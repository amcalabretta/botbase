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

describe("KickerPatternCandleStickStrategy", () => {
  
  it("Should create the first candle", (done) => {
    values.forEach(v=>{
      console.log(`feeding:${v}`);
      strategy.ticker(v);
      sleep(1);
    })
    sleep(10);
    strategy.ticker(189.78);    
    expect(strategy.candles.length).to.equal(1);
    console.log(`${JSON.stringify(strategy.candles[0])}`);
    expect(strategy.candles[0].open).to.equal(172.15);
    expect(strategy.candles[0].high).to.equal(180.43);
    expect(strategy.candles[0].low).to.equal(167.23);
    expect(strategy.candles[0].close).to.equal(172.15);
    done();
  }).timeout(60000);

});