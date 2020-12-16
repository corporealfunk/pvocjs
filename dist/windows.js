"use strict";

require("core-js/modules/es.symbol");

require("core-js/modules/es.symbol.description");

require("core-js/modules/es.symbol.iterator");

require("core-js/modules/es.array.from");

require("core-js/modules/es.array.iterator");

require("core-js/modules/es.array.reduce");

require("core-js/modules/es.array.slice");

require("core-js/modules/es.function.name");

require("core-js/modules/es.object.to-string");

require("core-js/modules/es.regexp.to-string");

require("core-js/modules/es.string.iterator");

require("core-js/modules/web.dom-collections.iterator");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.scaleWindows = exports.getTriangle = exports.getSinc = exports.getRectangle = exports.getRamp = exports.getKaiser = exports.getVonHann = exports.getHamming = void 0;

var _fastMemoize = _interopRequireDefault(require("fast-memoize"));

var _bessel = _interopRequireDefault(require("bessel"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var twoPi = 8.0 * Math.atan(1.0); // helper for hamm/hann windows

var getIngWindow = function getIngWindow(size, a) {
  var b = 1.0 - a;
  var ingWindow = Array(size);

  for (var i = 0; i < size; i++) {
    ingWindow[i] = a - b * Math.cos(twoPi * i / (size - 1));
  }

  return ingWindow;
};

var getHamming = (0, _fastMemoize.default)(function (size) {
  return getIngWindow(size, 0.54);
}); // this is a more standard hann window and differs from that found in
// SoundHack Math.c:56

exports.getHamming = getHamming;
var getVonHann = (0, _fastMemoize.default)(function (size) {
  return getIngWindow(size, 0.5);
});
exports.getVonHann = getVonHann;
var getKaiser = (0, _fastMemoize.default)(function (size) {
  if (size % 2 !== 0) {
    throw new Error('Kaiser window must be an even size');
  }

  var kaiserWindow = Array(size);
  var a = 2.1645; // SoundHack value

  var param = Math.PI * a;

  var paramBessel = _bessel.default.besseli(param, 0);

  var halfSize = size / 2;

  for (var i = 0; i < halfSize; i++) {
    var value = param * Math.sqrt(1 - Math.pow(2 * i / size, 2));
    kaiserWindow[i + halfSize] = _bessel.default.besseli(value, 0) / paramBessel;
    kaiserWindow[halfSize - i] = kaiserWindow[i + halfSize];
  }

  kaiserWindow[0] = 0;
  kaiserWindow[size - 1] = 0;
  return kaiserWindow;
});
exports.getKaiser = getKaiser;
var getRamp = (0, _fastMemoize.default)(function (size) {
  var rampWindow = Array(size);

  for (var i = 0; i < size; i++) {
    rampWindow[i] = 1 - i / size;
  }

  return rampWindow;
});
exports.getRamp = getRamp;
var getRectangle = (0, _fastMemoize.default)(function (size) {
  var rectangleWindow = Array(size);

  for (var i = 0; i < size; i++) {
    rectangleWindow[i] = 1;
  }

  return rectangleWindow;
});
exports.getRectangle = getRectangle;
var getSinc = (0, _fastMemoize.default)(function (size) {
  var sincWindow = Array(size);
  var halfSize = size / 2;

  for (var i = 0; i < size; i++) {
    if (i === halfSize) {
      sincWindow[i] = 1;
    } else {
      var a = Math.PI * ((i - halfSize) / halfSize);
      var b = 2 * Math.PI * (i - halfSize);
      sincWindow[i] = size * Math.sin(a) / b;
    }
  }

  return sincWindow;
});
exports.getSinc = getSinc;
var getTriangle = (0, _fastMemoize.default)(function (size) {
  if (size % 2 !== 0) {
    throw new Error('Triangle window must be an even size');
  }

  var triangleWindow = Array(size);
  var halfSize = size / 2;

  for (var i = 0; i < halfSize; i++) {
    triangleWindow[i] = i / halfSize;
    triangleWindow[size - i] = triangleWindow[i];
  }

  triangleWindow[halfSize] = 1;
  return triangleWindow;
});
/*
 * analysisWindow: array of the analysis window to scale
 * synthesisWindow: array of the synthesis window to scale
 * windowSize: the windowSize of the FFT to be performed
 * points: the number of points required to store an FFT (2x bands)
 * interpolation: synthesis rate
 *
 * this code is from SoundHack/PhaseVocoderRoutines.c:15
 */

exports.getTriangle = getTriangle;

var scaleWindows = function scaleWindows(_ref) {
  var analysisWindow = _ref.analysisWindow,
      synthesisWindow = _ref.synthesisWindow,
      windowSize = _ref.windowSize,
      points = _ref.points,
      interpolation = _ref.interpolation;

  var scaledAnalysisWindow = _toConsumableArray(analysisWindow);

  var scaledSynthesisWindow = _toConsumableArray(synthesisWindow); // scaling, note from original code:

  /* when windowSize > points, also apply sin(x)/x windows to
     ensure that window are 0 at increments of points (the FFT length)
     away from the center of the analysis window and of interpolation
     away from the center of the synthesis window
  */


  if (windowSize > points) {
    var halfWindowSize = -(windowSize - 1) / 2;

    for (var i = 0; i < windowSize; i++, halfWindowSize += 1.0) {
      if (halfWindowSize !== 0.0) {
        scaledAnalysisWindow[i] = analysisWindow[i] * points * Math.sin(Math.PI * halfWindowSize / points) / (Math.PI * halfWindowSize);
        scaledSynthesisWindow[i] = synthesisWindow[i] * interpolation * Math.sin(Math.PI * halfWindowSize / interpolation) / (Math.PI * halfWindowSize);
      }
    }
  } // normalizing, note from original code:
  //

  /* normalize windows for unity gain across unmodified
   * analysis-synthesis procedure
   */


  var analysisSum = scaledAnalysisWindow.reduce(function (memo, val) {
    return memo + val;
  }, 0);
  var analysisFactor = 2.0 / analysisSum; // NOTE: we are ignoring the analysisType === CSOUND code branch
  // in the original SoundHack code, I do not think analysisType is
  // even set in the Pvoc routines in Soundhack

  var synthesisFactor = windowSize > points ? 1 / analysisFactor : analysisFactor;

  for (var _i = 0; _i < windowSize; _i++) {
    scaledAnalysisWindow[_i] *= analysisFactor;
    scaledSynthesisWindow[_i] *= synthesisFactor;
  }

  if (windowSize <= points) {
    var synthesisSum = 0;

    for (var _i2 = 0; _i2 < windowSize; _i2 += interpolation) {
      synthesisSum += scaledSynthesisWindow[_i2] * scaledSynthesisWindow[_i2];
    }

    var amplitudeFactor = 1 / synthesisSum;

    for (var _i3 = 0; _i3 < windowSize; _i3++) {
      scaledSynthesisWindow[_i3] *= amplitudeFactor;
    }
  }

  return {
    scaledAnalysisWindow: scaledAnalysisWindow,
    scaledSynthesisWindow: scaledSynthesisWindow
  };
};

exports.scaleWindows = scaleWindows;