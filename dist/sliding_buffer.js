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

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _utilties = require("./utilties");

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var SlidingBuffer = /*#__PURE__*/function () {
  function SlidingBuffer(size) {
    _classCallCheck(this, SlidingBuffer);

    this.size = size;
    this.buffer = Array(size);
    (0, _utilties.zeroArray)(this.buffer);
    this.lastValidDataI = size;
  }

  _createClass(SlidingBuffer, [{
    key: "shiftIn",
    // returns to you the data that got shifted out
    value: function shiftIn(data) {
      var _this$buffer;

      var validData = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

      if (data.length > this.size) {
        throw new Error('Cannot shiftIn more data than buffer size');
      }

      var shiftedOut = this.buffer.slice(0, data.length);
      this.buffer = this.buffer.slice(data.length, this.buffer.length);

      (_this$buffer = this.buffer).push.apply(_this$buffer, _toConsumableArray(data));

      if (validData) {
        this.lastValidDataI = this.size - 1;
      }

      return shiftedOut;
    } // shifts the contents to the left by length and pads with 0
    // returns to you the shiftedOut data

  }, {
    key: "shiftLeft",
    value: function shiftLeft(length) {
      if (length > this.size) {
        throw new Error('Cannot shiftOver more than buffer size');
      }

      var data = Array(length);
      (0, _utilties.zeroArray)(data);
      this.lastValidDataI -= length;
      return this.shiftIn(data, false);
    }
  }, {
    key: "hasValidData",
    get: function get() {
      return this.lastValidDataI >= 0 && this.lastValidDataI < this.size;
    }
  }]);

  return SlidingBuffer;
}();

var _default = SlidingBuffer;
exports.default = _default;