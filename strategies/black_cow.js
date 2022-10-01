/**
* Black Cow strategy
*/
/* eslint max-len: ["error", { "code": 220 }] */
const Joi = require('joi');
const { OrderType } = require('../../model/constants');
const { Order } = require('../../model/order');
const { Candle } = require('../../model/candle');
const { checkConfiguration } = require('../../utils/checkConfiguration');
const { BigDecimal } = require('../../model/bigdecimal');

const subConfSchema = Joi.object().keys({
  minSlope: Joi.number().integer().min(1).max(10)
    .required()
});


class BlackCow {
  constructor(mainConf) {
    checkConfiguration(mainConf, confSchema, subConfSchema);
    this.markets = mainConf.markets;
    this.cryptoAmounts = mainConf.cryptoAmounts;
    this.euroAmount = new BigDecimal(mainConf.euroAmount);
    this.dollarAmount = new BigDecimal(mainConf.dollarAmount);
    this.lastValue = 0.00;
    this.orderCallback = (order) => order;
    this.strategyName = 'Black Cow';
  }

  /**
   *
   * Internal function receiving the candles
   * @param {*} values
   */

  candles(values) {
    const candles = values.map((value) => new Candle(value));
    candles.forEach((candle, idx) => {
      this.logger.info(`${idx} - Ts:${candle.ts},${candle.isBullish ? 'Bullish' : 'Bearish'}, 
                      lo:${candle.low.getValue()}, hi:${candle.high.getValue()}, 
                      op:${candle.open.getValue()}, cl:${candle.close.getValue()}, 
                      vol:${candle.volume.getValue()}`);
    });
  }

  valueCallBack(value) {
    switch (value.type) {
      case 'ticker':
        this.logger.debug(`Updating price to ${value.price}`);
        this.lastValue = value.price;
        break;
      case 'candlesPastTenMinutes':
        this.candles(value.payload);
        break;
      default:
        this.logger.warn('Unknown message type received');
    }
  }
}

exports.WhiteShark = WhiteShark;
