/**
 * Market data structure, holds and elaborate the data coming from the WS.
 * @param {*} market
 */
const moment = require('moment');

const MegaHash = require('megahash');
const IgushArray = require('../external/igusharray/igushArray');
const { BigDecimal, BigDecimalZero } = require('./bigdecimal');
const { MarketOrder, OrderStatus } = require('./orders/market_order');
const { parseSymbol } = require('../utils/parseSymbol');


class MarketData {
  constructor(market, logger, callBack) {
    this.market = market;
    this.lastTradeId = 0;
    this.lastSequence = 0;
    this.lastTimeStamp = moment('1970-01-01T00:00:00.000000Z');
    this.prices = new IgushArray(100);
    this.orders = new MegaHash();
    this.sequences = new MegaHash();
    this.callBack = callBack;
    this.logger = logger;
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
        // this.logger.info(`[HB] Current Last trade:${this.lastTradeId}`);
        // this.logger.info(`[HB] Current Last sequence:${this.lastSequence}`);
      }
    }
  };

  /**
   * Message ingesting orders that are received from the order book
   * @param {*} message 
   */
  orderReceived = (message) => {
    this.validateMessage(message);
    if (this.orders.has(message.order_id)) throw new Error(`Received Order with ID ${message.order_id} already ingested`)
    if (this.sequences.has(message.sequence)) throw new Error(`Received Order with sequence ${message.sequence} already ingested`)
    this.orders.set(message.order_id,new MarketOrder(message));
    this.sequences.set(message.sequence,message);
  };

  validateMessage = (message) => {
    if (message.product_id!==this.market) throw new Error(`Attempt to receive an order referring to market ${message.product_id} on a MD instance referring to ${this.market}`);
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
  };

  /**
   * Market data snapshot
   */
  mdSnapShot = () => {

  };

  log = (string) => {
    this.logger.info(string);
  };

  getTickers = () => this.prices
}

exports.MarketData = MarketData;
