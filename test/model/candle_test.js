'use strict';



const mocha = require('mocha');

const { describe } = mocha;
const { it } = mocha;
const assert = require('assert');
const { Candle } = require('../../model/candle');

describe('Candles Testing', () => {
  describe('Bullish / Bearish detection', () => {
    it('Should be bearish (1)', (done) => {
      const candle = new Candle({"base":"BTC","close":20986.02,"counter":"EUR","high":20986.02,"low":20969.45,"open":20977.4,"openTimeInISO":"2022-10-29T16:08:00.000Z","openTimeInMillis":1667059680000,"productId":"BTC-EUR","sizeInMillis":null,"volume":0.66249251});
      assert.strictEqual(candle.isBearish, true);
      assert.strictEqual(candle.isBullish, false);
      done();
    });

    it('Should be bearish (2)', (done) => {
      const candle = new Candle({"base":"BTC","close":20986.02,"counter":"EUR","high":20996.02,"low":20969.45,"open":20977.4,"openTimeInISO":"2022-10-29T16:08:00.000Z","openTimeInMillis":1667059680000,"productId":"BTC-EUR","sizeInMillis":null,"volume":0.66249251});
      assert.strictEqual(candle.isBearish, true);
      assert.strictEqual(candle.isBullish, false);
      done();
    });

    it('Should be bearish (3)', (done) => {
      const candle = new Candle({"base":"BTC","close":20986.02,"counter":"EUR","high":20986.02,"low":20969.45,"open":20999.4,"openTimeInISO":"2022-10-29T16:08:00.000Z","openTimeInMillis":1667059680000,"productId":"BTC-EUR","sizeInMillis":null,"volume":0.66249251});
      assert.strictEqual(candle.isBearish, true);
      assert.strictEqual(candle.isBullish, false);
      done();
    });

    it('Should be bearish (4)', (done) => {
      const candle = new Candle({"base":"BTC","close":20986.02,"counter":"EUR","high":20986.02,"low":20969.45,"open":20977.4,"openTimeInISO":"2022-10-29T16:08:00.000Z","openTimeInMillis":1667059680000,"productId":"BTC-EUR","sizeInMillis":null,"volume":0.66249251});
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
      const candle = new Candle({"base":"BTC","close":20986.02,"counter":"EUR","high":20986.02,"low":20969.45,"open":20977.4,"openTimeInISO":"2022-10-29T16:08:00.000Z","openTimeInMillis":1667059680000,"productId":"BTC-EUR","sizeInMillis":null,"volume":0.66249251});
      assert.strictEqual(candle.upperWick.getValue(), '0.0000');
      assert.strictEqual(candle.lowerWick.getValue(), '0.0005');
      done();
    });

    it('Bullish Case, Top / Down Wick (Hammer)', (done) => {
      const candle = new Candle({"base":"BTC","close":20986.02,"counter":"EUR","high":20986.02,"low":20969.45,"open":20977.4,"openTimeInISO":"2022-10-29T16:08:00.000Z","openTimeInMillis":1667059680000,"productId":"BTC-EUR","sizeInMillis":null,"volume":0.66249251});
      assert.strictEqual(candle.upperWick.getValue(), '0.0000');
      assert.strictEqual(candle.lowerWick.getValue(), '0.0005');
      done();
    });
  });

  describe('Timestamp formatting', () => {
    it('Should report the right timestamp', (done) => {
      const candle = new Candle({"base":"BTC","close":20989.97,"counter":"EUR","high":20991.36,"low":20988.07,"open":20989.24,"openTimeInISO":"2022-10-29T16:09:00.000Z","openTimeInMillis":1667059740000,"productId":"BTC-EUR","sizeInMillis":null,"volume":0.33274308});
      assert.strictEqual(candle.ts, '2022-10-29T16:09:00.000Z');
      done();
    });
  });

  describe('The isConsecutiveOf function', () => {
    it('Should be consecutive', (done) => {
      const current = new Candle({"base":"BTC","close":20989.97,"counter":"EUR","high":20991.36,"low":20988.07,"open":20989.24,"openTimeInISO":"2022-10-29T16:09:00.000Z","openTimeInMillis":1667059740000,"productId":"BTC-EUR","sizeInMillis":null,"volume":0.33274308});
      const previuos = new Candle({"base":"BTC","close":20986.02,"counter":"EUR","high":20986.02,"low":20969.45,"open":20977.4,"openTimeInISO":"2022-10-29T16:08:00.000Z","openTimeInMillis":1667059680000,"productId":"BTC-EUR","sizeInMillis":null,"volume":0.66249251});
      assert.strictEqual(current.isConsecutiveOf(previuos), true);
      done();
    });

    it('Should not be consecutive', (done) => {
      const previuos = new Candle({"base":"BTC","close":20989.97,"counter":"EUR","high":20991.36,"low":20988.07,"open":20989.24,"openTimeInISO":"2022-10-29T16:09:00.000Z","openTimeInMillis":1667059740000,"productId":"BTC-EUR","sizeInMillis":null,"volume":0.33274308});
      const current = new Candle({"base":"BTC","close":20986.02,"counter":"EUR","high":20986.02,"low":20969.45,"open":20977.4,"openTimeInISO":"2022-10-29T16:08:00.000Z","openTimeInMillis":1667059680000,"productId":"BTC-EUR","sizeInMillis":null,"volume":0.66249251});
      assert.strictEqual(current.isConsecutiveOf(previuos), false);
      done();
    });
  });

  describe('Immutability', () => {
    it('Should not be possible to change values in a candle once created', (done) => {
      const candle = new Candle({"base":"BTC","close":20986.02,"counter":"EUR","high":20986.02,"low":20969.45,"open":20977.4,"openTimeInISO":"2022-10-29T16:08:00.000Z","openTimeInMillis":1667059680000,"productId":"BTC-EUR","sizeInMillis":null,"volume":0.66249251});
      assert.throws(() => candle.low = '9',
        {
          name: 'TypeError', message: "Cannot assign to read only property 'low' of object '#<Candle>'"
        });
      done();
    });
  });
});
