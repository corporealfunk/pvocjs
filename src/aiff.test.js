import Aiff from './aiff';
import { unlinkIfExists } from '../test/helpers';

const strings_path = './test/aiffs/strings.aif';

describe('#openForRead', () => {
  test('populates FORM data', () => {
    const aiff = new Aiff(strings_path);

    return aiff.openForRead().then(() => {
      expect(aiff.chunks.FORM).toEqual(expect.objectContaining({
        size: 2288836,
        formType: 'AIFF',
      }));
    });
  });

  test('populates COMM data', () => {
    const aiff = new Aiff(strings_path);

    return aiff.openForRead().then(() => {
      expect(aiff.chunks.COMM).toEqual(expect.objectContaining({
        size: 18,
        numChannels: 2,
        numSampleFrames: 381465,
        sampleSize: 24,
        sampleRate: 48000.0,
      }));
    });
  });

  test('populates SSND data', () => {
    const aiff = new Aiff(strings_path);

    return aiff.openForRead().then(() => {
      expect(aiff.chunks.SSND).toEqual(expect.objectContaining({
        start: 38,
        size: 2288798,
        offset: 0,
        blockSize: 0,
      }));
    });
  });
});

const bits16 = './test/aiffs/mono_441k_16b_sine.aif';
const bits24 = './test/aiffs/mono_48k_24b_sine.aif';

describe("#samples", () => {
  describe('AIFF', () => {
    test('iterates samples 16b', () => {
      const aiff = new Aiff(bits16);
      const channel1 = [];
      return aiff.openForRead().then(async () => {
        for await (let samplesArray of aiff.samples) {
          channel1.push(...samplesArray[0]);
        }
      });
    });

    test('iterates samples 24b', () => {
      const aiff = new Aiff(bits24);
      const channel1 = [];
      return aiff.openForRead().then(async () => {
        for await (let samplesArray of aiff.samples) {
          channel1.push(...samplesArray[0]);
        }
      });
    });
  });
});

describe("#samplesIterator", () => {
  describe('AIFF', () => {
    test('iterates samples 16b', () => {
      const aiff = new Aiff(bits16);
      const channel1 = [];
      return aiff.openForRead().then(async () => {
        const it = aiff.samplesIterator(512);

        for await (let samplesArray of it) {
          channel1.push(...samplesArray[0]);
        }
      });
    });
  });
});

describe('#openForWrite', () => {
  const fileName = '/tmp/aiff_headers.aiff';
  let aiffOut;

  beforeEach(() => {
    unlinkIfExists(fileName);

    aiffOut = new Aiff(fileName);
  });

  afterEach(() => {
    unlinkIfExists(fileName);
  });

  test('file contains correct chunk data after open', () => {
    const aiffIn = new Aiff(fileName);

    return aiffOut.openForWrite({
      sampleRate: 48000,
      bitDepth: 24,
      numChannels: 1,
    }).then(() => aiffOut.close()).then(() => {
      return aiffIn.openForRead();
    }).then(() => (
      aiffIn.close()
    )).then(() => {
      expect(aiffIn.chunks).toEqual(
        expect.objectContaining({
          FORM: {
            start: 0,
            size: 46,
            formType: 'AIFF',
          },
          COMM: {
            start: 12,
            size: 18,
            numChannels: 1,
            numSampleFrames: 0,
            sampleSize: 24,
            sampleRate: 48000,
          },
          SSND: {
            start: 38,
            size: 8,
            offset: 0,
            blockSize: 0,
          },
        }),
      );
    });
  });
});

describe('#updateChunkHeadersOnDisk', () => {
  const fileName = '/tmp/aiff_headers_update.aiff';
  let aiffOut;

  beforeEach(() => {
    unlinkIfExists(fileName);

    aiffOut = new Aiff(fileName);

    return aiffOut.openForWrite({
      sampleRate: 48000,
      bitDepth: 24,
      numChannels: 1,
    });
  });

  afterEach(() => {
    return aiffOut.close().then(() => {
      unlinkIfExists(fileName);
    });
  });

  test('file contains correct chunk data after update', () => {
    const aiffIn = new Aiff(fileName);

    // write bogus values to read and compare:
    aiffOut.chunks.FORM.size = 893;
    aiffOut.chunks.COMM.numSampleFrames = 134;
    aiffOut.chunks.SSND.size = 372;

    return aiffOut.updateChunkHeadersOnDisk()
    .then(() => aiffOut.close()).then(() => {
      return aiffIn.openForRead();
    }).then(() => (
      aiffIn.close()
    )).then(() => {
      expect(aiffIn.chunks).toEqual(
        expect.objectContaining({
          FORM: {
            start: 0,
            size: 893,
            formType: 'AIFF',
          },
          COMM: {
            start: 12,
            size: 18,
            numChannels: 1,
            numSampleFrames: 134,
            sampleSize: 24,
            sampleRate: 48000,
          },
          SSND: {
            start: 38,
            size: 372,
            offset: 0,
            blockSize: 0,
          },
        }),
      );
    });
  });
});

describe('#writeSamples', () => {
  const fileName = '/tmp/aiff_write_samples.aiff';
  let aiffOut;

  beforeEach(() => {
    unlinkIfExists(fileName);

    aiffOut = new Aiff(fileName);

    return aiffOut.openForWrite({
      sampleRate: 44100,
      bitDepth: 16,
      numChannels: 2,
    });
  });

  afterEach(() => {
    // unlinkIfExists(fileName);
  });

  test('headers are correct after write', () => {
    const aiffIn = new Aiff(fileName);

    const halfDC = ((2 ** 15) - 1) / 2;
    const channels = [[], []];
    for (let i = 0; i < 1024; i++) {
      channels[0][i] = halfDC;
      channels[1][i] = -halfDC;
    }

    return aiffOut.writeSamples(channels)
    .then(() => aiffOut.close()).then(() => {
      return aiffIn.openForRead();
    }).then(() => (
      aiffIn.close()
    )).then(() => {
      expect(aiffIn.chunks).toEqual(
        expect.objectContaining({
          FORM: {
            start: 0,
            size: 4142,
            formType: 'AIFF',
          },
          COMM: {
            start: 12,
            size: 18,
            numChannels: 2,
            numSampleFrames: 1024,
            sampleSize: 16,
            sampleRate: 44100,
          },
          SSND: {
            start: 38,
            size: 8 + (1024 * 2 * 2),
            offset: 0,
            blockSize: 0,
          },
        }),
      );
    });
  });
});
