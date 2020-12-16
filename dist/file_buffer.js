"use strict";

require("core-js/modules/es.symbol");

require("core-js/modules/es.array.filter");

require("core-js/modules/es.array.for-each");

require("core-js/modules/es.object.get-own-property-descriptor");

require("core-js/modules/es.object.get-own-property-descriptors");

require("core-js/modules/es.object.keys");

require("core-js/modules/es.object.to-string");

require("core-js/modules/es.promise");

require("core-js/modules/web.dom-collections.for-each");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("regenerator-runtime/runtime");

var _fs = require("./fs");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var FileBuffer = /*#__PURE__*/function () {
  function FileBuffer(filePath) {
    _classCallCheck(this, FileBuffer);

    this.filePath = filePath;
    this.fd = null;
  }

  _createClass(FileBuffer, [{
    key: "openForRead",
    value: function () {
      var _openForRead = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                if (!(this.fd !== null)) {
                  _context.next = 2;
                  break;
                }

                throw new Error('FileBuffer already has open file');

              case 2:
                _context.next = 4;
                return (0, _fs.openAsync)(this.filePath);

              case 4:
                this.fd = _context.sent;
                // next byte to read from file
                this.pointer = 0;

              case 6:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function openForRead() {
        return _openForRead.apply(this, arguments);
      }

      return openForRead;
    }()
  }, {
    key: "openForWrite",
    value: function () {
      var _openForWrite = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
        var mode,
            _args2 = arguments;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                mode = _args2.length > 0 && _args2[0] !== undefined ? _args2[0] : 'wx';

                if (!(this.fd !== null)) {
                  _context2.next = 3;
                  break;
                }

                throw new Error('FileBuffer already has open file');

              case 3:
                _context2.next = 5;
                return (0, _fs.openAsync)(this.filePath, mode);

              case 5:
                this.fd = _context2.sent;
                // next byte to read from file
                this.pointer = 0;

              case 7:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function openForWrite() {
        return _openForWrite.apply(this, arguments);
      }

      return openForWrite;
    }() // resolves data obj with { bytesRead, buffer, eof (bool) }
    // if bytes read < length, close the file (we are EOF)

  }, {
    key: "read",
    value: function () {
      var _read = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(_ref) {
        var _this = this;

        var start, length;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                start = _ref.start, length = _ref.length;
                return _context3.abrupt("return", (0, _fs.readAsync)(this.fd, Buffer.alloc(length), 0, length, start).then(function (data) {
                  _this.pointer = start + data.bytesRead;
                  var eof = data.bytesRead < length;
                  return _objectSpread(_objectSpread({}, data), {}, {
                    eof: eof
                  });
                }));

              case 2:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function read(_x) {
        return _read.apply(this, arguments);
      }

      return read;
    }() // returns number of bytes written

  }, {
    key: "write",
    value: function () {
      var _write = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(_ref2) {
        var _this2 = this;

        var start, buffer;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                start = _ref2.start, buffer = _ref2.buffer;
                return _context4.abrupt("return", (0, _fs.writeAsync)(this.fd, buffer, 0, buffer.length, start).then(function (_ref3) {
                  var bytesWritten = _ref3.bytesWritten;

                  if (bytesWritten !== buffer.length) {
                    throw new Error('Could not write desired number of bytes');
                  }

                  _this2.pointer = start + bytesWritten;
                  return bytesWritten;
                }));

              case 2:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function write(_x2) {
        return _write.apply(this, arguments);
      }

      return write;
    }()
  }, {
    key: "append",
    value: function () {
      var _append = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(buffer) {
        var _this3 = this;

        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                return _context5.abrupt("return", (0, _fs.writeAsync)(this.fd, buffer, 0, buffer.length, null).then(function (_ref4) {
                  var bytesWritten = _ref4.bytesWritten;

                  if (bytesWritten !== buffer.length) {
                    throw new Error('Could not write desired number of bytes');
                  }

                  _this3.pointer = null;
                  return bytesWritten;
                }));

              case 1:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function append(_x3) {
        return _append.apply(this, arguments);
      }

      return append;
    }() // reads the next length bytes from the file and returns
    // { bytesRead, buffer, eof }

  }, {
    key: "readNext",
    value: function () {
      var _readNext = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(length) {
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                return _context6.abrupt("return", this.read({
                  start: this.pointer,
                  length: length
                }));

              case 1:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function readNext(_x4) {
        return _readNext.apply(this, arguments);
      }

      return readNext;
    }()
  }, {
    key: "close",
    value: function () {
      var _close = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7() {
        var _this4 = this;

        return regeneratorRuntime.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                if (!(this.fd === null)) {
                  _context7.next = 2;
                  break;
                }

                return _context7.abrupt("return", Promise.resolve(null));

              case 2:
                return _context7.abrupt("return", (0, _fs.closeAsync)(this.fd).then(function () {
                  _this4.fd = null;
                }));

              case 3:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function close() {
        return _close.apply(this, arguments);
      }

      return close;
    }()
  }]);

  return FileBuffer;
}();

var _default = FileBuffer;
exports.default = _default;