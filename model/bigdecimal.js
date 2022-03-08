'use strict'
const bigDecimal = require('js-big-decimal');
const ZERO = new bigDecimal(0);
const HUNDRED = new bigDecimal(100);

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
        return div.multiply(HUNDRED);
    }
    
    asRatioOf = (oTherValue) => {
        return bigDecimal.prototype.divide.call(this,oTherValue);;
    }
    
    isNegative = () => {
        return (bigDecimal.prototype.compareTo.call(this, ZERO) === 1)
    }

}

exports.BigDecimal = BigDecimal;
