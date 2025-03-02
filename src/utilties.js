/* eslint-disable no-param-reassign */
/* eslint-disable import/prefer-default-export */

// zero the array in place
const zeroArray = (data) => {
  for (let i = 0; i < data.length; i++) {
    data[i] = 0;
  }
};

// convert a number (double) to a buffer in float80 format, Big Endian
const floatToExtended = (number) => {
  const original = Buffer.alloc(8);
  original.writeDoubleBE(number);

  const output = Buffer.alloc(10);

  // only get bits 5-15
  let originalExponent = original.readInt16BE();
  originalExponent &= 0x7FF0;

  // shift down
  originalExponent = Math.floor(originalExponent / 2**4);

  // exponent is in "excess-1023" format, calculate original:
  originalExponent -= 1023;

  // in 80 bit, the exponent is in "excess-16383" format
  let newExponent = 16383 + originalExponent;

  // write the sign and new exponent to the buffer
  if (number < 0) {
    output.writeUInt16BE(newExponent + 0x8000);
  } else {
    output.writeUInt16BE(newExponent);
  }

  // grab all the bits from the original buffer
  let originalBits = original.readBigInt64BE();

  // get only the mantissa
  originalBits &= BigInt(0x000fffffffffffff);

  // shift it 11
  originalBits <<= BigInt(11);

  // add what will become bit 63 in the float80 (biggest bit here)
  originalBits += BigInt(0x8000000000000000);

  // insert into the output buffer at byte 3
  output.writeBigUInt64BE(originalBits, 2);

  return output;
};

export {
  zeroArray,
  floatToExtended,
};
