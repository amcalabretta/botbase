'use strict';

const mocha = require('mocha');

const { describe } = mocha;
const { it } = mocha;
const assert = require('assert');
const moment = require('moment');
const { MarketOrder, OrderStatus } = require('../../model/orders/market_order');

describe('MarketOrder Testing', () => {
  describe('Constructor testing', () => {
    it('should Create an OrderReceived from the ws message (status received)', (done) => {
      const testOrder = new MarketOrder(JSON.parse('{"order_id":"bc040674-76ba-40fd-ba46-692b8df2bf4a","order_type":"limit","size":"0.07","price":"21358.48","client_oid":"31b7a558-5df9-11ed-b859-0aaef69347ef","type":"received","side":"sell","product_id":"BTC-EUR","time":"2022-11-06T17:33:58.081009Z","sequence":20519096470}'));
      assert.strictEqual(testOrder.id, 'bc040674-76ba-40fd-ba46-692b8df2bf4a');
      assert.strictEqual(testOrder.type, 'limit');
      assert.strictEqual(testOrder.size.getValue(), '0.07');
      assert.strictEqual(testOrder.price.getValue(), '21358.48');
      assert.strictEqual(testOrder.side, 'sell');
      assert.strictEqual(testOrder.statuses.length, 1);
      assert.strictEqual(testOrder.statuses[0].status, OrderStatus.received.description);
      assert.strictEqual(testOrder.statuses[0].sequence, 20519096470);
      assert.strictEqual(testOrder.statuses[0].ts.utc().format('YYYY-MM-DDTHH:mm:00.000Z'), '2022-11-06T17:33:00.000+00:00');
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

  describe('It should move to the state open', () => {

  });

  describe('Immutability', () => {
    it('Should not be possible to change values in an Order once created', (done) => {
      const testOrder = new MarketOrder(JSON.parse('{"order_id":"bc040674-76ba-40fd-ba46-692b8df2bf4a","order_type":"limit","size":"0.07","price":"21358.48","client_oid":"31b7a558-5df9-11ed-b859-0aaef69347ef","type":"received","side":"sell","product_id":"BTC-EUR","time":"2022-11-06T17:33:58.081009Z","sequence":20519096470}'));
      assert.throws(() => testOrder.side = 'buy',
        {
          name: 'TypeError', message: "Cannot assign to read only property 'side' of object '#<MarketOrder>'"
        });
      done();
    });
  });
});

