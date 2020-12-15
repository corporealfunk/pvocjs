/* eslint no-plusplus: 0 */
/* eslint no-restricted-properties: 0 */

import memoize from 'fast-memoize';
import bessel from 'bessel';

const twoPi = 8.0 * Math.atan(1.0);

// helper for hamm/hann windows
const getIngWindow = (size, a) => {
  const b = 1.0 - a;

  const ingWindow = Array(size);

  for (let i = 0; i < size; i++) {
    ingWindow[i] = a - b * Math.cos((twoPi * i) / (size - 1));
  }

  return ingWindow;
};

const getHamming = memoize((size) => getIngWindow(size, 0.54));

// this is a more standard hann window and differs from that found in
// SoundHack Math.c:56
const getVonHann = memoize((size) => getIngWindow(size, 0.5));

const getKaiser = memoize((size) => {
  if (size % 2 !== 0) {
    throw new Error('Kaiser window must be an even size');
  }

  const kaiserWindow = Array(size);

  const a = 2.1645; // SoundHack value
  const param = Math.PI * a;
  const paramBessel = bessel.besseli(param, 0);

  const halfSize = size / 2;

  for (let i = 0; i < halfSize; i++) {
    const value = param * Math.sqrt(
      1 - Math.pow(((2 * i) / size), 2),
    );

    kaiserWindow[i + halfSize] = bessel.besseli(value, 0) / paramBessel;
    kaiserWindow[halfSize - i] = kaiserWindow[i + halfSize];
  }
  kaiserWindow[0] = 0;
  kaiserWindow[size - 1] = 0;

  return kaiserWindow;
});

const getRamp = memoize((size) => {
  const rampWindow = Array(size);

  for (let i = 0; i < size; i++) {
    rampWindow[i] = 1 - (i / size);
  }

  return rampWindow;
});

const getRectangle = memoize((size) => {
  const rectangleWindow = Array(size);

  for (let i = 0; i < size; i++) {
    rectangleWindow[i] = 1;
  }

  return rectangleWindow;
});

const getSinc = memoize((size) => {
  const sincWindow = Array(size);
  const halfSize = size / 2;

  for (let i = 0; i < size; i++) {
    if (i === halfSize) {
      sincWindow[i] = 1;
    } else {
      const a = Math.PI * ((i - halfSize) / halfSize);
      const b = 2 * Math.PI * (i - halfSize);

      sincWindow[i] = (size * Math.sin(a)) / b;
    }
  }

  return sincWindow;
});

const getTriangle = memoize((size) => {
  if (size % 2 !== 0) {
    throw new Error('Triangle window must be an even size');
  }

  const triangleWindow = Array(size);

  const halfSize = size / 2;

  for (let i = 0; i < halfSize; i++) {
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
const scaleWindows = ({
  analysisWindow,
  synthesisWindow,
  windowSize,
  points,
  interpolation,
}) => {
  const scaledAnalysisWindow = [...analysisWindow];
  const scaledSynthesisWindow = [...synthesisWindow];

  // scaling, note from original code:
  /* when windowSize > points, also apply sin(x)/x windows to
     ensure that window are 0 at increments of points (the FFT length)
     away from the center of the analysis window and of interpolation
     away from the center of the synthesis window
  */
  if (windowSize > points) {
    let halfWindowSize = -(windowSize - 1) / 2;

    for (let i = 0; i < windowSize; i++, halfWindowSize += 1.0) {
      if (halfWindowSize !== 0.0) {
        scaledAnalysisWindow[i] = (analysisWindow[i]
        * points
        * Math.sin((Math.PI * halfWindowSize) / points)) / (Math.PI * halfWindowSize);

        scaledSynthesisWindow[i] = (synthesisWindow[i]
        * interpolation
        * Math.sin((Math.PI * halfWindowSize) / interpolation)) / (Math.PI * halfWindowSize);
      }
    }
  }

  // normalizing, note from original code:
  //
  /* normalize windows for unity gain across unmodified
   * analysis-synthesis procedure
   */
  const analysisSum = scaledAnalysisWindow.reduce((memo, val) => memo + val, 0);
  const analysisFactor = 2.0 / analysisSum;

  // NOTE: we are ignoring the analysisType === CSOUND code branch
  // in the original SoundHack code, I do not think analysisType is
  // even set in the Pvoc routines in Soundhack
  const synthesisFactor = windowSize > points ? 1 / analysisFactor : analysisFactor;

  for (let i = 0; i < windowSize; i++) {
    scaledAnalysisWindow[i] *= analysisFactor;
    scaledSynthesisWindow[i] *= synthesisFactor;
  }

  if (windowSize <= points) {
    let synthesisSum = 0;

    for (let i = 0; i < windowSize; i += interpolation) {
      synthesisSum += scaledSynthesisWindow[i] * scaledSynthesisWindow[i];
    }

    const amplitudeFactor = 1 / synthesisSum;

    for (let i = 0; i < windowSize; i++) {
      scaledSynthesisWindow[i] *= amplitudeFactor;
    }
  }

  return {
    scaledAnalysisWindow,
    scaledSynthesisWindow,
  };
};

export {
  getHamming,
  getVonHann,
  getKaiser,
  getRamp,
  getRectangle,
  getSinc,
  getTriangle,
  scaleWindows,
};
