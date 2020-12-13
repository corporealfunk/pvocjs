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

  test.only('file contains correct chunk data after open', () => {
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
            size: 0,
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
            size: 0,
            offset: 0,
            blockSize: 0,
          },
        }),
      );
    });
  });
});
