const log4js = require('log4js');
const {
  workerData, BroadcastChannel, parentPort
} = require('worker_threads');
const { strategyFactory } = require('../utils/loadAllStrategies');

const broadCastChannel = new BroadcastChannel('botbase.broadcast');

const strategyName = workerData.conf.strategies[workerData.index].name;
const strategyUUid = workerData.uuid;
log4js.configure({
  appenders: { local: { type: 'file', filename: `${workerData.conf.logging.logDir}/${strategyName.replace(' ', '-')}-${strategyUUid}.log` } },
  categories: { default: { appenders: ['local'], level: `debug` } }
});
const localLogger = log4js.getLogger();
const allowedMessageType = ['ticker', 'candlesPastTenMinutes'];
try {
  localLogger.info(` Starting worker for ${strategyName}  /  ${strategyUUid}`);
  const strategy = strategyFactory(workerData.conf.strategies[workerData.index]);
  strategy.logger = localLogger;
  strategy.orderCallback = (order, reason) => {
    parentPort.postMessage({ strategyId:strategyUUid, order, reason });
  };
  broadCastChannel.onmessage = (event) => {
    if (allowedMessageType.includes(event.data.type)) {
      strategy.valueCallBack(event.data);
    }
  };
} catch (error) {
  localLogger.error(` Worker Error:${error.message}**${JSON.stringify(error)}`);
}
