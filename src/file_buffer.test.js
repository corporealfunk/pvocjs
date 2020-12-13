import FileBuffer from './file_buffer';
import { readFileAsync } from './fs';
import { unlinkIfExists } from '../test/helpers';

describe('#readNext', () => {
  describe('when reading exact file length', () => {
    test('eof is true', () => {
      const file = new FileBuffer('./test/four_bytes.txt');

      return file.openForRead().then(() => {
        return file.readNext(5);
      }).then((data) => {
        expect(data.eof).toBeTrue;
      });
    });
  });

  describe('when reading fewer bytes than file length', () => {
    test('eof is false', () => {
      const file = new FileBuffer('./test/four_bytes.txt');

      return file.openForRead().then(() => {
        return file.readNext(4);
      }).then((data) => {
        expect(data.eof).toBeFalse;
      });
    });

    test('bytesRead is requested length', () => {
      const file = new FileBuffer('./test/four_bytes.txt');

      return file.openForRead().then(() => {
        return file.readNext(2);
      }).then((data) => {
        expect(data.bytesRead).toBe(2);
      });
    });
  });

  describe('when reading more bytes than file length', () => {
    test('eof is true', () => {
      const file = new FileBuffer('./test/four_bytes.txt');

      return file.openForRead().then(() => {
        return file.readNext(10);
      }).then((data) => {
        expect(data.eof).toBeTrue;
      });
    });

    test('bytesRead is file length', () => {
      const file = new FileBuffer('./test/four_bytes.txt');

      return file.openForRead().then(() => {
        return file.readNext(10);
      }).then((data) => {
        expect(data.bytesRead).toBe(5);
      });
    });
  });

  describe('calling more than once', () => {
    test('returns expected bytes on first call', () => {
      const file = new FileBuffer('./test/four_bytes.txt');

      return file.openForRead().then(() => {
        return file.readNext(2);
      }).then((data) => {
        expect(String.fromCharCode(data.buffer[0], data.buffer[1])).toBe('ab');
      });
    });

    test('returns expected bytes on second call', () => {
      const file = new FileBuffer('./test/four_bytes.txt');

      return file.openForRead().then(() => {
        return file.readNext(2);
      }).then(() => {
        return file.readNext(2);
      }).then((data) => {
        expect(String.fromCharCode(...data.buffer)).toBe('cd');
      });
    });
  });
});

describe('#append', () => {
  const fileName = '/tmp/write_appended_bytes.txt';
  let outFile;
  let outData;

  beforeEach(() => {
    unlinkIfExists(fileName);
    outFile = new FileBuffer(fileName);
    outData = Buffer.alloc(4);
  });

  afterEach(() => {
    unlinkIfExists(fileName);
  });

  test('number of written bytes is correct', () => {
    return outFile.openForWrite().then(() => {
      outData.writeInt32BE(984);
      return outFile.append(outData);
    }).then((written) => {
      expect(written).toEqual(4);
    });
  });

  test('file contains correct data after two calls', () => {
    return outFile.openForWrite().then(() => {
      outData.writeInt32BE(984);
      return outFile.append(outData);
    }).then(() => {
      outData.writeInt32BE(4763);
      return outFile.append(outData);
    }).then(() => {
      return outFile.close();
    }).then(() => {
      return readFileAsync(fileName);
    }).then((data) => {
      expect(data.readInt32BE()).toEqual(984);
      expect(data.readInt32BE(4)).toEqual(4763);
    });
  });
});

describe('#write', () => {
  describe('writing at middle of file that has no data', () => {
    const fileName = '/tmp/write_middle_bytes.txt';
    let outFile;
    let outData;

    beforeEach(() => {
      unlinkIfExists(fileName);
      outFile = new FileBuffer(fileName);
      outData = Buffer.alloc(4);
    });

    afterEach(() => {
      unlinkIfExists(fileName);
    });

    test('file contains correct bytes', () => {
      return outFile.openForWrite().then(() => {
        outData.writeInt32BE(748);
        return outFile.write({ start: 1024, buffer: outData });
      }).then((data) => {;
        return outFile.close();
      }).then(() => {
        return readFileAsync(fileName);
      }).then((data) => {
        expect(data.readInt32BE(0)).toEqual(0);
        expect(data.readInt32BE(1024)).toEqual(748);
      });
    });
  });

  describe('writing at middle of file that has data', () => {
    const fileName = '/tmp/write_middle_bytes.txt';
    let outFile;
    let outData;

    beforeEach(() => {
      unlinkIfExists(fileName);
      outFile = new FileBuffer(fileName);
      outData = Buffer.alloc(4);

      // write some test data:
      const testData = Buffer.alloc(12);
      testData.writeInt32BE(26352, 0);
      testData.writeInt32BE(8574, 4);
      testData.writeInt32BE(732, 8);

      return outFile.openForWrite().then(() => {
        return outFile.append(testData);
      });
    });

    afterEach(() => {
      unlinkIfExists(fileName);
    });

    test('number of written bytes is correct', () => {
      outData.writeInt32BE(1234);
      return outFile.write({ start: 0, buffer: outData }).then((written) => {
        expect(written).toEqual(4);
      });
    });

    test('read bytes match written bytes', () => {
      outData.writeInt32BE(1234);
      return outFile.write({ start: 4, buffer: outData }).then(() => {
        return outFile.close();
      }).then(() => {
        return readFileAsync(fileName);
      }).then((data) => {
        expect(data.readInt32BE(0)).toEqual(26352);
        expect(data.readInt32BE(4)).toEqual(1234);
        expect(data.readInt32BE(8)).toEqual(732);
      });
    });
  });
});
