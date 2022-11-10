'use strict';

const mocha = require('mocha');

const { describe } = mocha;
const { it } = mocha;
const assert = require('assert');
const moment = require('moment');
const { MarketOrder, OrderStatus } = require('../../model/orders/market_order');

const receivedOrder = new MarketOrder(JSON.parse('{"order_id":"bc040674-76ba-40fd-ba46-692b8df2bf4a","order_type":"limit","size":"0.07","price":"21358.48","client_oid":"31b7a558-5df9-11ed-b859-0aaef69347ef","type":"received","side":"sell","product_id":"BTC-EUR","time":"2022-11-06T17:33:58.081009Z","sequence":20519096470}'));
const openingMessage = {"price":"21358.48","order_id":"bc040674-76ba-40fd-ba46-692b8df2bf4a","remaining_size":"8557.04","type":"open","side":"buy","product_id":"ADA-EUR","time":"2022-11-10T09:37:27.786434Z","sequence":1967808639};

describe('MarketOrder Testing', () => {
  describe('Constructor testing', () => {
    it('should Create an OrderReceived from the ws message (status received)', (done) => {
      assert.strictEqual(receivedOrder.id, 'bc040674-76ba-40fd-ba46-692b8df2bf4a');
      assert.strictEqual(receivedOrder.type, 'limit');
      assert.strictEqual(receivedOrder.size.getValue(), '0.07');
      assert.strictEqual(receivedOrder.price.getValue(), '21358.48');
      assert.strictEqual(receivedOrder.side, 'sell');
      assert.strictEqual(receivedOrder.statuses.length, 1);
      assert.strictEqual(receivedOrder.statuses[0].status, OrderStatus.received.description);
      assert.strictEqual(receivedOrder.statuses[0].sequence, 20519096470);
      assert.strictEqual(receivedOrder.statuses[0].ts.utc().format('YYYY-MM-DDTHH:mm:00.000Z'), '2022-11-06T17:33:00.000+00:00');
      done();
    });

    it('should throw an error when being created from a non-received message', (done) => {
      assert.throws(() => new MarketOrder(JSON.parse('{"order_id":"bc040674-76ba-40fd-ba46-692b8df2bf4a","order_type":"limit","size":"0.07","price":"21358.48","client_oid":"31b7a558-5df9-11ed-b859-0aaef69347ef","type":"whatever","side":"sell","product_id":"BTC-EUR","time":"2022-11-06T17:33:58.081009Z","sequence":20519096470}')),
        {
          name: 'Error', message: "Attempting creating an order from a non received one"
        });
      done();
    });

  });

  describe('Normal Operation', () => {
    it('should Move to open after received', (done) => {
      const newMarketOrder = MarketOrder.open(receivedOrder,openingMessage);
      assert.strictEqual(newMarketOrder.id, 'bc040674-76ba-40fd-ba46-692b8df2bf4a');
      assert.strictEqual(newMarketOrder.type, 'limit');
      assert.strictEqual(newMarketOrder.size.getValue(), '0.07');
      assert.strictEqual(newMarketOrder.price.getValue(), '21358.48');
      assert.strictEqual(newMarketOrder.side, 'sell');
      assert.strictEqual(newMarketOrder.statuses.length, 2);
      assert.strictEqual(newMarketOrder.statuses[0].status, OrderStatus.received.description);
      assert.strictEqual(newMarketOrder.statuses[0].sequence, 20519096470);
      assert.strictEqual(newMarketOrder.statuses[0].ts.utc().format('YYYY-MM-DDTHH:mm:00.000Z'), '2022-11-06T17:33:00.000+00:00');
      assert.strictEqual(newMarketOrder.statuses[1].status, OrderStatus.open.description);
      assert.strictEqual(newMarketOrder.statuses[1].sequence, 1967808639);
      assert.strictEqual(newMarketOrder.statuses[1].ts.utc().format('YYYY-MM-DDTHH:mm:00.000Z'), '2022-11-10T09:37:00.000+00:00');
      done();
    });
    
  });

  describe('Immutability', () => {
    it('Should not be possible to change values in an Order once created', (done) => {
      assert.throws(() => receivedOrder.side = 'buy',
        {
          name: 'TypeError', message: "Cannot assign to read only property 'side' of object '#<MarketOrder>'"
        });
      done();
    });
  });
});

