'use strict';

const moment = require('moment');
const { BigDecimal }  = require('./bigdecimal');

class Candle {
  constructor(values) {
    this.rawTs = values[0];
    this.ts = moment.unix(values[0]).utc().format('DD/MM/YYYY@HH:mm:00');
    this.low = new BigDecimal(values[1]);
    this.high = new BigDecimal(values[2]);
    this.open = new BigDecimal(values[3]);
    this.close = new BigDecimal(values[4]);
    this.volume = new BigDecimal(values[5]);
    if (this.close.lessThan(this.open)) { // bearish
      this.isBearish = true;
      this.isBullish = false;
      this.lowerWick = new BigDecimal(this.close.subtract(this.low).getValue());
      this.upperWick = new BigDecimal(this.high.subtract(this.open).getValue());
    } else if (this.close.moreThan(this.open) || this.open.equalsTo(this.close)) { // bullish
      this.isBearish = false;
      this.isBullish = true;
      this.lowerWick = new BigDecimal(this.high.subtract(this.close).getValue());
      this.upperWick = new BigDecimal(this.open.subtract(this.low).getValue());
    }
    Object.freeze(this);
  }

  isConsecutiveOf = (otherCandle) => {
    return this.rawTs - otherCandle.rawTs === 60;  
  }

}

exports.Candle = Candle;
