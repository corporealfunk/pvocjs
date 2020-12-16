"use strict";

require("core-js/modules/es.symbol");

require("core-js/modules/es.symbol.description");

require("core-js/modules/es.symbol.async-iterator");

require("core-js/modules/es.symbol.iterator");

require("core-js/modules/es.array.from");

require("core-js/modules/es.array.iterator");

require("core-js/modules/es.array.slice");

require("core-js/modules/es.function.name");

require("core-js/modules/es.object.to-string");

require("core-js/modules/es.promise");

require("core-js/modules/es.regexp.to-string");

require("core-js/modules/es.string.iterator");

require("core-js/modules/web.dom-collections.iterator");

require("regenerator-runtime/runtime");

var _aiff = _interopRequireDefault(require("./aiff"));

var _helpers = require("../test/helpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _asyncIterator(iterable) { var method; if (typeof Symbol !== "undefined") { if (Symbol.asyncIterator) { method = iterable[Symbol.asyncIterator]; if (method != null) return method.call(iterable); } if (Symbol.iterator) { method = iterable[Symbol.iterator]; if (method != null) return method.call(iterable); } } throw new TypeError("Object is not async iterable"); }

var strings_path = './test/aiffs/strings.aif';
describe('#openForRead', function () {
  test('populates FORM data', function () {
    var aiff = new _aiff.default(strings_path);
    return aiff.openForRead().then(function () {
      expect(aiff.chunks.FORM).toEqual(expect.objectContaining({
        size: 2288836,
        formType: 'AIFF'
      }));
    });
  });
  test('populates COMM data', function () {
    var aiff = new _aiff.default(strings_path);
    return aiff.openForRead().then(function () {
      expect(aiff.chunks.COMM).toEqual(expect.objectContaining({
        size: 18,
        numChannels: 2,
        numSampleFrames: 381465,
        sampleSize: 24,
        sampleRate: 48000.0
      }));
    });
  });
  test('populates SSND data', function () {
    var aiff = new _aiff.default(strings_path);
    return aiff.openForRead().then(function () {
      expect(aiff.chunks.SSND).toEqual(expect.objectContaining({
        start: 38,
        size: 2288798,
        offset: 0,
        blockSize: 0
      }));
    });
  });
});
var bits16 = './test/aiffs/mono_441k_16b_sine.aif';
var bits24 = './test/aiffs/mono_48k_24b_sine.aif';
describe("#samples", function () {
  describe('AIFF', function () {
    test('iterates samples 16b', function () {
      var aiff = new _aiff.default(bits16);
      var channel1 = [];
      return aiff.openForRead().then( /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, _value, samplesArray;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _iteratorNormalCompletion = true;
                _didIteratorError = false;
                _context.prev = 2;
                _iterator = _asyncIterator(aiff.samples);

              case 4:
                _context.next = 6;
                return _iterator.next();

              case 6:
                _step = _context.sent;
                _iteratorNormalCompletion = _step.done;
                _context.next = 10;
                return _step.value;

              case 10:
                _value = _context.sent;

                if (_iteratorNormalCompletion) {
                  _context.next = 17;
                  break;
                }

                samplesArray = _value;
                channel1.push.apply(channel1, _toConsumableArray(samplesArray[0]));

              case 14:
                _iteratorNormalCompletion = true;
                _context.next = 4;
                break;

              case 17:
                _context.next = 23;
                break;

              case 19:
                _context.prev = 19;
                _context.t0 = _context["catch"](2);
                _didIteratorError = true;
                _iteratorError = _context.t0;

              case 23:
                _context.prev = 23;
                _context.prev = 24;

                if (!(!_iteratorNormalCompletion && _iterator.return != null)) {
                  _context.next = 28;
                  break;
                }

                _context.next = 28;
                return _iterator.return();

              case 28:
                _context.prev = 28;

                if (!_didIteratorError) {
                  _context.next = 31;
                  break;
                }

                throw _iteratorError;

              case 31:
                return _context.finish(28);

              case 32:
                return _context.finish(23);

              case 33:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, null, [[2, 19, 23, 33], [24,, 28, 32]]);
      })));
    });
    test('iterates samples 24b', function () {
      var aiff = new _aiff.default(bits24);
      var channel1 = [];
      return aiff.openForRead().then( /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
        var _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, _value2, samplesArray;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                _iteratorNormalCompletion2 = true;
                _didIteratorError2 = false;
                _context2.prev = 2;
                _iterator2 = _asyncIterator(aiff.samples);

              case 4:
                _context2.next = 6;
                return _iterator2.next();

              case 6:
                _step2 = _context2.sent;
                _iteratorNormalCompletion2 = _step2.done;
                _context2.next = 10;
                return _step2.value;

              case 10:
                _value2 = _context2.sent;

                if (_iteratorNormalCompletion2) {
                  _context2.next = 17;
                  break;
                }

                samplesArray = _value2;
                channel1.push.apply(channel1, _toConsumableArray(samplesArray[0]));

              case 14:
                _iteratorNormalCompletion2 = true;
                _context2.next = 4;
                break;

              case 17:
                _context2.next = 23;
                break;

              case 19:
                _context2.prev = 19;
                _context2.t0 = _context2["catch"](2);
                _didIteratorError2 = true;
                _iteratorError2 = _context2.t0;

              case 23:
                _context2.prev = 23;
                _context2.prev = 24;

                if (!(!_iteratorNormalCompletion2 && _iterator2.return != null)) {
                  _context2.next = 28;
                  break;
                }

                _context2.next = 28;
                return _iterator2.return();

              case 28:
                _context2.prev = 28;

                if (!_didIteratorError2) {
                  _context2.next = 31;
                  break;
                }

                throw _iteratorError2;

              case 31:
                return _context2.finish(28);

              case 32:
                return _context2.finish(23);

              case 33:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, null, [[2, 19, 23, 33], [24,, 28, 32]]);
      })));
    });
  });
});
describe("#samplesIterator", function () {
  describe('AIFF', function () {
    test('iterates samples 16b', function () {
      var aiff = new _aiff.default(bits16);
      var channel1 = [];
      return aiff.openForRead().then( /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
        var it, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, _value3, samplesArray;

        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                it = aiff.samplesIterator(512);
                _iteratorNormalCompletion3 = true;
                _didIteratorError3 = false;
                _context3.prev = 3;
                _iterator3 = _asyncIterator(it);

              case 5:
                _context3.next = 7;
                return _iterator3.next();

              case 7:
                _step3 = _context3.sent;
                _iteratorNormalCompletion3 = _step3.done;
                _context3.next = 11;
                return _step3.value;

              case 11:
                _value3 = _context3.sent;

                if (_iteratorNormalCompletion3) {
                  _context3.next = 18;
                  break;
                }

                samplesArray = _value3;
                channel1.push.apply(channel1, _toConsumableArray(samplesArray[0]));

              case 15:
                _iteratorNormalCompletion3 = true;
                _context3.next = 5;
                break;

              case 18:
                _context3.next = 24;
                break;

              case 20:
                _context3.prev = 20;
                _context3.t0 = _context3["catch"](3);
                _didIteratorError3 = true;
                _iteratorError3 = _context3.t0;

              case 24:
                _context3.prev = 24;
                _context3.prev = 25;

                if (!(!_iteratorNormalCompletion3 && _iterator3.return != null)) {
                  _context3.next = 29;
                  break;
                }

                _context3.next = 29;
                return _iterator3.return();

              case 29:
                _context3.prev = 29;

                if (!_didIteratorError3) {
                  _context3.next = 32;
                  break;
                }

                throw _iteratorError3;

              case 32:
                return _context3.finish(29);

              case 33:
                return _context3.finish(24);

              case 34:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, null, [[3, 20, 24, 34], [25,, 29, 33]]);
      })));
    });
  });
});
describe('#openForWrite', function () {
  var fileName = '/tmp/aiff_headers.aiff';
  var aiffOut;
  beforeEach(function () {
    (0, _helpers.unlinkIfExists)(fileName);
    aiffOut = new _aiff.default(fileName);
  });
  afterEach(function () {
    (0, _helpers.unlinkIfExists)(fileName);
  });
  test('file contains correct chunk data after open', function () {
    var aiffIn = new _aiff.default(fileName);
    return aiffOut.openForWrite({
      sampleRate: 48000,
      bitDepth: 24,
      numChannels: 1
    }).then(function () {
      return aiffOut.close();
    }).then(function () {
      return aiffIn.openForRead();
    }).then(function () {
      return aiffIn.close();
    }).then(function () {
      expect(aiffIn.chunks).toEqual(expect.objectContaining({
        FORM: {
          start: 0,
          size: 46,
          formType: 'AIFF'
        },
        COMM: {
          start: 12,
          size: 18,
          numChannels: 1,
          numSampleFrames: 0,
          sampleSize: 24,
          sampleRate: 48000
        },
        SSND: {
          start: 38,
          size: 8,
          offset: 0,
          blockSize: 0
        }
      }));
    });
  });
});
describe('#updateChunkHeadersOnDisk', function () {
  var fileName = '/tmp/aiff_headers_update.aiff';
  var aiffOut;
  beforeEach(function () {
    (0, _helpers.unlinkIfExists)(fileName);
    aiffOut = new _aiff.default(fileName);
    return aiffOut.openForWrite({
      sampleRate: 48000,
      bitDepth: 24,
      numChannels: 1
    });
  });
  afterEach(function () {
    return aiffOut.close().then(function () {
      (0, _helpers.unlinkIfExists)(fileName);
    });
  });
  test('file contains correct chunk data after update', function () {
    var aiffIn = new _aiff.default(fileName); // write bogus values to read and compare:

    aiffOut.chunks.FORM.size = 893;
    aiffOut.chunks.COMM.numSampleFrames = 134;
    aiffOut.chunks.SSND.size = 372;
    return aiffOut.updateChunkHeadersOnDisk().then(function () {
      return aiffOut.close();
    }).then(function () {
      return aiffIn.openForRead();
    }).then(function () {
      return aiffIn.close();
    }).then(function () {
      expect(aiffIn.chunks).toEqual(expect.objectContaining({
        FORM: {
          start: 0,
          size: 893,
          formType: 'AIFF'
        },
        COMM: {
          start: 12,
          size: 18,
          numChannels: 1,
          numSampleFrames: 134,
          sampleSize: 24,
          sampleRate: 48000
        },
        SSND: {
          start: 38,
          size: 372,
          offset: 0,
          blockSize: 0
        }
      }));
    });
  });
});
describe('#writeSamples', function () {
  var fileName = '/tmp/aiff_write_samples.aiff';
  var aiffOut;
  beforeEach(function () {
    (0, _helpers.unlinkIfExists)(fileName);
    aiffOut = new _aiff.default(fileName);
    return aiffOut.openForWrite({
      sampleRate: 44100,
      bitDepth: 16,
      numChannels: 2
    });
  });
  afterEach(function () {
    (0, _helpers.unlinkIfExists)(fileName);
  });
  test('headers are correct after write', function () {
    var aiffIn = new _aiff.default(fileName);
    var halfDC = (Math.pow(2, 15) - 1) / 2;
    var channels = [[], []];

    for (var i = 0; i < 1024; i++) {
      channels[0][i] = halfDC;
      channels[1][i] = -halfDC;
    }

    return aiffOut.writeSamples(channels).then(function () {
      return aiffOut.close();
    }).then(function () {
      return aiffIn.openForRead();
    }).then(function () {
      return aiffIn.close();
    }).then(function () {
      expect(aiffIn.chunks).toEqual(expect.objectContaining({
        FORM: {
          start: 0,
          size: 4142,
          formType: 'AIFF'
        },
        COMM: {
          start: 12,
          size: 18,
          numChannels: 2,
          numSampleFrames: 1024,
          sampleSize: 16,
          sampleRate: 44100
        },
        SSND: {
          start: 38,
          size: 8 + 1024 * 2 * 2,
          offset: 0,
          blockSize: 0
        }
      }));
    });
  });
});