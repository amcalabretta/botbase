const mocha = require('mocha');

const { describe } = mocha;
const { it } = mocha;
const assert = require('assert');
const { expect } = require('chai');
const sinon = require('sinon');
const log4js = require('log4js');
const { WhiteShark } = require('../strategies/candlesticks/white_shark');
const { OrderType } = require('../model/constants');
const { Order } = require('../model/order');

log4js.configure({
  appenders: { out: { type: 'stdout' } },
  // put 'level' (info/debug) instead of 'off' to see the logs as 'level'
  categories: { default: { appenders: ['out'], level: 'off' } },
});

describe('White Shark Validation', () => {
  it('Should throw an error when No subconf is given', (done) => {
    assert.throws(() => new WhiteShark({
      markets: ['LTC-EUR'], cryptoAmounts: [10], euroAmount: 30, dollarAmount: 0
    }),
    { name: 'Error', message: 'mainConf Section missing' });
    done();
  });

  it('Should throw an error when subConf is missing one parameter (numBearishCandles)', (done) => {
    assert.throws(() => new WhiteShark({
      markets: ['LTC-EUR'],
      cryptoAmounts: [10],
      euroAmount: 30,
      dollarAmount: 0,
      subConf: {
        gapRatio: 0.2, wickRatio: 0.05, volumeRatio: 0.9
      }
    }),
    {
      name: 'Error', message: 'ValidationError: numBearishCandles is required'
    });
    done();
  });

  it('Should throw an error when numBearishCandles is negative', (done) => {
    assert.throws(() => new WhiteShark({
      markets: ['LTC-EUR'],
      cryptoAmounts: [10],
      euroAmount: 30,
      dollarAmount: 0,
      subConf: {
        gapRatio: 0.2, wickRatio: 0.05, volumeRatio: 0.9, numBearishCandles: -1
      }
    }),
    {
      name: 'Error', message: 'ValidationError: numBearishCandles must be greater than or equal to 1'
    });
    done();
  });

  it('Should throw an error when numBearishCandles is zero', (done) => {
    assert.throws(() => new WhiteShark({
      markets: ['LTC-EUR'],
      cryptoAmounts: [10],
      euroAmount: 30,
      dollarAmount: 0,
      subConf: {
        gapRatio: 0.2, wickRatio: 0.05, volumeRatio: 0.9, numBearishCandles: 0
      }
    }),
    {
      name: 'Error', message: 'ValidationError: numBearishCandles must be greater than or equal to 1'
    });
    done();
  });

  it('Should throw an error when numBearishCandles is not a number', (done) => {
    assert.throws(() => new WhiteShark({
      markets: ['LTC-EUR'],
      cryptoAmounts: [10],
      euroAmount: 30,
      dollarAmount: 0,
      subConf: {
        gapRatio: 0.2, wickRatio: 0.05, volumeRatio: 0.9, numBearishCandles: 'a'
      }
    }),
    {
      name: 'Error', message: 'ValidationError: numBearishCandles must be a number'
    });
    done();
  });

  it('Should throw an error when numBearishCandles is higher than 10', (done) => {
    assert.throws(() => new WhiteShark({
      markets: ['LTC-EUR'],
      cryptoAmounts: [10],
      euroAmount: 30,
      dollarAmount: 0,
      subConf: {
        gapRatio: 0.2, wickRatio: 0.05, volumeRatio: 0.9, numBearishCandles: 11
      }
    }),
    {
      name: 'Error', message: 'ValidationError: numBearishCandles must be less than or equal to 10'
    });
    done();
  });

  it('Should throw an error when markets and cryptoamounts are not exactly 1 (1)', (done) => {
    assert.throws(() => new WhiteShark({
      markets: ['LTC-EUR', 'BTC-EUR'],
      cryptoAmounts: [10, 34],
      euroAmount: 30,
      dollarAmount: 0,
      subConf: {
        gapRatio: 0.2, wickRatio: 0.05, volumeRatio: 0.9, numBearishCandles: 10
      }
    }),
    {
      name: 'Error', message: 'ValidationError: cryptoAmounts must contain 1 items'
    });
    done();
  });

  it('Should throw an error when markets and cryptoamounts are not exactly 1 (2)', (done) => {
    assert.throws(() => new WhiteShark({
      markets: ['LTC-EUR', 'BTC-EUR'],
      cryptoAmounts: [10],
      euroAmount: 30,
      dollarAmount: 0,
      subConf: {
        gapRatio: 0.2, wickRatio: 0.05, volumeRatio: 0.9, numBearishCandles: 10
      }
    }),
    {
      name: 'Error', message: 'ValidationError: markets must contain 1 items'
    });
    done();
  });

  it('Should throw an error when subConf is missing one parameter (gapRatio)', (done) => {
    assert.throws(() => new WhiteShark({
      markets: ['LTC-EUR'],
      cryptoAmounts: [10],
      euroAmount: 30,
      dollarAmount: 0,
      subConf: {
        numBearishCandles: 3, wickRatio: 0.05, volumeRatio: 0.9
      }
    }),
    { name: 'Error', message: 'ValidationError: gapRatio is required' });
    done();
  });

  it('Should throw an error when subConf is missing one parameter (wickRatio)', (done) => {
    assert.throws(() => new WhiteShark({
      markets: ['LTC-EUR'],
      cryptoAmounts: [10],
      euroAmount: 30,
      dollarAmount: 0,
      subConf: {
        numBearishCandles: 3, gapRatio: 0.2, volumeRatio: 0.9
      }
    }),
    { name: 'Error', message: 'ValidationError: wickRatio is required' });
    done();
  });

  it('Should throw an error when subConf is missing one parameter (volumeRatio)', (done) => {
    assert.throws(() => new WhiteShark({
      markets: ['LTC-EUR'],
      cryptoAmounts: [10],
      euroAmount: 30,
      dollarAmount: 0,
      subConf: {
        numBearishCandles: 3, gapRatio: 0.2, wickRatio: 0.05
      }
    }),
    { name: 'Error', message: 'ValidationError: volumeRatio is required' });
    done();
  });
});

