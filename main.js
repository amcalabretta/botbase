const {
  Worker, isMainThread, workerData, BroadcastChannel, MessageChannel,
} = require('worker_threads');
const ContainerBuilder = require('node-dependency-injection');
const log4js = require('log4js');
const { loadConfigurationFile } = require('./utils/loadConfigurationFile');
const { checkEnvironmentVariables } = require('./utils/checkEnvironmentVariables');

checkEnvironmentVariables(process.env);
const botConfiguration = loadConfigurationFile(process.argv);
log4js.configure({
  appenders: { main: { type: 'file', filename: `${botConfiguration.logging.logDir}/main.log` } },
  categories: { default: { appenders: ['main'], level: 'trace' } },
});
const mainLogger = log4js.getLogger('main');
botConfiguration.strategies.forEach((strategy, idx) => {
  // mainLogger.info(` Starting worker for strategy ${strategy.name()}`);
  new Worker('./worker.js', { workerData: { conf: botConfiguration, index: idx } });
});
