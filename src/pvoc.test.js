import Pvoc from './pvoc';
import Aiff from './aiff';
import { unlinkIfExists } from '../test/helpers';

describe('#findBestTimeScaleRatio', () => {
  test('desired ratio is > 1', () => {
    const pvoc = new Pvoc({
      bands: 4096,
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
      bands: 4096,
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

describe('run', () => {
  const a440 = './test/aiffs/mono_44k_16b_sine_a440.aif';
  const fileName = '/tmp/aiff_pvoc_run_test.aiff';
  let aiffOut;

  beforeEach(() => {
    unlinkIfExists(fileName);

    aiffOut = new Aiff(fileName);

    return aiffOut.openForWrite({
      sampleRate: 44100,
      bitDepth: 16,
      numChannels: 1,
    });
  });

  afterEach(() => {
    return aiffOut.close().then(() => {
      unlinkIfExists(fileName);
    });
  });

  it('runs', () => {
    const aiffIn = new Aiff(a440);
    const allSamples = [];

    const pvoc = new Pvoc({
      bands: 1024,
      overlap: 1,
      scaleFactor: 1,
    });

    return aiffIn.openForRead().then(() => {
      return pvoc.run(aiffIn, aiffOut);
    }).then(() => aiffIn.close()).then(() => {
      // no expectation
    });
  }, 180000);
});
