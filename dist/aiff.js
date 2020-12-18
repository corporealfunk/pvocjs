"use strict";

require("core-js/modules/es.symbol");

require("core-js/modules/es.symbol.description");

require("core-js/modules/es.symbol.async-iterator");

require("core-js/modules/es.array.concat");

require("core-js/modules/es.array.slice");

require("core-js/modules/es.object.to-string");

require("core-js/modules/es.promise");

require("core-js/modules/es.regexp.to-string");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("regenerator-runtime/runtime");

var _float = require("float80");

var _file_buffer = _interopRequireDefault(require("./file_buffer"));

var _utilties = require("./utilties");

var _fs = require("./fs");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Aiff = /*#__PURE__*/function () {
  function Aiff(filePath) {
    _classCallCheck(this, Aiff);

    this.fileBuffer = new _file_buffer.default(filePath);
    this.filePath = filePath;
    this.chunks = {
      FORM: {
        start: 0,
        size: 0,
        // long:     4 bytes
        formType: '' // chars:    4 bytes

      },
      COMM: {
        start: 0,
        size: 18,
        // long:     4 bytes
        numChannels: 0,
        // short:    2 bytes
        numSampleFrames: 0,
        // ulong:    4 bytes
        sampleSize: 0,
        // short:    2 bytes
        sampleRate: 0 // extended: 10 bytes

      },
      SSND: {
        start: 0,
        size: 0,
        // long:     4 bytes
        offset: 0,
        // ulong:    4 bytes
        blockSize: 0 // ulong:    4 bytes

      }
    }; // how many samples to return when reading through the sound data

    this.samplesPerRead = 1000; // to stream samples into client code, call it like this:
    // for await (let samplesByChannel of aiff.samples) {
    //  chanelsArray with have n entries (1 per channel)
    //  each channel is an array samplePerRead long, each entry being a Number representing a sample value
    //  every iteration yeilds the next samplePerRead samples
    // }
    // https://javascript.info/async-iterators-generators

    var _this = this;

    this.samples = _defineProperty({}, Symbol.asyncIterator, function () {
      var nextSampleFrameStart = 0;
      var numSampleFrames = _this.chunks.COMM.numSampleFrames;
      return {
        next: function next() {
          return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
            var sampleFramesRemaining, sampleFramesToRead, samplesByChannel;
            return regeneratorRuntime.wrap(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    if (!(nextSampleFrameStart >= numSampleFrames)) {
                      _context.next = 2;
                      break;
                    }

                    return _context.abrupt("return", {
                      done: true
                    });

                  case 2:
                    sampleFramesRemaining = numSampleFrames - nextSampleFrameStart;
                    sampleFramesToRead = _this.samplesPerRead <= sampleFramesRemaining ? _this.samplesPerRead : numSampleFrames - nextSampleFrameStart;
                    _context.next = 6;
                    return _this.readSampleFrames({
                      sampleFrameStart: nextSampleFrameStart,
                      sampleFramesToRead: sampleFramesToRead
                    });

                  case 6:
                    samplesByChannel = _context.sent;
                    nextSampleFrameStart = nextSampleFrameStart + sampleFramesToRead;
                    return _context.abrupt("return", {
                      done: false,
                      value: samplesByChannel
                    });

                  case 9:
                  case "end":
                    return _context.stop();
                }
              }
            }, _callee);
          }))();
        }
      };
    });
  }

  _createClass(Aiff, [{
    key: "openForRead",
    value: function () {
      var _openForRead = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
        var _this2 = this;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                return _context2.abrupt("return", this.fileBuffer.openForRead().then(function () {
                  return _this2.parse();
                }));

              case 1:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function openForRead() {
        return _openForRead.apply(this, arguments);
      }

      return openForRead;
    }() // seek through file to find all chunks and populate
    // this.chunks

  }, {
    key: "parse",
    value: function () {
      var _parse = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
        var eof, nextChunkStart, _yield$statAsync, size, chunkHeader;

        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                // loop all the chunks and find the ones we need, populate the data
                eof = false;
                nextChunkStart = 0;
                _context3.next = 4;
                return (0, _fs.statAsync)(this.filePath);

              case 4:
                _yield$statAsync = _context3.sent;
                size = _yield$statAsync.size;

              case 6:
                if (eof) {
                  _context3.next = 29;
                  break;
                }

                _context3.next = 9;
                return this.readNextChunkHeader(nextChunkStart);

              case 9:
                chunkHeader = _context3.sent;
                _context3.t0 = chunkHeader.chunkId;
                _context3.next = _context3.t0 === 'FORM' ? 13 : _context3.t0 === 'COMM' ? 17 : _context3.t0 === 'SSND' ? 21 : 25;
                break;

              case 13:
                _context3.next = 15;
                return this.parseForm(nextChunkStart);

              case 15:
                nextChunkStart = 12;
                return _context3.abrupt("break", 25);

              case 17:
                _context3.next = 19;
                return this.parseComm(nextChunkStart);

              case 19:
                nextChunkStart = nextChunkStart + 8 + chunkHeader.size;
                return _context3.abrupt("break", 25);

              case 21:
                _context3.next = 23;
                return this.parseSsnd(nextChunkStart);

              case 23:
                nextChunkStart = nextChunkStart + 16 + chunkHeader.size;
                return _context3.abrupt("break", 25);

              case 25:
                if (chunkHeader.chunkId !== 'FORM') {
                  // if odd, account for the padding byte at end of data
                  if (chunkHeader.size % 2 !== 0) {
                    nextChunkStart = nextChunkStart + 1;
                  }
                }

                eof = nextChunkStart >= size;
                _context3.next = 6;
                break;

              case 29:
                if (this.chunks.COMM.start) {
                  _context3.next = 31;
                  break;
                }

                throw new Error('File does not have COMM Chunk');

              case 31:
                if (this.chunks.SSND.start) {
                  _context3.next = 33;
                  break;
                }

                throw new Error('File does not have SSND Chunk');

              case 33:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function parse() {
        return _parse.apply(this, arguments);
      }

      return parse;
    }()
  }, {
    key: "readNextChunkHeader",
    value: function () {
      var _readNextChunkHeader = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(nextChunkStart) {
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                return _context4.abrupt("return", this.fileBuffer.read({
                  start: nextChunkStart,
                  length: 8
                }).then(function (data) {
                  var buffer = data.buffer;
                  return {
                    chunkId: buffer.toString('latin1', 0, 4),
                    size: buffer.readInt32BE(4)
                  };
                }));

              case 1:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function readNextChunkHeader(_x) {
        return _readNextChunkHeader.apply(this, arguments);
      }

      return readNextChunkHeader;
    }() // form is the header chunk of an AIFF

  }, {
    key: "parseForm",
    value: function () {
      var _parseForm = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(start) {
        var _this3 = this;

        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                return _context5.abrupt("return", this.fileBuffer.read({
                  start: start,
                  length: 12
                }).then(function (data) {
                  var buffer = data.buffer;
                  var FORM = _this3.chunks.FORM;
                  var chunkId = buffer.toString('latin1', 0, 4);
                  FORM.size = buffer.readInt32BE(4);
                  FORM.formType = buffer.toString('latin1', 8, 12);

                  if (FORM.formType !== 'AIFF') {
                    throw new Error("cannot read formtype ".concat(FORM.formType));
                  }
                }));

              case 1:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function parseForm(_x2) {
        return _parseForm.apply(this, arguments);
      }

      return parseForm;
    }() // parse the COMM chunk

  }, {
    key: "parseComm",
    value: function () {
      var _parseComm = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(start) {
        var _this4 = this;

        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                return _context6.abrupt("return", this.fileBuffer.read({
                  start: start,
                  length: 26
                }).then(function (data) {
                  var buffer = data.buffer;
                  var COMM = _this4.chunks.COMM;
                  COMM.start = start;
                  COMM.size = buffer.readInt32BE(4);
                  COMM.numChannels = buffer.readInt16BE(8);
                  COMM.numSampleFrames = buffer.readUInt32BE(10);
                  COMM.sampleSize = buffer.readInt16BE(14);
                  COMM.sampleRate = _float.Float80.fromBytes(buffer.slice(16, 26)).asNumber().toNumber();
                }));

              case 1:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function parseComm(_x3) {
        return _parseComm.apply(this, arguments);
      }

      return parseComm;
    }() // parse the SSND chunk

  }, {
    key: "parseSsnd",
    value: function () {
      var _parseSsnd = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(start) {
        var _this5 = this;

        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                return _context7.abrupt("return", this.fileBuffer.read({
                  start: start,
                  length: 16
                }).then(function (data) {
                  var buffer = data.buffer;
                  var SSND = _this5.chunks.SSND;
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
                }));

              case 1:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function parseSsnd(_x4) {
        return _parseSsnd.apply(this, arguments);
      }

      return parseSsnd;
    }() // sampleFrameStart: which sample frame to start reading from?
    // sampleFramesToRead: how many sample frames should we read?

  }, {
    key: "readSampleFrames",
    value: function () {
      var _readSampleFrames = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(_ref) {
        var _this6 = this;

        var sampleFrameStart, sampleFramesToRead, start, length;
        return regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                sampleFrameStart = _ref.sampleFrameStart, sampleFramesToRead = _ref.sampleFramesToRead;
                // at which byte in the file do we start reading?
                start = this.soundDataStart + sampleFrameStart * this.sampleFrameSize; // how many bytes do we read?

                length = sampleFramesToRead * this.sampleFrameSize;
                return _context8.abrupt("return", this.fileBuffer.read({
                  start: start,
                  length: length
                }).then(function (data) {
                  var buffer = data.buffer,
                      bytesRead = data.bytesRead; // create an array with a subarray to hold samples for each channel

                  var samplesByChannel = [];

                  for (var i = 0; i < _this6.chunks.COMM.numChannels; i++) {
                    samplesByChannel.push([]);
                  } // we should never be asked to read more data than exists in the file


                  if (bytesRead !== length) {
                    throw new Error('cannot request sampleFrames past end of file');
                  }

                  if (bytesRead % _this6.sampleFrameSize !== 0) {
                    throw new Error('bytesRead is not a multiple of sampleFrameSize');
                  } // how many sample frames were actually returned?


                  var sampleFramesRead = bytesRead / _this6.sampleFrameSize; // loop the sample frames:

                  for (var _i = 0; _i < sampleFramesRead; _i++) {
                    // where does the frame start within the buffer
                    var frameStart = _i * _this6.sampleFrameSize; // loop each channel

                    for (var j = 0; j < _this6.chunks.COMM.numChannels; j++) {
                      // where does this channel start within the buffer?
                      var channelStart = frameStart + j * _this6.sampleStorageBytes; // get one sample for this channel

                      var samplePointBytes = buffer.slice(channelStart, channelStart + _this6.sampleStorageBytes); // use a new byte buffer to leverage reading JS Numbers, we can only read 8, 16, 32 bits
                      // and AIFFs can only contain samples of bitdepth 1-32 bits
                      // lets always pad it out to 4 bytes long so we always read a 32 bit number

                      var sampleBuffer = Buffer.concat([samplePointBytes, Buffer.alloc(4 - _this6.sampleStorageBytes)]);
                      var paddingBits = _this6.sampleZeroPadBits + (4 - _this6.sampleStorageBytes) * 8;
                      var sample = sampleBuffer.readInt32BE(); // bit shift in JS:

                      samplesByChannel[j][_i] = Math.floor(sample / Math.pow(2, paddingBits));
                    }
                  }

                  return samplesByChannel;
                }));

              case 4:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      function readSampleFrames(_x5) {
        return _readSampleFrames.apply(this, arguments);
      }

      return readSampleFrames;
    }() // return an iterator that will grab <size> samples at a time
    // if size is undefined, the iterator will grab all data on first read
    // yields array of channels which will contain up to <size> samples

  }, {
    key: "samplesIterator",
    value: /*#__PURE__*/regeneratorRuntime.mark(function samplesIterator(size) {
      var nextSampleFrameStart, numSampleFrames, sampleFramesRemaining, sampleFramesToRead;
      return regeneratorRuntime.wrap(function samplesIterator$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              nextSampleFrameStart = 0;
              numSampleFrames = this.chunks.COMM.numSampleFrames;
              sampleFramesRemaining = numSampleFrames - nextSampleFrameStart;

            case 3:
              if (!(sampleFramesRemaining > 0)) {
                _context9.next = 11;
                break;
              }

              sampleFramesToRead = size <= sampleFramesRemaining ? size : numSampleFrames - nextSampleFrameStart;
              _context9.next = 7;
              return this.readSampleFrames({
                sampleFrameStart: nextSampleFrameStart,
                sampleFramesToRead: sampleFramesToRead
              });

            case 7:
              nextSampleFrameStart += sampleFramesToRead;
              sampleFramesRemaining = numSampleFrames - nextSampleFrameStart;
              _context9.next = 3;
              break;

            case 11:
            case "end":
              return _context9.stop();
          }
        }
      }, samplesIterator, this);
    })
  }, {
    key: "close",
    value: function () {
      var _close = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9() {
        return regeneratorRuntime.wrap(function _callee9$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                return _context10.abrupt("return", this.fileBuffer.close());

              case 1:
              case "end":
                return _context10.stop();
            }
          }
        }, _callee9, this);
      }));

      function close() {
        return _close.apply(this, arguments);
      }

      return close;
    }()
  }, {
    key: "openForWrite",
    value: function () {
      var _openForWrite = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10(_ref2) {
        var _this7 = this;

        var sampleRate, bitDepth, numChannels, _this$chunks, COMM, FORM, SSND;

        return regeneratorRuntime.wrap(function _callee10$(_context11) {
          while (1) {
            switch (_context11.prev = _context11.next) {
              case 0:
                sampleRate = _ref2.sampleRate, bitDepth = _ref2.bitDepth, numChannels = _ref2.numChannels;
                _this$chunks = this.chunks, COMM = _this$chunks.COMM, FORM = _this$chunks.FORM, SSND = _this$chunks.SSND;
                FORM.size = 4;
                FORM.formType = 'AIFF';
                COMM.start = 12;
                COMM.numChannels = numChannels;
                COMM.numSampleFrames = 0;
                COMM.sampleSize = bitDepth;
                COMM.sampleRate = sampleRate; // COMM headers + it's size:

                FORM.size += 8 + COMM.size;
                SSND.start = 38;
                SSND.size = 8; // SSND headers + it's size:

                FORM.size += 8 + SSND.size;
                return _context11.abrupt("return", this.fileBuffer.openForWrite().then(function () {
                  return _this7.fileBuffer.append(_this7.formChunkToBuffer());
                }).then(function () {
                  return _this7.fileBuffer.append(_this7.commChunkToBuffer());
                }).then(function () {
                  return _this7.fileBuffer.append(_this7.ssndChunkToBuffer());
                }));

              case 14:
              case "end":
                return _context11.stop();
            }
          }
        }, _callee10, this);
      }));

      function openForWrite(_x6) {
        return _openForWrite.apply(this, arguments);
      }

      return openForWrite;
    }()
  }, {
    key: "formChunkToBuffer",
    value: function formChunkToBuffer() {
      var FORM = this.chunks.FORM;
      var buffer = Buffer.alloc(12);
      buffer.write('FORM');
      buffer.writeInt32BE(FORM.size, 4);
      buffer.write('AIFF', 8);
      return buffer;
    }
  }, {
    key: "commChunkToBuffer",
    value: function commChunkToBuffer() {
      var COMM = this.chunks.COMM;
      var buffer = Buffer.alloc(26);
      buffer.write('COMM');
      buffer.writeInt32BE(COMM.size, 4);
      buffer.writeInt16BE(COMM.numChannels, 8);
      buffer.writeUInt32BE(COMM.numSampleFrames, 10);
      buffer.writeInt16BE(COMM.sampleSize, 14);
      var sampleRateFloat80 = (0, _utilties.floatToExtended)(COMM.sampleRate);
      sampleRateFloat80.copy(buffer, 16);
      return buffer;
    }
  }, {
    key: "ssndChunkToBuffer",
    value: function ssndChunkToBuffer() {
      var SSND = this.chunks.SSND;
      var buffer = Buffer.alloc(16);
      buffer.write('SSND');
      buffer.writeInt32BE(SSND.size, 4);
      buffer.writeUInt32BE(SSND.offset, 8);
      buffer.writeUInt32BE(SSND.blockSize, 12);
      return buffer;
    } // chanels is an array of arrays where each sub-array
    // is sample data for that channel,
    // this is going to appended to the end of the file
    // channels is an array, where each element is a subarray of
    // js Number point samples for a given channel
    // we will handle rounding and bit padding into bit depth
    // needed. Any extra channels beyond our storage needs
    // will be tossed. If you send fewer than our storage needs,
    // extra channels will be Zeroed

  }, {
    key: "writeSamples",
    value: function () {
      var _writeSamples = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11(channels) {
        var numInputSamples, numChannels, output, nextSampleFrameI, i, x, nextSampleI, sample, tmpBuffer, storageSample, _this$chunks2, FORM, COMM, SSND;

        return regeneratorRuntime.wrap(function _callee11$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                if (!(channels.length === 0)) {
                  _context12.next = 2;
                  break;
                }

                throw new Error('Cannot write 0 channels');

              case 2:
                // TODO: we can only have a file where the FORM.size must be < (2**32-1) - 1
                // guard against overages
                numInputSamples = channels[0].length;
                numChannels = this.chunks.COMM.numChannels;
                output = Buffer.alloc(this.sampleFrameSize * numInputSamples); // where in the buffer to write the next frame:

                nextSampleFrameI = 0;
                i = 0;

              case 7:
                if (!(i < numInputSamples)) {
                  _context12.next = 36;
                  break;
                }

                x = 0;

              case 9:
                if (!(x < numChannels)) {
                  _context12.next = 32;
                  break;
                }

                nextSampleI = nextSampleFrameI + x * this.sampleStorageBytes;
                sample = Math.round(channels[x][i]); // if it is outside the bit depth range, clip it

                if (sample < this.bitDepthRange[0]) {
                  sample = this.bitDepthRange[0];
                } else if (sample > this.bitDepthRange[1]) {
                  sample = this.bitDepthRange[1];
                } // pad the sample by shifting left if needed


                if (this.sampleZeroPadBits > 0) {
                  sample *= Math.pow(2, this.sampleZeroPadBits);
                }

                _context12.t0 = this.sampleStorageBytes;
                _context12.next = _context12.t0 === 1 ? 17 : _context12.t0 === 2 ? 19 : _context12.t0 === 3 ? 21 : _context12.t0 === 4 ? 26 : 28;
                break;

              case 17:
                output.writeInt8(sample, nextSampleI);
                return _context12.abrupt("break", 29);

              case 19:
                output.writeInt16BE(sample, nextSampleI);
                return _context12.abrupt("break", 29);

              case 21:
                tmpBuffer = Buffer.alloc(4); // shift it one more byte over

                storageSample = sample * Math.pow(2, 8); // write 4 bytes (the last byte is now padding)

                tmpBuffer.writeInt32BE(storageSample); // copy only the first 3 bytes

                tmpBuffer.copy(output, nextSampleI, 0, 3);
                return _context12.abrupt("break", 29);

              case 26:
                output.writeInt32BE(sample, nextSampleI);
                return _context12.abrupt("break", 29);

              case 28:
                throw new Error("sampleStorageBytes must be within range 1-4 inclusive, got ".concat(this.sampleStorageBytes));

              case 29:
                x++;
                _context12.next = 9;
                break;

              case 32:
                nextSampleFrameI += this.sampleFrameSize;

              case 33:
                i++;
                _context12.next = 7;
                break;

              case 36:
                _context12.next = 38;
                return this.fileBuffer.append(output);

              case 38:
                // update counters:
                _this$chunks2 = this.chunks, FORM = _this$chunks2.FORM, COMM = _this$chunks2.COMM, SSND = _this$chunks2.SSND;
                COMM.numSampleFrames += numInputSamples;
                SSND.size += numInputSamples * this.sampleFrameSize;
                FORM.size += numInputSamples * this.sampleFrameSize;
                _context12.next = 44;
                return this.updateChunkHeadersOnDisk();

              case 44:
              case "end":
                return _context12.stop();
            }
          }
        }, _callee11, this);
      }));

      function writeSamples(_x7) {
        return _writeSamples.apply(this, arguments);
      }

      return writeSamples;
    }()
  }, {
    key: "updateChunkHeadersOnDisk",
    value: function () {
      var _updateChunkHeadersOnDisk = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee12() {
        var _this8 = this;

        var headerBuffer;
        return regeneratorRuntime.wrap(function _callee12$(_context13) {
          while (1) {
            switch (_context13.prev = _context13.next) {
              case 0:
                headerBuffer = new _file_buffer.default(this.filePath);
                return _context13.abrupt("return", headerBuffer.openForWrite('r+').then(function () {
                  return headerBuffer.write({
                    start: 0,
                    buffer: _this8.formChunkToBuffer()
                  });
                }).then(function () {
                  return headerBuffer.write({
                    start: _this8.chunks.COMM.start,
                    buffer: _this8.commChunkToBuffer()
                  });
                }).then(function () {
                  return headerBuffer.write({
                    start: _this8.chunks.SSND.start,
                    buffer: _this8.ssndChunkToBuffer()
                  });
                }).then(function () {
                  return headerBuffer.close();
                }));

              case 2:
              case "end":
                return _context13.stop();
            }
          }
        }, _callee12, this);
      }));

      function updateChunkHeadersOnDisk() {
        return _updateChunkHeadersOnDisk.apply(this, arguments);
      }

      return updateChunkHeadersOnDisk;
    }()
  }, {
    key: "sampleRate",
    get: function get() {
      return this.chunks.COMM.sampleRate;
    }
  }, {
    key: "bitDepth",
    get: function get() {
      return this.chunks.COMM.sampleSize;
    }
  }, {
    key: "numChannels",
    get: function get() {
      return this.chunks.COMM.numChannels;
    }
  }, {
    key: "numSamples",
    get: function get() {
      return this.chunks.COMM.numSampleFrames;
    } // how many bytes are needed to store one sample?

  }, {
    key: "sampleStorageBytes",
    get: function get() {
      if (this._sampleStorageBytes === undefined) {
        this._sampleStorageBytes = Math.ceil(this.bitDepth / 8);
      }

      return this._sampleStorageBytes;
    } // how many bits are at the end of the sample that are zero pads?

  }, {
    key: "sampleZeroPadBits",
    get: function get() {
      if (this._sampleZeroPadBits === undefined) {
        this._sampleZeroPadBits = this.sampleStorageBytes * 8 - this.bitDepth;
      }

      return this._sampleZeroPadBits;
    } // how many bytes are in each sample frame?

  }, {
    key: "sampleFrameSize",
    get: function get() {
      if (this._sampleFrameSize === undefined) {
        this._sampleFrameSize = this.sampleStorageBytes * this.numChannels;
      }

      return this._sampleFrameSize;
    } // at which byte index the sound data starts in the file:

  }, {
    key: "soundDataStart",
    get: function get() {
      if (this._soundDataStart === undefined) {
        this._soundDataStart = this.chunks.SSND.start + 16;
      }

      return this._soundDataStart;
    } // helper to return a two element array of low and high sample value range
    // based on bit depth

  }, {
    key: "bitDepthRange",
    get: function get() {
      if (this._bitDepthRange === undefined) {
        this._bitDepthRange = [-Math.pow(2, this.bitDepth - 1), Math.pow(2, this.bitDepth - 1) - 1];
      }

      return this._bitDepthRange;
    }
  }]);

  return Aiff;
}();

var _default = Aiff;
exports.default = _default;