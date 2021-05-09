const KickerPatternCandleStickStrategy = require('./candlesticks_kicker_pattern').KickerPatternCandleStickStrategy;

const strategies=[
    new KickerPatternCandleStickStrategy({tickMs:60000,market:'LTC-EUR'})//1 minute tick
];

exports.strategies = strategies;