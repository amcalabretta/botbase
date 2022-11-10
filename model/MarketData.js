/**
 * Market data structure, holds and elaborate the data coming from the WS.
 * @param {*} market
 */
const moment = require('moment');

const MegaHash = require('megahash');
const cron = require('node-cron');
const IgushArray = require('../external/igusharray/igushArray');
const { BigDecimal, BigDecimalZero } = require('./bigdecimal');
const { MarketOrder } = require('./orders/market_order');


const dumpHashMap = (hashMap, logger) => {
  logger.info(' Dumping the hash');
  var key = hashMap.nextKey();
  while (key) {
    //logger.info(`Key ${key}, value:${JSON.stringify(hashMap.get(key))}`);
    const marketOrder = hashMap.get(key);
    logger.info(`Key ${key}, value:${JSON.stringify(hashMap.get(key))}`);
    key = hashMap.nextKey(key);
  }
}

const scheduler = (hashMap, logger) => {
  cron.schedule('* * * * *', () => dumpHashMap(hashMap, logger));
}

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
    scheduler(this.orders, this.logger);
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

  // TODO: change the name of this method (market order or something similar?)
  orderAdded = (orderMessage) => {
    //this.log(`Adding order ${JSON.stringify(orderMessage)}`);
    const orderStored = this.orders.get(orderMessage.order_id);
    if (orderStored === undefined) { // new order
      this.orders.set(orderMessage.order_id, new MarketOrder(orderMessage));
    } else { // update order and related data (the time of fillment?)
      //this.log(`Updating order id:${orderReceived.id}, seq:${orderReceived.sequenceNr}`);
      this.orders.set(orderMessage.id, MarketOrder.open(orderStored, orderMessage));
    }
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
