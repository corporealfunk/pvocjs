import memoize from 'fast-memoize';
import bessel from 'bessel';

const twoPi = 8.0 * Math.atan(1.0);

// helper for hamm/hann windows
const ingWindow = (size, a) => {
  const b = 1.0 - a;

  const ingWindow = [];

  for (let i = 0; i < size; i++) {
    ingWindow[i] = a - b * Math.cos(twoPi * i / (size - 1));
  }

  return ingWindow;
};

const getHamming = memoize((size) => {
  return ingWindow(size, 0.54);
});

// this is a more standard hann window and differs from that found in
// SoundHack Math.c:56
const getVonHann = memoize((size) => {
  return ingWindow(size, 0.5);
});

const getKaiser = (size) => {
  if (size % 2 !== 0) {
    throw new Error('Kaiser window must be an even size');
  }

  const kaiserWindow = [];

  const a = 2.1645; // SoundHack value
  const param = Math.PI * a;
  const paramBessel = bessel.besseli(param, 0);

  const halfSize = size / 2;

  for (let i = 0; i < halfSize; i++) {
    const value = param * Math.sqrt(
      1 - Math.pow(((2 * i)/size), 2),
    );

    kaiserWindow[i + halfSize] = bessel.besseli(value, 0) / paramBessel;
    kaiserWindow[halfSize - i] = kaiserWindow[i + halfSize];
  }
  kaiserWindow[0] = 0;
  kaiserWindow[size - 1] = 0;

  return kaiserWindow;
}

const getRamp = (size) => {
}

const getRectangle = (size) => {
}

const getSinc = (size) => {
}

const getTriangle = (size) => {
}

export {
  getHamming,
  getVonHann,
  getKaiser,
  getRamp,
  getRectangle,
  getSinc,
  getTriangle,
}
