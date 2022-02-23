/**
* Candlestick strategy, detects a bullish pattern
 * based on those conditions:
 *
 *  1. The pattern starts with a number of bearish candles, the number of bearish candles to 
 * trigger the detection is passed as a parameter.
 *  2. 
 *  3. The gap should not be filled by the wick of the second candlestick,
 *      but be left untouched.
 *      In other words, the candlestick has a tiny or nonexisting lower wick.
 *
 * This strategy has been written after the following article:
 * https://therobusttrader.com/bullish-kicker-candlestick-pattern/
 *
 * When the above pattern is detected (only on the last two candles) the following order is issued:
 *
 * Possible improvements (from the link above):
 *  - Take into account the volume.
 *  - Use the technical indicators to take into account volatility.
 *  - Add the wick calculation
*/
/* eslint max-len: ["error", { "code": 120 }] */
const Joi = require('joi');
const { OrderType } = require('../../model/constants');
const { Order } = require('../../model/order');
const { Candle } = require('../../model/candle');
const { checkConfiguration } = require('../../utils/checkConfiguration');
const bigDecimal = require('js-big-decimal');

const subConfSchema = Joi.object().keys({
  numBearishCandles: Joi.number().integer().min(1).max(10).required(),
  gapRatio: Joi.number().positive().required(),
  wickRatio: Joi.number().positive().required(),
  volumeRatio: Joi.number().positive().required(),
});

const confSchema = Joi.object().keys({
  cryptoAmounts: Joi.array().length(1),
  markets: Joi.array().length(1),
}).unknown(true);


class WhiteShark {
  constructor(mainConf) {
    checkConfiguration(mainConf,confSchema,subConfSchema);
    this.markets = mainConf.markets;
    this.cryptoAmounts = mainConf.cryptoAmounts;
    this.euroAmount = mainConf.euroAmount;
    this.dollarAmount = mainConf.dollarAmount;
    this.numBearishCandles = mainConf.subConf.numBearishCandles;
    this.gapRatio = mainConf.subConf.gapRatio;
    this.wickRatio = mainConf.subConf.wickRatio;
    this.volumeRatio = mainConf.subConf.volumeRatio;
    this.lastValue = 0.00;
    this.orderCallback = (order) => order;
    this.strategyType = 'CandleStick';
    this.strategyName = 'White Shark';
  }

  
  /**
   * 
   * Internal function receiving the candles
   * 
   * format of the single candle: [ time, low, high, open, close, volume ]
   * @param {*} values 
   */
  
  candles(values) {
    let candles = values.map(value => new Candle(value));
    candles.forEach((candle) => {
      this.logger.debug(`Ts:${candle.getTs()},${candle.isBullish()?`Bullish`:`Bearish`}, lo:${candle.getLow()}, hi:${candle.getHigh()}, op:${candle.getOpen()}, close:${candle.getClose()}, vol:${candle.getVolume()}`);
    });
    const lastCandle = candles[0];
    const secondLastCandle = candles[1];
    //first check: the last candle is green.
    if (lastCandle.isBearish()) {
      this.logger.debug(` Last candle is not bullish, bailing out.`)
      this.orderCallback(new Order(OrderType.NO_OP, 0, 0, 0, 0));
      return;
    } 
    //second check, the last numBearishCandles are red.
    let allBearish = true;
    for (let i=1;i<this.numBearishCandles;i++) {
       allBearish = allBearish && candles[i].isBearish();
    }
    if (!allBearish) {
      this.logger.debug(` Last ${this.numBearishCandles} are not bearish, bailing out.`)
      this.orderCallback(new Order(OrderType.NO_OP, 0, 0, 0, 0));
      return;
    }
    const gap = lastCandle.getOpen() - secondLastCandle.getOpen();
    //third check: gap is positive
    if (gap < 0) {
      this.logger.debug(` Gap ${gap} is negative, bailing out.`)
      this.orderCallback(new Order(OrderType.NO_OP, 0, 0, 0, 0));
      return;
    }
    //fourth check: the ratio between the wick of the last candle and the gap between it and the previous one must be below the wickRatio parameter.
    const wick = new bigDecimal(lastCandle.getOpen() - lastCandle.getLow());
    
    const actualWickRatio = 
    

    
    

    
    /*const secondLastCandle = values[1];
    if (secondLastCandle[3] < secondLastCandle[4] // second last is 'red' (e.g. 'open' is lower than 'close')
        && lastCandle[3] > lastCandle[4] // most recent is 'green' (e.g. 'open' is higher than 'close')
        && lastCandle[1] - secondLastCandle[2] > 0 // 'low' of the last higher than the 'high' of the second last
    ) {
      this.logger.debug(' Bullish Pattern detected');
      if (this.moneyAmount > 0) { // we bet 1% of our current Money Amount
        const amountToBeBought = (this.moneyAmount / 100) * this.lastValue;
        this.orderCallback(new Order(OrderType.BUY_SELL, this.markets[0], this.lastValue, amountToBeBought, 0, 0));
      } else {
        this.orderCallback(new Order(OrderType.NO_OP, 0, 0, 0, 0));
      }
    }*/
  }

  valueCallBack(value) {
    switch (value.type) {
      case 'ticker':
        this.logger.info(`Updating price to ${value.price}`);
        this.lastValue = value.price;
        this.orderCallback(new Order(OrderType.NO_OP, 0, 0, 0, 0));
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
