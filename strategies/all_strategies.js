const KickerPatternCandleStickStrategy = require('./candlesticks_kicker_pattern').KickerPatternCandleStickStrategy;

const strategies=[
    new KickerPatternCandleStickStrategy({markets:['LTC-EUR'],channels:['candles-minute-10']})
];

exports.strategies = strategies;