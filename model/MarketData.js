/**
 * Market data structure, holds and elaborate the data coming from the WS.
 * @param {*} market 
 */
const moment = require('moment');
const { BigDecimal } = require('./bigdecimal');
const IgushArray = require("igusharray");

class MarketData {
    constructor(market) {
        this.market = market;
        this.lastTradeId = 0;
        this.lastTimeStamp = moment("1970-01-01T00:00:00.000000Z");
        this.prices = new IgushArray(100);
    }

    /**
     * Function to take care of the s.c. heartbit, reporting the last trade id.
     * 
     * @param {*} heartBit 
     * @returns 
     */
    heartBit = (heartBit) => {
        const time = moment(heartBit.time);
        if (time.isAfter(this.lastTimeStamp)) {
            this.lastTradeId = heartBit.last_trade_id;
            this.lastTimeStamp = time;
        }
    }
    /**
     * 
     * @param {*} ticker 
     */
    ticker = (ticker) => {
        
    }

}

exports.MarketData = MarketData;