import SlidingBuffer from './sliding_buffer';

describe('#new', () => {
  test('buffer is zero and correct length', () => {
    const buffer = new SlidingBuffer(5);

    expect(buffer.buffer).toEqual([0,0,0,0,0]);
  });
});

describe('#shiftIn', () => {
  describe('when less data than size', () => {
    const buffer = new SlidingBuffer(5);

    test('buffer contains correct data', () => {
      buffer.shiftIn([9,8,7]);

      expect(buffer.buffer).toEqual([0,0,9,8,7]);
    });

    test('returns the shifted out data', () => {
      buffer.shiftIn([1,2,3,4,5]);
      expect(buffer.shiftIn([6,7,8])).toEqual([1,2,3]);
    });
  });

  describe('when same data than size', () => {
    const buffer = new SlidingBuffer(5);

    test('buffer contains correct data', () => {
      buffer.shiftIn([9,8,7,6,5]);

      expect(buffer.buffer).toEqual([9,8,7,6,5]);
    });
  });

  describe('when more data than size', () => {
    const buffer = new SlidingBuffer(5);

    test('buffer throws error', () => {
      try {
        buffer.shiftIn([9,8,7,6,5,4]);
      } catch(e) {
        expect(e.message).toEqual('Cannot shiftIn more data than buffer size');
      }
    });
  });
});

describe('#shiftLeft', () => {
  const buffer = new SlidingBuffer(5);

  test('buffer contains correct data padded', () => {
    buffer.shiftIn([9]);
    buffer.shiftLeft(4);

    expect(buffer.buffer).toEqual([9,0,0,0,0]);
  });

  test('returns the shifted out data', () => {
    buffer.shiftIn([10,11,12,13,14]);

    expect(buffer.shiftLeft(3)).toEqual([10,11,12]);
  });
});
