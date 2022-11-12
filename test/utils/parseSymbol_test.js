const mocha = require('mocha');

const { describe } = mocha;
const { it } = mocha;
const assert = require('assert');
const { parseSymbol } = require('../../utils/parseSymbol');
const { OrderStatus } = require('../../model/orders/market_order');


describe('parseSymbol', () => {
    describe('validation', () => {
        it('Should throw an error if a non valid string is passed', (done) => {
            assert.throws(() => { parseSymbol(OrderStatus, 'whatever'); }, { name: 'Error', message: 'whatever is not a valid instance' });
            done();
        });
    });
    describe('parsing', () => {
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

});
