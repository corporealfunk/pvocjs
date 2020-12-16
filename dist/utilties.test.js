"use strict";

var _utilties = require("./utilties");

var _float = require("float80");

var float80ToNumber = function float80ToNumber(buffer) {
  return _float.Float80.fromBytes(buffer).asNumber().toNumber();
};

describe('floatToExtended', function () {
  it('converts numbers >= 1.0', function () {
    expect(float80ToNumber((0, _utilties.floatToExtended)(5.1))).toEqual(5.1);
  });
  it('converts numbers 1.0 > n < 0', function () {
    expect(float80ToNumber((0, _utilties.floatToExtended)(0.00473539))).toEqual(0.00473539);
  });
  it('converts numbers 0 > n > -1.0', function () {
    expect(float80ToNumber((0, _utilties.floatToExtended)(-0.0000034565))).toEqual(-0.0000034565);
  });
  it('converts numbers < -1.0', function () {
    expect(float80ToNumber((0, _utilties.floatToExtended)(-55.0034598))).toEqual(-55.0034598);
  });
  it('converts a standard sample rate', function () {
    expect(float80ToNumber((0, _utilties.floatToExtended)(48000))).toEqual(48000);
  });
});