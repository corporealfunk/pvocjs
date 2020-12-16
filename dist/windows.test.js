"use strict";

var _windows = require("./windows");

var _pvoc = _interopRequireDefault(require("./pvoc"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('#getHamming', function () {
  test('returns correct hamming window', function () {
    var hammingWindow = (0, _windows.getHamming)(10);
    expect(hammingWindow).toEqual([0.08000000000000007, 0.18761955616527015, 0.46012183827321207, 0.7699999999999999, 0.9722586055615179, 0.9722586055615179, 0.7700000000000002, 0.46012183827321224, 0.18761955616527026, 0.08000000000000007]);
  });
});
describe('#getVonHann', function () {
  test('returns correct hann window', function () {
    var hannWindow = (0, _windows.getVonHann)(10);
    expect(hannWindow).toEqual([0, 0.116977778440511, 0.4131759111665348, 0.7499999999999999, 0.9698463103929542, 0.9698463103929542, 0.7500000000000002, 0.413175911166535, 0.1169777784405111, 0]);
  });
});
describe('#getKaiser', function () {
  test('returns correct kaiser window', function () {
    var kaiserWindow = (0, _windows.getKaiser)(10);
    expect(kaiserWindow).toEqual([0, 0.08642921347855281, 0.2885948752723749, 0.5932877479138193, 0.8809748997589503, 1, 0.8809748997589503, 0.5932877479138193, 0.2885948752723749, 0]);
  });
});
describe('#getRamp', function () {
  test('returns correct ramp window', function () {
    var rampWindow = (0, _windows.getRamp)(10);
    expect(rampWindow).toEqual([1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.30000000000000004, 0.19999999999999996, 0.09999999999999998]);
  });
});
describe('#getRectangle', function () {
  test('returns correct rectangle window', function () {
    var rectangleWindow = (0, _windows.getRectangle)(10);
    expect(rectangleWindow).toEqual([1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);
  });
});
describe('#getSinc', function () {
  test('returns correct sinc window', function () {
    var sincWindow = (0, _windows.getSinc)(10);
    expect(sincWindow).toEqual([3.898171832519376e-17, 0.23387232094715982, 0.5045511524271047, 0.7568267286406569, 0.9354892837886392, 1, 0.9354892837886392, 0.7568267286406569, 0.5045511524271047, 0.23387232094715982]);
  });
});
describe('#getTriangle', function () {
  test('returns correct triangle window', function () {
    var triangleWindow = (0, _windows.getTriangle)(10);
    expect(triangleWindow).toEqual([0, 0.2, 0.4, 0.6, 0.8, 1, 0.8, 0.6, 0.4, 0.2, 0]);
  });
});
describe('#scaleWindows', function () {
  describe('when windowSize > points', function () {
    test('returns correct scaled window', function () {
      var pvoc = new _pvoc.default({
        bands: 8,
        overlap: 2,
        scaleFactor: 2
      });
      var rectangleWindow = (0, _windows.getRectangle)(pvoc.windowSize);

      var _scaleWindows = (0, _windows.scaleWindows)({
        analysisWindow: rectangleWindow,
        synthesisWindow: rectangleWindow,
        windowSize: pvoc.windowSize,
        points: pvoc.points,
        interpolation: pvoc.interpolation
      }),
          scaledAnalysisWindow = _scaleWindows.scaledAnalysisWindow,
          scaledSynthesisWindow = _scaleWindows.scaledSynthesisWindow;

      expect(scaledSynthesisWindow).toEqual([-0.29657487667347526, -0.7653740612155567, -0.8220684361204125, -0.3677528470751085, 0.3997313555164231, 1.0569451321548162, 1.1682025144869022, 0.5408130104045715, -0.6129214117918486, -1.7073729057885492, -2.017804343204649, -1.0215356863197456, 1.3134030252682452, 4.439169555050229, 7.398615925083715, 9.193821176877712, 9.193821176877712, 7.398615925083715, 4.439169555050229, 1.3134030252682452, -1.0215356863197456, -2.017804343204649, -1.7073729057885492, -0.6129214117918486, 0.5408130104045715, 1.1682025144869022, 1.0569451321548162, 0.3997313555164231, -0.3677528470751085, -0.8220684361204125, -0.7653740612155567, -0.29657487667347526]);
      expect(scaledAnalysisWindow).toEqual([0.0034136906457985826, 0.010807119218249003, 0.01884979519421818, 0.027396961303457375, 0.03628618906376107, 0.04534133965400855, 0.054376980507522175, 0.06320313329992723, 0.07163021773991754, 0.07947404843407085, 0.08656073933947088, 0.09273137205183381, 0.09784629036949063, 0.1017888940487781, 0.10446881910974033, 0.1058244100197558, 0.1058244100197558, 0.10446881910974033, 0.1017888940487781, 0.09784629036949063, 0.09273137205183381, 0.08656073933947088, 0.07947404843407085, 0.07163021773991754, 0.06320313329992723, 0.054376980507522175, 0.04534133965400855, 0.03628618906376107, 0.027396961303457375, 0.01884979519421818, 0.010807119218249003, 0.0034136906457985826]);
    });
  });
  describe('when windowSize < points', function () {
    test('returns correct scaled window', function () {
      var pvoc = new _pvoc.default({
        bands: 8,
        overlap: .5,
        scaleFactor: 2
      });
      var rectangleWindow = (0, _windows.getRectangle)(pvoc.windowSize);

      var _scaleWindows2 = (0, _windows.scaleWindows)({
        analysisWindow: rectangleWindow,
        synthesisWindow: rectangleWindow,
        windowSize: pvoc.windowSize,
        points: pvoc.points,
        interpolation: pvoc.interpolation
      }),
          scaledAnalysisWindow = _scaleWindows2.scaledAnalysisWindow,
          scaledSynthesisWindow = _scaleWindows2.scaledSynthesisWindow;

      expect(scaledSynthesisWindow).toEqual([0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5]);
      expect(scaledAnalysisWindow).toEqual([0.25, 0.25, 0.25, 0.25, 0.25, 0.25, 0.25, 0.25]);
    });
  });
});