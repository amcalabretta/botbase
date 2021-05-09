const KickerPatternCandleStickStrategy = require('./candlesticks_kicker_pattern').KickerPatternCandleStickStrategy;

const strategies=[
    new KickerPatternCandleStickStrategy({tickInSeconds:60,market:'LTC-EUR'})//1 minute tick
];

exports.strategies = strategies;