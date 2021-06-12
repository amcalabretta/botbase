const mocha = require('mocha');
const { describe } = mocha;
const { it } = mocha;
const assert = require('assert');
const { expect } = require('chai');
const { sleep } = require('sleep');
const sinon = require('sinon');
const { KickerPatternCandleStickStrategy } = require('../strategies/candlesticks/white_shark');
require('../strategies/candlesticks/white_shark');

const strategy = new KickerPatternCandleStickStrategy({ markets: ['LTC-EUR'], channels: ['candles-every-minute-past-10-minutes'] });
const stub = sinon.stub(strategy, "orderCallback").returns(stubValue);

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
    strategy.ticker(134.78);
    // [ time, low, high, open, close, volume ]
    strategy.candles(
       [[
          

       ]] 


    )

    done();
  }).timeout(60000);
});
