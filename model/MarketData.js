/**
 * Market data structure, holds and elaborate the data coming from the WS.
 * @param {*} market
 */
const moment = require('moment');
const IgushArray = require('igusharray');
const { BigDecimal } = require('./bigdecimal');

class MarketData {
  constructor(market, callBack) {
    this.market = market;
    this.lastTradeId = 0;
    this.lastTimeStamp = moment('1970-01-01T00:00:00.000000Z');
    this.prices = new IgushArray(100);
    this.callBack = callBack;
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
   * @param {*} ticker
   */
  ticker = (ticker) => {
    this.prices.push({
      seq: ticker.sequence,
      price: new BigDecimal(ticker.price),
      time: ticker.time,
      tradeId: ticker.trade_id,
      size: ticker.last_size
    });
  }

  getTickers = () => this.prices
}

exports.MarketData = MarketData;
