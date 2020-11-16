import FileBuffer from './file_buffer';
import { Float80 } from 'float80';

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
  }

  async open() {
    return this.fileBuffer.open().then(() => this.parse());
  }

  // seek through file to find all chunks and populate
  // this.chunks
  async parse() {
    /*
    const formData = await this.parseForm();
    */

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
  }

  async readNextChunkHeader(nextChunkStart) {
    return this.fileBuffer.read({
      start: nextChunkStart,
      length: 8,
    }).then((data) => {
      const { buffer, eof } = data;
      return {
        chunkId: buffer.toString('latin1', 0, 4),
        size: buffer.readInt32BE(4),
        eof,
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

  async close() {
    return this.fileBuffer.close();
  }
}

export default Aiff;
