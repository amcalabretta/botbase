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
  markets: ['LTC-EUR'], cryptoAmounts: [10], euroAmount: 30, dollarAmount: 0
});
const stub = sinon.stub(strategy, 'orderCallback').returns({});

log4js.configure({
  appenders: { out: { type: 'stdout' } },
  categories: { default: { appenders: ['out'], level: 'info' } },
});
strategy.logger = log4js.getLogger();

/** *
 *
 * var expectedValue = [1, 2, 3];
var myStub = sinon.stub;

// let's pretend this is the call you want to verify
myStub(expectedValue);

var firstArgument = myStub.getCall(0).args[0];
assert.equal(firstArgument, expectedValue);
 */

describe('White Shark Ticker response', () => {
  it('Should trigger a NO_OP when a ticker is send', (done) => {
    strategy.valueCallBack({ type: 'ticker', price: 107 });
    sinon.assert.calledWith(stub, new Order(OrderType.NO_OP, 0, 0, 0, 0));
    done();
  }).timeout(60000);
});

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

