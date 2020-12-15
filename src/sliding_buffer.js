import { zeroArray } from './utilties';

class SlidingBuffer {
  constructor(size) {
    this.size = size;

    this.buffer = Array(size);
    zeroArray(this.buffer);

    this.lastValidDataI = size;
  }

  get hasValidData() {
    return (this.lastValidDataI >= 0 && this.lastValidDataI < this.size);
  }

  // returns to you the data that got shifted out
  shiftIn(data, validData = true) {
    if (data.length > this.size) {
      throw new Error('Cannot shiftIn more data than buffer size');
    }

    const shiftedOut = this.buffer.slice(0, data.length);

    this.buffer = this.buffer.slice(data.length, this.buffer.length);
    this.buffer.push(...data);

    if (validData) {
      this.lastValidDataI = this.size - 1;
    }

    return shiftedOut;
  }

  // shifts the contents to the left by length and pads with 0
  // returns to you the shiftedOut data
  shiftLeft(length) {
    if (length > this.size) {
      throw new Error('Cannot shiftOver more than buffer size');
    }

    const data = Array(length);
    zeroArray(data);

    this.lastValidDataI -= length;
    return this.shiftIn(data, false);
  }
}

export default SlidingBuffer;
