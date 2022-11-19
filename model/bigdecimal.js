/* eslint max-len: ["error", { "code": 150 }] */

'use strict';

const bigDecimal = require('js-big-decimal');

const ZERO = new bigDecimal(0);
const HUNDRED = new bigDecimal(100);

/**
 * Wrapper for the bigdecimal class, to improve readability, a few methods have been added, mailnly to favour the
 * use booleans rather than matching with 0/-1/+1
 */

class BigDecimal extends bigDecimal {
  lessThan = (oTherValue) => bigDecimal.prototype.compareTo.call(this, oTherValue) === -1;

  moreThan = (oTherValue) => bigDecimal.prototype.compareTo.call(this, oTherValue) === 1;

  equalsTo = (oTherValue) => bigDecimal.prototype.compareTo.call(this, oTherValue) === 0;

  asPercentageOf = (oTherValue) => {
    const div = bigDecimal.prototype.divide.call(this, oTherValue);
    return new BigDecimal(div.multiply(HUNDRED).round(6, bigDecimal.RoundingModes.HALF_EVEN).getValue());
  };

  asRatioOf = (other) => new BigDecimal(bigDecimal.prototype.divide.call(this, other).round(6, bigDecimal.RoundingModes.HALF_EVEN).getValue());

  isNegative = () => (bigDecimal.prototype.compareTo.call(this, ZERO) === -1);

  isPositive = () => (bigDecimal.prototype.compareTo.call(this, ZERO) === 1);

  isZero = () => (bigDecimal.prototype.compareTo.call(this, ZERO) === 0);

  isNotZero = () => (bigDecimal.prototype.compareTo.call(this, ZERO) !== 0);

  asInt = () => {
    const value = bigDecimal.prototype.getValue.call(this);
    return parseInt(value, 10);
  };
}

exports.BigDecimal = BigDecimal;
exports.BigDecimalZero = ZERO;
