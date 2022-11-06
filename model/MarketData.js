/**
 * Market data structure, holds and elaborate the data coming from the WS.
 * @param {*} market
 */
const moment = require('moment');
const IgushArray = require('../external/igusharray/igushArray');
const { BigDecimal,BigDecimalZero } = require('./bigdecimal');
const { OrderReceived } = require('../model/orders/order_received');
const MegaHash = require('megahash');

class MarketData {
  constructor(market, logger, callBack) {
    this.market = market;
    this.logger = logger;
    this.lastTradeId = 0;
    this.lastSequence = 0;
    this.lastTimeStamp = moment('1970-01-01T00:00:00.000000Z');
    this.prices = new IgushArray(100);
    this.buyOrders = new MegaHash();
    this.sellOrders = new MegaHash();
    this.callBack = callBack;
    this.numBuyOrders = 0;
    this.sizeBuyOrders = BigDecimalZero;
    this.numSellOrders = 0;
    this.sizeSellOrders = BigDecimalZero;
  }

  /**
   * Function to take care of the s.c. heartbit, reporting the last trade id.
   *
   * @param {*} hB
   * @returns
   */
  heartBit = (hB) => {
    const time = moment(hB.time);
    if (time.isAfter(this.lastTimeStamp)) {
      this.lastTimeStamp = time;
      this.lastSequence = hB.sequence;
      if (this.lastTradeId !== hB.last_trade_id) {
        this.lastTradeId = hB.last_trade_id;
        this.logger.info(`[HB] Current Last trade:${this.lastTradeId}`)
        this.logger.info(`[HB] Current Last sequence:${this.lastSequence}`)
      }
    }
  };

  orderAdded = (order) => {
    const orderReceived = new OrderReceived(order);
    if (orderReceived.side==='buy') {
      this.buyOrders.set(order.order_id, orderReceived);
      this.numBuyOrders++;
      this.sizeBuyOrders = this.sizeBuyOrders.add(orderReceived.size);
    } else {
      this.sellOrders.set(order.order_id, orderReceived);
      this.numSellOrders++;
      this.sizeSellOrders = this.sizeBuyOrders.add(orderReceived.size);
    }
    this.log(`Sell Orders:${this.numSellOrders} / Total Size:${this.sizeSellOrders.getValue()}`);
    this.log(`Buy Orders:${this.numBuyOrders} / Total Size:${this.sizeBuyOrders.getValue()}`);
  };

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
  };

  log = (string) => {
    this.logger.info(string);
  };

  getTickers = () => this.prices
}

exports.MarketData = MarketData;
