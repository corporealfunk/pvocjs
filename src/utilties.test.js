import { floatToExtended } from './utilties';
import { Float80 } from 'float80';

const float80ToNumber = (buffer) => {
  return Float80.fromBytes(buffer).asNumber().toNumber();
};

describe('floatToExtended', () => {
  it('converts numbers >= 1.0', () => {
    expect(float80ToNumber(
      floatToExtended(5.1),
    )).toEqual(5.1);
  });

  it('converts numbers 1.0 > n < 0', () => {
    expect(float80ToNumber(
      floatToExtended(0.00473539),
    )).toEqual(0.00473539);
  });

  it('converts numbers 0 > n > -1.0', () => {
    expect(float80ToNumber(
      floatToExtended(-0.0000034565),
    )).toEqual(-0.0000034565);
  });

  it('converts numbers < -1.0', () => {
    expect(float80ToNumber(
      floatToExtended(-55.0034598),
    )).toEqual(-55.0034598);
  });
});
