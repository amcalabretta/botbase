'use strict';

const moment = require('moment');
const { BigDecimal }  = require('./bigdecimal');

class Candle {
  constructor(values) {
    this.ts = moment.unix(values[0]).format('DD/MM/YYYY@HH:mm:00');
    this.low = new BigDecimal(values[1]);
    this.high = new BigDecimal(values[2]);
    this.open = new BigDecimal(values[3]);
    this.close = new BigDecimal(values[4]);
    this.volume = new BigDecimal(values[5]);
    if (this.close.lessThan(this.open)) { // bearish
      this.isBearish = true;
      this.isBullish = false;
      this.lowerWick = this.close.subtract(this.low);
      this.upperWick = this.high.subtract(this.open);
    } else if (this.close.moreThan(this.open) || this.open.equalsTo(this.close)) { // bullish
      this.isBearish = false;
      this.isBullish = true;
      this.lowerWick = this.high.subtract(this.close);
      this.upperWick = this.open.subtract(this.low);
    }
    Object.freeze(this);
  }
}

exports.Candle = Candle;
