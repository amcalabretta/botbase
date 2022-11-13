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
    if (receivedMessage.type !== MarketOrderStatus.received) throw new Error(`Attempting creating an order from a non received one ${receivedMessage.type}`)
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
      default://no need with an enumeration
    }
    this.statuses = [{ status: MarketOrderStatus.received, ts: moment(receivedMessage.time), sequence: receivedMessage.sequence }];
    Object.freeze(this);
  }

  
  /*static open = (marketOrder, openMessage) => {
    if (OrderStatus.open === parseSymbol(OrderStatus, openMessage.type)) {
      if (marketOrder.id === openMessage.order_id) {
        marketOrder.statuses.push({ status: OrderStatus.open.description, ts: moment(openMessage.time), sequence: openMessage.sequence, remaining: openMessage.remaining_size });
        return marketOrder;
      } 
    }
    throw new Error(`Attempting creating an open an order from a message type ${openMessage.type}`);
  }

  //TODO: check about the cloning here, it's probably unnecessary
  static done = (marketOrder, doneMessage) => {
    if (OrderStatus.done === parseSymbol(OrderStatus, doneMessage.type)) {
      const cloneOrder = { ...marketOrder };
      cloneOrder.statuses.push({ status: OrderStatus.done.description, ts: moment(doneMessage.time), sequence: doneMessage.sequence });
      return cloneOrder;
    }
    throw new Error(`Attempting set an order as done from a message type ${doneMessage.type}`);
  }

  static match = (matchMessage) => {

  }*/
}

exports.MarketOrder = MarketOrder;
exports.MarketOrderStatus = MarketOrderStatus;
exports.MarketOrderType = MarketOrderType;
exports.MarketOrderSide = MarketOrderSide;
