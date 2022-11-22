'use strict';

const mocha = require('mocha');

const { describe } = mocha;
const { it } = mocha;
const assert = require('assert');
const { MarketData } = require('../../model/MarketData');
const log4js = require('log4js');
const fs = require('fs');
const { MarketOrderType, MarketOrderStatus, MarketOrderSide,MarketOrderOutcome } = require('../../model/orders/market_order');


log4js.configure({
  appenders: { out: { type: 'stdout' } },
  // put 'level' (info/debug) instead of 'off' to see the logs as 'level'
  categories: { default: { appenders: ['out'], level: 'info' } },
});

const loadMessage = (fileName) => {
  return JSON.parse(fs.readFileSync(`test/data/ws_messages/${fileName}`, 'utf8'));
}

describe('MarketData Testing', () => {
  describe('HeartBit testing', () => {
    it('should change the trade ID (Simple case)', (done) => {
      const md = new MarketData('BTC-EUR', log4js.getLogger());
      md.heartBit(JSON.parse('{"type":"heartbeat","last_trade_id":9035771,"product_id":"ADA-EUR","sequence":1935971303,"time":"2022-10-25T12:27:38.227412Z"}'));
      assert.strictEqual(md.lastTradeId, 9035771);
      md.heartBit(JSON.parse('{"type":"heartbeat","last_trade_id":9035777,"product_id":"ADA-EUR","sequence":1935971418,"time":"2022-10-25T12:27:44.226559Z"}'));
      assert.strictEqual(md.lastTradeId, 9035777);
      md.heartBit(JSON.parse('{"type":"heartbeat","last_trade_id":9035777,"product_id":"ADA-EUR","sequence":1935971418,"time":"2022-10-25T12:27:44.226559Z"}'));
      assert.strictEqual(md.lastTradeId, 9035777);
      done();
    });

    it('should not change the trade ID (Inverted trade ids on time fff)', (done) => {
      const md = new MarketData('BTC-EUR', log4js.getLogger());
      md.heartBit(JSON.parse('{"type":"heartbeat","last_trade_id":9045792,"product_id":"ADA-EUR","sequence":1936995973,"time":"2022-10-25T20:02:48.226584Z"}'));
      assert.strictEqual(md.lastTradeId, 9045792);
      md.heartBit(JSON.parse('{"type":"heartbeat","last_trade_id":9045789,"product_id":"ADA-EUR","sequence":1936995863,"time":"2022-10-25T20:02:47.226627Z"}'));
      assert.strictEqual(md.lastTradeId, 9045792);
      done();
    });
  });


  describe('Ordercycle testing', () => {
    it('Should ingest an order as received-open-done (reason:filled)', (done) => {
      const md = new MarketData('BTC-EUR', log4js.getLogger());
      const receivedOrderMessage = loadMessage('004_coinbase_buy_order_received_limit_btc_eur.json');
      const openOrderMessage = loadMessage('005_coinbase_buy_order_open_limit_btc_eur.json');
      const filledOrderMessage = loadMessage('006_coinbase_buy_order_filled_limit_btc_eur.json');
      const orderId = receivedOrderMessage.order_id;
      md.orderReceived(receivedOrderMessage);
      md.orderUpdated(openOrderMessage);
      md.orderUpdated(filledOrderMessage);
      assert.strictEqual(md.orders.length(),1);
      assert.strictEqual(md.orders.get(orderId).statuses[2].status,'done');
      done();
    });
    it('Should throw an error in case of either of the matched orders are not previously ingested', (done) => {
      const md = new MarketData('BTC-EUR', log4js.getLogger());
      const receivedFirstOrderMessage = loadMessage('004_coinbase_buy_order_received_limit_btc_eur.json');
      const openFirstOrderMessage = loadMessage('005_coinbase_buy_order_open_limit_btc_eur.json');
      const receivedSecondOrderMessage = loadMessage('001_coinbase_buy_order_received_limit_btc_eur.json');
      const openSecondOrderMessage = loadMessage('002_coinbase_buy_order_open_limit_btc_eur.json');
      const matchMessage = loadMessage('007_coinbase_order_match_btc_eur.json');
      md.orderReceived(receivedFirstOrderMessage);
      md.orderUpdated(openFirstOrderMessage);
      md.orderReceived(receivedSecondOrderMessage);
      md.orderUpdated(openSecondOrderMessage);
      assert.throws(() => {
        md.match(matchMessage);
      },
        {
          name: 'Error', message: "Cannot match as at least one of the orders are not ingested"
        });
      done();
    });

    it('Should ingest an order as received-open-done (reason:canceled)', (done) => {
      const md = new MarketData('BTC-EUR', log4js.getLogger());
      const receivedOrderMessage = loadMessage('001_coinbase_buy_order_received_limit_btc_eur.json');
      const openOrderMessage = loadMessage('002_coinbase_buy_order_open_limit_btc_eur.json');
      const canceledOrderMessage = loadMessage('003_coinbase_buy_order_canceled_limit_btc_eur.json');
      const orderId = receivedOrderMessage.order_id;
      md.orderReceived(receivedOrderMessage);
      md.orderUpdated(openOrderMessage);
      md.orderUpdated(canceledOrderMessage);
      assert.strictEqual(md.orders.length(),1);
      assert.strictEqual(md.orders.get(orderId).statuses.length,3);
      assert.strictEqual(md.orders.get(orderId).statuses[2].status,'done');
      assert.strictEqual(md.orders.get(orderId).statuses[2].reason,MarketOrderOutcome.canceled);
      done();
    });
  });

  describe('Ticker testing', () => {
    it('should add one ticker', (done) => {
      const md = new MarketData('BTC-EUR', log4js.getLogger());
      md.ticker(JSON.parse('{"type":"ticker","sequence":20401309348,"product_id":"BTC-EUR","price":"20608.9","open_24h":"20339.07","volume_24h":"646.52524689","low_24h":"20059.17","high_24h":"20965.95","volume_30d":"10899.20555282","best_bid":"20602.07","best_bid_size":"0.00604328","best_ask":"20611.92","best_ask_size":"0.00969975","side":"buy","time":"2022-10-26T19:40:02.207724Z","trade_id":68077668,"last_size":"0.05"}'));
      assert.strictEqual(md.getTickers().length, 1);
      done();
    });

    it('should add two ticker', (done) => {
      const md = new MarketData('BTC-EUR', log4js.getLogger());
      md.ticker(JSON.parse('{"type":"ticker","sequence":20401309348,"product_id":"BTC-EUR","price":"20608.9","open_24h":"20339.07","volume_24h":"646.52524689","low_24h":"20059.17","high_24h":"20965.95","volume_30d":"10899.20555282","best_bid":"20602.07","best_bid_size":"0.00604328","best_ask":"20611.92","best_ask_size":"0.00969975","side":"buy","time":"2022-10-26T19:40:02.207724Z","trade_id":68077668,"last_size":"0.05"}'));
      md.ticker(JSON.parse('{"type":"ticker","sequence":20401469539,"product_id":"BTC-EUR","price":"20598.3","open_24h":"20260.78","volume_24h":"595.11194792","low_24h":"20059.17","high_24h":"20965.95","volume_30d":"10902.83926537","best_bid":"20593.67","best_bid_size":"0.05000000","best_ask":"20598.30","best_ask_size":"0.02587826","side":"buy","time":"2022-10-26T20:01:45.896217Z","trade_id":68077788,"last_size":"0.00012174"}'));
      assert.strictEqual(md.getTickers().length, 2);
      done();
    });

    it('Tickers should be ordered when added in order', (done) => {
      const md = new MarketData('BTC-EUR', log4js.getLogger());
      md.ticker(JSON.parse('{"type":"ticker","sequence":20401309348,"product_id":"BTC-EUR","price":"20608.9","open_24h":"20339.07","volume_24h":"646.52524689","low_24h":"20059.17","high_24h":"20965.95","volume_30d":"10899.20555282","best_bid":"20602.07","best_bid_size":"0.00604328","best_ask":"20611.92","best_ask_size":"0.00969975","side":"buy","time":"2022-10-26T19:40:02.207724Z","trade_id":68077668,"last_size":"0.05"}'));
      md.ticker(JSON.parse('{"type":"ticker","sequence":20401469539,"product_id":"BTC-EUR","price":"20598.3","open_24h":"20260.78","volume_24h":"595.11194792","low_24h":"20059.17","high_24h":"20965.95","volume_30d":"10902.83926537","best_bid":"20593.67","best_bid_size":"0.05000000","best_ask":"20598.30","best_ask_size":"0.02587826","side":"buy","time":"2022-10-26T20:01:45.896217Z","trade_id":68077788,"last_size":"0.00012174"}'));
      assert.strictEqual(md.getTickers().length, 2);
      assert.strictEqual(md.getTickers().get(0).time, '2022-10-26T19:40:02.207724Z');
      assert.strictEqual(md.getTickers().get(1).time, '2022-10-26T20:01:45.896217Z');
      done();
    });
  });

  describe('Order received testing', () => {
    it('Should ingest a limit order (received)', (done) => {
      const receivedOrderMessage = loadMessage('coinbase_order_received_limit.json');
      const md = new MarketData('BTC-EUR', log4js.getLogger());
      md.orderReceived(loadMessage('coinbase_order_received_limit.json'));
      assert.strictEqual(md.orders.length(), 1);
      assert.strictEqual(md.orders.get(receivedOrderMessage.order_id).type, MarketOrderType.limit);
      done();
    });

    it('Should ingest a market order (received)', (done) => {
      const receivedOrderMessage = loadMessage('coinbase_order_received_market.json');
      const md = new MarketData('BTC-EUR', log4js.getLogger());
      md.orderReceived(loadMessage('coinbase_order_received_market.json'));
      assert.strictEqual(md.orders.length(), 1);
      assert.strictEqual(md.orders.get(receivedOrderMessage.order_id).type, MarketOrderType.market);
      done();
    });

    it('Should not ingest a received order referring to another market', (done) => {
      assert.throws(() => {
        const md = new MarketData('BTC-EUR', log4js.getLogger());
        md.orderReceived(loadMessage('coinbase_order_received_limit_ada_ur.json'))
      },
        {
          name: 'Error', message: "Attempt to receive an order referring to market ADA-EUR on a MD instance referring to BTC-EUR"
        });
      done();
    });

    it('Should not ingest a received order that is not received', (done) => {
      assert.throws(() => {
        const md = new MarketData('BTC-EUR', log4js.getLogger());
        md.orderReceived(loadMessage('coinbase_order_open.json'))
      },
        {
          name: 'Error', message: "Attempting creating an order from a non received one open"
        });
      done();
    });

    it('Should not ingest a received order that has been already ingested (by order id)', (done) => {
      assert.throws(() => {
        const md = new MarketData('BTC-EUR', log4js.getLogger());
        md.orderReceived(loadMessage('coinbase_order_received_limit.json'));
        md.orderReceived(loadMessage('coinbase_order_received_limit.json'));
      },
      {
        name: 'Error', message: "Received Order with ID f8915c1c-fa25-45ca-842b-cebc310de22e already ingested"
      });
      done();
    });

    it('Should not ingest a received order that has been already ingested (by sequence)', (done) => {
      assert.throws(() => {
        const md = new MarketData('BTC-EUR', log4js.getLogger());
        md.orderReceived(loadMessage('coinbase_order_received_limit.json'));
        md.orderReceived(loadMessage('coinbase_order_received_limit_different_id.json'));
      },
      {
        name: 'Error', message: "Received Order with sequence 20589255134 already ingested"
      });
      done();
    });
  });
});
