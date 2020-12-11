import FileBuffer from './file_buffer';
import { Float80 } from 'float80';
import memoize from 'fast-memoize';

class Aiff {
  constructor(filePath) {
    this.fileBuffer = new FileBuffer(filePath);
    this.chunks = {
      FORM: {
        start: 0,
        size: null,             // long:     4 bytes
        formType: null,         // chars:    4 bytes
      },
      COMM: {
        start: 0,
        size: 18,               // long:     4 bytes
        numChannels: null,      // short:    2 bytes
        numSampleFrames: null,  // ulong:    4 bytes
        sampleSize: null,       // short:    2 bytes
        sampleRate: null,       // extended: 10 bytes
      },
      SSND: {
        start: 0,
        size: null,             // long:     4 bytes
        offset: null,           // ulong:    4 bytes
        blockSize: null,        // ulong:    4 bytes
      },
    };

    // how many samples to return when reading through the sound data
    this.samplesPerRead = 1000;

    // to stream samples into client code, call it like this:
    // for await (let samplesByChannel of aiff.samples) {
    //  chanelsArray with have n entries (1 per channel)
    //  each channel is an array samplePerRead long, each entry being a Number representing a sample value
    //  every iteration yeilds the next samplePerRead samples
    // }
    // https://javascript.info/async-iterators-generators
    const _this = this;
    this.samples = {
      [Symbol.asyncIterator]() {
        let nextSampleFrameStart = 0;
        const { numSampleFrames } = _this.chunks.COMM;

        return {
          async next() {
            if (nextSampleFrameStart >= numSampleFrames) {
              return { done: true };
            }

            const sampleFramesRemaining = numSampleFrames - nextSampleFrameStart;
            const sampleFramesToRead = (_this.samplesPerRead <= sampleFramesRemaining) ? _this.samplesPerRead : numSampleFrames - nextSampleFrameStart;

            const samplesByChannel = await _this.readSampleFrames({
              sampleFrameStart: nextSampleFrameStart,
              sampleFramesToRead,
            });

            nextSampleFrameStart = nextSampleFrameStart + sampleFramesToRead;

            return { done: false, value: samplesByChannel };
          },
        };
      },
    };
  }

  // how many bytes are needed to store one sample?
  get sampleStorageBytes() {
    const computation = memoize(sampleSize => Math.ceil(sampleSize / 8));
    return computation(this.chunks.COMM.sampleSize);
  }

  // how many bits are at the end of the sample that are zero pads?
  get sampleZeroPadBits() {
    const computation = memoize((sampleStorageBytes, sampleSize) => (
      (sampleStorageBytes * 8) - sampleSize
    ));
    return computation(this.sampleStorageBytes, this.chunks.COMM.sampleSize);
  }

  // how many bytes are in each sample frame?
  get sampleFrameSize() {
    const computation = memoize((sampleStorageBytes, numChannels) => sampleStorageBytes * numChannels);
    return computation(this.sampleStorageBytes, this.chunks.COMM.numChannels);
  }

  // at which byte index the sound data starts in the file:
  get soundDataStart() {
    const computation = memoize(start => start + 16);
    return computation(this.chunks.SSND.start);
  }

  async openForRead() {
    return this.fileBuffer.openForRead().then(() => this.parse());
  }

  async openForWrite({
    sampleRate,
    bitDepth,
    numChannels,
  }) {
    const {
      COMM,
      FORM,
      SSND,
    } = this.chunks;

    FORM.size = 0;
    FORM.formType = 'AIFF';

    COMM.start = 12;
    COMM.numChannels = numChannels;
    COMM.numSampleFrames = 0;
    COMM.sampleSize = bitDepth;
    COMM.sampleRate = sampleRate;

    SSND.start = 30;

    return this.fileBuffer.openForWrite();
  }

  // seek through file to find all chunks and populate
  // this.chunks
  async parse() {
    // loop all the chunks and find the ones we need, populate the data
    let eof = false;
    let nextChunkStart = 0;
    let fileSize = 0;

    while (!eof) {
      const chunkHeader = await this.readNextChunkHeader(nextChunkStart);

      switch (chunkHeader.chunkId) {
        case 'FORM':
          await this.parseForm(nextChunkStart);
          break;
        case 'COMM':
          await this.parseComm(nextChunkStart);
          break;
        case 'SSND':
          await this.parseSsnd(nextChunkStart);
          break;
      }

      if (chunkHeader.chunkId === 'FORM') {
        nextChunkStart = 12;
        fileSize = 8 + chunkHeader.size;
      } else {
        nextChunkStart = nextChunkStart + 8 + chunkHeader.size;

        // if odd, account for the padding byte at end of data
        if (chunkHeader.size % 2 !== 0) {
          nextChunkStart = nextChunkStart + 1;
        }
      }

      eof = nextChunkStart >= fileSize;
    };

    if (!this.chunks.COMM.start) {
      throw new Error('File does not have COMM Chunk');
    }

    if (!this.chunks.SSND.start) {
      throw new Error('File does not have SSND Chunk');
    }
  }

  async readNextChunkHeader(nextChunkStart) {
    return this.fileBuffer.read({
      start: nextChunkStart,
      length: 8,
    }).then((data) => {
      const { buffer } = data;
      return {
        chunkId: buffer.toString('latin1', 0, 4),
        size: buffer.readInt32BE(4),
      };
    });
  }

