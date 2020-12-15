import Tap from './tap';

describe('.flush', () => {
  it('flushes to the directories', () => {
    const tapper = new Tap('/tmp/tapper');

    const samples = [1,2,3,4,5,6]
    tapper.accumulate('decimate', samples);
    const samples2 = ['a','b','c','d'];
    tapper.accumulate('decimate', samples2);

    const other = [5,6,7,8,3,4];
    tapper.accumulate('foldedsamples', other);
    tapper.flush();
  });
});
