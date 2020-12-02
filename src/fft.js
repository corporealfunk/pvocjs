/* eslint-disable no-param-reassign */
const FFT_TIME2FREQ = 1;
const FFT_FREQ2TIME = 2;

const gOmegaPiImag = [];
const gOmegaPiReal = [];

const Pi = 4.0 * Math.atan(1.0);
const TwoPi = 8.0 * Math.atan(1.0);

// InitFFTable code from SoundHack/Math/FFT.c
const initFFTTable = () => {
  let N = 2;

  for (let i = 0; i < 31; i++) {
    gOmegaPiImag[i] = Math.sin(TwoPi / N);
    gOmegaPiReal[i] = -2.0 * Math.sin(Pi / N) * Math.sin(Pi / N);

    // JS bit shift: N = N << i:
    N *= 2 ** i;
  }
};

initFFTTable();

// rearranges data array in bit-reversal order in-place
// NOTE: the data array contains data in pairs, so the
// bitreversal operates on data pairs (element i and i + 1)
// and is not exactly a straight bitreversal, if our array is:
// [0, 1, 2, 3, 4, 5, 6, 7] <- array data
//  ____  ____  ____  ____
//   0     1     2     3    <- indexes to bit reverse
const bitReverse = (data) => {
  let m = 0;
  const numberData = data.length;

  for (let i = 0, j = 0; i < numberData; i += 2, j += m) {
    if (j > i) {
      const realTemp = data[j];
      const imagTemp = data[j + 1];
      data[j] = data[i];
      data[j + 1] = data[i + 1];
      data[i] = realTemp;
      data[i + 1] = imagTemp;
    }

    for (m = numberData / 2; m >= 2 && j >= m; m /= 2) {
      j -= m;
    }
  }
};

// computes FFT in-place on the inputSpectrum
const FFT = ({ inputSpectrum, halfPoints, direction }) => {
  const data = inputSpectrum;
  bitReverse(data);

  let twoMMax = 0;
  let n = 0;

  for (let nMax = 2; nMax < halfPoints; nMax = twoMMax) {
    twoMMax = nMax * 2;

    const omegaPiReal = gOmegaPiReal[n];
    const omegaPiImag = direction === FFT_TIME2FREQ ? gOmegaPiImag[n] : -gOmegaPiImag[n];
    n++;
    let omegaReal = 1;
    let omegaImag = 0;

    for (let m = 0; m < nMax; m += 2) {
      let realTemp;
      let imagTemp;
      for (let i = m; i < halfPoints; i += twoMMax) {
        const j = i + nMax;
        realTemp = (omegaReal * data[j]) - (omegaImag * data[j + 1]);
        imagTemp = (omegaReal * data[j + 1]) + (omegaImag * data[j]);
        data[j] = data[i] - realTemp;
        data[j + 1] = data[i + 1] - imagTemp;
        data[i] += realTemp;
        data[i + 1] += imagTemp;
      }
      realTemp = omegaReal;
      omegaReal = (omegaReal * omegaPiReal) - (omegaImag * omegaPiImag) + omegaReal;
      omegaImag = (omegaImag * omegaPiReal) + (realTemp * omegaPiImag) + omegaImag;
    }
  }

  if (direction === FFT_FREQ2TIME) {
    const scale = 1.0 / halfPoints;
    for (let i = 0; i < halfPoints * 2; i++) {
      data[i] *= scale;
    }
  }
};

const RealFFT = ({ inputSpectrum, halfPoints, direction }) => {
  const data = inputSpectrum;
  let twoPiOmmax = Pi / halfPoints;
  const c1 = 0.5;

  let c2;
  let xr;
  let xi;
  if (direction === FFT_TIME2FREQ) {
    c2 = -0.5;
    FFT({ inputSpectrum, halfPoints, direction });
    [xr, xi] = data;
  } else {
    c2 = 0.5;
    twoPiOmmax = -twoPiOmmax;
    xr = data[1]; // eslint-disable-line prefer-destructuring
    xi = 0;
    data[1] = 0;
  }
};

export {
  FFT_FREQ2TIME,
  FFT_TIME2FREQ,
  gOmegaPiImag,
  gOmegaPiReal,
  bitReverse,
};
