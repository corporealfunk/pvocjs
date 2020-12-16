"use strict";

var _pvoc = _interopRequireDefault(require("./pvoc"));

var _aiff = _interopRequireDefault(require("./aiff"));

var _helpers = require("../test/helpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('#findBestTimeScaleRatio', function () {
  test('desired ratio is > 1', function () {
    var pvoc = new _pvoc.default({
      bands: 4096,
      overlap: 4,
      scaleFactor: 1000
    });
    expect(pvoc.findBestTimeScaleRatio({
      windowSize: pvoc.windowSize,
      scaleFactor: 1000
    })).toEqual(expect.objectContaining({
      decimation: 4,
      interpolation: 4039,
      newScaleFactor: 1009.75
    }));
  });
  test('desired ratio is < 1', function () {
    var pvoc = new _pvoc.default({
      bands: 4096,
      overlap: 4,
      scaleFactor: .01
    });
    expect(pvoc.findBestTimeScaleRatio({
      windowSize: pvoc.windowSize,
      scaleFactor: .01
    })).toEqual(expect.objectContaining({
      decimation: 4039,
      interpolation: 40,
      newScaleFactor: 40 / 4039
    }));
  });
});
describe('run', function () {
  var a440 = './test/aiffs/mono_44k_16b_sine_a440.aif';
  var fileName = '/tmp/aiff_pvoc_run_test.aiff';
  var aiffOut;
  beforeEach(function () {
    (0, _helpers.unlinkIfExists)(fileName);
    aiffOut = new _aiff.default(fileName);
    return aiffOut.openForWrite({
      sampleRate: 44100,
      bitDepth: 16,
      numChannels: 1
    });
  });
  afterEach(function () {
    return aiffOut.close().then(function () {
      (0, _helpers.unlinkIfExists)(fileName);
    });
  });
  it('runs', function () {
    var aiffIn = new _aiff.default(a440);
    var allSamples = [];
    var pvoc = new _pvoc.default({
      bands: 1024,
      overlap: 1,
      scaleFactor: 1
    });
    return aiffIn.openForRead().then(function () {
      return pvoc.run(aiffIn, aiffOut);
    }).then(function () {
      return aiffIn.close();
    }).then(function () {// no expectation
    });
  }, 180000);
});