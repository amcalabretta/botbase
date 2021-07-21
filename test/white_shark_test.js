const mocha = require('mocha');
const { describe } = mocha;
const { it } = mocha;
const assert = require('assert');
const { expect } = require('chai');
const sinon = require('sinon');
const { WhiteShark } = require('../strategies/candlesticks/white_shark');
const log4js = require('log4js');
const strategy = new WhiteShark({ markets: ['LTC-EUR'], cryptoAmounts: [10], euroAmount: 30, dollarAmount: 0 });
const stub = sinon.stub(strategy, "orderCallback").returns({});

log4js.configure({
  appenders: { out: { type: 'stdout' } },
  categories: { default: { appenders: ['out'], level: 'info' } },
});
strategy.logger = log4js.getLogger();


/***
 * 
 * var expectedValue = [1, 2, 3];
var myStub = sinon.stub;

// let's pretend this is the call you want to verify
myStub(expectedValue);

var firstArgument = myStub.getCall(0).args[0];
assert.equal(firstArgument, expectedValue);
 */

describe('White Shark Bullish Detection', () => {
  it('Should trigger a bullish order', (done) => {
    strategy.valueCallBack({ type: 'ticker', price: 107 });
    done();
  }).timeout(60000);
});
