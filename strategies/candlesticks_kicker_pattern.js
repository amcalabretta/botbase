/**
 * Candlestick strategy, detects the bullish and bearish pattern
 * based on those conditions:
 *
 *  1. The pattern starts with a bearish (red/black) candle
 *  2. The second candle gaps to the upside, and opens above the previous day’s close.
 *      It continues straight up and ends as a bullish candlestick.
 *  3. The gap should not be filled by the wick of the second candlestick,
 *      but be left untouched.
 *      In other words, the candlestick has a tiny or nonexisting lower wick.
 * CandleStick strategy, it's based on detecting the bearish and bullish patterns and act
 * accordingly in selling/buying.
 * https://github.com/cm45t3r/candlestick
 * or
 * https://github.com/anandanand84/technicalindicators
 *
 * Another one that might be interesting:
 * https://github.com/ttezel/nn
 *
 * Or this:
 * https://www.altcointrading.net/ichimoku-cloud/
 *
 * Another technical indicator
 * https://canvasjs.com/javascript-stockcharts/stockchart-annotation-indexlabel/
 *
 * this is for thefront end
 * https://github.com/Mobius1/Vanilla-DataTables
 *
 *
 * to log:
 * https://www.npmjs.com/package/log4js
*/
const cs = require('candlestick');
const moment = require('moment');
const { isBullishKicker, isBearishKicker } = require('candlestick');
const { OrderType } = require('../model/constants');
const { Order } = require('../model/order');

class KickerPatternCandleStickStrategy {
  constructor(conf) {
    this.mkts = conf.markets;
    this.channels = conf.channels;
    this.cryptoAmounts = conf.cryptoAmounts;
    this.moneyAmounts = conf.moneyAmounts;
    this.orderCallback = (order) => { console.log(`${JSON.stringify(order)}`); };
  }

  candles(value) {
    console.log(' Received candles ');
    // console.log(`CB:${JSON.stringify(value)}`);
    // [ time, low, high, open, close, volume ]
    const candleStickObjs = value.map((coinBaseCandle) => ({
      security: 'kandlestick',
      date: moment.unix(coinBaseCandle[0]).format('DD/MM/YYYY@HH:mm:00'),
      open: coinBaseCandle[3],
      high: coinBaseCandle[2],
      low: coinBaseCandle[1],
      close: coinBaseCandle[4],
    }));
    const bullish = cs.isBullishKicker(candleStickObjs[1], candleStickObjs[0]);
    const bearish = cs.isBearishKicker(candleStickObjs[1], candleStickObjs[0]);
    if (bullish) console.log(' - Bullish');
    else if (bearish) console.log(' - Bearish');
    else console.log(' - None');
    this.orderCallback(new Order(OrderType.NO_OP, 0, 0, 0, 0));
  }

  ticker(value) {}

  type() {
    return 'KickerPatternCandleStick';
  }

  name() {
    return 'White Shark';
  }

  markets() {
    return this.mkts;
  }
}

exports.KickerPatternCandleStickStrategy = KickerPatternCandleStickStrategy;
