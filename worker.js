const {
  Worker, isMainThread, workerData, BroadcastChannel, MessageChannel,
} = require('worker_threads');
const {strategyFactory} = require('./utils/loadAllStrategies');
const broadCastChannel = new BroadcastChannel('botbase.broadcast', {
  type: 'node',
  webWorkerSupport: true
});
const { v4 } = require('uuid');
const identifier = v4();
const log4js = require('log4js');
const strategyName = workerData.conf.strategies[workerData.index].name;
log4js.configure({
  appenders: { local: { type: 'file', filename: `${workerData.conf.logging.logDir}/${strategyName.replace(' ', '-')}-${identifier.substring(0, 8)}.log` } },
  categories: { default: { appenders: ['local'], level: 'trace' } },
});
const localLogger = log4js.getLogger();
localLogger.info(` Starting worker for ${strategyName}`);
localLogger.info(` Configuration ${JSON.stringify(workerData.conf.strategies[workerData.index])}`);
//localLogger.info(` - Markets:${workerData.conf.strategies[workerData.index].markets}`);
//localLogger.info(` - Cryptos:${workerData.conf.strategies[workerData.index].cryptoAmounts}`);
//localLogger.info(` - Liquidity:${workerData.conf.strategies[workerData.index].moneyAmount}`);
const strategy = strategyFactory(workerData.conf.strategies[workerData.index])
strategy.logger = localLogger;

broadCastChannel.onmessage = (event) => {
  strategy.valueCallBack(event);
};
