'use strict';

const mocha = require('mocha');

const { describe } = mocha;
const { it } = mocha;
const assert = require('assert');
const { Candle } = require('../../model/candle');

describe('Candles Testing', () => {
  describe('Bullish / Bearish detection', () => {
    it('Should be bearish (1)', (done) => {
      const candle = new Candle([1646047500, 0.7831, 0.7838, 0.7833, 0.7831, 1304.24]);
      assert.strictEqual(candle.isBearish, true);
      assert.strictEqual(candle.isBullish, false);
      done();
    });

    it('Should be bearish (2)', (done) => {
      const candle = new Candle([1646047260, 0.7817, 0.7826, 0.7826, 0.7817, 1782.06]);
      assert.strictEqual(candle.isBearish, true);
      assert.strictEqual(candle.isBullish, false);
      done();
    });

    it('Should be bearish (3)', (done) => {
      const candle = new Candle([1646047200, 0.7807, 0.7825, 0.7825, 0.7817, 6592.7]);
      assert.strictEqual(candle.isBearish, true);
      assert.strictEqual(candle.isBullish, false);
      done();
    });

    it('Should be bearish (4)', (done) => {
      const candle = new Candle([1646047140, 0.7838, 0.7852, 0.7852, 0.7839, 16187.59]);
      assert.strictEqual(candle.isBearish, true);
      assert.strictEqual(candle.isBullish, false);
      done();
    });

    it('Should be bullish (1)', (done) => {
      const candle = new Candle([1646047440, 0.7827, 0.7827, 0.7827, 0.7827, 137]);
      assert.strictEqual(candle.isBearish, false);
      assert.strictEqual(candle.isBullish, true);
      done();
    });

    it('Should be bullish (2)', (done) => {
      const candle = new Candle([1646047380, 0.7823, 0.7828, 0.7823, 0.7824, 705.47]);
      assert.strictEqual(candle.isBearish, false);
      assert.strictEqual(candle.isBullish, true);
      done();
    });

    it('Should be bullish (3)', (done) => {
      const candle = new Candle([1646047320, 0.7821, 0.7829, 0.7821, 0.7826, 2165.68]);
      assert.strictEqual(candle.isBearish, false);
      assert.strictEqual(candle.isBullish, true);
      done();
    });
  });

  describe('Wicks Calculations', () => {
    it('Bearish Case, Top / Down Wick (Hammer)', (done) => {
      const candle = new Candle([1646047320, 0.8536, 0.8556, 0.8556, 0.8541, 2165.68]);
      assert.strictEqual(candle.upperWick.getValue(), '0.0000');
      assert.strictEqual(candle.lowerWick.getValue(), '0.0005');
      done();
    });

    it('Bullish Case, Top / Down Wick (Hammer)', (done) => {
      const candle = new Candle([1646047320, 0.8536, 0.8556, 0.8556, 0.8541, 2165.68]);
      assert.strictEqual(candle.upperWick.getValue(), '0.0000');
      assert.strictEqual(candle.lowerWick.getValue(), '0.0005');
      done();
    });
  });

  describe('Timestamp formatting', () => {
    it('Should report the right timestamp', (done) => {
      const candle = new Candle([1646131080, 0.7821, 0.7829, 0.7821, 0.7826, 2165.68]);
      assert.strictEqual(candle.ts, '01/03/2022@10:38:00');
      done();
    });
  });

  describe('Immutability', () => {
    it('Should not be possible to change values in a candle once created', (done) => {
      const candle = new Candle([1646131080, 0.7821, 0.7829, 0.7821, 0.7826, 2165.68]);
      assert.throws(() => candle.low = '9',
        {
          name: 'TypeError', message: "Cannot assign to read only property 'low' of object '#<Candle>'"
        });
      done();
    });
  });
});