  // form is the header chunk of an AIFF
  async parseForm(start) {
    return this.fileBuffer.read({ start, length: 12 }).then((data) => {
      const { buffer } = data;
      const { FORM } = this.chunks;

      const chunkId = buffer.toString('latin1', 0, 4);
      FORM.size = buffer.readInt32BE(4);
      FORM.formType = buffer.toString('latin1', 8, 12);

      if (FORM.formType !== 'AIFF') {
        throw new Error(`cannot read formtype ${FORM.formType}`);
      }
    });
  }

  // parse the COMM chunk
  async parseComm(start) {
    return this.fileBuffer.read({ start, length: 26 }).then((data) => {
      const { buffer } = data;
      const { COMM } = this.chunks;

      COMM.start = start;
      COMM.size = buffer.readInt32BE(4);
      COMM.numChannels = buffer.readInt16BE(8);
      COMM.numSampleFrames = buffer.readUInt32BE(10);
      COMM.sampleSize = buffer.readInt16BE(14);
      COMM.sampleRate = Float80.fromBytes(
        buffer.slice(16, 26),
      ).asNumber().toNumber();
    });
  }

  // parse the SSND chunk
  async parseSsnd(start) {
    return this.fileBuffer.read({ start, length: 16 }).then((data) => {
      const { buffer } = data;
      const { SSND } = this.chunks;

      SSND.start = start;
      SSND.size = buffer.readInt32BE(4);
      SSND.offset = buffer.readUInt32BE(8);
      SSND.blockSize = buffer.readUInt32BE(12);

      if (SSND.offset !== 0) {
        throw new Error('Cannot read AIFFs with non-zero offset');
      }

      if (SSND.blockSize !== 0) {
        throw new Error('Cannot read AIFFs with non-zero blockSize');
      }
    });
  }

  // sampleFrameStart: which sample frame to start reading from?
  // sampleFramesToRead: how many sample frames should we read?
  async readSampleFrames({ sampleFrameStart, sampleFramesToRead }) {
    // at which byte in the file do we start reading?
    const start = this.soundDataStart + (sampleFrameStart * this.sampleFrameSize);

    // how many bytes do we read?
    const length = (sampleFramesToRead * this.sampleFrameSize);

    return this.fileBuffer.read({ start, length }).then((data) => {
      const { buffer, bytesRead } = data;

      // create an array with a subarray to hold samples for each channel
      const samplesByChannel = [];

      for (let i = 0; i < this.chunks.COMM.numChannels; i++) {
        samplesByChannel.push([]);
      }

      // we should never be asked to read more data than exists in the file
      if (bytesRead !== length) {
        throw new Error('cannot request sampleFrames past end of file');
      }

      if (bytesRead % this.sampleFrameSize !== 0) {
        throw new Error('bytesRead is not a multiple of sampleFrameSize');
      }

      // how many sample frames were actually returned?
      const sampleFramesRead = bytesRead / this.sampleFrameSize;

      // loop the sample frames:
      for (let i = 0; i < sampleFramesRead; i++) {
        // where does the frame start within the buffer
        const frameStart = i * this.sampleFrameSize;

        // loop each channel
        for (let j = 0; j < this.chunks.COMM.numChannels; j++) {
          // where does this channel start within the buffer?
          const channelStart = frameStart + (j * this.sampleStorageBytes);

          // get one sample for this channel
          const samplePointBytes = buffer.slice(
            channelStart,
            channelStart + this.sampleStorageBytes,
          );

          // use a new byte buffer to leverage reading JS Numbers, we can only read 8, 16, 32 bits
          // and AIFFs can only contain samples of bitdepth 1-32 bits
          // lets always pad it out to 4 bytes long so we always read a 32 bit number
          const sampleBuffer = Buffer.concat([
            samplePointBytes,
            Buffer.alloc(4 - this.sampleStorageBytes),
          ]);

          const paddingBits = this.sampleZeroPadBits + ((4 - this.sampleStorageBytes) * 8);
          const sample = sampleBuffer.readInt32BE();

          // bit shift in JS:
          samplesByChannel[j][i] = sample / Math.pow(2, paddingBits);
        }
      }

      return samplesByChannel;
    });
  }

  // return an iterator that will grab <size> samples at a time
  // if size is undefined, the iterator will grab all data on first read
  // yields array of channels which will contain up to <size> samples
  *samplesIterator(size) {
    let nextSampleFrameStart = 0;
    const { numSampleFrames } = this.chunks.COMM;

    let sampleFramesRemaining = numSampleFrames - nextSampleFrameStart;

    while (sampleFramesRemaining > 0) {
      const sampleFramesToRead = (size <= sampleFramesRemaining) ? size : numSampleFrames - nextSampleFrameStart;

      yield this.readSampleFrames({
        sampleFrameStart: nextSampleFrameStart,
        sampleFramesToRead,
      });

      nextSampleFrameStart = nextSampleFrameStart + sampleFramesToRead;
      sampleFramesRemaining = numSampleFrames - nextSampleFrameStart;
    }
  }

  async close() {
    return this.fileBuffer.close();
  }
}

export default Aiff;
