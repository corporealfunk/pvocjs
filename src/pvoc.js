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

// TEST
// import Tapper from './tap'; // TAPPR

import {
  cartToPolar,
  polarToCart,
  simpleSpectralGate,
  phaseInterpolate,
} from './spectral_processing';

import SlidingBuffer from './sliding_buffer';

class Pvoc {
  constructor({
    bands,          // number of FFT bins/bands
    overlap,        // overlap factor: 4,2,1,0.5
    scaleFactor,    // time scale factor
  }) {
    if (![4096, 2048, 1024, 512, 256, 128, 64, 32, 16, 8].includes(bands)) {
      throw new Error(`bands must be a power of two between 8-4096 got ${bands}`);
    }

    if (![0.5, 1, 2, 4].includes(overlap)) {
      throw new Error(`overlap must be one of: .5, 1, 2, 4, got ${overlap}`);
    }

    // points the number of data points required to store an FFT
    // for the desired number of bands
    this.points = bands * 2;

    // which means that halfPoints === bands
    this.halfPoints = this.points / 2;
    this.windowSize = this.points * overlap;
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

    this.eventListeners = {};
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

  on(eventName, cb) {
    if (!this.eventListeners[eventName]) {
      this.eventListeners[eventName] = [cb];
    } else {
      this.eventListeners[eventName].push(cb);
    }
  }

  trigger(eventName, ...data) {
    const cbs = this.eventListeners[eventName];

    if (cbs) {
      cbs.forEach((cb) => cb(...data));
    }
  }

  async run(inputSoundData, outputSoundData) {
    const totalInputSamples = inputSoundData.numSamples;

    const analysisWindow = getHamming(this.windowSize);
    const synthesisWindow = getHamming(this.windowSize);

    const {
      scaledAnalysisWindow,
      scaledSynthesisWindow,
    } = scaleWindows({
      analysisWindow,
      synthesisWindow,
      windowSize: this.windowSize,
      points: this.points,
      interpolation: this.interpolation,
    });

    // where we are in the input/output in samples
    let inPointer = -this.windowSize;
    let outPointer = (inPointer * this.interpolation) / this.decimation;
    outPointer = outPointer < 0 ? Math.floor(outPointer) : Math.ceil(outPointer);

    // only do mono right now:
    const inputBuffers = [];
    const outputBuffers = [];

    // every time we ge samples we need the decimation length:
    const samplesIterator = inputSoundData.samplesIterator(this.decimation);

    // loop:
    let bufferHasValidSamples = true;
    let inputSamplesProcessed = 0;
    while (bufferHasValidSamples) {
      this.trigger('progress', { numSamples: totalInputSamples, samplesRead: inputSamplesProcessed });

      inPointer += this.decimation;
      outPointer += this.interpolation;

      // shift into the input buffer samples from the audio file:
      const { value } = samplesIterator.next();

      // if we have samples from the file, get those,
      if (value) {
        const channels = await value;

        // pad with 0's to match decimation length if needed:
        for (let c = 0; c < channels.length; c++) {
          const channel = channels[c];

          for (let i = 0; i < this.decimation - channel.length; i++) {
            channel.push(0);
          }

          if (!inputBuffers[c]) {
            inputBuffers[c] = new SlidingBuffer(this.windowSize);
          }

          if (!outputBuffers[c]) {
            outputBuffers[c] = new SlidingBuffer(this.windowSize);
          }

          inputBuffers[c].shiftIn(channel);
        }
      } else {
        // no valid samples, so shift the buffer over over
        for (let c = 0; c < inputBuffers.length; c++) {
          inputBuffers[c].shiftLeft(this.decimation);
        }
      }

      // process each channel
      const writeToDisk = [];
      for (let c = 0; c < inputBuffers.length; c++) {
        this.processBlock({
          inputBuffer: inputBuffers[c],
          outputBuffer: outputBuffers[c],
          scaledAnalysisWindow,
          scaledSynthesisWindow,
          inPointer,
          outPointer,
        });

        writeToDisk[c] = outputBuffers[c].shiftLeft(this.interpolation);
      }

      if (outPointer >= 0) {
        await outputSoundData.writeSamples(writeToDisk);
      }

      bufferHasValidSamples = inputBuffers.length > 0 ? inputBuffers[0].hasValidData : false;
      inputSamplesProcessed += this.decimation;
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

      timeIndex += 1;
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
      // Tapper.accumulate('output_time_index', [timeIndex]); // TAPPR
      outputBuffer[i] += inputSamples[timeIndex] * synthesisWindow[i];

      timeIndex++;
      if (timeIndex === points) {
        timeIndex = 0;
      }
    }
  }

  processBlock({
    inputBuffer,
    outputBuffer,
    scaledAnalysisWindow,
    scaledSynthesisWindow,
    inPointer,
    outPointer,
  }) {
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
  }
}

export default Pvoc;
