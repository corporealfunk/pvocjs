"use strict";

require("core-js/modules/es.array.concat");

require("core-js/modules/es.array.for-each");

require("core-js/modules/es.array.index-of");

require("core-js/modules/es.array.join");

require("core-js/modules/es.array.map");

require("core-js/modules/es.object.keys");

require("core-js/modules/es.object.to-string");

require("core-js/modules/es.promise");

require("core-js/modules/es.string.pad-start");

require("core-js/modules/web.dom-collections.for-each");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("regenerator-runtime/runtime");

var _fs = _interopRequireDefault(require("fs"));

var _fs2 = require("./fs");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var DIR = '/tmp/tapper';

var Tap = /*#__PURE__*/function () {
  function Tap(csvDirectory) {
    _classCallCheck(this, Tap);

    this.csvDirectory = csvDirectory;
    this.dataSet = {};
    this.flushCount = 0;
    this.time = Math.floor(+new Date() / 1000);
    this.keyOrder = [];
  }

  _createClass(Tap, [{
    key: "accumulate",
    value: function accumulate(key, samples) {
      var _this = this;

      if (this.dataSet[key] === undefined) {
        this.dataSet[key] = [];
      }

      this.keyOrder.push(key);
      var rows = samples.map(function (sample) {
        return [sample];
      });
      rows.forEach(function (row) {
        return _this.dataSet[key].push(row);
      });
    } // writes accumulated data to csv files in the directory
    // a dataSet has keys that will be named as CSV files

  }, {
    key: "flush",
    value: function () {
      var _flush = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var setName,
            flushName,
            subDir,
            dir,
            _i,
            _Object$keys,
            key,
            rows,
            contents,
            keyI,
            fileName,
            _args = arguments;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                setName = _args.length > 0 && _args[0] !== undefined ? _args[0] : null;
                this.flushCount += 1;
                flushName = setName || this.flushCount;
                subDir = "".concat(this.time, "/").concat(flushName);
                dir = "".concat(this.csvDirectory, "/").concat(subDir);

                if (!_fs.default.existsSync(dir)) {
                  _fs.default.mkdirSync(dir, {
                    recursive: true
                  });
                }

                _i = 0, _Object$keys = Object.keys(this.dataSet);

              case 7:
                if (!(_i < _Object$keys.length)) {
                  _context.next = 19;
                  break;
                }

                key = _Object$keys[_i];
                rows = this.dataSet[key];
                contents = '';
                rows.forEach(function (row) {
                  contents += row.join(',');
                  contents += "\n";
                });
                keyI = String(this.keyOrder.indexOf(key));
                fileName = "".concat(dir, "/").concat(keyI.padStart(2, '0'), "_").concat(key, ".csv");
                _context.next = 16;
                return (0, _fs2.writeFileAsync)(fileName, contents);

              case 16:
                _i++;
                _context.next = 7;
                break;

              case 19:
                this.dataSet = {};
                this.keyOrder = [];

              case 21:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function flush() {
        return _flush.apply(this, arguments);
      }

      return flush;
    }()
  }]);

  return Tap;
}();

var Tapper = new Tap(DIR);
var _default = Tapper;
exports.default = _default;