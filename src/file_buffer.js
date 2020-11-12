import { openAsync, readAsync, closeAsync } from './fs';

class FileBuffer {
  constructor(filePath) {
    this.filePath = filePath;
    this.fd = null;
  }

  async open() {
    if (this.fd !== null) {
      throw new Error('FileBuffer already has open file');
    }

    // file descriptor
    this.fd = await openAsync(this.filePath);

    // next byte to read from file
    this.pointer = 0;
  }

  // resolves data obj with { bytesRead, buffer, eof (bool) }
  // if bytes read < length, close the file (we are EOF)
  async read({ start, length }) {
    return readAsync(
      this.fd,
      new Buffer.alloc(length),
      0,
      length,
      start,
    ).then((data) => {
      this.pointer = start + data.bytesRead;

      // close the file and resolve with data
      // if we are at EOF
      if (data.bytesRead < length) {
        return this.close().then(() => ({ ...data, eof: true }));
      }

      return {...data, eof: false };
    });
  }

  // reads the next length bytes from the file and returns
  // { byteRead, buffer, eof }
  async readNext(length) {
    return this.read({ start: this.pointer, length });
  }

  async close() {
    if (this.fd === null) {
      return Promise.resolve(null);
    }

    return closeAsync(this.fd);
  }
}

export default FileBuffer;
