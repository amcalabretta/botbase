const mocha = require('mocha');

const { describe } = mocha;
const { it } = mocha;
const assert = require('assert');
const { serializeMarket } = require('../../utils/serializeMarket');

describe('serializeMarket', () => {
  it('Should trow an Error when the market is clearly wrong', (done) => {
    assert.throws(() => { serializeMarket('FTEd.hkjse'); }, 'Error');
    assert.throws(() => { serializeMarket('BTC'); }, 'Error');
    assert.throws(() => { serializeMarket('BTC.HTY'); }, 'Error');
    assert.throws(() => { serializeMarket('BTC-YEN'); }, 'Error');
    done();
  });
  it('Should work with real markets', (done) => {
    assert.strictEqual(serializeMarket('BTC-EUR'), 'btc.eur');
    assert.strictEqual(serializeMarket('ETH-USD'), 'eth.usd');
    done();
  });
});