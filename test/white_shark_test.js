/* eslint max-len: ["error", { "code": 400 }] */
const mocha = require('mocha');

const { describe } = mocha;
const { it } = mocha;
const assert = require('assert');
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
    { name: 'Error', message: 'subConf Section missing' });
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
  let stub;
  const strategy = new WhiteShark({
    markets: ['LTC-EUR'],
    cryptoAmounts: [10],
    euroAmount: 30,
    dollarAmount: 0,
    subConf: {
      numBearishCandles: 3, gapRatio: 0.2, buyRatio: 0.3, sellRatio: 0.4, wickRatio: 0.05, volumeRatio: 0.9
    }
  });

  beforeEach(() => {
    stub = sinon.stub(strategy, 'orderCallback').returns({});
  });

  afterEach(() => {
    strategy.orderCallback.restore();
  });

  strategy.logger = log4js.getLogger();

  it('Should Not detect the pattern if the first candle is bearish', (done) => {
    strategy.valueCallBack({ type: 'ticker', price: 107 });
    strategy.valueCallBack({
      type: 'candlesPastTenMinutes',
      payload: [{
        base: 'ADA', close: 0.4119, counter: 'EUR', high: 0.4125, low: 0.4119, open: 0.4125, openTimeInISO: '2022-10-29T16:16:00.000Z', openTimeInMillis: 1667060160000, productId: 'ADA-EUR', sizeInMillis: null, volume: 4352.51
      }, {
        base: 'ADA', close: 0.4121, counter: 'EUR', high: 0.4121, low: 0.4121, open: 0.4121, openTimeInISO: '2022-10-29T16:17:00.000Z', openTimeInMillis: 1667060220000, productId: 'ADA-EUR', sizeInMillis: null, volume: 1203.75
      }, {
        base: 'ADA', close: 0.4137, counter: 'EUR', high: 0.4137, low: 0.413, open: 0.413, openTimeInISO: '2022-10-29T16:18:00.000Z', openTimeInMillis: 1667060280000, productId: 'ADA-EUR', sizeInMillis: null, volume: 7693.33
      }, {
        base: 'ADA', close: 0.4143, counter: 'EUR', high: 0.4143, low: 0.4138, open: 0.414, openTimeInISO: '2022-10-29T16:19:00.000Z', openTimeInMillis: 1667060340000, productId: 'ADA-EUR', sizeInMillis: null, volume: 497.9
      }, {
        base: 'ADA', close: 0.4165, counter: 'EUR', high: 0.4165, low: 0.4149, open: 0.4149, openTimeInISO: '2022-10-29T16:20:00.000Z', openTimeInMillis: 1667060400000, productId: 'ADA-EUR', sizeInMillis: null, volume: 15739.18
      }, {
        base: 'ADA', close: 0.4083, counter: 'EUR', high: 0.4184, low: 0.4166, open: 0.4166, openTimeInISO: '2022-10-29T16:21:00.000Z', openTimeInMillis: 1667060460000, productId: 'ADA-EUR', sizeInMillis: null, volume: 4666.32
      }]
    });
    sinon.assert.calledOnce(stub);
    sinon.assert.calledWith(stub, new Order(OrderType.NO_OP, 'LTC-EUR', 0, 0, 0, 0), 'First candle not bullish');
    done();
  });
  it('Should Not detect the pattern if the first candle is bullish and there are less than x bearish candles before', (done) => {
    strategy.valueCallBack({ type: 'ticker', price: 107 });
    strategy.valueCallBack({
      type: 'candlesPastTenMinutes',
      payload: [
        {
          base: 'ADA', close: 0.4119, counter: 'EUR', high: 0.4125, low: 0.4119, open: 0.4125, openTimeInISO: '2022-10-29T16:16:00.000Z', openTimeInMillis: 1667060160000, productId: 'ADA-EUR', sizeInMillis: null, volume: 4352.51
        }, {
          base: 'ADA', close: 0.4121, counter: 'EUR', high: 0.4121, low: 0.4121, open: 0.4121, openTimeInISO: '2022-10-29T16:17:00.000Z', openTimeInMillis: 1667060220000, productId: 'ADA-EUR', sizeInMillis: null, volume: 1203.75
        }, {
          base: 'ADA', close: 0.4137, counter: 'EUR', high: 0.4137, low: 0.413, open: 0.413, openTimeInISO: '2022-10-29T16:18:00.000Z', openTimeInMillis: 1667060280000, productId: 'ADA-EUR', sizeInMillis: null, volume: 7693.33
        }, {
          base: 'ADA', close: 0.4443, counter: 'EUR', high: 0.4143, low: 0.4138, open: 0.414, openTimeInISO: '2022-10-29T16:19:00.000Z', openTimeInMillis: 1667060340000, productId: 'ADA-EUR', sizeInMillis: null, volume: 497.9
        }]
    });
    sinon.assert.calledOnce(stub);
    sinon.assert.calledWith(stub, new Order(OrderType.NO_OP, 'LTC-EUR', 0, 0, 0, 0), 'Last 3 not bearish');
    done();
  });

  it('Should Not detect the pattern if the gap is negative (i.e. if the opening of the last candle is not above the opening of the previous one)', (done) => {
    strategy.valueCallBack({ type: 'ticker', price: 107 });
    strategy.valueCallBack({
      type: 'candlesPastTenMinutes',
      payload: [{
        base: 'ADA', close: 0.4119, counter: 'EUR', high: 0.4125, low: 0.4119, open: 0.4125, openTimeInISO: '2022-10-29T16:16:00.000Z', openTimeInMillis: 1667060160000, productId: 'ADA-EUR', sizeInMillis: null, volume: 4352.51
      }, {
        base: 'ADA', close: 0.4121, counter: 'EUR', high: 0.4121, low: 0.4121, open: 0.4122, openTimeInISO: '2022-10-29T16:17:00.000Z', openTimeInMillis: 1667060220000, productId: 'ADA-EUR', sizeInMillis: null, volume: 1203.75
      }, {
        base: 'ADA', close: 0.4137, counter: 'EUR', high: 0.4137, low: 0.413, open: 0.4138, openTimeInISO: '2022-10-29T16:18:00.000Z', openTimeInMillis: 1667060280000, productId: 'ADA-EUR', sizeInMillis: null, volume: 7693.33
      }, {
        base: 'ADA', close: 0.4443, counter: 'EUR', high: 0.4143, low: 0.4138, open: 0.405, openTimeInISO: '2022-10-29T16:19:00.000Z', openTimeInMillis: 1667060340000, productId: 'ADA-EUR', sizeInMillis: null, volume: 497.9
      }]
    });
    sinon.assert.calledOnce(stub);
    sinon.assert.calledWith(stub, new Order(OrderType.NO_OP, 'LTC-EUR', 0, 0, 0, 0), 'Negative Gap (-0.0088)');
    done();
  });

  it('Should Not detect the pattern if the last payload does not contain at least x+1 candles', (done) => {
    strategy.valueCallBack({ type: 'ticker', price: 107 });
    strategy.valueCallBack({
      type: 'candlesPastTenMinutes',
      payload: [{
        base: 'ADA', close: 0.4115, counter: 'EUR', high: 0.4115, low: 0.4112, open: 0.4112, openTimeInISO: '2022-10-29T16:11:00.000Z', openTimeInMillis: 1667059860000, productId: 'ADA-EUR', sizeInMillis: null, volume: 751.41
      },
      {
        base: 'ADA', close: 0.4121, counter: 'EUR', high: 0.4121, low: 0.4117, open: 0.4117, openTimeInISO: '2022-10-29T16:12:00.000Z', openTimeInMillis: 1667059920000, productId: 'ADA-EUR', sizeInMillis: null, volume: 13669.32
      },
      {
        base: 'ADA', close: 0.4121, counter: 'EUR', high: 0.4121, low: 0.4117, open: 0.4117, openTimeInISO: '2022-10-29T16:12:00.000Z', openTimeInMillis: 1667059920000, productId: 'ADA-EUR', sizeInMillis: null, volume: 13669.32
      }]
    });
    sinon.assert.calledOnce(stub);
    sinon.assert.calledWith(stub, new Order(OrderType.NO_OP, 'LTC-EUR', 0, 0, 0, 0), 'Not Enough candles (needed 4)');
    done();
  });

  it('Should Not detect the pattern if the payload does not contain consecutive candles', (done) => {
    strategy.valueCallBack({ type: 'ticker', price: 107 });
    strategy.valueCallBack({
      type: 'candlesPastTenMinutes',
      payload: [{
        base: 'ADA', close: 0.4115, counter: 'EUR', high: 0.4115, low: 0.4112, open: 0.4112, openTimeInISO: '2022-10-29T16:11:00.000Z', openTimeInMillis: 1667059860000, productId: 'ADA-EUR', sizeInMillis: null, volume: 751.41
      },
      {
        base: 'ADA', close: 0.4121, counter: 'EUR', high: 0.4121, low: 0.4117, open: 0.4117, openTimeInISO: '2022-10-29T16:12:00.000Z', openTimeInMillis: 1667059920000, productId: 'ADA-EUR', sizeInMillis: null, volume: 13669.32
      },
      {
        base: 'ADA', close: 0.4123, counter: 'EUR', high: 0.4123, low: 0.4118, open: 0.4118, openTimeInISO: '2022-10-29T16:13:00.000Z', openTimeInMillis: 1667059980000, productId: 'ADA-EUR', sizeInMillis: null, volume: 3379.31
      },
      {
        base: 'ADA', close: 0.4126, counter: 'EUR', high: 0.4126, low: 0.4125, open: 0.4125, openTimeInISO: '2022-10-29T16:14:00.000Z', openTimeInMillis: 1667060040000, productId: 'ADA-EUR', sizeInMillis: null, volume: 3446.52
      },
      {
        base: 'ADA', close: 0.4119, counter: 'EUR', high: 0.4125, low: 0.4119, open: 0.4125, openTimeInISO: '2022-10-29T16:16:00.000Z', openTimeInMillis: 1667060160000, productId: 'ADA-EUR', sizeInMillis: null, volume: 4352.51
      },
      {
        base: 'ADA', close: 0.4121, counter: 'EUR', high: 0.4121, low: 0.4121, open: 0.4121, openTimeInISO: '2022-10-29T16:17:00.000Z', openTimeInMillis: 1667060220000, productId: 'ADA-EUR', sizeInMillis: null, volume: 1203.75
      },
      {
        base: 'ADA', close: 0.411, counter: 'EUR', high: 0.4137, low: 0.413, open: 0.413, openTimeInISO: '2022-10-29T16:18:00.000Z', openTimeInMillis: 1667060280000, productId: 'ADA-EUR', sizeInMillis: null, volume: 7693.33
      },
      {
        base: 'ADA', close: 0.410, counter: 'EUR', high: 0.4143, low: 0.4138, open: 0.411, openTimeInISO: '2022-10-29T16:19:00.000Z', openTimeInMillis: 1667060340000, productId: 'ADA-EUR', sizeInMillis: null, volume: 497.9
      },
      {
        base: 'ADA', close: 0.409, counter: 'EUR', high: 0.4184, low: 0.4166, open: 0.310, openTimeInISO: '2022-10-29T16:21:00.000Z', openTimeInMillis: 1667060460000, productId: 'ADA-EUR', sizeInMillis: null, volume: 4666.32
      }]
    });
    sinon.assert.calledOnce(stub);
    sinon.assert.calledWith(stub, new Order(OrderType.NO_OP, 'LTC-EUR', 0, 0, 0, 0), 'Not consecutive candles');
    done();
  });
});
