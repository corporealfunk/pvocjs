import memoize from 'fast-memoize';

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
