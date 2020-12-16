"use strict";

var _sliding_buffer = _interopRequireDefault(require("./sliding_buffer"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('#new', function () {
  test('buffer is zero and correct length', function () {
    var buffer = new _sliding_buffer.default(5);
    expect(buffer.buffer).toEqual([0, 0, 0, 0, 0]);
  });
});
describe('#shiftIn', function () {
  describe('when less data than size', function () {
    var buffer = new _sliding_buffer.default(5);
    test('buffer contains correct data', function () {
      buffer.shiftIn([9, 8, 7]);
      expect(buffer.buffer).toEqual([0, 0, 9, 8, 7]);
    });
    test('returns the shifted out data', function () {
      buffer.shiftIn([1, 2, 3, 4, 5]);
      expect(buffer.shiftIn([6, 7, 8])).toEqual([1, 2, 3]);
    });
  });
  describe('when same data than size', function () {
    var buffer = new _sliding_buffer.default(5);
    test('buffer contains correct data', function () {
      buffer.shiftIn([9, 8, 7, 6, 5]);
      expect(buffer.buffer).toEqual([9, 8, 7, 6, 5]);
    });
  });
  describe('when more data than size', function () {
    var buffer = new _sliding_buffer.default(5);
    test('buffer throws error', function () {
      try {
        buffer.shiftIn([9, 8, 7, 6, 5, 4]);
      } catch (e) {
        expect(e.message).toEqual('Cannot shiftIn more data than buffer size');
      }
    });
  });
});
describe('#shiftLeft', function () {
  var buffer = new _sliding_buffer.default(5);
  test('buffer contains correct data padded', function () {
    buffer.shiftIn([9]);
    buffer.shiftLeft(4);
    expect(buffer.buffer).toEqual([9, 0, 0, 0, 0]);
  });
  test('returns the shifted out data', function () {
    buffer.shiftIn([10, 11, 12, 13, 14]);
    expect(buffer.shiftLeft(3)).toEqual([10, 11, 12]);
  });
});
describe('#hasValidData', function () {
  describe('when fresh', function () {
    var buffer = new _sliding_buffer.default(5);
    it('returns false', function () {
      expect(buffer.hasValidData).toEqual(false);
    });
  });
  describe('when data is shifted in', function () {
    var buffer = new _sliding_buffer.default(5);
    it('returns true', function () {
      buffer.shiftIn([1, 2, 3]);
      expect(buffer.hasValidData).toEqual(true);
    });
  });
  describe('when data is shiftedOut', function () {
    describe('when buffer still has valid data', function () {
      var buffer = new _sliding_buffer.default(5);
      it('returns true', function () {
        buffer.shiftIn([1, 2, 3]);
        expect(buffer.hasValidData).toEqual(true);
      });
    });
    describe('when buffer has no valid data left', function () {
      var buffer = new _sliding_buffer.default(5);
      it('returns false', function () {
        buffer.shiftIn([1, 2, 3]);
        buffer.shiftLeft(5);
        expect(buffer.hasValidData).toEqual(false);
      });
    });
  });
});