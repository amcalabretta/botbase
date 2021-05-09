/**
 * CandleStick strategy, it's based on detecting the bearish and bullish patterns and act
 * accordingly in selling/buying.
 * https://github.com/cm45t3r/candlestick
 * or 
 * https://github.com/anandanand84/technicalindicators
 * 
 * Another one that might be interesting:
 * https://github.com/ttezel/nn
*/
const cs = require('candlestick');
const moment = require('moment');
const OrderType = require('../model/constants').OrderType

class KickerPatternCandleStickStrategy {

    constructor(conf) {
        this.candles=[];
        this.values=[];
        this.tickMs = conf.tickMs;
        this.min = 0;
        this.max = Number.MAX_SAFE_INTEGER;
    }
    
    ticker(value){
       var currentTs = moment().unix();  
       let res = {orderType:OrderType.NO_OP};
       this.values.push({ts:moment().unix(),price:parseFloat(value)});   
       if (this.values.length>0 && currentTs - this.values[0].ts>this.tickMs) {
          this.candles.push({
                open: this.values[0],
                high: this.max,
                low: this.min,
                close: this.values[this.values.length-1]
              });
          if (this.candles.length==2) {//we prepare the action
            if (isBullishKicker(this.candles[0], this.candles[1])) {
                res = {orderType:OrderType.BUY_SELL};     
            }
            if (isBearishKicker(this.candles[0], this.candles[1])) {
                res = {orderType:OrderType.SELL_BUY};     
            }
            this.candles.shift();
          }
          this.values = [];
          this.min = 0;
          this.max = Number.MAX_SAFE_INTEGER;
       }
       this.candles.forEach(el=>{
           console.log(el.high);
       })
       return res
    }
    
    type() {
      return 'KickerPatternCandleStick';
    }
};

exports.KickerPatternCandleStickStrategy = KickerPatternCandleStickStrategy;
