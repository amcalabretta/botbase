/* eslint max-len: ["error", { "code": 200 }] */
/**
 * Market data structure, holds and elaborate the data coming from the WS.
 * @param {*} market
 */
const moment = require('moment');

const MegaHash = require('megahash');
const IgushArray = require('../external/igusharray/igushArray');
const { BigDecimal } = require('./bigdecimal');
const {
  MarketOrder, MarketOrderStatus, MarketOrderOutcome
} = require('./orders/market_order');
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
    this.candlesBySecond = new MegaHash();
    this.sellQuantity = new MegaHash();// amount of cryptos on the sell buy at a certain price (price being the key)
    this.buyQuantity = new MegaHash();// amount of cryptos on the buy side at a certain price (price being the key)
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
      }
    }
  };

  /**
   * Message ingesting orders that are received from the order book
   * @param {*} message
   */
  orderReceived = (message) => {
    if (this.orders.has(message.order_id)) throw new Error(`Received Order with ID ${message.order_id} already ingested`);
    this.validate(message);
    this.orders.set(message.order_id, new MarketOrder(message));
    this.sequences.set(message.sequence, message);
    this.logger.info(` Received order with id ${message.order_id}`);
  };

  validate = (message) => {
    if (message.product_id !== this.market) throw new Error(`Attempt to receive an order referring to market ${message.product_id} on a MD instance referring to ${this.market}`);
    if (this.sequences.has(message.sequence)) throw new Error(`Received Order with sequence ${message.sequence} already ingested`);
  };

  /** Open or done */
  orderUpdated = (message) => {
    this.validate(message);
    if (this.orders.has(message.order_id)) {
      const currentOrder = this.orders.get(message.order_id);
      const marketStatus = message.type === 'open' ? MarketOrderStatus.open : MarketOrderStatus.done;
      const status = { status: marketStatus, ts: moment(message.time), sequence: message.sequence };
      if (marketStatus === MarketOrderStatus.done) {
        status.reason = parseSymbol(MarketOrderOutcome, message.reason);
      }
      currentOrder.statuses.push(status);
      this.orders.set(message.order_id, currentOrder);
      this.logger.info(` Updating order with id ${message.order_id} -> ${marketStatus}`);
    }
  };

  /** Match between two orders */
  match = (message) => {
    this.validate(message);
    const sellOrder = this.orders.get(message.maker_order_id);
    const buyOrder = this.orders.get(message.taker_order_id);
    // validate the match
    if (sellOrder === undefined || buyOrder === undefined) {
      throw new Error('Cannot match as at least one of the orders are not ingested');
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

  log = (string) => {
    this.logger.info(string);
  };

  getTickers = () => this.prices;
}

exports.MarketData = MarketData;
