/* eslint-disable no-multi-spaces */

import { Float80 } from 'float80';
import FileBuffer from './file_buffer';
import { floatToExtended } from './utilties';
import { statAsync } from './fs';

class Aiff {
  constructor(filePath) {
    this.fileBuffer = new FileBuffer(filePath);
    this.filePath = filePath;
    this.chunks = {
      FORM: {
        start: 0,
        size: 0,                // long:     4 bytes
        formType: '',           // chars:    4 bytes
      },
      COMM: {
        start: 0,
        size: 18,               // long:     4 bytes
        numChannels: 0,         // short:    2 bytes
        numSampleFrames: 0,     // ulong:    4 bytes
        sampleSize: 0,          // short:    2 bytes
        sampleRate: 0,          // extended: 10 bytes
      },
      SSND: {
        start: 0,
        size: 0,                // long:     4 bytes
        offset: 0,              // ulong:    4 bytes
        blockSize: 0,           // ulong:    4 bytes
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

  get sampleRate() {
    return this.chunks.COMM.sampleRate;
  }

  get bitDepth() {
    return this.chunks.COMM.sampleSize;
  }

  get numChannels() {
    return this.chunks.COMM.numChannels;
  }

  get numSamples() {
    return this.chunks.COMM.numSampleFrames;
  }

  // how many bytes are needed to store one sample?
  get sampleStorageBytes() {
    if (this._sampleStorageBytes === undefined) {
      this._sampleStorageBytes = Math.ceil(this.bitDepth / 8);
    }
    return this._sampleStorageBytes;
  }

  // how many bits are at the end of the sample that are zero pads?
  get sampleZeroPadBits() {
    if (this._sampleZeroPadBits === undefined) {
      this._sampleZeroPadBits = (this.sampleStorageBytes * 8) - this.bitDepth;
    }
    return this._sampleZeroPadBits;
  }

  // how many bytes are in each sample frame?
  get sampleFrameSize() {
    if (this._sampleFrameSize === undefined) {
      this._sampleFrameSize = this.sampleStorageBytes * this.numChannels;
    }
    return this._sampleFrameSize;
  }

  // at which byte index the sound data starts in the file:
  get soundDataStart() {
    if (this._soundDataStart === undefined) {
      this._soundDataStart = this.chunks.SSND.start + 16;
    }

    return this._soundDataStart;
  }

  // helper to return a two element array of low and high sample value range
  // based on bit depth
  get bitDepthRange() {
    if (this._bitDepthRange === undefined) {
      this._bitDepthRange = [
        -(2 ** (this.bitDepth - 1)),
        (2 ** (this.bitDepth - 1) -1),
      ];
    }
    return this._bitDepthRange;
  }

  async openForRead() {
    return this.fileBuffer.openForRead().then(() => this.parse());
  }

  // seek through file to find all chunks and populate
  // this.chunks
  async parse() {
    // loop all the chunks and find the ones we need, populate the data
    let eof = false;
    let nextChunkStart = 0;
    const { size } = await statAsync(this.filePath);

    while (!eof) {
      const chunkHeader = await this.readNextChunkHeader(nextChunkStart);

      switch (chunkHeader.chunkId) {
        case 'FORM':
          await this.parseForm(nextChunkStart);
          nextChunkStart = 12;
          break;
        case 'COMM':
          await this.parseComm(nextChunkStart);
          nextChunkStart = nextChunkStart + 8 + chunkHeader.size;
          break;
        case 'SSND':
          await this.parseSsnd(nextChunkStart);
          nextChunkStart = nextChunkStart + 16 + chunkHeader.size;
          break;
      }

      if (chunkHeader.chunkId !== 'FORM') {
        // if odd, account for the padding byte at end of data
        if (chunkHeader.size % 2 !== 0) {
          nextChunkStart = nextChunkStart + 1;
        }
      }

      eof = nextChunkStart >= size;
    }

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
          samplesByChannel[j][i] = Math.floor(sample / Math.pow(2, paddingBits));
        }
      }

      return samplesByChannel;
    });
  }

  // return an iterator that will grab <size> samples at a time
  // if size is undefined, the iterator will grab all data on first read
  // yields array of channels which will contain up to <size> samples
  * samplesIterator(size) {
    let nextSampleFrameStart = 0;
    const { numSampleFrames } = this.chunks.COMM;

    let sampleFramesRemaining = numSampleFrames - nextSampleFrameStart;

    while (sampleFramesRemaining > 0) {
      const sampleFramesToRead = (size <= sampleFramesRemaining) ? size : numSampleFrames - nextSampleFrameStart;

      yield this.readSampleFrames({
        sampleFrameStart: nextSampleFrameStart,
        sampleFramesToRead,
      });

      nextSampleFrameStart += sampleFramesToRead;
      sampleFramesRemaining = numSampleFrames - nextSampleFrameStart;
    }
  }

  async close() {
    return this.fileBuffer.close();
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

    FORM.size = 4;
    FORM.formType = 'AIFF';

    COMM.start = 12;
    COMM.numChannels = numChannels;
    COMM.numSampleFrames = 0;
    COMM.sampleSize = bitDepth;
    COMM.sampleRate = sampleRate;

    // COMM headers + it's size:
    FORM.size += 8 + COMM.size;

    SSND.start = 38;
    SSND.size = 8;

    // SSND headers + it's size:
    FORM.size += 8 + SSND.size;

    return this.fileBuffer.openForWrite().then(() => (
      this.fileBuffer.append(this.formChunkToBuffer())
    )).then(() => (
      this.fileBuffer.append(this.commChunkToBuffer())
    )).then(() => (
      this.fileBuffer.append(this.ssndChunkToBuffer())
    ));
  }

  formChunkToBuffer() {
    const { FORM } = this.chunks;
    const buffer = Buffer.alloc(12);
    buffer.write('FORM');
    buffer.writeInt32BE(FORM.size, 4);
    buffer.write('AIFF', 8);
    return buffer;
  }

  commChunkToBuffer() {
    const { COMM } = this.chunks;
    const buffer = Buffer.alloc(26);
    buffer.write('COMM');
    buffer.writeInt32BE(COMM.size, 4);
    buffer.writeInt16BE(COMM.numChannels, 8);
    buffer.writeUInt32BE(COMM.numSampleFrames, 10);
    buffer.writeInt16BE(COMM.sampleSize, 14);
    const sampleRateFloat80 = floatToExtended(COMM.sampleRate);
    sampleRateFloat80.copy(buffer, 16);
    return buffer;
  }

  ssndChunkToBuffer() {
    const { SSND } = this.chunks;
    const buffer = Buffer.alloc(16);
    buffer.write('SSND');
    buffer.writeInt32BE(SSND.size, 4);
    buffer.writeUInt32BE(SSND.offset, 8);
    buffer.writeUInt32BE(SSND.blockSize, 12);
    return buffer;
  }

  // chanels is an array of arrays where each sub-array
  // is sample data for that channel,
  // this is going to appended to the end of the file
  // channels is an array, where each element is a subarray of
  // js Number point samples for a given channel
  // we will handle rounding and bit padding into bit depth
  // needed. Any extra channels beyond our storage needs
  // will be tossed. If you send fewer than our storage needs,
  // extra channels will be Zeroed
  async writeSamples(channels) {
    if (channels.length === 0) {
      throw new Error('Cannot write 0 channels');
    }

    // TODO: we can only have a file where the FORM.size must be < (2**32-1) - 1
    // guard against overages
    const numInputSamples = channels[0].length;
    const { numChannels } = this.chunks.COMM;

    const output = Buffer.alloc(this.sampleFrameSize * numInputSamples);

    // where in the buffer to write the next frame:
    let nextSampleFrameI = 0;
    for (let i = 0; i < numInputSamples; i++) {
      for (let x = 0; x < numChannels; x++) {
        const nextSampleI = nextSampleFrameI + (x * this.sampleStorageBytes);
        let sample = Math.round(channels[x][i]);

        // if it is outside the bit depth range, clip it
        if (sample < this.bitDepthRange[0]) {
          sample = this.bitDepthRange[0];
        } else if (sample > this.bitDepthRange[1]) {
          sample = this.bitDepthRange[1];
        }

        // pad the sample by shifting left if needed
        if (this.sampleZeroPadBits > 0) {
          sample *= 2 ** this.sampleZeroPadBits;
        }

        switch (this.sampleStorageBytes) {
          case 1:
            output.writeInt8(sample, nextSampleI);
            break;
          case 2:
            output.writeInt16BE(sample, nextSampleI);
            break;
          case 3:
            const tmpBuffer = Buffer.alloc(4);

            // shift it one more byte over
            const storageSample = sample * (2 ** 8);

            // write 4 bytes (the last byte is now padding)
            tmpBuffer.writeInt32BE(storageSample);

            // copy only the first 3 bytes
            tmpBuffer.copy(output, nextSampleI, 0, 3);
            break;
          case 4:
            output.writeInt32BE(sample, nextSampleI);
            break;
          default:
            throw new Error(`sampleStorageBytes must be within range 1-4 inclusive, got ${this.sampleStorageBytes}`);
        }
      }
      nextSampleFrameI += this.sampleFrameSize;
    }

    // write output to disk
    await this.fileBuffer.append(output);

    // update counters:
    const { FORM, COMM, SSND } = this.chunks;
    COMM.numSampleFrames += numInputSamples;
    SSND.size += numInputSamples * this.sampleFrameSize;
    FORM.size += numInputSamples * this.sampleFrameSize;
    await this.updateChunkHeadersOnDisk();
  }

  async updateChunkHeadersOnDisk() {
    const headerBuffer = new FileBuffer(this.filePath);

    return headerBuffer.openForWrite('r+').then(() => (
      headerBuffer.write({
        start: 0,
        buffer: this.formChunkToBuffer(),
      })
    )).then(() => (
      headerBuffer.write({
        start: this.chunks.COMM.start,
        buffer: this.commChunkToBuffer(),
      })
    )).then(() => (
      headerBuffer.write({
        start: this.chunks.SSND.start,
        buffer: this.ssndChunkToBuffer(),
      })
    )).then(() => headerBuffer.close());
  }
}

export default Aiff;
