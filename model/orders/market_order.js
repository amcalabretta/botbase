/* eslint max-len: ["error", { "code": 150 }] */

'use strict';

const moment = require('moment');
const { BigDecimal } = require('../bigdecimal');
const {parseSymbol} = require('../../utils/parseSymbol');

// TODO: Change name: Probably should be something like 'MarketOrderStatus'? (see below)
const OrderStatus = Object.freeze({
  open: Symbol('open'),
  received: Symbol('received'),
  done: Symbol('done')
});

// TODO: Change name: Probably should be something like 'MarketOrderSide'? (see below)
const OrderSide = Object.freeze({
  buy: Symbol('buy'),
  sell: Symbol('sell')
});

// TODO: Change name: Probably should be something like 'MarketOrderType'? (see below)
const OrderType = Object.freeze({
  limit: Symbol('limit'),
  market: Symbol('market')
});


// Levaraging on the Megahash (that should be fast enough) and the sequence number, we should be able to track the life of
// every single order on the market.
class MarketOrder {
  constructor(receivedMessage) {
    const status = parseSymbol(OrderStatus,receivedMessage.type);
    if (status!==OrderStatus.received) throw new Error(`Attempting creating an order from a non received one ${receivedMessage.type}`)
    this.id = receivedMessage.order_id;
    this.client_id = receivedMessage.client_oid;
    this.type = parseSymbol(OrderType,receivedMessage.order_type); 
    this.side = parseSymbol(OrderSide,receivedMessage.side); 
    this.price = new BigDecimal(receivedMessage.price);
    this.size = new BigDecimal(receivedMessage.size);
    this.statuses = [{ status: OrderStatus.received.description, ts: moment(receivedMessage.time), sequence: receivedMessage.sequence }];
    Object.freeze(this);
  }

  //TODO: check about the cloning here, it's probably unnecessary
  static open = (marketOrder, openMessage) => {
    if (OrderStatus.open === parseSymbol(OrderStatus,openMessage.type)) {
      const cloneOrder = { ...marketOrder };
      cloneOrder.statuses.push({ status: OrderStatus.open.description, ts: moment(openMessage.time), sequence: openMessage.sequence, remaining: openMessage.remaining_size });
      return cloneOrder;
    }
    throw new Error(`Attempting creating an open an order from a message type ${openMessage.type}`);
  }

  //TODO: check about the cloning here, it's probably unnecessary
  static done = (marketOrder, doneMessage) => {
    if (OrderStatus.done === parseSymbol(OrderStatus,openMessage.type)) {
      const cloneOrder = { ...marketOrder };
      cloneOrder.statuses.push({ status: OrderStatus.done.description, ts: moment(doneMessage.time), sequence: doneMessage.sequence });
      return cloneOrder;
    }
    throw new Error(`Attempting set an order as done from a message type ${doneMessage.type}`);
  }
}

exports.MarketOrder = MarketOrder;
exports.OrderStatus = OrderStatus;
exports.OrderType = OrderType;
exports.OrderSide = OrderSide;
