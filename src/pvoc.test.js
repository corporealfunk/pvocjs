import Pvoc from './pvoc';

describe('#findBestTimeScaleRatio', () => {
  test('desired ratio is > 1', () => {
    const pvoc = new Pvoc({
      points: 8192,
      overlap: 4,
      scaleFactor: 1000,
    });

    expect(pvoc.findBestTimeScaleRatio({
      windowSize: pvoc.windowSize,
      scaleFactor: 1000,
    })).toEqual(
      expect.objectContaining({
        decimation: 4,
        interpolation: 4039,
        newScaleFactor: 1009.75,
      }),
    );
  });

  test('desired ratio is < 1', () => {
    const pvoc = new Pvoc({
      points: 8192,
      overlap: 4,
      scaleFactor: .01,
    });

    expect(pvoc.findBestTimeScaleRatio({
      windowSize: pvoc.windowSize,
      scaleFactor: .01,
    })).toEqual(
      expect.objectContaining({
        decimation: 4039,
        interpolation: 40,
        newScaleFactor: 40/4039,
      }),
    );
  });
});
