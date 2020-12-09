/* eslint-disable no-param-reassign */
const FFT_TIME2FREQ = 1;
const FFT_FREQ2TIME = 2;

const gOmegaPiTables = {
  imag: [],
  real: [],
};

const Pi = 4.0 * Math.atan(1.0);
const TwoPi = 8.0 * Math.atan(1.0);

// InitFFTable code from SoundHack/Math/FFT.c
const initFFTTable = () => {
  let N = 2;

  for (let i = 0; i < 31; i++) {
    gOmegaPiTables.imag[i] = Math.sin(TwoPi / N);
    gOmegaPiTables.real[i] = -2.0 * Math.sin(Pi / N) * Math.sin(Pi / N);

    // JS bit shift: N = N << i:
    N *= 2 ** 1;
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

    const omegaPiReal = gOmegaPiTables.real[n];
    const omegaPiImag = (direction === FFT_TIME2FREQ)
      ? gOmegaPiTables.imag[n] : -gOmegaPiTables.imag[n];
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

  let omegaReal = 1.0;
  let omegaImag = 0;

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

  let temp = Math.sin(0.5 * twoPiOmmax);
  const omegaPiReal = -2.0 * temp * temp;

  // deal with sinf float force? normally in C sin returns a double?
  const omegaPiImag = Math.sin(twoPiOmmax);
  const N2p1 = (halfPoints * 2) + 1;

  for (let i = 0; i <= halfPoints / 2; i++) {
    const i1 = i * 2;
    const i2 = i1 + 1;
    const i3 = N2p1 - i2;
    const i4 = i3 + 1;
    if (i === 0) {
      const h1r = c1 * (data[i1] + xr);
      const h1i = c1 * (data[i2] - xi);
      const h2r = -c2 * (data[i2] + xi);
      const h2i = c2 * (data[i1] - xr);
      data[i1] = h1r + omegaReal * h2r - omegaImag * h2i;
      data[i2] = h1i + omegaReal * h2i + omegaImag * h2r;
      xr = h1r - omegaReal * h2r + omegaImag * h2i;
      xi = -h1i + omegaReal * h2i + omegaImag * h2r;
    } else {
      const h1r = c1 * (data[i1] + data[i3]);
      const h1i = c1 * (data[i2] - data[i4]);
      const h2r = -c2 * (data[i2] + data[i4]);
      const h2i = c2 * (data[i1] - data[i3]);
      data[i1] = h1r + omegaReal * h2r - omegaImag * h2i;
      data[i2] = h1i + omegaReal * h2i + omegaImag * h2r;
      data[i3] = h1r - omegaReal * h2r + omegaImag * h2i;
      data[i4] = -h1i + omegaReal * h2i + omegaImag * h2r;
    }
    temp = omegaReal;
    omegaReal = temp * omegaPiReal - omegaImag * omegaPiImag + omegaReal;
    omegaImag = omegaImag * omegaPiReal + temp * omegaPiImag + omegaImag;
  }

  if (direction === FFT_TIME2FREQ) {
    data[1] = xr;
  } else {
    FFT({ inputSpectrum, halfPoints, direction });
  }
};

export {
  FFT_FREQ2TIME,
  FFT_TIME2FREQ,
  gOmegaPiTables,
  bitReverse,
  RealFFT,
};
