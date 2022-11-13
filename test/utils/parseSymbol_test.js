const mocha = require('mocha');

const { describe } = mocha;
const { it } = mocha;
const assert = require('assert');
const { parseSymbol } = require('../../utils/parseSymbol');
const { MarketOrderStatus } = require('../../model/orders/market_order');
const { MarketOrderType } = require('../../model/orders/market_order');


describe('parseSymbol', () => {
    describe('validation', () => {
        it('Should throw an error if a non valid string is passed (status)', (done) => {
            assert.throws(() => { parseSymbol(MarketOrderStatus, 'whatever'); }, { name: 'Error', message: 'whatever is not a valid instance' });
            done();
        });
        it('Should throw an error if a non valid string is passed (type)', (done) => {
            assert.throws(() => { parseSymbol(MarketOrderType, 'whatever'); }, { name: 'Error', message: 'whatever is not a valid instance' });
            done();
        });
    });
    describe('parsing status', () => {
        it('Should parse the done value', (done) => {
            assert.strictEqual(parseSymbol(MarketOrderStatus, 'done'), MarketOrderStatus.done);
            done();
        });
        
        it('Should parse the received value', (done) => {
            assert.strictEqual(parseSymbol(MarketOrderStatus, 'received'), MarketOrderStatus.received);
            done();
        });
        it('Should parse the open value', (done) => {
            assert.strictEqual(parseSymbol(MarketOrderStatus, 'open'), MarketOrderStatus.open);
            done();
        });
    });
    describe('parsing type', () => {
        it('Should parse the limit value', (done) => {
            assert.strictEqual(parseSymbol(MarketOrderType, 'limit'), MarketOrderType.limit);
            done();
        });
        it('Should parse the market value', (done) => {
            assert.strictEqual(parseSymbol(MarketOrderType, 'market'), MarketOrderType.market);
            done();
        });
    });
});
