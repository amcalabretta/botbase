const mocha = require('mocha');

const { describe } = mocha;
const { it } = mocha;
const assert = require('assert');
const { parseSymbol } = require('../../utils/parseSymbol');
const { OrderStatus } = require('../../model/orders/market_order');
const { OrderType } = require('../../model/orders/market_order');


describe('parseSymbol', () => {
    describe('validation', () => {
        it('Should throw an error if a non valid string is passed (status)', (done) => {
            assert.throws(() => { parseSymbol(OrderStatus, 'whatever'); }, { name: 'Error', message: 'whatever is not a valid instance' });
            done();
        });
        it('Should throw an error if a non valid string is passed (type)', (done) => {
            assert.throws(() => { parseSymbol(OrderType, 'whatever'); }, { name: 'Error', message: 'whatever is not a valid instance' });
            done();
        });
    });
    describe('parsing status', () => {
        it('Should parse the done value', (done) => {
            assert.strictEqual(parseSymbol(OrderStatus, 'done'), OrderStatus.done);
            done();
        });
        it('Should parse the received value', (done) => {
            assert.strictEqual(parseSymbol(OrderStatus, 'received'), OrderStatus.received);
            done();
        });
        it('Should parse the open value', (done) => {
            assert.strictEqual(parseSymbol(OrderStatus, 'open'), OrderStatus.open);
            done();
        });
    });
    describe('parsing type', () => {
        it('Should parse the limit value', (done) => {
            assert.strictEqual(parseSymbol(OrderType, 'limit'), OrderType.limit);
            done();
        });
        it('Should parse the market value', (done) => {
            assert.strictEqual(parseSymbol(OrderType, 'market'), OrderType.market);
            done();
        });
    });

});
