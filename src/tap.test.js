import Tapper from './tap';

describe('.flush', () => {
  it('flushes to the directories', () => {
    const samples = [1,2,3,4,5,6]
    Tapper.accumulate('decimate', samples);
    const samples2 = ['a','b','c','d'];
    Tapper.accumulate('decimate', samples2);

    const other = [5,6,7,8,3,4];
    Tapper.accumulate('foldedsamples', other);
    Tapper.flush();
  });
});
