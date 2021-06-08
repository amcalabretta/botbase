const KickerPatternCandleStickStrategy = require('./candlesticks_kicker_pattern').KickerPatternCandleStickStrategy;

const strategies=[
    new KickerPatternCandleStickStrategy({markets:['LTC-EUR'],channels:['candles-every-minute-past-10-minutes']})
];

exports.strategies = strategies;