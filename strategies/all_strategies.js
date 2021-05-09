const KickerPatternCandleStickStrategy = require('./candlesticks_kicker_pattern').KickerPatternCandleStickStrategy;

const strategies=[
    new KickerPatternCandleStickStrategy()
];

exports.strategies = strategies;