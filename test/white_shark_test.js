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


const strategy = new WhiteShark({
  markets: ['LTC-EUR'], cryptoAmounts: [10], euroAmount: 30, dollarAmount: 0,
  subConf:{numBearishCandles: 3, gapRatio: 0.2, wickRatio: 0.05, volumeRatio: 0.9}
});
const stub = sinon.stub(strategy, 'orderCallback').returns({});

log4js.configure({
  appenders: { out: { type: 'stdout' } },
  categories: { default: { appenders: ['out'], level: 'info' } },
});
strategy.logger = log4js.getLogger();


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
    }})
    , {
      name: 'Error', message: 'ValidationError: numBearishCandles is required' });
  done();
});

it('Should throw an error when numBearishCandles is negative', (done) => {
  assert.throws(() =>
    new WhiteShark({
      markets: ['LTC-EUR'], cryptoAmounts: [10], euroAmount: 30, dollarAmount: 0,
      subConf: {
        gapRatio: 0.2, wickRatio: 0.05, volumeRatio: 0.9, numBearishCandles:-1
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
      markets: ['LTC-EUR','BTC-EUR'], cryptoAmounts: [10,34], euroAmount: 30, dollarAmount: 0,
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
        numBearishCandles: 3,  wickRatio: 0.05, volumeRatio: 0.9
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
    , { name: 'Error', message: 'ValidationError: volumeRatio is required'  });
  done();
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

