/* eslint max-len: ["error", { "code": 150 }] */

'use strict';

const moment = require('moment');
const { BigDecimal } = require('../bigdecimal');

// TODO: Change name: Probably should be something like 'MarketOrderStatus'? (see below)
const OrderStatus = Object.freeze({
  open: Symbol('OPN'),
  received: Symbol('RCV')
});



// Levaraging on the Megahash (that should be fast enough) and the sequence number, we should be able to track the life of
// every single order on the market.
class MarketOrder {
  constructor(receivedMessage) {
    if (receivedMessage.type != 'received') throw new Error('Attempting creating an order from a non received one');
    this.id = receivedMessage.order_id;
    this.side = receivedMessage.side;
    this.type = receivedMessage.order_type;
    this.price = new BigDecimal(receivedMessage.price);
    this.size = new BigDecimal(receivedMessage.size);
    this.statuses = [{ status: OrderStatus.received.description, ts: moment(receivedMessage.time), sequence: receivedMessage.sequence }];
    Object.freeze(this);
  }

  static open = (marketOrder, openMessage) => {
    const cloneOrder = { ...marketOrder };
    cloneOrder.statuses.push({ status: OrderStatus.open.description, ts: moment(openMessage.time), sequence: openMessage.sequence })
    return cloneOrder;
  }
}

exports.MarketOrder = MarketOrder;
exports.OrderStatus = OrderStatus;
