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

class KickerPatternCandleStickStrategy {

    constructor() {
        this.candles=[];
    }

    action() {
        
    }
    
    ticker(value){

    }
    
    type() {
     return 'KickerPatternCandleStick';
    }
};

exports.KickerPatternCandleStickStrategy = KickerPatternCandleStickStrategy;
