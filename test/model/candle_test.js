'use strict';

const mocha = require('mocha');

const { describe } = mocha;
const { it } = mocha;
const assert = require('assert');
const { Candle } = require('../../model/candle');
//TODO: add tests for lower wick / body / upper wick for more cases.
describe('Candles Testing', () => {
  
  describe('Building a candle', () => {
    it('should have all the values on (bearish case)', (done) => {
      const candle = new Candle({
        base: 'BTC', close: 20986.02, counter: 'EUR', high: 20992.02, low: 20969.45, open: 20997.4, openTimeInISO: '2022-10-29T16:08:00.000Z', openTimeInMillis: 1667059680000, productId: 'BTC-EUR', sizeInMillis: null, volume: 0.66249251
      });
      assert.strictEqual(candle.open.getValue(), '20997.4');
      assert.strictEqual(candle.close.getValue(), '20986.02');
      assert.strictEqual(candle.low.getValue(), '20969.45');
      assert.strictEqual(candle.high.getValue(), '20992.02');
      assert.strictEqual(candle.ts, '2022-10-29T16:08:00.000Z');
      assert.strictEqual(candle.volume.getValue(), '0.66249251');
      done();
    });
  });
  
  
  describe('Bullish / Bearish detection', () => {
    it('Should be bearish (1)', (done) => {
      const candle = new Candle({
        base: 'BTC', close: 20986.02, counter: 'EUR', high: 20992.02, low: 20969.45, open: 20997.4, openTimeInISO: '2022-10-29T16:08:00.000Z', openTimeInMillis: 1667059680000, productId: 'BTC-EUR', sizeInMillis: null, volume: 0.66249251
      });
      assert.strictEqual(candle.isBearish, true);
      assert.strictEqual(candle.isBullish, false);
      done();
    });

    it('Should be bearish (2)', (done) => {
      const candle = new Candle({
        base: 'BTC', close: 20986.02, counter: 'EUR', high: 20996.02, low: 20969.45, open: 21077.4, openTimeInISO: '2022-10-29T16:08:00.000Z', openTimeInMillis: 1667059680000, productId: 'BTC-EUR', sizeInMillis: null, volume: 0.66249251
      });
      assert.strictEqual(candle.isBearish, true);
      assert.strictEqual(candle.isBullish, false);
      done();
    });

    it('Should be bearish (3)', (done) => {
      const candle = new Candle({
        base: 'BTC', close: 20986.02, counter: 'EUR', high: 20986.02, low: 20969.45, open: 20999.4, openTimeInISO: '2022-10-29T16:08:00.000Z', openTimeInMillis: 1667059680000, productId: 'BTC-EUR', sizeInMillis: null, volume: 0.66249251
      });
      assert.strictEqual(candle.isBearish, true);
      assert.strictEqual(candle.isBullish, false);
      done();
    });

    it('Should be bearish (4)', (done) => {
      const candle = new Candle({
        base: 'BTC', close: 20986.02, counter: 'EUR', high: 20986.02, low: 20969.45, open: 21077.4, openTimeInISO: '2022-10-29T16:08:00.000Z', openTimeInMillis: 1667059680000, productId: 'BTC-EUR', sizeInMillis: null, volume: 0.66249251
      });
      assert.strictEqual(candle.isBearish, true);
      assert.strictEqual(candle.isBullish, false);
      done();
    });

    it('Should be bearish (5)', (done) => {
      const candle = new Candle({
        base: 'ADA', close: 0.411, counter: 'EUR', high: 0.4137, low: 0.413, open: 0.413, openTimeInISO: '2022-10-29T16:18:00.000Z', openTimeInMillis: 1667060280000, productId: 'ADA-EUR', sizeInMillis: null, volume: 7693.33
      });
      assert.strictEqual(candle.isBearish, true);
      assert.strictEqual(candle.isBullish, false);
      done();
    });

    it('Should be bearish (6)', (done) => {
      const candle = new Candle({
        base: 'ADA', close: 0.410, counter: 'EUR', high: 0.4143, low: 0.4138, open: 0.411, openTimeInISO: '2022-10-29T16:19:00.000Z', openTimeInMillis: 1667060340000, productId: 'ADA-EUR', sizeInMillis: null, volume: 497.9
      });
      assert.strictEqual(candle.isBearish, true);
      assert.strictEqual(candle.isBullish, false);
      done();
    });

    it('Should be bearish (7)', (done) => {
      const candle = new Candle({
        base: 'ADA', close: 0.409, counter: 'EUR', high: 0.4184, low: 0.4166, open: 0.410, openTimeInISO: '2022-10-29T16:21:00.000Z', openTimeInMillis: 1667060460000, productId: 'ADA-EUR', sizeInMillis: null, volume: 4666.32
      });
      assert.strictEqual(candle.isBearish, true);
      assert.strictEqual(candle.isBullish, false);
      done();
    });

    it('Should be bullish (1)', (done) => {
      const candle = new Candle({
        base: 'BTC', close: 10.03, counter: 'EUR', high: 20986.02, low: 20969.45, open: 10.02, openTimeInISO: '2022-10-29T16:08:00.000Z', openTimeInMillis: 1667059680000, productId: 'BTC-EUR', sizeInMillis: null, volume: 0.66249251
      });
      assert.strictEqual(candle.isBearish, false);
      assert.strictEqual(candle.isBullish, true);
      done();
    });

    it('Should be bullish (2)', (done) => {
      const candle = new Candle({
        base: 'BTC', close: 20986.02, counter: 'EUR', high: 20986.02, low: 20969.45, open: 19986.4, openTimeInISO: '2022-10-29T16:08:00.000Z', openTimeInMillis: 1667059680000, productId: 'BTC-EUR', sizeInMillis: null, volume: 0.66249251
      });
      assert.strictEqual(candle.isBearish, false);
      assert.strictEqual(candle.isBullish, true);
      done();
    });

    it('Should be bullish (3)', (done) => {
      const candle = new Candle({
        base: 'BTC', close: 20986.02, counter: 'EUR', high: 20986.02, low: 20969.45, open: 20986.02, openTimeInISO: '2022-10-29T16:08:00.000Z', openTimeInMillis: 1667059680000, productId: 'BTC-EUR', sizeInMillis: null, volume: 0.66249251
      });
      assert.strictEqual(candle.isBearish, false);
      assert.strictEqual(candle.isBullish, true);
      done();
    });
  });

  describe('Wicks Calculations', () => {
    it('Bearish Case, Top / Down Wick (Hammer)', (done) => {
      const candle = new Candle({
        base: 'BTC', open: 88.04, close: 86.02, high: 88.04, low: 85.45, counter: 'EUR', openTimeInISO: '2022-10-29T16:08:00.000Z', openTimeInMillis: 1667059680000, productId: 'BTC-EUR', sizeInMillis: null, volume: 0.66249251
      });
      assert.strictEqual(candle.upperWick.getValue(), '0.00');
      assert.strictEqual(candle.lowerWick.getValue(), '0.57');
      done();
    });

    it('Bullish Case, Top / Down Wick (Hammer)', (done) => {
      const candle = new Candle({
        base: 'BTC', open: 77.40, close: 86.02, high: 86.02, low: 72.45, counter: 'EUR', openTimeInISO: '2022-10-29T16:08:00.000Z', openTimeInMillis: 1667059680000, productId: 'BTC-EUR', sizeInMillis: null, volume: 0.66249251
      });
      assert.strictEqual(candle.upperWick.getValue(), '0.00');
      assert.strictEqual(candle.lowerWick.getValue(), '4.95');
      done();
    });
  });

  describe('Timestamp formatting', () => {
    it('Should report the right timestamp', (done) => {
      const candle = new Candle({
        base: 'BTC', close: 20989.97, counter: 'EUR', high: 20991.36, low: 20988.07, open: 20989.24, openTimeInISO: '2022-10-29T16:09:00.000Z', openTimeInMillis: 1667059740000, productId: 'BTC-EUR', sizeInMillis: null, volume: 0.33274308
      });
      assert.strictEqual(candle.ts, '2022-10-29T16:09:00.000Z');
      done();
    });
  });

  describe('The isConsecutiveOf function', () => {
    it('Should be consecutive', (done) => {
      const current = new Candle({
        base: 'BTC', close: 20989.97, counter: 'EUR', high: 20991.36, low: 20988.07, open: 20989.24, openTimeInISO: '2022-10-29T16:09:00.000Z', openTimeInMillis: 1667059740000, productId: 'BTC-EUR', sizeInMillis: null, volume: 0.33274308
      });
      const previuos = new Candle({
        base: 'BTC', close: 20986.02, counter: 'EUR', high: 20986.02, low: 20969.45, open: 20977.4, openTimeInISO: '2022-10-29T16:08:00.000Z', openTimeInMillis: 1667059680000, productId: 'BTC-EUR', sizeInMillis: null, volume: 0.66249251
      });
      assert.strictEqual(current.isConsecutiveOf(previuos), true);
      done();
    });

    it('Should not be consecutive', (done) => {
      const previuos = new Candle({
        base: 'BTC', close: 20989.97, counter: 'EUR', high: 20991.36, low: 20988.07, open: 20989.24, openTimeInISO: '2022-10-29T16:09:00.000Z', openTimeInMillis: 1667059740000, productId: 'BTC-EUR', sizeInMillis: null, volume: 0.33274308
      });
      const current = new Candle({
        base: 'BTC', close: 20986.02, counter: 'EUR', high: 20986.02, low: 20969.45, open: 20977.4, openTimeInISO: '2022-10-29T16:08:00.000Z', openTimeInMillis: 1667059680000, productId: 'BTC-EUR', sizeInMillis: null, volume: 0.66249251
      });
      assert.strictEqual(current.isConsecutiveOf(previuos), false);
      done();
    });
  });

  describe('Body calculation', () => {
    it('Should calculate the body correctly (flat candle)', (done) => {
      const candle = new Candle({
        base: 'BTC', close: 20986.02, counter: 'EUR', high: 20986.02, low: 20969.45, open: 20986.02, openTimeInISO: '2022-10-29T16:08:00.000Z', openTimeInMillis: 1667059680000, productId: 'BTC-EUR', sizeInMillis: null, volume: 0.66249251
      });
      assert.strictEqual(candle.body.getValue(), '0.00');
      done();
    });

    it('Should calculate the body correctly (bearish case)', (done) => {
      const candle = new Candle({
        base: 'BTC', close: 20986.02, counter: 'EUR', high: 20986.02, low: 20969.45, open: 20996.02, openTimeInISO: '2022-10-29T16:08:00.000Z', openTimeInMillis: 1667059680000, productId: 'BTC-EUR', sizeInMillis: null, volume: 0.66249251
      });
      assert.strictEqual(candle.body.getValue(), '10.00');
      done();
    });

    it('Should calculate the body correctly (bullish case)', (done) => {
      const candle = new Candle({
        base: 'BTC', close: 20986.02, counter: 'EUR', high: 20986.02, low: 20969.45, open: 20986.02, openTimeInISO: '2022-10-29T16:08:00.000Z', openTimeInMillis: 1667059680000, productId: 'BTC-EUR', sizeInMillis: null, volume: 0.66249251
      });
      assert.strictEqual(candle.body.getValue(), '0.00');
      done();
    });
  });


  describe('Immutability', () => {
    it('Should not be possible to change values in a candle once created', (done) => {
      const candle = new Candle({
        base: 'BTC', close: 20986.02, counter: 'EUR', high: 20986.02, low: 20969.45, open: 20977.4, openTimeInISO: '2022-10-29T16:08:00.000Z', openTimeInMillis: 1667059680000, productId: 'BTC-EUR', sizeInMillis: null, volume: 0.66249251
      });
      assert.throws(() => candle.low = '9',
        {
          name: 'TypeError', message: "Cannot assign to read only property 'low' of object '#<Candle>'"
        });
      done();
    });
  });
});
