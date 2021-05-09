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
const {OrderType} = require('../model/constants');
const {isBullishKicker,isBearishKicker} = require('candlestick');

class KickerPatternCandleStickStrategy {

    constructor(conf) {
        this.candles=[];
        this.values=[];
        this.tickInSeconds = conf.tickInSeconds;
        this.min = Number.MIN_SAFE_INTEGER;
        this.max = 0;
    }
    
    ticker(value){
       var currentTs = moment().unix();  
       if (this.values.length > 0) {
        console.log(`${currentTs - this.values[0].ts} - ${currentTs}`);
       }
       let res = {orderType:OrderType.NO_OP};
       this.values.push({ts:currentTs,price:parseFloat(value)}); 
       if (parseFloat(value) > this.max) {
           this.max = parseFloat(value);
       }
       if (parseFloat(value) < this.min) {
         this.min = parseFloat(value);
       }

       if (this.values.length>0 && currentTs - this.values[0].ts>this.tickInSeconds) {
         console.log('candles!');
         this.candles.push({
                open: this.values[0].price,
                high: this.max,
                low: this.min,
                close: this.values[this.values.length-1].price
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
          this.candles.forEach(el=>{
             console.log(`H:${el.high}`);
             console.log(`L:${el.low}`);
             console.log(`O:${el.open}`);
             console.log(`C:${el.close}`);
             console.log('===========')
          })
        }
       return res
    }
    
    type() {
      return 'KickerPatternCandleStick';
    }
};

exports.KickerPatternCandleStickStrategy = KickerPatternCandleStickStrategy;
