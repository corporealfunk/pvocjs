"use strict";

require("core-js/modules/es.array.for-each");

require("core-js/modules/es.array.includes");

require("core-js/modules/es.object.to-string");

require("core-js/modules/es.promise");

require("core-js/modules/web.dom-collections.for-each");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("regenerator-runtime/runtime");

var _windows = require("./windows");

var _fft = require("./fft");

var _utilties = require("./utilties");

var _spectral_processing = require("./spectral_processing");

var _sliding_buffer = _interopRequireDefault(require("./sliding_buffer"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Pvoc = /*#__PURE__*/function () {
  function Pvoc(_ref) {
    var bands = _ref.bands,
        overlap = _ref.overlap,
        scaleFactor = _ref.scaleFactor;

    _classCallCheck(this, Pvoc);

    if (![4096, 2048, 1024, 512, 256, 128, 64, 32, 16, 8].includes(bands)) {
      throw new Error("bands must be a power of two between 8-4096 got ".concat(bands));
    }

    if (![0.5, 1, 2, 4].includes(overlap)) {
      throw new Error("overlap must be one of: .5, 1, 2, 4, got ".concat(overlap));
    } // points the number of data points required to store an FFT
    // for the desired number of bands


    this.points = bands * 2; // which means that halfPoints === bands

    this.halfPoints = this.points / 2;
    this.windowSize = this.points * overlap;
    this.overlap = overlap; // find the best analysis/synthesis ratio that gets us close
    // to the scale factor, then set the scaleFactor accordingly

    var ratioResult = this.findBestTimeScaleRatio({
      windowSize: this.windowSize,
      scaleFactor: scaleFactor
    }); // time stretching factor

    this.scaleFactor = ratioResult.newScaleFactor; // analysis rate:

    this.decimation = ratioResult.decimation; // synthesis rate:

    this.interpolation = ratioResult.interpolation;
    this.eventListeners = {};
  } // takes in the windowsize and desired scaleFactor
  // returns decimation rate and interp rate as whole numbers
  // and what the actual scale is between the two


  _createClass(Pvoc, [{
    key: "findBestTimeScaleRatio",
    value: function findBestTimeScaleRatio(_ref2) {
      var windowSize = _ref2.windowSize,
          scaleFactor = _ref2.scaleFactor;
      // max decimation and interpolation rates:
      var maxRate = windowSize / 8;
      var decimation;
      var interpolation;
      var percentError = 2.0;

      if (scaleFactor > 1.0) {
        interpolation = maxRate; // starting from the max interpolation rate, keep subtracting one
        // and then calculate what the decimation rate is based on the desired
        // scale. If the ratio between the two is within 1% of our desired scale,
        // then we're done, use that. If we get down to a point where interpolation
        // is === 1, then just set it back to maxRate and do a straight calculation
        // of decimation (ie: we couldn't find an interpolation rate that resulted
        // in the decimation rate being within 1% of desired)

        for (interpolation; percentError > 1.01; interpolation--) {
          decimation = Math.floor(interpolation / scaleFactor);
          var tempScaleFactor = interpolation / decimation;

          if (tempScaleFactor > scaleFactor) {
            percentError = tempScaleFactor / scaleFactor;
          } else {
            percentError = scaleFactor / tempScaleFactor;
          }

          if (percentError < 1.004) {
            break;
          }

          if (interpolation === 1) {
            interpolation = maxRate;
            decimation = Math.floor(interpolation / scaleFactor);
            break;
          }
        }
      } else {
        decimation = maxRate;

        for (decimation; percentError > 1.01; decimation--) {
          interpolation = Math.floor(decimation * scaleFactor);

          var _tempScaleFactor = interpolation / decimation;

          if (_tempScaleFactor > scaleFactor) {
            percentError = _tempScaleFactor / scaleFactor;
          } else {
            percentError = scaleFactor / _tempScaleFactor;
          }

          if (percentError < 1.004) {
            break;
          }

          if (decimation === 1) {
            decimation = maxRate;
            interpolation = Math.floor(decimation * scaleFactor);
            break;
          }
        }
      }

      var newScaleFactor = interpolation / decimation;
      return {
        decimation: decimation,
        interpolation: interpolation,
        newScaleFactor: newScaleFactor
      };
    }
  }, {
    key: "on",
    value: function on(eventName, cb) {
      if (!this.eventListeners[eventName]) {
        this.eventListeners[eventName] = [cb];
      } else {
        this.eventListeners[eventName].push(cb);
      }
    }
  }, {
    key: "trigger",
    value: function trigger(eventName) {
      for (var _len = arguments.length, data = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        data[_key - 1] = arguments[_key];
      }

      var cbs = this.eventListeners[eventName];

      if (cbs) {
        cbs.forEach(function (cb) {
          return cb.apply(void 0, data);
        });
      }
    }
  }, {
    key: "run",
    value: function () {
      var _run = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(inputSoundData, outputSoundData) {
        var totalInputSamples, analysisWindow, synthesisWindow, _scaleWindows, scaledAnalysisWindow, scaledSynthesisWindow, inPointer, outPointer, inputBuffers, outputBuffers, samplesIterator, bufferHasValidSamples, inputSamplesProcessed, _samplesIterator$next, value, channels, c, channel, i, _c, writeToDisk, _c2;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                totalInputSamples = inputSoundData.numSamples;
                analysisWindow = (0, _windows.getHamming)(this.windowSize);
                synthesisWindow = (0, _windows.getHamming)(this.windowSize);
                _scaleWindows = (0, _windows.scaleWindows)({
                  analysisWindow: analysisWindow,
                  synthesisWindow: synthesisWindow,
                  windowSize: this.windowSize,
                  points: this.points,
                  interpolation: this.interpolation
                }), scaledAnalysisWindow = _scaleWindows.scaledAnalysisWindow, scaledSynthesisWindow = _scaleWindows.scaledSynthesisWindow; // where we are in the input/output in samples

                inPointer = -this.windowSize;
                outPointer = inPointer * this.interpolation / this.decimation;
                outPointer = outPointer < 0 ? Math.floor(outPointer) : Math.ceil(outPointer); // only do mono right now:

                inputBuffers = [];
                outputBuffers = []; // every time we ge samples we need the decimation length:

                samplesIterator = inputSoundData.samplesIterator(this.decimation); // loop:

                bufferHasValidSamples = true;
                inputSamplesProcessed = 0;

              case 12:
                if (!bufferHasValidSamples) {
                  _context.next = 34;
                  break;
                }

                this.trigger('progress', {
                  numSamples: totalInputSamples,
                  samplesRead: inputSamplesProcessed
                });
                inPointer += this.decimation;
                outPointer += this.interpolation; // shift into the input buffer samples from the audio file:

                _samplesIterator$next = samplesIterator.next(), value = _samplesIterator$next.value; // if we have samples from the file, get those,

                if (!value) {
                  _context.next = 24;
                  break;
                }

                _context.next = 20;
                return value;

              case 20:
                channels = _context.sent;

                // pad with 0's to match decimation length if needed:
                for (c = 0; c < channels.length; c++) {
                  channel = channels[c];

                  for (i = 0; i < this.decimation - channel.length; i++) {
                    channel.push(0);
                  }

                  if (!inputBuffers[c]) {
                    inputBuffers[c] = new _sliding_buffer.default(this.windowSize);
                  }

                  if (!outputBuffers[c]) {
                    outputBuffers[c] = new _sliding_buffer.default(this.windowSize);
                  }

                  inputBuffers[c].shiftIn(channel);
                }

                _context.next = 25;
                break;

              case 24:
                // no valid samples, so shift the buffer over over
                for (_c = 0; _c < inputBuffers.length; _c++) {
                  inputBuffers[_c].shiftLeft(this.decimation);
                }

              case 25:
                // process each channel
                writeToDisk = [];

                for (_c2 = 0; _c2 < inputBuffers.length; _c2++) {
                  this.processBlock({
                    inputBuffer: inputBuffers[_c2],
                    outputBuffer: outputBuffers[_c2],
                    scaledAnalysisWindow: scaledAnalysisWindow,
                    scaledSynthesisWindow: scaledSynthesisWindow,
                    inPointer: inPointer,
                    outPointer: outPointer
                  });
                  writeToDisk[_c2] = outputBuffers[_c2].shiftLeft(this.interpolation);
                }

                if (!(outPointer >= 0)) {
                  _context.next = 30;
                  break;
                }

                _context.next = 30;
                return outputSoundData.writeSamples(writeToDisk);

              case 30:
                bufferHasValidSamples = inputBuffers.length > 0 ? inputBuffers[0].hasValidData : false;
                inputSamplesProcessed += this.decimation;
                _context.next = 12;
                break;

              case 34:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function run(_x, _x2) {
        return _run.apply(this, arguments);
      }

      return run;
    }()
  }, {
    key: "windowFold",
    value: function windowFold(_ref3) {
      var inputSamples = _ref3.inputSamples,
          analysisWindow = _ref3.analysisWindow,
          currentTime = _ref3.currentTime,
          points = _ref3.points,
          windowSize = _ref3.windowSize;
      var output = Array(points);
      (0, _utilties.zeroArray)(output);
      var timeIndex = currentTime;

      while (timeIndex < 0) {
        timeIndex += points;
      }

      timeIndex %= points;

      for (var i = 0; i < windowSize; i++) {
        output[timeIndex] += inputSamples[i] * analysisWindow[i];
        timeIndex += 1;

        if (timeIndex === points) {
          timeIndex = 0;
        }
      }

      return output;
    }
  }, {
    key: "overlapAdd",
    value: function overlapAdd(_ref4) {
      var inputSamples = _ref4.inputSamples,
          synthesisWindow = _ref4.synthesisWindow,
          outputBuffer = _ref4.outputBuffer,
          currentTime = _ref4.currentTime,
          points = _ref4.points,
          windowSize = _ref4.windowSize;
      var timeIndex = currentTime;

      while (timeIndex < 0) {
        timeIndex += points;
      }

      timeIndex %= points;

      for (var i = 0; i < windowSize; i++) {
        // Tapper.accumulate('output_time_index', [timeIndex]); // TAPPR
        outputBuffer[i] += inputSamples[timeIndex] * synthesisWindow[i];
        timeIndex++;

        if (timeIndex === points) {
          timeIndex = 0;
        }
      }
    }
  }, {
    key: "processBlock",
    value: function processBlock(_ref5) {
      var inputBuffer = _ref5.inputBuffer,
          outputBuffer = _ref5.outputBuffer,
          scaledAnalysisWindow = _ref5.scaledAnalysisWindow,
          scaledSynthesisWindow = _ref5.scaledSynthesisWindow,
          inPointer = _ref5.inPointer,
          outPointer = _ref5.outPointer;
      // window fold:
      var foldedSamples = this.windowFold({
        inputSamples: inputBuffer.buffer,
        analysisWindow: scaledAnalysisWindow,
        currentTime: inPointer,
        points: this.points,
        windowSize: this.windowSize
      }); // FFT in-place:

      (0, _fft.RealFFT)({
        data: foldedSamples,
        halfPoints: this.halfPoints,
        direction: _fft.FFT_TIME2FREQ
      }); // foldedSamples now contains the spectrum for each band:

      var spectrum = foldedSamples; // get a polar spectrum out of it:

      var polarSpectrum = (0, _spectral_processing.cartToPolar)({
        spectrum: spectrum,
        halfPoints: this.halfPoints
      }); // constrain amplitudes in place:

      (0, _spectral_processing.simpleSpectralGate)({
        polarSpectrum: polarSpectrum,
        maskRatio: 0,
        // seems to always be 0 in SoundHack
        minAmplitude: 0,
        // seems to always be 0 in SoundHack
        halfPoints: this.halfPoints
      }); // phase interpolate in place:

      (0, _spectral_processing.phaseInterpolate)({
        polarSpectrum: polarSpectrum,
        halfPoints: this.halfPoints,
        decimation: this.decimation,
        scaleFactor: this.scaleFactor,
        phaseLocking: false // seems to always be false in SoundHack

      });
      var cartSpectrum = (0, _spectral_processing.polarToCart)({
        polarSpectrum: polarSpectrum,
        halfPoints: this.halfPoints
      }); // spectrum to samples in place:

      (0, _fft.RealFFT)({
        data: cartSpectrum,
        halfPoints: this.halfPoints,
        FFT_FREQ2TIME: _fft.FFT_FREQ2TIME
      });
      var fftResynth = cartSpectrum; // overlap add into the contents of our buffer

      this.overlapAdd({
        inputSamples: fftResynth,
        synthesisWindow: scaledSynthesisWindow,
        outputBuffer: outputBuffer.buffer,
        currentTime: outPointer,
        points: this.points,
        windowSize: this.windowSize
      });
    }
  }]);

  return Pvoc;
}();

var _default = Pvoc;
exports.default = _default;