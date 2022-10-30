/**
* Candlestick strategy, detects a bullish pattern
 * based on those conditions:
 *
 *  1. The pattern starts with a number of bearish candles, the number of bearish candles to
 * trigger the detection is passed as a parameter.
 *  2. The gap should not be filled by the wick of the second candlestick,
 *      but be left untouched.
 *      In other words, the candlestick has a tiny or nonexisting lower wick.
 *
 * This strategy has been written after the following article:
 * https://therobusttrader.com/bullish-kicker-candlestick-pattern/
 *
 * When the above pattern is detected (only on the last x candles) the following order is issued:
 *
 *
 * Possible improvements (from the link above):
 *  - Take into account the volume.
 *  - Use the technical indicators to take into account volatility.
 *  - Add the wick calculation
*/
/* eslint max-len: ["error", { "code": 220 }] */
const Joi = require('joi');
const { OrderType } = require('../../model/constants');
const { Order } = require('../../model/order');
const { Candle } = require('../../model/candle');
const { checkConfiguration } = require('../../utils/checkConfiguration');
const { BigDecimal } = require('../../model/bigdecimal');

const subConfSchema = Joi.object().keys({
  numBearishCandles: Joi.number().integer().min(1).max(10)
    .required(),
  gapRatio: Joi.number().positive().required(),
  wickRatio: Joi.number().positive().required(),
  volumeRatio: Joi.number().positive().required(),
  buyRatio: Joi.number().precision(2).required(),
  sellRatio: Joi.number().precision(2).required()
});

const confSchema = Joi.object().keys({
  cryptoAmounts: Joi.array().length(1),
  markets: Joi.array().length(1),
}).unknown(true);

class WhiteShark {
  constructor(mainConf) {
    checkConfiguration(mainConf, confSchema, subConfSchema);
    this.market = mainConf.markets[0];
    this.cryptoAmounts = mainConf.cryptoAmounts;
    this.euroAmount = new BigDecimal(mainConf.euroAmount);
    this.dollarAmount = new BigDecimal(mainConf.dollarAmount);
    this.numBearishCandles = new BigDecimal(mainConf.subConf.numBearishCandles);
    this.gapRatio = new BigDecimal(mainConf.subConf.gapRatio);
    this.wickRatio = new BigDecimal(mainConf.subConf.wickRatio);
    this.volumeRatio = new BigDecimal(mainConf.subConf.volumeRatio);
    this.lastValue = 0.00;
    this.orderCallback = (order) => order;
    this.strategyType = 'CandleStick';
    this.strategyName = 'White Shark';
  }

  /**
   *
   * Internal function receiving the candles
   * @param {*} values
   */

  candles(value) {
    this.logger.info(`Candles received:${JSON.stringify(value)}`);
    const candles = value.map((c) => new Candle(c));
    candles.forEach((candle, idx) => {
      this.logger.info(`${idx} - Ts:${candle.ts},${candle.isBullish ? 'Bullish' : 'Bearish'}, 
                      lo:${candle.low.getValue()}, hi:${candle.high.getValue()}, 
                      op:${candle.open.getValue()}, cl:${candle.close.getValue()}, 
                      vol:${candle.volume.getValue()}`);
    });
    // TODO: numBearishCandles can be an int (no need for the lessThan here)
    if ((new BigDecimal(candles.length - 1)).lessThan(this.numBearishCandles)) {
      this.logger.info(`[0] - [Negative] Not Enough candles ${candles.length} vs ${this.numBearishCandles.getValue()}, bailing out.`);
      this.orderCallback(new Order(OrderType.NO_OP, this.market, 0, 0, 0, 0, 0), `Not Enough candles (needed ${this.numBearishCandles.asInt() + 1})`);
      return;
    }
    // the last numBerishCandles must be consecutive
    for (let i = this.candles.length - 1; i > 0; i -= 1) {
      if (!candles[i].isConsecutiveOf(candles[i - 1])) {
        this.logger.info(`[0] - [Negative] candle nr ${i} and candle ${i + 1} are not consecutive`);
        this.orderCallback(new Order(OrderType.NO_OP, this.market, 0, 0, 0, 0, 0), 'Not consecutive candles');
        return;
      }
    }
    const lastCandle = candles[0];
    const secondLastCandle = candles[1];
    // first check: the last candle is green.
    if (lastCandle.isBearish) {
      this.logger.info('[1] - [Negative] Last candle is not bullish, bailing out.');
      this.orderCallback(new Order(OrderType.NO_OP, this.market, 0, 0, 0, 0, 0), 'First candle not bullish');
      return;
    }
    this.logger.info('[1] - [Affirmative] Last candle is bullish.');
    // second check, the last numBearishCandles are red.
    let allBearish = true;
    for (let i = 1; i < this.numBearishCandles.asInt(); i += 1) {
      allBearish = allBearish && candles[i].isBearish;
    }
    if (!allBearish) {
      this.logger.info(`[2] - [Negative] Last ${this.numBearishCandles.getValue()} are not bearish, bailing out.`);
      this.orderCallback(new Order(OrderType.NO_OP, this.market, 0, 0, 0, 0, 0), `Last ${this.numBearishCandles.getValue()} not bearish`);
      return;
    }
    this.logger.info(`[2] - [Affirmative] Last ${this.numBearishCandles.getValue()} are bearish.`);
    const gap = new BigDecimal(lastCandle.open.subtract(secondLastCandle.open).getValue());
    // third check: gap is positive
    if (gap.isNegative()) { //
      this.logger.info(`[3] - [Negative] Gap ${gap.getValue()} is negative, bailing out.`);
      this.orderCallback(new Order(OrderType.NO_OP, this.markets[0], 0, 0, 0, 0), 'Negative Gap');
      return;
    }
    this.logger.info(`[3] - [Affirmative] Gap ${gap.getValue()} is positive, proceeding.`);

    // fourth check: the ratio between the wick of the last candle and the gap between it and the previous one must be below the wickRatio parameter.
    const wick = lastCandle.lowerWick;
    if (wick.isZero()) {
      this.logger.info('[4] - [Negative] Last Candle lowerwick is zero bailing out.');
      this.orderCallback(new Order(OrderType.NO_OP, 0, 0, 0, 0, 0), 'Null lowerwick on last candle');
      return;
    }
    if (wick.asRatioOf(gap).moreThan(this.wickRatio)) {
      this.logger.info(`[5] - [Negative] Lower Wick ${wick.getValue()} as a ratio of the gap ${gap.getValue()} is higher than ${this.wickRatio.getValue()}, bailing out`);
      this.orderCallback(new Order(OrderType.NO_OP, 0, 0, 0, 0, 0));
      return;
    }
    this.logger.info(`[5] - [Affirmative] Lower Wick ${wick.getValue()} as a ratio of the gap ${gap.getValue()} is lower than ${this.wickRatio.getValue()}, (actual ratio:${wick.asRatioOf(gap).getValue()})Proceeding`);

    // fifth and last check: The ratio between the second to last candle and the last one must be lower than the volume ratio.
    if (secondLastCandle.volume.asRatioOf(lastCandle.volume).isMoreThan(this.volumeRatio)) {
      this.logger.info(` Second to last candle Volume  ${secondLastCandle.volume.getValue()} as a ratio of the gap ${gap.getValue()} is higher than ${this.volumeRatio.getValue()}, bailing out`);
      this.orderCallback(new Order(OrderType.NO_OP, 0, 0, 0, 0, 0));
      return;
    }
    // preparing the order..
    this.logger.info('Proceeding with the oder');
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
