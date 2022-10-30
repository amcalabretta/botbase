/* eslint prefer-destructuring: ["error", {"array": false,"object": true}, {"enforceForRenamedProperties": false}] */
/* eslint max-len: ["error", { "code": 150 }] */

'use strict';

const moment = require('moment');
const { BigDecimal } = require('./bigdecimal');

class Candle {
  constructor(values) {
    this.close = new BigDecimal(values['close']);
    this.high = new BigDecimal(values['high']);
    this.rawTs = values['openTimeInMillis'];
    this.ts = values['openTimeInISO'];
    this.low = new BigDecimal(values['low']);
    this.open = new BigDecimal(values['open']);
    this.volume = new BigDecimal(values['volume']);
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

  isConsecutiveOf = (otherCandle) => this.rawTs - otherCandle.rawTs === 60000;
}

exports.Candle = Candle;
