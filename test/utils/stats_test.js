const mocha = require('mocha');

const { describe } = mocha;
const { it } = mocha;
const assert = require('assert');
const { calculateMean } = require('../../utils/stats');
const { BigDecimal,BigDecimalZero } = require('../../model/bigdecimal');

const num1 = new BigDecimal('3.456');
const num2 = new BigDecimal('4.897');
const num3 = new BigDecimal('2.2134');

describe('calculateMean', () => {
  it('Should calculate the mean of 1 value as itself', (done) => {
    assert.strictEqual(calculateMean(BigDecimalZero,1,num1).getValue(), '3.456');
    done();
  });
  it('Should calculate the mean of 2 values', (done) => {
    assert.strictEqual(calculateMean(num1,2,num2).getValue(), '4.17650000');
    done();
  });
  it('Should calculate the mean of 3 values', (done) => {
    const mean = calculateMean(num1,2,num2);
    assert.strictEqual(calculateMean(mean,3,num3).getValue(), '3.52213333');
    done();
  });

});
