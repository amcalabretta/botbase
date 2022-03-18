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
  categories: { default: { appenders: ['out'], level: 'info' } },
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
      payload: [[1647417000, 0.8909, 0.8939, 0.8967, 0.8935, 8146.76],
      [1647416940, 0.892, 0.8951, 0.8951, 0.8932, 9450.78],
      [1647416880, 0.8952, 0.898, 0.8962, 0.8961, 5347.99],
      [1647416820, 0.8946, 0.8972, 0.8951, 0.8966, 4686.05]]

    });
    sinon.assert.calledWith(stub, new Order(OrderType.NO_OP, 'LTC-EUR', 0, 0, 0, 0), 'First candle not bullish');
    done();
  });
  it('Should Not detect the pattern if the first candle is bullish and there are less than x bearish candles before (1)', (done) => {
    strategy.valueCallBack({ type: 'ticker', price: 107 });
    strategy.valueCallBack({
      type: 'candlesPastTenMinutes',
      payload: [[1647417000, 0.8909, 0.8939, 0.8936, 0.8967, 8146.76],
        [1647416940, 0.892, 0.8951, 0.8951, 0.8932, 9450.78],
        [1647416880, 0.8952, 0.898, 0.8962, 0.8962, 5347.99],
        [1647416820, 0.8946, 0.8972, 0.8951, 0.8966, 4686.05]]
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

  it('Should Not detect the pattern if the gap is negative (i.e. if the opening of the last candle is not above the opening of the previous one)', (done) => {
    strategy.valueCallBack({ type: 'ticker', price: 107 });
    strategy.valueCallBack({
      type: 'candlesPastTenMinutes',
      payload: [[1647417000, 0.8909, 0.8939, 0.8936, 0.8967, 8146.76],
        [1647416940, 0.892, 0.8951, 0.8951, 0.8932, 9450.78],
        [1647416880, 0.8952, 0.898, 0.8962, 0.8961, 5347.99],
        [1647416820, 0.8946, 0.8972, 0.8951, 0.8966, 4686.05]]
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

  
  it('Should Not detect the pattern if the wick ratio is not compatible  5675', (done) => {
    strategy.valueCallBack({ type: 'ticker', price: 107 });
    strategy.valueCallBack({
      type: 'candlesPastTenMinutes',
      
      payload: [[1647354240, 0.8909, 0.8939, 0.8936, 0.8967, 8146.76],
      [1647354180, 0.892, 0.8951, 0.8951, 0.8932, 9450.78],
      [1647354120, 0.8952, 0.898, 0.8962, 0.8961, 5347.99],
      [1647354060, 0.8952, 0.898, 0.8962, 0.8961, 5347.99]]
    });
    sinon.assert.calledWith(stub, new Order(OrderType.NO_OP, 'LTC-EUR', 0, 0, 0, 0), 'dsds');
    done();
  });

});