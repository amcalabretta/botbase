/**
 * Class modelling an order to be issued.
 */

class Order {
  constructor(type, market, buyAmountM, buyAmountC, sellAmountM, sellAmountC) {
    this.type = type;
    this.market = market;
    this.buyAmountC = buyAmountC;
    this.buyAmountM = buyAmountM;
    this.sellAmountC = sellAmountC;
    this.sellAmountM = sellAmountM;
  }
}

exports.Order = Order;
