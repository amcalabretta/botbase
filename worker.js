const {
  workerData, BroadcastChannel, parentPort
} = require('worker_threads');
const { strategyFactory } = require('./utils/loadAllStrategies');

const broadCastChannel = new BroadcastChannel('botbase.broadcast');
const log4js = require('log4js');

const strategyName = workerData.conf.strategies[workerData.index].name;
const strategyUUid = workerData.uuid;
log4js.configure({
  appenders: { local: { type: 'file', filename: `${workerData.conf.logging.logDir}/${strategyName.replace(' ', '-')}-${strategyUUid}.log` } },
  categories: { default: { appenders: ['local'], level: `${workerData.conf.logging.logLevel}` } }
});
const localLogger = log4js.getLogger();
const allowedMessageType = ['ticker', 'candlesPastTenMinutes'];
try {
  localLogger.info(` Starting worker for ${strategyName}  /  ${strategyUUid}`);
  const strategy = strategyFactory(workerData.conf.strategies[workerData.index]);
  strategy.logger = localLogger;
  strategy.orderCallback = (order) => { parentPort.postMessage({ strategyId:strategyUUid, order }); };
  broadCastChannel.onmessage = (event) => {
    if (allowedMessageType.includes(event.data.type)) {
      strategy.valueCallBack(event.data);
    }
  };
} catch (error) {
  // const payload = JSON.parse(`${ error }`);
  localLogger.error(` Worker Error:${error.message}**${JSON.stringify(error)}`);
}
