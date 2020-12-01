class SlidingBuffer {
  constructor(size) {
    this.size = size;

    this.buffer = Array(size);

    for (let i = 0; i < size; i++) {
      this.buffer[i] = 0;
    }
  }

  shiftIn(data) {
    if (data.length > this.size) {
      throw new Error('Cannot shiftIn more data than buffer size');
    }

    this.buffer = this.buffer.slice(data.length, this.buffer.length);
    this.buffer.push(...data);
  }

  // shifts the contents to the left by length and pads with 0
  shiftLeft(length) {
    if (length > this.size) {
      throw new Error('Cannot shiftOver more than buffer size');
    }

    const data = Array(length);

    for (let i = 0; i < data.length; i++) {
      data[i] = 0;
    }

    this.shiftIn(data);
  }
}

export default SlidingBuffer;
