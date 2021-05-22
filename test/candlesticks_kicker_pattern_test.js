let mocha = require('mocha');
let describe = mocha.describe;
let it = mocha.it;
const assert = require('assert');
const expect = require('chai').expect;
const { sleep } = require('sleep');
const { KickerPatternCandleStickStrategy } = require('../strategies/candlesticks_kicker_pattern');
require('../strategies/candlesticks_kicker_pattern');
const strategy = new KickerPatternCandleStickStrategy({tickInSeconds:10});
const values = [172.15,178.45,180.43,167.23,178.45];

describe("Strategy", () => {
  
  it("Should create the first candle", (done) => {
    values.forEach(v=>{
      console.log(`feeding:${v}`);
      strategy.ticker(v);
      sleep(1);
    })
    expect(strategy.candles.length).to.equal(1);
  }).timeout(10000);

});