const  { WhiteShark } = require('../strategies/candlesticks/white_shark');

const strategyFactory = (conf) => {
  switch (conf.name) {
    case 'White Shark': return new WhiteShark(conf);
    default: throw new Error(`Strategy ${conf.name} not existing`);
  }
};

exports.strategyFactory = strategyFactory;
