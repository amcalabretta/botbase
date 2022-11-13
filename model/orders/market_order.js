/* eslint max-len: ["error", { "code": 150 }] */

'use strict';

const moment = require('moment');
const { BigDecimal } = require('../bigdecimal');
const { parseSymbol } = require('../../utils/parseSymbol');

const MarketOrderStatus = Object.freeze({
  open: 'open',
  received: 'received',
  done: 'done',
  match: 'match'
});

const MarketOrderSide = Object.freeze({
  buy: 'buy',
  sell: 'sell'
});

const MarketOrderType = Object.freeze({
  limit: 'limit',
  market: 'market'
});

// Levaraging on the Megahash (that should be fast enough) and the sequence number, we should be able to track the life of
// every single order on the market.
class MarketOrder {
  constructor(receivedMessage) {
    if (receivedMessage.type !== MarketOrderStatus.received) {
      throw new Error(`Attempting creating an order from a non received one ${receivedMessage.type}`);
    }
    this.id = receivedMessage.order_id;
    this.type = parseSymbol(MarketOrderType, receivedMessage.order_type);
    this.client_id = receivedMessage.client_oid;
    this.side = parseSymbol(MarketOrderSide, receivedMessage.side);
    switch (this.type) {
      case MarketOrderType.limit:
        this.size = new BigDecimal(receivedMessage.size);
        this.price = new BigDecimal(receivedMessage.price);
        break;
      case MarketOrderType.market:
        this.funds = new BigDecimal(receivedMessage.funds);
        break;
      default:// no need with an enumeration
    }
    this.statuses = [{ status: MarketOrderStatus.received, ts: moment(receivedMessage.time), sequence: receivedMessage.sequence }];
    Object.freeze(this);
  }
}

exports.MarketOrder = MarketOrder;
exports.MarketOrderStatus = MarketOrderStatus;
exports.MarketOrderType = MarketOrderType;
exports.MarketOrderSide = MarketOrderSide;
