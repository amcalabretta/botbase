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
    assert.throws(() =>
      new WhiteShark({
        markets: ['LTC-EUR'], cryptoAmounts: [10], euroAmount: 30, dollarAmount: 0
      })
      , { name: 'Error', message: 'mainConf Section missing' });
    done();
  });


  it('Should throw an error when subConf is missing one parameter (numBearishCandles)', (done) => {
    assert.throws(() =>
      new WhiteShark({
        markets: ['LTC-EUR'], cryptoAmounts: [10], euroAmount: 30, dollarAmount: 0,
        subConf: {
          gapRatio: 0.2, wickRatio: 0.05, volumeRatio: 0.9
        }
      })
      , {
        name: 'Error', message: 'ValidationError: numBearishCandles is required'
      });
    done();
  });

  it('Should throw an error when numBearishCandles is negative', (done) => {
    assert.throws(() =>
      new WhiteShark({
        markets: ['LTC-EUR'], cryptoAmounts: [10], euroAmount: 30, dollarAmount: 0,
        subConf: {
          gapRatio: 0.2, wickRatio: 0.05, volumeRatio: 0.9, numBearishCandles: -1
        }
      })
      , {
        name: 'Error', message: 'ValidationError: numBearishCandles must be greater than or equal to 1'
      });
    done();
  });


  it('Should throw an error when numBearishCandles is zero', (done) => {
    assert.throws(() =>
      new WhiteShark({
        markets: ['LTC-EUR'], cryptoAmounts: [10], euroAmount: 30, dollarAmount: 0,
        subConf: {
          gapRatio: 0.2, wickRatio: 0.05, volumeRatio: 0.9, numBearishCandles: 0
        }
      })
      , {
        name: 'Error', message: 'ValidationError: numBearishCandles must be greater than or equal to 1'
      });
    done();
  });

  it('Should throw an error when numBearishCandles is not a number', (done) => {
    assert.throws(() =>
      new WhiteShark({
        markets: ['LTC-EUR'], cryptoAmounts: [10], euroAmount: 30, dollarAmount: 0,
        subConf: {
          gapRatio: 0.2, wickRatio: 0.05, volumeRatio: 0.9, numBearishCandles: 'a'
        }
      })
      , {
        name: 'Error', message: 'ValidationError: numBearishCandles must be a number'
      });
    done();
  });

  it('Should throw an error when numBearishCandles is higher than 10', (done) => {
    assert.throws(() =>
      new WhiteShark({
        markets: ['LTC-EUR'], cryptoAmounts: [10], euroAmount: 30, dollarAmount: 0,
        subConf: {
          gapRatio: 0.2, wickRatio: 0.05, volumeRatio: 0.9, numBearishCandles: 11
        }
      })
      , {
        name: 'Error', message: 'ValidationError: numBearishCandles must be less than or equal to 10'
      });
    done();
  });


  it('Should throw an error when markets and cryptoamounts are not exactly 1 (1)', (done) => {
    assert.throws(() =>
      new WhiteShark({
        markets: ['LTC-EUR', 'BTC-EUR'], cryptoAmounts: [10, 34], euroAmount: 30, dollarAmount: 0,
        subConf: {
          gapRatio: 0.2, wickRatio: 0.05, volumeRatio: 0.9, numBearishCandles: 10
        }
      })
      , {
        name: 'Error', message: 'ValidationError: cryptoAmounts must contain 1 items'
      });
    done();
  });

  it('Should throw an error when markets and cryptoamounts are not exactly 1 (2)', (done) => {
    assert.throws(() =>
      new WhiteShark({
        markets: ['LTC-EUR', 'BTC-EUR'], cryptoAmounts: [10], euroAmount: 30, dollarAmount: 0,
        subConf: {
          gapRatio: 0.2, wickRatio: 0.05, volumeRatio: 0.9, numBearishCandles: 10
        }
      })
      , {
        name: 'Error', message: 'ValidationError: markets must contain 1 items'
      });
    done();
  });


  it('Should throw an error when subConf is missing one parameter (gapRatio)', (done) => {
    assert.throws(() =>
      new WhiteShark({
        markets: ['LTC-EUR'], cryptoAmounts: [10], euroAmount: 30, dollarAmount: 0,
        subConf: {
          numBearishCandles: 3, wickRatio: 0.05, volumeRatio: 0.9
        }
      })
      , { name: 'Error', message: 'ValidationError: gapRatio is required' });
    done();
  });



  it('Should throw an error when subConf is missing one parameter (wickRatio)', (done) => {
    assert.throws(() =>
      new WhiteShark({
        markets: ['LTC-EUR'], cryptoAmounts: [10], euroAmount: 30, dollarAmount: 0,
        subConf: {
          numBearishCandles: 3, gapRatio: 0.2, volumeRatio: 0.9
        }
      })
      , { name: 'Error', message: 'ValidationError: wickRatio is required' });
    done();
  });



  it('Should throw an error when subConf is missing one parameter (volumeRatio)', (done) => {
    assert.throws(() =>
      new WhiteShark({
        markets: ['LTC-EUR'], cryptoAmounts: [10], euroAmount: 30, dollarAmount: 0,
        subConf: {
          numBearishCandles: 3, gapRatio: 0.2, wickRatio: 0.05
        }
      })
      , { name: 'Error', message: 'ValidationError: volumeRatio is required' });
    done();
  });

});

