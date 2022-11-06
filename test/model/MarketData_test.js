'use strict';

const mocha = require('mocha');

const { describe } = mocha;
const { it } = mocha;
const assert = require('assert');
const { MarketData } = require('../../model/MarketData');
const log4js = require('log4js');

log4js.configure({
  appenders: { out: { type: 'stdout' } },
  // put 'level' (info/debug) instead of 'off' to see the logs as 'level'
  categories: { default: { appenders: ['out'], level: 'off' } },
});

describe('MarketData Testing', () => {
  describe('HeartBit testing', () => {
    it('should change the trade ID (Simple case)', (done) => {
      const md = new MarketData('BTC-EUR',log4js.getLogger());
      md.heartBit(JSON.parse('{"type":"heartbeat","last_trade_id":9035771,"product_id":"ADA-EUR","sequence":1935971303,"time":"2022-10-25T12:27:38.227412Z"}'));
      assert.strictEqual(md.lastTradeId, 9035771);
      md.heartBit(JSON.parse('{"type":"heartbeat","last_trade_id":9035777,"product_id":"ADA-EUR","sequence":1935971418,"time":"2022-10-25T12:27:44.226559Z"}'));
      assert.strictEqual(md.lastTradeId, 9035777);
      md.heartBit(JSON.parse('{"type":"heartbeat","last_trade_id":9035777,"product_id":"ADA-EUR","sequence":1935971418,"time":"2022-10-25T12:27:44.226559Z"}'));
      assert.strictEqual(md.lastTradeId, 9035777);
      done();
    });

    it('should not change the trade ID (Inverted trade ids on time fff)', (done) => {
      const md = new MarketData('BTC-EUR',log4js.getLogger());
      md.heartBit(JSON.parse('{"type":"heartbeat","last_trade_id":9045792,"product_id":"ADA-EUR","sequence":1936995973,"time":"2022-10-25T20:02:48.226584Z"}'));
      assert.strictEqual(md.lastTradeId, 9045792);
      md.heartBit(JSON.parse('{"type":"heartbeat","last_trade_id":9045789,"product_id":"ADA-EUR","sequence":1936995863,"time":"2022-10-25T20:02:47.226627Z"}'));
      assert.strictEqual(md.lastTradeId, 9045792);
      done();
    });
  });

  describe('Ticker testing', () => {
    it('should add one ticker', (done) => {
      const md = new MarketData('BTC-EUR',log4js.getLogger());
      md.ticker(JSON.parse('{"type":"ticker","sequence":20401309348,"product_id":"BTC-EUR","price":"20608.9","open_24h":"20339.07","volume_24h":"646.52524689","low_24h":"20059.17","high_24h":"20965.95","volume_30d":"10899.20555282","best_bid":"20602.07","best_bid_size":"0.00604328","best_ask":"20611.92","best_ask_size":"0.00969975","side":"buy","time":"2022-10-26T19:40:02.207724Z","trade_id":68077668,"last_size":"0.05"}'));
      assert.strictEqual(md.getTickers().length, 1);
      done();
    });

    it('should add two ticker', (done) => {
      const md = new MarketData('BTC-EUR',log4js.getLogger());
      md.ticker(JSON.parse('{"type":"ticker","sequence":20401309348,"product_id":"BTC-EUR","price":"20608.9","open_24h":"20339.07","volume_24h":"646.52524689","low_24h":"20059.17","high_24h":"20965.95","volume_30d":"10899.20555282","best_bid":"20602.07","best_bid_size":"0.00604328","best_ask":"20611.92","best_ask_size":"0.00969975","side":"buy","time":"2022-10-26T19:40:02.207724Z","trade_id":68077668,"last_size":"0.05"}'));
      md.ticker(JSON.parse('{"type":"ticker","sequence":20401469539,"product_id":"BTC-EUR","price":"20598.3","open_24h":"20260.78","volume_24h":"595.11194792","low_24h":"20059.17","high_24h":"20965.95","volume_30d":"10902.83926537","best_bid":"20593.67","best_bid_size":"0.05000000","best_ask":"20598.30","best_ask_size":"0.02587826","side":"buy","time":"2022-10-26T20:01:45.896217Z","trade_id":68077788,"last_size":"0.00012174"}'));
      assert.strictEqual(md.getTickers().length, 2);
      done();
    });

    it('Tickers should be ordered when added in order', (done) => {
      const md = new MarketData('BTC-EUR',log4js.getLogger());
      md.ticker(JSON.parse('{"type":"ticker","sequence":20401309348,"product_id":"BTC-EUR","price":"20608.9","open_24h":"20339.07","volume_24h":"646.52524689","low_24h":"20059.17","high_24h":"20965.95","volume_30d":"10899.20555282","best_bid":"20602.07","best_bid_size":"0.00604328","best_ask":"20611.92","best_ask_size":"0.00969975","side":"buy","time":"2022-10-26T19:40:02.207724Z","trade_id":68077668,"last_size":"0.05"}'));
      md.ticker(JSON.parse('{"type":"ticker","sequence":20401469539,"product_id":"BTC-EUR","price":"20598.3","open_24h":"20260.78","volume_24h":"595.11194792","low_24h":"20059.17","high_24h":"20965.95","volume_30d":"10902.83926537","best_bid":"20593.67","best_bid_size":"0.05000000","best_ask":"20598.30","best_ask_size":"0.02587826","side":"buy","time":"2022-10-26T20:01:45.896217Z","trade_id":68077788,"last_size":"0.00012174"}'));
      assert.strictEqual(md.getTickers().length, 2);
      assert.strictEqual(md.getTickers().get(0).time, '2022-10-26T19:40:02.207724Z');
      assert.strictEqual(md.getTickers().get(1).time, '2022-10-26T20:01:45.896217Z');
      done();
    });
  });
});
