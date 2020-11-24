import {
  getHamming,
  getVonHann,
  getKaiser,
  getRamp,
  getRectangle,
  getSinc,
  getTriangle,
} from './windows';

describe('#getHamming', () => {
  test('returns correct hamming window', () => {
    const hammingWindow = getHamming(10);

    expect(hammingWindow).toEqual([
      0.08000000000000007,
      0.18761955616527015,
      0.46012183827321207,
      0.7699999999999999,
      0.9722586055615179,
      0.9722586055615179,
      0.7700000000000002,
      0.46012183827321224,
      0.18761955616527026,
      0.08000000000000007
    ]);
  });
});

describe('#getVonHann', () => {
  test('returns correct hann window', () => {
    const hannWindow = getVonHann(10);

    expect(hannWindow).toEqual([
      0,
      0.116977778440511,
      0.4131759111665348,
      0.7499999999999999,
      0.9698463103929542,
      0.9698463103929542,
      0.7500000000000002,
      0.413175911166535,
      0.1169777784405111,
      0
    ]);
  });
});

describe('#getKaiser', () => {
  test('returns correct kaiser window', () => {
    const kaiserWindow = getKaiser(10);

    expect(kaiserWindow).toEqual([
      0,
      0.08642921347855281,
      0.2885948752723749,
      0.5932877479138193,
      0.8809748997589503,
      1,
      0.8809748997589503,
      0.5932877479138193,
      0.2885948752723749,
      0
    ]);
  });
});

describe('#getRamp', () => {
  test('returns correct ramp window', () => {
    const rampWindow = getRamp(10);

    expect(rampWindow).toEqual([
      1,
      0.9,
      0.8,
      0.7,
      0.6,
      0.5,
      0.4,
      0.30000000000000004,
      0.19999999999999996,
      0.09999999999999998
    ]);
  });
});

describe('#getRectangle', () => {
  test('returns correct rectangle window', () => {
    const rectangleWindow = getRectangle(10);

    expect(rectangleWindow).toEqual([
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
    ]);
  });
});

describe('#getSinc', () => {
  test('returns correct sinc window', () => {
    const sincWindow = getSinc(10);

    expect(sincWindow).toEqual([
      3.898171832519376e-17,
      0.23387232094715982,
      0.5045511524271047,
      0.7568267286406569,
      0.9354892837886392,
      1,
      0.9354892837886392,
      0.7568267286406569,
      0.5045511524271047,
      0.23387232094715982
    ]);
  });
});

describe('#getTriangle', () => {
  test('returns correct triangle window', () => {
    const triangleWindow = getTriangle(10);

    expect(triangleWindow).toEqual([
      0,
      0.2,
      0.4,
      0.6,
      0.8,
      1,
      0.8,
      0.6,
      0.4,
      0.2,
      0
    ]);
  });
});
