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
exports.RealFFT = exports.bitReverse = exports.gOmegaPiTables = exports.FFT_TIME2FREQ = exports.FFT_FREQ2TIME = void 0;

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

/* eslint-disable no-param-reassign */
var FFT_TIME2FREQ = 1;
exports.FFT_TIME2FREQ = FFT_TIME2FREQ;
var FFT_FREQ2TIME = 2;
exports.FFT_FREQ2TIME = FFT_FREQ2TIME;
var gOmegaPiTables = {
  imag: [],
  real: []
};
exports.gOmegaPiTables = gOmegaPiTables;
var Pi = 4.0 * Math.atan(1.0);
var TwoPi = 8.0 * Math.atan(1.0); // InitFFTable code from SoundHack/Math/FFT.c

var initFFTTable = function initFFTTable() {
  var N = 2;

  for (var i = 0; i < 31; i++) {
    gOmegaPiTables.imag[i] = Math.sin(TwoPi / N);
    gOmegaPiTables.real[i] = -2.0 * Math.sin(Pi / N) * Math.sin(Pi / N); // JS bit shift: N = N << i:

    N *= Math.pow(2, 1);
  }
};

initFFTTable(); // rearranges data array in bit-reversal order in-place
// NOTE: the data array contains data in pairs, so the
// bitreversal operates on data pairs (element i and i + 1)
// and is not exactly a straight bitreversal, if our array is:
// [0, 1, 2, 3, 4, 5, 6, 7] <- array data
//  ____  ____  ____  ____
//   0     1     2     3    <- indexes to bit reverse

var bitReverse = function bitReverse(data) {
  var m = 0;
  var numberData = data.length;

  for (var i = 0, j = 0; i < numberData; i += 2, j += m) {
    if (j > i) {
      var realTemp = data[j];
      var imagTemp = data[j + 1];
      data[j] = data[i];
      data[j + 1] = data[i + 1];
      data[i] = realTemp;
      data[i + 1] = imagTemp;
    }

    for (m = numberData / 2; m >= 2 && j >= m; m /= 2) {
      j -= m;
    }
  }
}; // computes FFT in-place on the data


exports.bitReverse = bitReverse;

var FFT = function FFT(_ref) {
  var data = _ref.data,
      halfPoints = _ref.halfPoints,
      direction = _ref.direction;
  bitReverse(data);
  var twoMMax = 0;
  var n = 0;
  var numberData = halfPoints * 2;

  for (var nMax = 2; nMax < numberData; nMax = twoMMax) {
    twoMMax = nMax * 2;
    var omegaPiReal = gOmegaPiTables.real[n];
    var omegaPiImag = direction === FFT_TIME2FREQ ? gOmegaPiTables.imag[n] : -gOmegaPiTables.imag[n];
    n++;
    var omegaReal = 1;
    var omegaImag = 0;

    for (var m = 0; m < nMax; m += 2) {
      var realTemp = void 0;
      var imagTemp = void 0;

      for (var i = m; i < numberData; i += twoMMax) {
        var j = i + nMax;
        realTemp = omegaReal * data[j] - omegaImag * data[j + 1];
        imagTemp = omegaReal * data[j + 1] + omegaImag * data[j];
        data[j] = data[i] - realTemp;
        data[j + 1] = data[i + 1] - imagTemp;
        data[i] += realTemp;
        data[i + 1] += imagTemp;
      }

      realTemp = omegaReal;
      omegaReal = omegaReal * omegaPiReal - omegaImag * omegaPiImag + omegaReal;
      omegaImag = omegaImag * omegaPiReal + realTemp * omegaPiImag + omegaImag;
    }
  } // SoundHack original scales after taking the inverse FFT (iFFT)
  // however scaling after forward FFT provides better amplitude
  // results
  // ORIGINAL: if (direction === FFT_FREQ2TIME) {


  if (direction === FFT_TIME2FREQ) {
    var scale = 1.0 / halfPoints;

    for (var _i = 0; _i < halfPoints * 2; _i++) {
      data[_i] *= scale;
    }
  }
};

var RealFFT = function RealFFT(_ref2) {
  var data = _ref2.data,
      halfPoints = _ref2.halfPoints,
      direction = _ref2.direction;
  var twoPiOmmax = Pi / halfPoints;
  var omegaReal = 1.0;
  var omegaImag = 0;
  var c1 = 0.5;
  var c2;
  var xr;
  var xi;

  if (direction === FFT_TIME2FREQ) {
    c2 = -0.5;
    FFT({
      data: data,
      halfPoints: halfPoints,
      direction: direction
    });

    var _data = _slicedToArray(data, 2);

    xr = _data[0];
    xi = _data[1];
  } else {
    c2 = 0.5;
    twoPiOmmax = -twoPiOmmax;
    xr = data[1]; // eslint-disable-line prefer-destructuring

    xi = 0;
    data[1] = 0;
  }

  var temp = Math.sin(0.5 * twoPiOmmax);
  var omegaPiReal = -2.0 * temp * temp; // deal with sinf float force? normally in C sin returns a double?

  var omegaPiImag = Math.sin(twoPiOmmax);
  var N2p1 = halfPoints * 2 + 1;

  for (var i = 0; i <= halfPoints / 2; i++) {
    var i1 = i * 2;
    var i2 = i1 + 1;
    var i3 = N2p1 - i2;
    var i4 = i3 + 1;

    if (i === 0) {
      var h1r = c1 * (data[i1] + xr);
      var h1i = c1 * (data[i2] - xi);
      var h2r = -c2 * (data[i2] + xi);
      var h2i = c2 * (data[i1] - xr);
      data[i1] = h1r + omegaReal * h2r - omegaImag * h2i;
      data[i2] = h1i + omegaReal * h2i + omegaImag * h2r;
      xr = h1r - omegaReal * h2r + omegaImag * h2i;
      xi = -h1i + omegaReal * h2i + omegaImag * h2r;
    } else {
      var _h1r = c1 * (data[i1] + data[i3]);

      var _h1i = c1 * (data[i2] - data[i4]);

      var _h2r = -c2 * (data[i2] + data[i4]);

      var _h2i = c2 * (data[i1] - data[i3]);

      data[i1] = _h1r + omegaReal * _h2r - omegaImag * _h2i;
      data[i2] = _h1i + omegaReal * _h2i + omegaImag * _h2r;
      data[i3] = _h1r - omegaReal * _h2r + omegaImag * _h2i;
      data[i4] = -_h1i + omegaReal * _h2i + omegaImag * _h2r;
    }

    temp = omegaReal;
    omegaReal = temp * omegaPiReal - omegaImag * omegaPiImag + omegaReal;
    omegaImag = omegaImag * omegaPiReal + temp * omegaPiImag + omegaImag;
  }

  if (direction === FFT_TIME2FREQ) {
    data[1] = xr;
  } else {
    FFT({
      data: data,
      halfPoints: halfPoints,
      direction: direction
    });
  }
};

exports.RealFFT = RealFFT;