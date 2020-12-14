/* eslint-disable no-param-reassign */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-multi-spaces */
import {
  getHamming,
  scaleWindows,
} from './windows';

import {
  FFT_TIME2FREQ,
  FFT_FREQ2TIME,
  RealFFT,
} from './fft';

import {
  zeroArray,
} from './utilties';

import {
  cartToPolar,
  polarToCart,
  simpleSpectralGate,
  phaseInterpolate,
} from './spectral_processing';

import SlidingBuffer from './sliding_buffer';

// TODO: points is a bad variable name, see:
// https://github.com/tomerbe/SoundHack/issues/2
class Pvoc {
  constructor({
    points,         // number of FFT bins/bands
    overlap,        // overlap factor: 4,2,1,0.5
    scaleFactor,    // time scale factor
  }) {
    if (![8192, 4096, 2048, 1024, 512, 256, 128, 64, 32, 16].includes(points)) {
      throw new Error('points must be a power of two between 16-8192');
    }

    if (![0.5, 1, 2, 4].includes(overlap)) {
      throw new Error('overlap must be one of: .5, 1, 2, 4');
    }

    this.points = points;
    this.halfPoints = points / 2;
    this.windowSize = points * overlap;
    this.overlap = overlap;

    // find the best analysis/synthesis ratio that gets us close
    // to the scale factor, then set the scaleFactor accordingly
    const ratioResult = this.findBestTimeScaleRatio({
      windowSize: this.windowSize,
      scaleFactor,
    });

    // time stretching factor
    this.scaleFactor = ratioResult.newScaleFactor;

    // analysis rate:
    this.decimation = ratioResult.decimation;

    // synthesis rate:
    this.interpolation = ratioResult.interpolation;
  }

  // takes in the windowsize and desired scaleFactor
  // returns decimation rate and interp rate as whole numbers
  // and what the actual scale is between the two
  findBestTimeScaleRatio({ windowSize, scaleFactor }) {
    // max decimation and interpolation rates:
    const maxRate = windowSize / 8;

    let decimation;
    let interpolation;
    let percentError = 2.0;

    if (scaleFactor > 1.0) {
      interpolation = maxRate;
      // starting from the max interpolation rate, keep subtracting one
      // and then calculate what the decimation rate is based on the desired
      // scale. If the ratio between the two is within 1% of our desired scale,
      // then we're done, use that. If we get down to a point where interpolation
      // is === 1, then just set it back to maxRate and do a straight calculation
      // of decimation (ie: we couldn't find an interpolation rate that resulted
      // in the decimation rate being within 1% of desired)
      for (interpolation; percentError > 1.01; interpolation--) {
        decimation = Math.floor(interpolation / scaleFactor);
        const tempScaleFactor = interpolation / decimation;

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
        const tempScaleFactor = interpolation / decimation;

        if (tempScaleFactor > scaleFactor) {
          percentError = tempScaleFactor / scaleFactor;
        } else {
          percentError = scaleFactor / tempScaleFactor;
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

    const newScaleFactor = interpolation / decimation;

    return {
      decimation,
      interpolation,
      newScaleFactor,
    };
  }

  async run(inputSoundData, outputSoundData) {
    const {
      scaledAnalysisWindow,
      scaledSynthesisWindow,
    } = scaleWindows({
      analysisWindow: getHamming(this.windowSize),
      synthesisWindow: getHamming(this.windowSize),
      windowSize: this.windowSize,
      points: this.points,
      interpolation: this.interpolation,
    });

    // where we are in the input/output in samples
    let inPointer = -1 * this.windowSize;
    let outPointer = (inPointer * this.interpolation) / this.decimation;

    // only do mono right now:
    const inputBuffer = new SlidingBuffer(this.windowSize);
    const outputBuffer = new SlidingBuffer(this.windowSize);

    // every time we ge samples we need the decimation length:
    const samplesIterator = inputSoundData.samplesIterator(this.decimation);

    // loop:
    let eof = false;
    while (!eof) {
      inPointer += this.decimation;
      outPointer += this.interpolation;

      // shift into the input buffer samples from the audio file:
      const { done, value } = samplesIterator.next();
      const channels = await value;

      if (!done) {
        // index 0 is 1st channel's samples
        const channel = channels[0];

        // pad with 0's to match decimation length if needed:
        for (let i = 0; i < this.decimation - channel.length; i++) {
          channel.push(0);
        }

        inputBuffer.shiftIn(channel);

        // window fold:
        const foldedSamples = this.windowFold({
          inputSamples: inputBuffer.buffer,
          analysisWindow: scaledAnalysisWindow,
          currentTime: inPointer,
          points: this.points,
          windowSize: this.windowSize,
        });

        // FFT in-place:
        RealFFT({
          data: foldedSamples,
          halfPoints: this.halfPoints,
          direction: FFT_TIME2FREQ,
        });

        // foldedSamples now contains the spectrum for each band:
        const spectrum = foldedSamples;

        // get a polar spectrum out of it:
        const polarSpectrum = cartToPolar({
          spectrum,
          halfPoints: this.halfPoints,
        });

        // constrain amplitudes in place:
        simpleSpectralGate({
          polarSpectrum,
          maskRatio: 0, // seems to always be 0 in SoundHack
          minAmplitude: 0, // seems to always be 0 in SoundHack
          halfPoints: this.halfPoints,
        });

        // phase interpolate in place:
        phaseInterpolate({
          polarSpectrum,
          halfPoints: this.halfPoints,
          decimation: this.decimation,
          scaleFactor: this.scaleFactor,
          phaseLocking: false, // seems to always be false in SoundHack
        });

        const cartSpectrum = polarToCart({
          polarSpectrum,
          halfPoints: this.halfPoints,
        });

        // spectrum to samples in place:
        RealFFT({
          data: cartSpectrum,
          halfPoints: this.halfPoints,
          FFT_FREQ2TIME,
        });

        const fftResynth = cartSpectrum;

        // overlap add into the contents of our buffer
        this.overlapAdd({
          inputSamples: fftResynth,
          synthesisWindow: scaledSynthesisWindow,
          outputBuffer: outputBuffer.buffer,
          currentTime: outPointer,
          points: this.points,
          windowSize: this.windowSize,
        });

        outputSoundData.writeSamples(
          [outputBuffer.shiftLeft(this.interpolation)],
        );
      }

      eof = done;
    }
  }

  windowFold({
    inputSamples,
    analysisWindow,
    currentTime,
    points,
    windowSize,
  }) {
    const output = Array(points);
    zeroArray(output);

    let timeIndex = currentTime;

    while (timeIndex < 0) {
      timeIndex += points;
    }

    timeIndex %= points;

    for (let i = 0; i < windowSize; i++) {
      output[timeIndex] += inputSamples[i] * analysisWindow[i];

      timeIndex++;
      if (timeIndex === points) {
        timeIndex = 0;
      }
    }

    return output;
  }

  overlapAdd({
    inputSamples,
    synthesisWindow,
    outputBuffer,
    currentTime,
    points,
    windowSize,
  }) {
    let timeIndex = currentTime;

    while (timeIndex < 0) {
      timeIndex += points;
    }

    timeIndex %= points;

    for (let i = 0; i < windowSize; i++) {
      outputBuffer[i] += inputSamples[timeIndex] * synthesisWindow[i];

      timeIndex++;
      if (timeIndex === points) {
        timeIndex = 0;
      }
    }
  }
}

export default Pvoc;
