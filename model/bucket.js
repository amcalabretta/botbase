/**
* Bucket data structure.
*/
class Bucket {
  constructor(type, amount, currency) {
    this.type = type;
    this.amount = amount;
    this.currency = currency;
  }

  type() {
    return this.type;
  }
}

export default { Bucket };
