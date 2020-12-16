"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.phaseInterpolate = exports.simpleSpectralGate = exports.polarToCart = exports.cartToPolar = void 0;

var _utilties = require("./utilties");

/* eslint-disable no-param-reassign */
var Pi = 4.0 * Math.atan(1.0);
var TwoPi = 8.0 * Math.atan(1.0);

var hypot = function hypot(x, y) {
  var z = x * x + y * y;

  if (z === 0) {
    return 0;
  }

  return Math.sqrt(z);
};

var cartToPolar = function cartToPolar(_ref) {
  var spectrum = _ref.spectrum,
      halfPoints = _ref.halfPoints;
  var polarSpectrum = Array(spectrum.length + 2);
  (0, _utilties.zeroArray)(polarSpectrum);

  for (var i = 0; i <= halfPoints; i++) {
    var realIndex = i * 2;
    var ampIndex = realIndex;
    var imagIndex = realIndex + 1;
    var phaseIndex = imagIndex;
    var realPart = void 0;
    var imagPart = void 0;

    if (i === 0) {
      realPart = spectrum[realIndex];
      imagPart = 0;
    } else if (i === halfPoints) {
      realPart = spectrum[1]; // eslint-disable-line prefer-destructuring

      imagPart = 0;
    } else {
      realPart = spectrum[realIndex];
      imagPart = spectrum[imagIndex];
    }

    polarSpectrum[ampIndex] = hypot(realPart, imagPart);

    if (polarSpectrum[ampIndex] === 0) {
      polarSpectrum[phaseIndex] = 0;
    } else {
      polarSpectrum[phaseIndex] = -Math.atan2(imagPart, realPart);
    }
  }

  return polarSpectrum;
};

exports.cartToPolar = cartToPolar;

var polarToCart = function polarToCart(_ref2) {
  var polarSpectrum = _ref2.polarSpectrum,
      halfPoints = _ref2.halfPoints;
  var spectrum = Array(halfPoints * 2);

  for (var i = 0; i < spectrum.length; i++) {
    spectrum[i] = 0;
  }

  for (var _i = 0; _i <= halfPoints; _i++) {
    var realIndex = _i * 2;
    var ampIndex = realIndex;
    var imagIndex = realIndex + 1;
    var phaseIndex = imagIndex;
    var realValue = void 0;
    var imagValue = void 0;

    if (polarSpectrum[ampIndex] === 0) {
      realValue = 0;
      imagValue = 0;
    } else if (_i === 0 || _i === halfPoints) {
      realValue = polarSpectrum[ampIndex] * Math.cos(polarSpectrum[phaseIndex]);
      imagValue = 0;
    } else {
      realValue = polarSpectrum[ampIndex] * Math.cos(polarSpectrum[phaseIndex]);
      imagValue = -polarSpectrum[ampIndex] * Math.sin(polarSpectrum[phaseIndex]);
    }

    if (_i === halfPoints) {
      realIndex = 1;
    }

    spectrum[realIndex] = realValue;

    if (_i !== halfPoints && _i !== 0) {
      spectrum[imagIndex] = imagValue;
    }
  }

  return spectrum;
}; // in-place spectral gate


exports.polarToCart = polarToCart;

var simpleSpectralGate = function simpleSpectralGate(_ref3) {
  var polarSpectrum = _ref3.polarSpectrum,
      maskRatio = _ref3.maskRatio,
      minAmplitude = _ref3.minAmplitude,
      halfPoints = _ref3.halfPoints;
  var maxAmplitude = 0;

  for (var i = 0; i <= halfPoints; i++) {
    var ampIndex = i * 2;

    if (polarSpectrum[ampIndex] > maxAmplitude) {
      maxAmplitude = polarSpectrum[ampIndex];
    }
  }

  var maskAmplitude = maskRatio * maxAmplitude;

  for (var _i2 = 0; _i2 <= halfPoints; _i2++) {
    var _ampIndex = _i2 * 2; // duck to 0 if below maskAmplitude or minAmplitude


    if (polarSpectrum[_ampIndex] < maskAmplitude) {
      polarSpectrum[_ampIndex] = 0;
    } else if (polarSpectrum[_ampIndex] < minAmplitude) {
      polarSpectrum[_ampIndex] = 0;
    }
  }
};

exports.simpleSpectralGate = simpleSpectralGate;

var phaseInterpolate = function phaseInterpolate(_ref4) {
  var polarSpectrum = _ref4.polarSpectrum,
      halfPoints = _ref4.halfPoints,
      decimation = _ref4.decimation,
      scaleFactor = _ref4.scaleFactor,
      phaseLocking = _ref4.phaseLocking;
  var phasePerBand = decimation * TwoPi / (halfPoints * 2);
  var lastPhaseIn = Array(halfPoints + 1);
  var lastPhaseOut = Array(halfPoints + 1);
  (0, _utilties.zeroArray)(lastPhaseIn);
  (0, _utilties.zeroArray)(lastPhaseOut);

  for (var i = 0; i <= halfPoints; i++) {
    var ampIndex = i * 2;
    var phaseIndex = ampIndex + 1;
    var phaseDifference = void 0;

    if (polarSpectrum[ampIndex] === 0) {
      phaseDifference = 0;
      polarSpectrum[phaseIndex] = lastPhaseOut[i];
    } else {
      if (phaseLocking) {
        var maxAmplitude = 0;

        if (i > 1) {
          maxAmplitude = polarSpectrum[ampIndex - 2];
          phaseDifference = polarSpectrum[phaseIndex - 2] - lastPhaseIn[i - 1] - phasePerBand;
        }

        if (polarSpectrum[ampIndex] > maxAmplitude) {
          maxAmplitude = polarSpectrum[ampIndex];
        }

        if (i !== halfPoints) {
          if (polarSpectrum[ampIndex + 2] > maxAmplitude) {
            phaseDifference = polarSpectrum[phaseIndex + 2] - lastPhaseIn[i + 1] + phasePerBand;
          }
        }
      } else {
        phaseDifference = polarSpectrum[phaseIndex] - lastPhaseIn[i];
      }

      lastPhaseIn[i] = polarSpectrum[phaseIndex];
      phaseDifference *= scaleFactor;
      polarSpectrum[phaseIndex] = lastPhaseOut[i] + phaseDifference;

      while (polarSpectrum[phaseIndex] > Pi) {
        polarSpectrum[phaseIndex] -= TwoPi;
      }

      while (polarSpectrum[phaseIndex] < -Pi) {
        polarSpectrum[phaseIndex] += TwoPi;
      }

      lastPhaseOut[i] = polarSpectrum[phaseIndex];
    }
  }
};

exports.phaseInterpolate = phaseInterpolate;