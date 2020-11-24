import {
  getHamming,
  getVonHann,
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
