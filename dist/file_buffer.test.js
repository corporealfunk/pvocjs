"use strict";

require("core-js/modules/es.symbol");

require("core-js/modules/es.symbol.description");

require("core-js/modules/es.symbol.iterator");

require("core-js/modules/es.array.from");

require("core-js/modules/es.array.iterator");

require("core-js/modules/es.array.slice");

require("core-js/modules/es.function.name");

require("core-js/modules/es.object.to-string");

require("core-js/modules/es.regexp.to-string");

require("core-js/modules/es.string.iterator");

require("core-js/modules/web.dom-collections.iterator");

var _file_buffer = _interopRequireDefault(require("./file_buffer"));

var _fs = require("./fs");

var _helpers = require("../test/helpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

describe('#readNext', function () {
  describe('when reading exact file length', function () {
    test('eof is true', function () {
      var file = new _file_buffer.default('./test/four_bytes.txt');
      return file.openForRead().then(function () {
        return file.readNext(5);
      }).then(function (data) {
        expect(data.eof).toBeTrue;
      });
    });
  });
  describe('when reading fewer bytes than file length', function () {
    test('eof is false', function () {
      var file = new _file_buffer.default('./test/four_bytes.txt');
      return file.openForRead().then(function () {
        return file.readNext(4);
      }).then(function (data) {
        expect(data.eof).toBeFalse;
      });
    });
    test('bytesRead is requested length', function () {
      var file = new _file_buffer.default('./test/four_bytes.txt');
      return file.openForRead().then(function () {
        return file.readNext(2);
      }).then(function (data) {
        expect(data.bytesRead).toBe(2);
      });
    });
  });
  describe('when reading more bytes than file length', function () {
    test('eof is true', function () {
      var file = new _file_buffer.default('./test/four_bytes.txt');
      return file.openForRead().then(function () {
        return file.readNext(10);
      }).then(function (data) {
        expect(data.eof).toBeTrue;
      });
    });
    test('bytesRead is file length', function () {
      var file = new _file_buffer.default('./test/four_bytes.txt');
      return file.openForRead().then(function () {
        return file.readNext(10);
      }).then(function (data) {
        expect(data.bytesRead).toBe(5);
      });
    });
  });
  describe('calling more than once', function () {
    test('returns expected bytes on first call', function () {
      var file = new _file_buffer.default('./test/four_bytes.txt');
      return file.openForRead().then(function () {
        return file.readNext(2);
      }).then(function (data) {
        expect(String.fromCharCode(data.buffer[0], data.buffer[1])).toBe('ab');
      });
    });
    test('returns expected bytes on second call', function () {
      var file = new _file_buffer.default('./test/four_bytes.txt');
      return file.openForRead().then(function () {
        return file.readNext(2);
      }).then(function () {
        return file.readNext(2);
      }).then(function (data) {
        expect(String.fromCharCode.apply(String, _toConsumableArray(data.buffer))).toBe('cd');
      });
    });
  });
});
describe('#append', function () {
  var fileName = '/tmp/write_appended_bytes.txt';
  var outFile;
  var outData;
  beforeEach(function () {
    (0, _helpers.unlinkIfExists)(fileName);
    outFile = new _file_buffer.default(fileName);
    outData = Buffer.alloc(4);
  });
  afterEach(function () {
    (0, _helpers.unlinkIfExists)(fileName);
  });
  test('number of written bytes is correct', function () {
    return outFile.openForWrite().then(function () {
      outData.writeInt32BE(984);
      return outFile.append(outData);
    }).then(function (written) {
      expect(written).toEqual(4);
    });
  });
  test('file contains correct data after two calls', function () {
    return outFile.openForWrite().then(function () {
      outData.writeInt32BE(984);
      return outFile.append(outData);
    }).then(function () {
      outData.writeInt32BE(4763);
      return outFile.append(outData);
    }).then(function () {
      return outFile.close();
    }).then(function () {
      return (0, _fs.readFileAsync)(fileName);
    }).then(function (data) {
      expect(data.readInt32BE()).toEqual(984);
      expect(data.readInt32BE(4)).toEqual(4763);
    });
  });
});
describe('#write', function () {
  describe('writing at middle of file that has no data', function () {
    var fileName = '/tmp/write_middle_bytes.txt';
    var outFile;
    var outData;
    beforeEach(function () {
      (0, _helpers.unlinkIfExists)(fileName);
      outFile = new _file_buffer.default(fileName);
      outData = Buffer.alloc(4);
    });
    afterEach(function () {
      (0, _helpers.unlinkIfExists)(fileName);
    });
    test('file contains correct bytes', function () {
      return outFile.openForWrite().then(function () {
        outData.writeInt32BE(748);
        return outFile.write({
          start: 1024,
          buffer: outData
        });
      }).then(function (data) {
        ;
        return outFile.close();
      }).then(function () {
        return (0, _fs.readFileAsync)(fileName);
      }).then(function (data) {
        expect(data.readInt32BE(0)).toEqual(0);
        expect(data.readInt32BE(1024)).toEqual(748);
      });
    });
  });
  describe('writing at middle of file that has data', function () {
    var fileName = '/tmp/write_middle_bytes.txt';
    var outFile;
    var outData;
    beforeEach(function () {
      (0, _helpers.unlinkIfExists)(fileName);
      outFile = new _file_buffer.default(fileName);
      outData = Buffer.alloc(4); // write some test data:

      var testData = Buffer.alloc(12);
      testData.writeInt32BE(26352, 0);
      testData.writeInt32BE(8574, 4);
      testData.writeInt32BE(732, 8);
      return outFile.openForWrite().then(function () {
        return outFile.append(testData);
      });
    });
    afterEach(function () {
      (0, _helpers.unlinkIfExists)(fileName);
    });
    test('number of written bytes is correct', function () {
      outData.writeInt32BE(1234);
      return outFile.write({
        start: 0,
        buffer: outData
      }).then(function (written) {
        expect(written).toEqual(4);
      });
    });
    test('read bytes match written bytes', function () {
      outData.writeInt32BE(1234);
      return outFile.write({
        start: 4,
        buffer: outData
      }).then(function () {
        return outFile.close();
      }).then(function () {
        return (0, _fs.readFileAsync)(fileName);
      }).then(function (data) {
        expect(data.readInt32BE(0)).toEqual(26352);
        expect(data.readInt32BE(4)).toEqual(1234);
        expect(data.readInt32BE(8)).toEqual(732);
      });
    });
  });
});