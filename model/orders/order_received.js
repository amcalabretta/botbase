/* eslint max-len: ["error", { "code": 150 }] */

'use strict';

const {BigDecimal} = require('../bigdecimal');

/**
 * {"order_id":"6326d127-ff39-4c9f-9025-705e782070d2",
 * "order_type":"limit","size":"0.01249034",
 * "price":"19265.73",
 * "client_oid":"0d415733-f17c-4e1d-956f-5763a0fee20a",
 * "type":"received",
 * "side":"sell",
 * "product_id":"BTC-USD",
 * "time":"2022-10-24T14:38:32.996565Z",
 * "sequence":48653608492}
 */

class OrderReceived {
  constructor(orderMessage) {
    this.id = orderMessage.order_id;
    this.type = orderMessage.order_type;
    this.size = new BigDecimal(orderMessage.size);
    this.price = new BigDecimal(orderMessage.price);
    this.side = orderMessage.side;
    Object.freeze(this);
  }
}

exports.OrderReceived = OrderReceived;
