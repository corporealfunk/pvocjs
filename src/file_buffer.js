import {
  openAsync,
  readAsync,
  writeAsync,
  closeAsync,
} from './fs';

class FileBuffer {
  constructor(filePath) {
    this.filePath = filePath;
    this.fd = null;
  }

  async openForRead() {
    if (this.fd !== null) {
      throw new Error('FileBuffer already has open file');
    }

    // file descriptor
    this.fd = await openAsync(this.filePath);

    // next byte to read from file
    this.pointer = 0;
  }

  async openForWrite() {
    if (this.fd !== null) {
      throw new Error('FileBuffer already has open file');
    }

    // file descriptor
    this.fd = await openAsync(this.filePath, 'wx');

    // next byte to read from file
    this.pointer = 0;
  }

  // resolves data obj with { bytesRead, buffer, eof (bool) }
  // if bytes read < length, close the file (we are EOF)
  async read({ start, length }) {
    return readAsync(
      this.fd,
      Buffer.alloc(length),
      0,
      length,
      start,
    ).then((data) => {
      this.pointer = start + data.bytesRead;

      const eof = data.bytesRead < length;

      return { ...data, eof };
    });
  }

  // returns number of bytes written
  async write({ start, buffer }) {
    return writeAsync(
      this.fd,
      buffer,
      0,
      buffer.length,
      start,
    ).then(({ bytesWritten }) => {
      if (bytesWritten !== buffer.length) {
        throw new Error('Could not write desired number of bytes');
      }
      this.pointer = start + bytesWritten;
      return bytesWritten;
    });
  }

  async append(buffer) {
    return writeAsync(
      this.fd,
      buffer,
      0,
      buffer.length,
      null,
    ).then(({ bytesWritten }) => {
      if (bytesWritten !== buffer.length) {
        throw new Error('Could not write desired number of bytes');
      }
      this.pointer = null;
      return bytesWritten;
    });
  }

  // reads the next length bytes from the file and returns
  // { bytesRead, buffer, eof }
  async readNext(length) {
    return this.read({ start: this.pointer, length });
  }

  async close() {
    if (this.fd === null) {
      return Promise.resolve(null);
    }

    return closeAsync(this.fd).then(() => { this.fd = null; });
  }
}

export default FileBuffer;
