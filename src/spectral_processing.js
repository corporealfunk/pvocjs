/* eslint-disable no-param-reassign */
import { zeroArray } from './utilties';

const Pi = 4.0 * Math.atan(1.0);
const TwoPi = 8.0 * Math.atan(1.0);

const hypot = (x, y) => {
  const z = x * x + y * y;

  if (z === 0) {
    return 0;
  }

  return Math.sqrt(z);
};

const cartToPolar = ({ spectrum, halfPoints }) => {
  const polarSpectrum = Array(spectrum.length + 2);

  zeroArray(polarSpectrum);

  for (let i = 0; i <= halfPoints; i++) {
    const realIndex = i * 2;
    const ampIndex = realIndex;

    const imagIndex = realIndex + 1;
    const phaseIndex = imagIndex;

    let realPart;
    let imagPart;

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

const polarToCart = ({ polarSpectrum, halfPoints }) => {
  const spectrum = Array(halfPoints * 2);

  for (let i = 0; i < spectrum.length; i++) {
    spectrum[i] = 0;
  }

  for (let i = 0; i <= halfPoints; i++) {
    let realIndex = i * 2;
    const ampIndex = realIndex;

    const imagIndex = realIndex + 1;
    const phaseIndex = imagIndex;

    let realValue;
    let imagValue;

    if (polarSpectrum[ampIndex] === 0) {
      realValue = 0;
      imagValue = 0;
    } else if (i === 0 || i === halfPoints) {
      realValue = polarSpectrum[ampIndex] * Math.cos(polarSpectrum[phaseIndex]);
      imagValue = 0;
    } else {
      realValue = polarSpectrum[ampIndex] * Math.cos(polarSpectrum[phaseIndex]);
      imagValue = -polarSpectrum[ampIndex] * Math.sin(polarSpectrum[phaseIndex]);
    }

    if (i === halfPoints) {
      realIndex = 1;
    }

    spectrum[realIndex] = realValue;

    if (i !== halfPoints && i !== 0) {
      spectrum[imagIndex] = imagValue;
    }
  }

  return spectrum;
};

// in-place spectral gate
const simpleSpectralGate = ({
  polarSpectrum,
  maskRatio,
  minAmplitude,
  halfPoints,
}) => {
  let maxAmplitude = 0;

  for (let i = 0; i <= halfPoints; i++) {
    const ampIndex = i * 2;

    if (polarSpectrum[ampIndex] > maxAmplitude) {
      maxAmplitude = polarSpectrum[ampIndex];
    }
  }

  const maskAmplitude = maskRatio * maxAmplitude;

  for (let i = 0; i <= halfPoints; i++) {
    const ampIndex = i * 2;

    // duck to 0 if below maskAmplitude or minAmplitude
    if (polarSpectrum[ampIndex] < maskAmplitude) {
      polarSpectrum[ampIndex] = 0;
    } else if (polarSpectrum[ampIndex] < minAmplitude) {
      polarSpectrum[ampIndex] = 0;
    }
  }
};

const phaseInterpolate = ({
  polarSpectrum,
  halfPoints,
  decimation,
  scaleFactor,
  phaseLocking,
}) => {
  const phasePerBand = (decimation * TwoPi) / (halfPoints * 2);

  const lastPhaseIn = Array(halfPoints + 1);
  const lastPhaseOut = Array(halfPoints + 1);

  zeroArray(lastPhaseIn);
  zeroArray(lastPhaseOut);

  for (let i = 0; i <= halfPoints; i++) {
    const ampIndex = i * 2;
    const phaseIndex = ampIndex + 1;
    let phaseDifference;

    if (polarSpectrum[ampIndex] === 0) {
      phaseDifference = 0;
      polarSpectrum[phaseIndex] = lastPhaseOut[i];
    } else {
      if (phaseLocking) {
        let maxAmplitude = 0;

        if (i > 1) {
          maxAmplitude = polarSpectrum[ampIndex - 2];
          phaseDifference = (polarSpectrum[phaseIndex - 2] - lastPhaseIn[i - 1]) - phasePerBand;
        }

        if (polarSpectrum[ampIndex] > maxAmplitude) {
          maxAmplitude = polarSpectrum[ampIndex];
        }

        if (i !== halfPoints) {
          if (polarSpectrum[ampIndex + 2] > maxAmplitude) {
            phaseDifference = (polarSpectrum[phaseIndex + 2] - lastPhaseIn[i + 1]) + phasePerBand;
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

export {
  cartToPolar,
  polarToCart,
  simpleSpectralGate,
  phaseInterpolate,
};
