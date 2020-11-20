class Pvoc {
  constructor({
    points,         // number of FFT bins/bands
    overlap,        // overlap factor: 4,2,1,0.5
    scaleFactor,    // time scale factor
  }) {
    if (![8192,4096,2048,1024,512,256,128,64,32,16].includes(points)) {
      throw new Error('points must be a power of two between 16-8192');
    }

    if (![.5, 1, 2, 4].includes(overlap)) {
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

        if (interpolation == 1) {
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

        if (decimation == 1) {
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
}

export default Pvoc;