describe('White Shark Pattern Spotting', () => {

  const strategy = new WhiteShark({
    markets: ['LTC-EUR'], cryptoAmounts: [10], euroAmount: 30, dollarAmount: 0,
    subConf: { numBearishCandles: 3, gapRatio: 0.2, wickRatio: 0.05, volumeRatio: 0.9 }
  });
  const stub = sinon.stub(strategy, 'orderCallback').returns({});
  strategy.logger = log4js.getLogger();


  it('Should detect the pattern (1)', (done) => {
    strategy.valueCallBack({ type: 'ticker', price: 107 });
    strategy.valueCallBack({
      type: 'candlesPastTenMinutes',
      payload: [[1645541220, 0.7772, 0.7785, 0.7773, 0.7772, 6974.74],
      [1645541160, 0.7769, 0.7781, 0.7771, 0.7781, 18225.25],
      [1645541100, 0.7766, 0.778, 0.778, 0.777, 12637.79],
      [1645541040, 0.7741, 0.7777, 0.7748, 0.7777, 21507.44],
      [1645540980, 0.7752, 0.7769, 0.7755, 0.7756, 9481.71],
      [1645540920, 0.7736, 0.7761, 0.7736, 0.7751, 13766.6],
      [1645540860, 0.7718, 0.7741, 0.7727, 0.7733, 2848.81],
      [1645540800, 0.7695, 0.7727, 0.7704, 0.7727, 40000.46],
      [1645540740, 0.7693, 0.7742, 0.7742, 0.7703, 16443.14],
      [1645540680, 0.7728, 0.7743, 0.7743, 0.7734, 12427.33]]
    });
    sinon.assert.calledWith(stub, new Order(OrderType.BUY_SELL, 'LTC-EUR', 107, 10, 0, 0));
    done();
  });


  //format of the single candle: [time, low, high, open, close, volume]


  

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

/*describe('White Shark Ticker response', () => {
  it('Should trigger a NO_OP when a ticker is send', (done) => {
    strategy.valueCallBack({ type: 'ticker', price: 107 });
    sinon.assert.calledWith(stub, new Order(OrderType.NO_OP, 0, 0, 0, 0));
    done();
  }).timeout(60000);
});*/

/*describe('White Shark Bullish reponse', () => {
  it('Should detect a bullish pattern', (done) => {
    strategy.valueCallBack({
      type:'candlesPastTenMinutes',
      payload:[]
    });
    sinon.assert.calledWith(stub, new Order(OrderType.NO_OP, 0, 0, 0, 0));
    done();
  }).timeout(60000);
});*/

