import FileBuffer from './file_buffer';

describe('#readNext', () => {
  describe('when reading exact file length', () => {
    test('eof is true', () => {
      const file = new FileBuffer('./test/four_bytes.txt');

      return file.open().then(() => {
        return file.readNext(5);
      }).then((data) => {
        expect(data.eof).toBeTrue;
      });
    });
  });

  describe('when reading fewer bytes than file length', () => {
    test('eof is false', () => {
      const file = new FileBuffer('./test/four_bytes.txt');

      return file.open().then(() => {
        return file.readNext(4);
      }).then((data) => {
        expect(data.eof).toBeFalse;
      });
    });

    test('bytesRead is requested length', () => {
      const file = new FileBuffer('./test/four_bytes.txt');

      return file.open().then(() => {
        return file.readNext(2);
      }).then((data) => {
        expect(data.bytesRead).toBe(2);
      });
    });
  });

  describe('when reading more bytes than file length', () => {
    test('eof is true', () => {
      const file = new FileBuffer('./test/four_bytes.txt');

      return file.open().then(() => {
        return file.readNext(10);
      }).then((data) => {
        expect(data.eof).toBeTrue;
      });
    });

    test('bytesRead is file length', () => {
      const file = new FileBuffer('./test/four_bytes.txt');

      return file.open().then(() => {
        return file.readNext(10);
      }).then((data) => {
        expect(data.bytesRead).toBe(5);
      });
    });
  });

  describe('calling more than once', () => {
    test('returns expected bytes on first call', () => {
      const file = new FileBuffer('./test/four_bytes.txt');

      return file.open().then(() => {
        return file.readNext(2);
      }).then((data) => {
        expect(String.fromCharCode(data.buffer[0], data.buffer[1])).toBe('ab');
      });
    });

    test('returns expected bytes on second call', () => {
      const file = new FileBuffer('./test/four_bytes.txt');

      return file.open().then(() => {
        return file.readNext(2);
      }).then(() => {
        return file.readNext(2);
      }).then((data) => {
        expect(String.fromCharCode(...data.buffer)).toBe('cd');
      });
    });
  });
});
