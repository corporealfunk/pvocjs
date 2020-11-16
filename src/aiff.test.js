import Aiff from './aiff';

describe('#open', () => {
  test('populates FORM data', () => {
    const aiff = new Aiff('./test/strings.aif');

    return aiff.open().then((data) => {
      expect(aiff.chunks.FORM).toEqual(expect.objectContaining({
        size: 2288836,
        formType: 'AIFF',
      }));
    });
  });

  test('populates COMM data', () => {
    const aiff = new Aiff('./test/strings.aif');

    return aiff.open().then((data) => {
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
    const aiff = new Aiff('./test/strings.aif');

    return aiff.open().then((data) => {
      expect(aiff.chunks.SSND).toEqual(expect.objectContaining({
        start: 38,
        size: 2288798,
        offset: 0,
        blockSize: 0,
      }));
    });
  });
});
