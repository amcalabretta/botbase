/**
 * Market data structure, holds and elaborate the data coming from the WS.
 * @param {*} market
 */
const moment = require('moment');

const MegaHash = require('megahash');
const IgushArray = require('../external/igusharray/igushArray');
const { BigDecimal, BigDecimalZero } = require('./bigdecimal');
const { MarketOrder } = require('./orders/market_order');


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
    this.orders = new MegaHash();
    this.callBack = callBack;
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

  // TODO: change the name of this method (market order or upsertOrder or something similar?)
  orderAdded = (orderMessage) => {
    try {
      const currentOrder = this.orders.get(orderMessage.order_id);
      this.validateMessage(orderMessage, currentOrder);
      switch (orderMessage.type) {
        case 'received':
          this.orders.set(orderMessage.order_id, new MarketOrder(orderMessage));
          break;
        case 'open':
          this.orders.set(orderMessage.order_id, MarketOrder.open(this.orders.get(orderMessage.order_id), orderMessage));
          break;
        case 'done':
          this.orders.set(orderMessage.order_id, MarketOrder.done(this.orders.get(orderMessage.order_id), orderMessage));
          break;
        default:
          this.log(` Unknown message received: ${JSON.stringify(orderMessage)}`);
      }
    } catch (error) {
      this.log(` Error taking order: ${error}`);
    }
  };

  validateMessage = (orderMessage, currentOrder) => {
    if (currentOrder !== undefined && orderMessage.type === 'received') throw new Error(`Same order ID found in MarketData upon receiving a received message`);
    if (currentOrder == undefined && orderMessage.type === 'open') throw new Error(`Order open but unknown`);
    if (currentOrder == undefined && orderMessage.type === 'done') throw new Error(`Order done but unknown`);
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
