'use strict';

const mocha = require('mocha');

const { describe } = mocha;
const { it } = mocha;
const assert = require('assert');
const { OrderReceived } = require('../../model/orders/order_received');

describe('OrderReceived Testing', () => {
    describe('Constructor testing', () => {
        it('should Create an OrderReceived from the ws message', (done) => {
            const testOrder = new OrderReceived(JSON.parse('{"order_id":"bc040674-76ba-40fd-ba46-692b8df2bf4a","order_type":"limit","size":"0.07","price":"21358.48","client_oid":"31b7a558-5df9-11ed-b859-0aaef69347ef","type":"received","side":"sell","product_id":"BTC-EUR","time":"2022-11-06T17:33:58.081009Z","sequence":20519096470}'));
            assert.strictEqual(testOrder.id, 'bc040674-76ba-40fd-ba46-692b8df2bf4a');
            assert.strictEqual(testOrder.type, 'limit');
            assert.strictEqual(testOrder.size.getValue(), '0.07');
            assert.strictEqual(testOrder.price.getValue(), '21358.48');
            assert.strictEqual(testOrder.side, 'sell');
            done();
        });
    });
    describe('Immutability', () => {
        it('Should not be possible to change values in am Order once created', (done) => {
          const testOrder = new OrderReceived(JSON.parse('{"order_id":"bc040674-76ba-40fd-ba46-692b8df2bf4a","order_type":"limit","size":"0.07","price":"21358.48","client_oid":"31b7a558-5df9-11ed-b859-0aaef69347ef","type":"received","side":"sell","product_id":"BTC-EUR","time":"2022-11-06T17:33:58.081009Z","sequence":20519096470}'));
          assert.throws(() => testOrder.side = 'buy',
            {
              name: 'TypeError', message: "Cannot assign to read only property 'side' of object '#<OrderReceived>'"
            });
          done();
        });
      });
});

