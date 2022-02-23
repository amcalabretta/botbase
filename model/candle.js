const moment = require('moment');
const bigDecimal = require('js-big-decimal');

class Candle {
    //`Ts:${moment.unix(el[0]).format('DD/MM/YYYY@HH:mm:00')}, lo:${el[1]}, hi:${el[2]}, op:${el[3]}, close:${el[4]}, vol:${el[5]}`
    constructor(values) {
        this.ts = moment.unix(values[0]).format('DD/MM/YYYY@HH:mm:00');
        this.low = new bigDecimal(values[1]);
        this.high = new bigDecimal( values[2]);
        this.open = new bigDecimal(values[3]);
        this.close = new bigDecimal(values[4]);
        this.volume = new bigDecimal(values[5]);
        if (this.close < this.open) { // bearish
            this.bottomWick = new bigDecimal(0);
            this.topWick = new bigDecimal(0);
        } else if (this.close > this.open) { // bullish
            this.bottomWick = new bigDecimal(0);
            this.topWick = new bigDecimal(0);
        } else { //flat
            this.bottomWick = new bigDecimal(0);
            this.topWick = new bigDecimal(0);
        }
    }
    
    isBearish() {
       return this.close < this.open;     
    }

    isBullish() {
        return this.close > this.open;     
    }

    getLow() {
        return this.low;
    }

    getHigh() {
        return this.high;
    }

    getTs() {
        return this.ts;
    }

    getOpen() {
        return this.open;
    }

    getClose() {
        return this.close;
    }

    getVolume() {
        return this.volume;
    }

}

exports.Candle = Candle;