"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var PromiseQueue = /*#__PURE__*/function () {
  function PromiseQueue() {
    _classCallCheck(this, PromiseQueue);

    this.queue = [];
    this.working = false;
  }

  _createClass(PromiseQueue, [{
    key: "push",
    value: function push(cb) {
      this.queue.push(cb);
      this.work();
    }
  }, {
    key: "work",
    value: function work() {
      if (this.working) {
        return;
      }
    }
  }]);

  return PromiseQueue;
}();

var _default = PromiseQueue;
exports.default = _default;