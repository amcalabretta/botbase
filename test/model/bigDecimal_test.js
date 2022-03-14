'use strict';

const mocha = require('mocha');

const { describe } = mocha;
const { it } = mocha;
const assert = require('assert');

const { BigDecimal } = require('../../model/bigdecimal');

describe('BigDecimal Wrapper', () => {
  describe('The lessThan Function', () => {
    it('Normal case', (done) => {
      const testValue1 = new BigDecimal(7.98);
      const testValue2 = new BigDecimal(5.23);
      assert.strictEqual(testValue2.lessThan(testValue1), true);
      done();
    });

    it('Equal case', (done) => {
      const testValue1 = new BigDecimal(7.98);
      const testValue2 = new BigDecimal(7.98);
      assert.strictEqual(testValue2.lessThan(testValue1), false);
      done();
    });

    it('One decimal case', (done) => {
      const testValue1 = new BigDecimal(7.981);
      const testValue2 = new BigDecimal(7.98);
      assert.strictEqual(testValue2.lessThan(testValue1), true);
      done();
    });
  });

  describe('The moreThan Function', () => {
    it('Normal case', (done) => {
      const testValue1 = new BigDecimal(7.98);
      const testValue2 = new BigDecimal(5.23);
      assert.strictEqual(testValue1.moreThan(testValue2), true);
      done();
    });

    it('Equal case', (done) => {
      const testValue1 = new BigDecimal(7.98);
      const testValue2 = new BigDecimal(7.98);
      assert.strictEqual(testValue2.moreThan(testValue1), false);
      done();
    });

    it('One decimal case (1)', (done) => {
      const testValue1 = new BigDecimal(1.230);
      const testValue2 = new BigDecimal(1.23);
      assert.strictEqual(testValue2.moreThan(testValue1), false);
      done();
    });

    it('One decimal case (2)', (done) => {
      const testValue1 = new BigDecimal(1.23);
      const testValue2 = new BigDecimal(1.231);
      assert.strictEqual(testValue2.moreThan(testValue1), true);
      done();
    });
  });

  describe('The equals Function', () => {
    it('Normal case', (done) => {
      const testValue1 = new BigDecimal(7.98);
      const testValue2 = new BigDecimal(5.23);
      assert.strictEqual(testValue2.equalsTo(testValue1), false);
      done();
    });

    it('Equal case', (done) => {
      const testValue1 = new BigDecimal(7.98);
      const testValue2 = new BigDecimal(7.98);
      assert.strictEqual(testValue2.equalsTo(testValue1), true);
      done();
    });

    it('One decimal case', (done) => {
      const testValue1 = new BigDecimal(7.981);
      const testValue2 = new BigDecimal(7.98);
      assert.strictEqual(testValue2.equalsTo(testValue1), false);
      done();
    });
  });

  describe('The asPercentageOf Function', () => {
    it('Normal case (1)', (done) => {
      const testValue1 = new BigDecimal(10);
      const testValue2 = new BigDecimal(200);
      const perc = testValue1.asPercentageOf(testValue2);
      assert.strictEqual(perc.getValue(), '5.000000');
      done();
    });

    it('Normal case (2)', (done) => {
      const testValue1 = new BigDecimal(16.56);
      const testValue2 = new BigDecimal(200);
      const perc = testValue1.asPercentageOf(testValue2);
      assert.strictEqual(perc.getValue(), '8.280000');
      done();
    });

    it('Low case', (done) => {
      const testValue1 = new BigDecimal(0.001);
      const testValue2 = new BigDecimal(200);
      const perc = testValue1.asPercentageOf(testValue2);
      assert.strictEqual(perc.getValue(), '0.000500');
      done();
    });
  });

  describe('The asRatioOf Function', () => {
    it('Normal case (1)', (done) => {
      const testValue1 = new BigDecimal(10);
      const testValue2 = new BigDecimal(200);
      const perc = testValue1.asRatioOf(testValue2);
      assert.strictEqual(perc.getValue(), '0.050000');
      done();
    });

    it('Normal case (2)', (done) => {
      const testValue1 = new BigDecimal(23.76);
      const testValue2 = new BigDecimal(2353.45);
      const perc = testValue1.asRatioOf(testValue2);
      assert.strictEqual(perc.getValue(), '0.010096');
      done();
    });

    it('Low case', (done) => {
      const testValue1 = new BigDecimal(0.001);
      const testValue2 = new BigDecimal(200);
      const perc = testValue1.asRatioOf(testValue2);
      assert.strictEqual(perc.getPrettyValue(2, '.'), '0.000005');
      done();
    });
  });

  describe('The negative Function', () => {
    it('Should be true for a negative number (1)', (done) => {
      const testValue = new BigDecimal(-10);
      assert.equal(testValue.isNegative(),true);
      done();
    });

    it('Should be true for a negative number (2)', (done) => {
      const testValue = new BigDecimal(-0.001);
      assert.equal(testValue.isNegative(), true);
      done();
    });

    it('Should be true for a negative number (3)', (done) => {
      const testValue = new BigDecimal(-0.0015);
      assert.equal(testValue.isNegative(), true);
      done();
    });
    

    it('Should be false for a positive number (1)', (done) => {
      const testValue = new BigDecimal(10);
      assert.equal(testValue.isNegative(), false);
      done();
    });

    it('Should be false for a positive number (2)', (done) => {
      const testValue = new BigDecimal(0.001);
      assert.equal(testValue.isNegative(), false);
      done();
    });

    it('Should be false for zero', (done) => {
      const testValue = new BigDecimal(0);
      assert.equal(testValue.isNegative(), false);
      done();
    });
  });

  describe('The zero Functions', () => {
    it('Should be false for a negative number (1)', (done) => {
      const testValue = new BigDecimal(-10);
      assert.equal(testValue.isZero(), false);
      done();
    });

    it('Should be false for a negative number (2)', (done) => {
      const testValue = new BigDecimal(-0.001);
      assert.equal(testValue.isZero(), false);
      done();
    });

    it('Should be false for a positive number (1)', (done) => {
      const testValue = new BigDecimal(10);
      assert.equal(testValue.isZero(), false);
      done();
    });

    it('Should be false for a positive number (2)', (done) => {
      const testValue = new BigDecimal(0.001);
      assert.equal(testValue.isZero(), false);
      done();
    });

    it('Should be true for zero', (done) => {
      const testValue = new BigDecimal(0);
      assert.equal(testValue.isZero(), true);
      done();
    });

    it('Should be false for non zero', (done) => {
      const testValue = new BigDecimal(0.000009);
      assert.equal(testValue.isZero(), false);
      done();
    });
  });

  describe('The asInt Function', () => {
    it('Normal case', (done) => {
      const testValue = new BigDecimal(10.23);
      assert.strictEqual(testValue.asInt(), 10);
      done();
    });
  });
});
