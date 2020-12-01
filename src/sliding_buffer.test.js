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
  test('buffer contains correct data padded', () => {
    const buffer = new SlidingBuffer(5);

    buffer.shiftIn([9]);
    buffer.shiftLeft(4);

    expect(buffer.buffer).toEqual([9,0,0,0,0]);
  });
});
