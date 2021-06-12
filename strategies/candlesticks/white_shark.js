/**
* Candlestick strategy, detects the bullish pattern
 * based on those conditions:
 *
 *  1. The pattern starts with a bearish (red/black) candle
 *  2. The second candle gaps to the upside, and opens above the previous day’s close.
 *      It continues straight up and ends as a bullish candlestick.
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
const moment = require('moment');
const { OrderType } = require('../../model/constants');
const { Order } = require('../../model/order');

class WhiteShark {
  constructor(conf) {
    this.mkts = conf.markets;
    this.channels = conf.channels;
    this.cryptoAmounts = conf.cryptoAmounts;
    this.moneyAmounts = conf.moneyAmounts;
    this.lastValue = 0.00;
    this.numCandles = conf.numCandles;
    this.orderCallback = (order) => { console.log(`${JSON.stringify(order)}`); };
    this.type = 'CandleStick';
    this.name = 'White Shark';
  }

  // format of the single candle: [ time, low, high, open, close, volume ]
  candles(values) {
    console.log(' Received candles ');
    values.array.forEach((el) => {
      console.log(`Ts:${moment.unix(el[0]).format('DD/MM/YYYY@HH:mm:00')}, 
                   lo:${el[1]}, hi:${el[2]}, op:${el[4]}, close:${el[5]}, vol:${el[6]}`);
    });
    const lastCandle = values[0];
    const secondLastCandle = values[1];
    if (secondLastCandle[3] < secondLastCandle[4] // second last is 'red' (e.g. 'open' is lower than 'close')
        && lastCandle[3] > lastCandle[4] // most recent is 'green' (e.g. 'open' is higher than 'close')
        && lastCandle[1] - secondLastCandle[2] > 0 // 'low' of the last higher than the 'high' of the second last
    ) {
      this.orderCallback(new Order(OrderType.NO_OP, 0, 0, 0, 0));
    }
  }

  ticker(value) {
    this.lastValue = value;
  }

  type() {
    return this.type;
  }

  name() {
    return this.name;
  }

  markets() {
    return this.mkts;
  }
}

exports.WhiteShark = WhiteShark;