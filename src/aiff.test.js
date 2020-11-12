import Aiff from './aiff';

describe('#open', () => {
  test('populates header data', () => {
    const aiff = new Aiff('./test/strings.aif');

    return aiff.open().then((data) => {
      expect(aiff.formChunk).objectContaining({
        ckId: 'FORM',
        size: 2288836,
        formType: 'AIFF',
      });
    });
  });
});
