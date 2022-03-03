'use strict'
const mocha = require('mocha');

const { describe } = mocha;
const { it } = mocha;
const assert = require('assert');

const { bigDecimal } = require('../../utils/bigDecimal');
//const bigDecimal = require('js-big-decimal');


describe('BigDecimal Wrapper', () => {
    
    it('lessThanFunction', (done) => {
        const testValue1 = new bigDecimal(7.98);
        const testValue2 = new bigDecimal(5.23);
        assert.strictEqual(testValue1.lessThan(testValue2), true);
        done();
    });

    


});
