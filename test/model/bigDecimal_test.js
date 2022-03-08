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
      assert.strictEqual(perc.getPrettyValue(2, '.'), '5');
      done();
    });

    it('Normal case (2)', (done) => {
      const testValue1 = new BigDecimal(16.56);
      const testValue2 = new BigDecimal(200);
      const perc = testValue1.asPercentageOf(testValue2);
      assert.strictEqual(perc.getPrettyValue(2, '.'), '8.28');
      done();
    });

    it('Low case', (done) => {
      const testValue1 = new BigDecimal(0.001);
      const testValue2 = new BigDecimal(200);
      const perc = testValue1.asPercentageOf(testValue2);
      assert.strictEqual(perc.getPrettyValue(2, '.'), '0.0005');
      done();
    });
  });

  describe('The asRatioOf Function', () => {
    it('Normal case (1)', (done) => {
      const testValue1 = new BigDecimal(10);
      const testValue2 = new BigDecimal(200);
      const perc = testValue1.asPercentageOf(testValue2);
      assert.strictEqual(perc.getPrettyValue(2, '.'), '0.05');
      done();
    });

    it('Normal case (2)', (done) => {
      const testValue1 = new BigDecimal(23.76);
      const testValue2 = new BigDecimal(2353.45);
      const perc = testValue1.asPercentageOf(testValue2);
      assert.strictEqual(perc.getPrettyValue(2, '.'), '0.01');
      done();
    });

    it('Low case', (done) => {
      const testValue1 = new BigDecimal(0.001);
      const testValue2 = new BigDecimal(200);
      const perc = testValue1.asPercentageOf(testValue2);
      assert.strictEqual(perc.getPrettyValue(2, '.'), '0.0005');
      done();
    });
  });
});