describe('White Shark Pattern Spotting', () => {
  const strategy = new WhiteShark({
    markets: ['LTC-EUR'],
    cryptoAmounts: [10],
    euroAmount: 30,
    dollarAmount: 0,
    subConf: {
      numBearishCandles: 3, gapRatio: 0.2, buyRatio: 0.3, sellRatio: 0.4, wickRatio: 0.05, volumeRatio: 0.9
    }
  });
  const stub = sinon.stub(strategy, 'orderCallback').returns({});
  strategy.logger = log4js.getLogger();

  it('Should Not detect the pattern if the first candle is not bullish', (done) => {
    strategy.valueCallBack({ type: 'ticker', price: 107 });
    strategy.valueCallBack({
      type: 'candlesPastTenMinutes',
      payload: [[0, 0.8909, 0.8939, 0.8936, 0.8909, 8146.76],
        [0, 0.892, 0.8951, 0.8951, 0.8932, 9450.78],
        [0, 0.8952, 0.898, 0.8962, 0.8962, 5347.99],
        [0, 0.8946, 0.8972, 0.8951, 0.8966, 4686.05],
        [0, 0.8938, 0.8975, 0.8949, 0.8964, 11058.46],
        [0, 0.894, 0.8962, 0.8961, 0.8962, 17063.37],
        [0, 0.8951, 0.8987, 0.8983, 0.8951, 41754.58],
        [0, 0.898, 0.9021, 0.9015, 0.8991, 16429.72],
        [0, 0.9015, 0.9047, 0.9027, 0.9015, 41941.04]]
    });
    sinon.assert.calledWith(stub, new Order(OrderType.NO_OP, 'LTC-EUR', 0, 0, 0, 0), 'First candle not bullish');
    done();
  });
  it('Should Not detect the pattern if the first candle is bullish and there are less than x bearish candles before (1)', (done) => {
    strategy.valueCallBack({ type: 'ticker', price: 107 });
    strategy.valueCallBack({
      type: 'candlesPastTenMinutes',
      payload: [[0, 0.8909, 0.8939, 0.8936, 0.8967, 8146.76],
        [0, 0.892, 0.8951, 0.8951, 0.8932, 9450.78],
        [0, 0.8952, 0.898, 0.8962, 0.8962, 5347.99],
        [0, 0.8946, 0.8972, 0.8951, 0.8966, 4686.05],
        [0, 0.8938, 0.8975, 0.8949, 0.8964, 11058.46],
        [0, 0.894, 0.8962, 0.8961, 0.8962, 17063.37],
        [0, 0.8951, 0.8987, 0.8983, 0.8951, 41754.58],
        [0, 0.898, 0.9021, 0.9015, 0.8991, 16429.72],
        [0, 0.9015, 0.9047, 0.9027, 0.9015, 41941.04]]
    });
    sinon.assert.calledWith(stub, new Order(OrderType.NO_OP, 'LTC-EUR', 0, 0, 0, 0), 'Last 3 not bearish');
    done();
  });

  it('Should Not detect the pattern if the first candle is bullish and there are less than x bearish candles before (2)', (done) => {
    strategy.valueCallBack({ type: 'ticker', price: 107 });
    strategy.valueCallBack({
      type: 'candlesPastTenMinutes',
      payload: [
  [0,0.7295,0.7296, 0.7295, 0.7296, 428.44],
  [0,0.7295,0.7295, 0.7295, 0.7295, 131.14],
  [0,0.7291,0.7294, 0.7294, 0.7291, 93.18],
  [0,0.7294, 0.7302,0.7302, 0.7294, 4754.58],
  [0,0.7298, 0.7302, 0.7302, 0.7298, 656.58],
  [0,0.7299, 0.7303, 0.7303, 0.7299, 1310.4]]
    });
    sinon.assert.calledWith(stub, new Order(OrderType.NO_OP, 'LTC-EUR', 0, 0, 0, 0), 'Last 3 not bearish');
    done();
  });
/*
  [2022 - 03 - 12T17: 03: 16.291][DEBUG] default - 0 - Ts: 12 / 03 / 2022@16: 01: 00, Bullish, lo: 0.7265, hi: 0.7275, op: 0.7269, close: 0.7275, vol: 10671.98
  [2022 - 03 - 12T17: 03: 16.291][DEBUG] default - 1 - Ts: 12 / 03 / 2022@16: 00: 00, Bearish, lo: 0.7275, hi: 0.7278, op: 0.7278, close: 0.7275, vol: 9046.54
  [2022 - 03 - 12T17: 03: 16.291][DEBUG] default - 2 - Ts: 12 / 03 / 2022@15: 57: 00, Bearish, lo: 0.7276, hi: 0.7289, op: 0.7289, close: 0.7276, vol: 262.62
  [2022 - 03 - 12T17: 03: 16.291][DEBUG] default - 3 - Ts: 12 / 03 / 2022@15: 56: 00, Bullish, lo: 0.7284, hi: 0.7287, op: 0.7284, close: 0.7287, vol: 43.75
  [2022 - 03 - 12T17: 03: 16.292][DEBUG] default - 4 - Ts: 12 / 03 / 2022@15: 54: 00, Bullish, lo: 0.7288, hi: 0.7292, op: 0.7288, close: 0.7289, vol: 696.28
*/

  it('Should Not detect the pattern if the gap is negative (i.e. if the opening of the last candle is not above the opening of the previous one)    5675', (done) => {
    strategy.valueCallBack({ type: 'ticker', price: 107 });
    strategy.valueCallBack({
      type: 'candlesPastTenMinutes',
      payload: [[0, 0.8909, 0.8939, 0.8936, 0.8967, 8146.76],
      [0, 0.892, 0.8951, 0.8951, 0.8932, 9450.78],
      [0, 0.8952, 0.898, 0.8962, 0.8961, 5347.99],
      [0, 0.8946, 0.8972, 0.8951, 0.8966, 4686.05],
      [0, 0.8938, 0.8975, 0.8949, 0.8964, 11058.46],
      [0, 0.894, 0.8962, 0.8961, 0.8962, 17063.37],
      [0, 0.8951, 0.8987, 0.8983, 0.8951, 41754.58],
      [0, 0.898, 0.9021, 0.9015, 0.8991, 16429.72],
      [0, 0.9015, 0.9047, 0.9027, 0.9015, 41941.04]]
    });
    sinon.assert.calledWith(stub, new Order(OrderType.NO_OP, 'LTC-EUR', 0, 0, 0, 0), 'Negative Gap');
    done();
  });

  it('Should Not detect the pattern if the last payload does not contain at least x+1 candles', (done) => {
    strategy.valueCallBack({ type: 'ticker', price: 107 });
    strategy.valueCallBack({
      type: 'candlesPastTenMinutes',
      payload: [[0, 0.8909, 0.8939, 0.8936, 0.8967, 8146.76],
      [0, 0.892, 0.8951, 0.8951, 0.8932, 9450.78],
      [0, 0.8952, 0.898, 0.8962, 0.8961, 5347.99]]
    });
    sinon.assert.calledWith(stub, new Order(OrderType.NO_OP, 'LTC-EUR', 0, 0, 0, 0), 'Not Enough candles (needed 4)');
    done();
  });

  it('Should Not detect the pattern if the last payload does not contain consecutive candles', (done) => {
    strategy.valueCallBack({ type: 'ticker', price: 107 });
    strategy.valueCallBack({
      type: 'candlesPastTenMinutes',
      payload: [[1647354240, 0.8909, 0.8939, 0.8936, 0.8967, 8146.76],
        [1647354120, 0.892, 0.8951, 0.8951, 0.8932, 9450.78],
        [1647354060, 0.8952, 0.898, 0.8962, 0.8961, 5347.99],
        [1647354000, 0.8952, 0.898, 0.8962, 0.8961, 5347.99]]
    });
    sinon.assert.calledWith(stub, new Order(OrderType.NO_OP, 'LTC-EUR', 0, 0, 0, 0), 'Not consecutive candles');
    done();
  });

  
  it('Should Not detect the pattern if the wick ratio is not compatible ', (done) => {
    strategy.valueCallBack({ type: 'ticker', price: 107 });
    /*strategy.valueCallBack({
      type: 'candlesPastTenMinutes',
      payload: [[0, 0.8909, 0.8939, 0.8976, 0.9167, 8146.76],
      [0, 0.892, 0.8951, 0.8951, 0.8932, 9450.78],
      [0, 0.8952, 0.898, 0.8962, 0.8961, 5347.99],
      [0, 0.8946, 0.8972, 0.8951, 0.8966, 4686.05],
      [0, 0.8938, 0.8975, 0.8949, 0.8964, 11058.46],
      [0, 0.894, 0.8962, 0.8961, 0.8962, 17063.37],
      [0, 0.8951, 0.8987, 0.8983, 0.8951, 41754.58],
      [0, 0.898, 0.9021, 0.9015, 0.8991, 16429.72],
      [0, 0.9015, 0.9047, 0.9027, 0.9015, 41941.04]]
    });
    sinon.assert.calledWith(stub, new Order(OrderType.NO_OP, 'LTC-EUR', 0, 0, 0, 0));*/
    done();
  });

});