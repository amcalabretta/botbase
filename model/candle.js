'use strict';
const moment = require('moment');
const { bigDecimal}  = require('../utils/bigDecimal');

class Candle {
    constructor(values) {
        this.ts = moment.unix(values[0]).format('DD/MM/YYYY@HH:mm:00');
        this.low = new bigDecimal(values[1]);
        this.high = new bigDecimal(values[2]);
        this.open = new bigDecimal(values[3]);
        this.close = new bigDecimal(values[4]);
        this.volume = new bigDecimal(values[5]);
        if (this.close.lessThan(this.open)) { // bearish
            this.isBearish = true;
            this.isBullish = false;
            this.lowerWick = this.close.subtract(this.low);
            this.upperWick = this.high.subtract(this.open);
        } else if (this.close.moreThan(this.open)|| this.open.equalsTo(this.close)) { // bullish
            this.isBearish = false;
            this.isBullish = true;
            this.lowerWick = this.high.subtract(this.close);
            this.upperWick = this.open.subtract(this.low);
        } 
        Object.freeze(this);
    }
}

exports.Candle = Candle;