'use strict';

const mocha = require('mocha');

const { describe } = mocha;
const { it } = mocha;
const assert = require('assert');
const fs = require('fs');
const { MarketOrder, MarketOrderStatus, MarketOrderType, MarketOrderSide } = require('../../model/orders/market_order');

const loadOrder = (fileName) => {
  return new MarketOrder(loadMessage(fileName));
}

const loadMessage = (fileName) => {
  return JSON.parse(fs.readFileSync(`test/data/ws_messages/${fileName}`, 'utf8'));
}




describe('MarketOrder Testing', () => {
  describe('Constructor testing', () => {
    it('should Create an OrderReceived from the ws message (status:received, type:limit order)', (done) => {
      const limitOrder = loadOrder('coinbase_order_received_limit.json');
      assert.strictEqual(limitOrder.id, 'f8915c1c-fa25-45ca-842b-cebc310de22e');
      assert.strictEqual(limitOrder.type, MarketOrderType.limit);
      assert.strictEqual(limitOrder.client_id, '20221111-0000-0712-0061-180030782520');
      assert.strictEqual(limitOrder.side, MarketOrderSide.buy);
      assert.strictEqual(limitOrder.size.getValue(), '0.06263005');
      assert.strictEqual(limitOrder.price.getValue(), '16269.88');
      assert.strictEqual(limitOrder.funds, undefined);
      assert.strictEqual(limitOrder.statuses.length, 1);
      assert.strictEqual(limitOrder.statuses[0].status, MarketOrderStatus.received);
      assert.strictEqual(limitOrder.statuses[0].ts.utc().format('YYYY-MM-DDTHH:mm:00.000Z'), '2022-11-11T22:35:00.000+00:00');
      assert.strictEqual(limitOrder.statuses[0].sequence, 20589255134);
      done();
    });

    it('should Create an OrderReceived from the ws message (status:received, type:market order)', (done) => {
      const marketOrder = loadOrder('coinbase_order_received_market.json');
      assert.strictEqual(marketOrder.id, 'bad13052-0485-48c2-b388-eeeb044e1953');
      assert.strictEqual(marketOrder.type, MarketOrderType.market);
      assert.strictEqual(marketOrder.client_id, '2bea29c6-4f16-4721-acc9-f90bac7a6194');
      assert.strictEqual(marketOrder.side, MarketOrderSide.buy);
      assert.strictEqual(marketOrder.size, undefined);
      assert.strictEqual(marketOrder.price, undefined);
      assert.strictEqual(marketOrder.funds.getValue(), '14.9103971596');
      assert.strictEqual(marketOrder.statuses.length, 1);
      assert.strictEqual(marketOrder.statuses[0].status, MarketOrderStatus.received);
      assert.strictEqual(marketOrder.statuses[0].ts.utc().format('YYYY-MM-DDTHH:mm:ss'), '2022-11-11T22:35:26');
      assert.strictEqual(marketOrder.statuses[0].sequence, 20589255134);
      done();
    });

    it('should throw an error when being created from a non received type', (done) => {
      assert.throws(() => loadOrder('007_coinbase_order_match_btc_eur.json'),
        {
          name: 'Error', message: "Attempting creating an order from a non received one match"
        });
      done();
    });

  });

  describe('Immutability', () => {
    it('Should not be possible to change values in an Order once created', (done) => {
      assert.throws(() => {
        const receivedOrder = new MarketOrder(JSON.parse(fs.readFileSync('test/data/ws_messages/coinbase_order_received_limit.json', 'utf8')));
        receivedOrder.side = 'buy';
      },
        {
          name: 'TypeError', message: "Cannot assign to read only property 'side' of object '#<MarketOrder>'"
        });
      done();
    });
  });
});

