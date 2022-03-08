'use strict'
const bigDecimal = require('js-big-decimal');
const ZERO = new bigDecimal(0);
const HUNDRED = new bigDecimal(100);
/**
 * Wrapper for the bigdecimal class, to improve readability, a few methods have been added, mailnly to favour the 
 * use booleans rather than matching with 0/-1/+1 
 */
class BigDecimal extends bigDecimal {
    
    constructor(number){
        super(number);
    }

    lessThan = (oTherValue) => {
        return bigDecimal.prototype.compareTo.call(this,oTherValue) === -1;
    }
    moreThan = (oTherValue) => {
        return bigDecimal.prototype.compareTo.call(this,oTherValue) === 1;
    }
    
    equalsTo = (oTherValue) => {
        return bigDecimal.prototype.compareTo.call(this,oTherValue) === 0;
    }
    
    asPercentageOf = (oTherValue) => {
        const div = bigDecimal.prototype.divide.call(this,oTherValue);
        return div.multiply(HUNDRED).round(6, bigDecimal.RoundingModes.HALF_EVEN);
    }
    
    asRatioOf = (oTherValue) => {
        return bigDecimal.prototype.divide.call(this, oTherValue).round(6, bigDecimal.RoundingModes.HALF_EVEN);
    }
    
    isNegative = () => {
        return (bigDecimal.prototype.compareTo.call(this, ZERO) === -1)
    }

    isPositive = () => {
        return (bigDecimal.prototype.compareTo.call(this, ZERO) === 1)
    }

    isZero = () => {
        return (bigDecimal.prototype.compareTo.call(this, ZERO) === 0)
    }

}

exports.BigDecimal = BigDecimal;
