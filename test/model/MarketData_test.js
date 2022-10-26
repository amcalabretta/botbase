'use strict';

const mocha = require('mocha');

const { describe } = mocha;
const { it } = mocha;
const assert = require('assert');
const { MarketData } = require('../../model/MarketData');

describe('MarketData Testing', () => {
    describe('HeartBit testing', () => {
        it('should change the trade ID (Simple case)', (done) => {
            const md = new MarketData('BTC-EUR');
            md.heartBit(JSON.parse('{"type":"heartbeat","last_trade_id":9035771,"product_id":"ADA-EUR","sequence":1935971303,"time":"2022-10-25T12:27:38.227412Z"}'));
            assert.strictEqual(md.lastTradeId, 9035771);
            md.heartBit(JSON.parse('{"type":"heartbeat","last_trade_id":9035777,"product_id":"ADA-EUR","sequence":1935971418,"time":"2022-10-25T12:27:44.226559Z"}'));
            assert.strictEqual(md.lastTradeId, 9035777);
            md.heartBit(JSON.parse('{"type":"heartbeat","last_trade_id":9035777,"product_id":"ADA-EUR","sequence":1935971418,"time":"2022-10-25T12:27:44.226559Z"}'));
            assert.strictEqual(md.lastTradeId, 9035777);
            done();
        });

        it('should not change the trade ID (Inverted trade ids on time fff)', (done) => {
            const md = new MarketData('BTC-EUR');
            md.heartBit(JSON.parse('{"type":"heartbeat","last_trade_id":9045792,"product_id":"ADA-EUR","sequence":1936995973,"time":"2022-10-25T20:02:48.226584Z"}'));
            assert.strictEqual(md.lastTradeId, 9045792);
            md.heartBit(JSON.parse('{"type":"heartbeat","last_trade_id":9045789,"product_id":"ADA-EUR","sequence":1936995863,"time":"2022-10-25T20:02:47.226627Z"}'));
            assert.strictEqual(md.lastTradeId, 9045792);
            done();
        });
    });
});
