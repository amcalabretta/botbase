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
      payload: [[0, 0.8909, 0.8939, 0.8936, 0.8909, 8146.76,
        0, 0.892, 0.8951, 0.8951, 0.8932, 9450.78,
        0, 0.8952, 0.898, 0.8962, 0.8962, 5347.99,
        0, 0.8946, 0.8972, 0.8951, 0.8966, 4686.05,
        0, 0.8938, 0.8975, 0.8949, 0.8964, 11058.46,
        0, 0.894, 0.8962, 0.8961, 0.8962, 17063.37,
        0, 0.8951, 0.8987, 0.8983, 0.8951, 41754.58,
        0, 0.898, 0.9021, 0.9015, 0.8991, 16429.72,
        0, 0.9015, 0.9047, 0.9027, 0.9015, 41941.04]]
    });
    sinon.assert.calledWith(stub, new Order(OrderType.NO_OP, 'LTC-EUR', 0, 0, 0, 0));
    done();
  });
  it('Should Not detect the pattern if the first candle is bullish and there are less than x bearish candles before', (done) => {
    strategy.valueCallBack({ type: 'ticker', price: 107 });
    strategy.valueCallBack({
      type: 'candlesPastTenMinutes',
      payload: [[0, 0.8909, 0.8939, 0.8936, 0.8909, 8146.76,
        0, 0.892, 0.8951, 0.8951, 0.8932, 9450.78,
        0, 0.8952, 0.898, 0.8962, 0.8962, 5347.99,
        0, 0.8946, 0.8972, 0.8951, 0.8966, 4686.05,
        0, 0.8938, 0.8975, 0.8949, 0.8964, 11058.46,
        0, 0.894, 0.8962, 0.8961, 0.8962, 17063.37,
        0, 0.8951, 0.8987, 0.8983, 0.8951, 41754.58,
        0, 0.898, 0.9021, 0.9015, 0.8991, 16429.72,
        0, 0.9015, 0.9047, 0.9027, 0.9015, 41941.04]]
    });
    sinon.assert.calledWith(stub, new Order(OrderType.NO_OP, 'LTC-EUR', 0, 0, 0, 0));
    done();
  });

  // format of the single candle: [time, low, high, open, close, volume]
});

/** *
 *
 * var expectedValue = [1, 2, 3];
var myStub = sinon.stub;

// let's pretend this is the call you want to verify
myStub(expectedValue);

var firstArgument = myStub.getCall(0).args[0];
assert.equal(firstArgument, expectedValue);
 */

/* describe('White Shark Ticker response', () => {
  it('Should trigger a NO_OP when a ticker is send', (done) => {
    strategy.valueCallBack({ type: 'ticker', price: 107 });
    sinon.assert.calledWith(stub, new Order(OrderType.NO_OP, 0, 0, 0, 0));
    done();
  }).timeout(60000);
}); */

/* describe('White Shark Bullish reponse', () => {
  it('Should detect a bullish pattern', (done) => {
    strategy.valueCallBack({
      type:'candlesPastTenMinutes',
      payload:[]
    });
    sinon.assert.calledWith(stub, new Order(OrderType.NO_OP, 0, 0, 0, 0));
    done();
  }).timeout(60000);
}); */
