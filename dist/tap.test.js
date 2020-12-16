"use strict";

var _tap = _interopRequireDefault(require("./tap"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('.flush', function () {
  it('flushes to the directories', function () {
    var samples = [1, 2, 3, 4, 5, 6];

    _tap.default.accumulate('decimate', samples);

    var samples2 = ['a', 'b', 'c', 'd'];

    _tap.default.accumulate('decimate', samples2);

    var other = [5, 6, 7, 8, 3, 4];

    _tap.default.accumulate('foldedsamples', other);

    _tap.default.flush();
  });
});