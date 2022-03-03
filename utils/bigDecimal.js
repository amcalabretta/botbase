'use strict'
const bigDecimal = require('js-big-decimal');
const ZERO = new bigDecimal(0);


bigDecimal.prototype.lessThan = (oTherValue) => {
    //console.log(` *** ${bigDecimal.compareTo}`)
    console.log(` *** ${ oTherValue}`)
    bigDecimal.compareTo.call(this,oTherValue);
    //return (.call(compareTo,this,oTherValue) === -1)
    return true;
}

/*bigDecimal.prototype.moreThan = (oTherValue) => {
    return (this.prototype.compareTo.call(this,oTherValue) === 1)
}

bigDecimal.prototype.equalsTo = (oTherValue) => {
    return (this.prototype.compareTo.call(this,oTherValue) === 0)
}

bigDecimal.prototype.asPercentageOf = (oTherValue) => {
    return ZERO;
}

bigDecimal.prototype.asRatioOf = (oTherValue) => {
    return ZERO;
}


bigDecimal.prototype.isNegative = () => {
    return (bigDecimal.prototype.compareTo.call(this, ZERO) === 1)
}*/

module.exports = {bigDecimal, ZERO}



