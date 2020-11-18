import Aiff from './aiff';

const strings_path = './test/aiffs/strings.aif';

describe('#open', () => {
  test('populates FORM data', () => {
    const aiff = new Aiff(strings_path);

    return aiff.open().then(() => {
      expect(aiff.chunks.FORM).toEqual(expect.objectContaining({
        size: 2288836,
        formType: 'AIFF',
      }));
    });
  });

  test('populates COMM data', () => {
    const aiff = new Aiff(strings_path);

    return aiff.open().then(() => {
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

    return aiff.open().then(() => {
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

describe("#samples", () => {
  const aiff = new Aiff(bits16);

  test('iterates samples', () => {
    const channel1 = [];
    return aiff.open().then(async () => {
      for await (let samplesArray of aiff.samples) {
        channel1.push(...samplesArray[0]);
      }
      console.log(channel1.join(','));
    });
  });
});
