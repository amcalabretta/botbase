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
        this.mkts = conf.markets;
        this.channels = conf.channels;
    }
    
    candles(value) {
      console.log(' Received candles');
      return new Order(OrderType.NO_OP,0,0,0,0)
    }
    
    ticker(value){
      return {} 
    }
    
    type() {
      return 'KickerPatternCandleStick';
    }

    markets() {
      return this.mkts;
    }
};

exports.KickerPatternCandleStickStrategy = KickerPatternCandleStickStrategy;
