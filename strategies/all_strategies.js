const { WhiteShark } = require('./candlesticks/white_shark');

const strategies = [
  new WhiteShark({ markets:['LTC-EUR'], channels:['candles-every-minute-past-10-minutes', 'ticker'] })
];

exports.strategies = strategies;
