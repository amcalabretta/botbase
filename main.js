/* eslint max-len: ["error", { "code": 160 }] */
const { Worker, BroadcastChannel } = require('worker_threads');
const log4js = require('log4js');
const { CandleGranularity, CoinbasePro } = require('coinbase-pro-node');
const { v4 } = require('uuid');
const { loadConfigurationFile } = require('./utils/loadConfigurationFile');
const { strategyMessage } = require('./workers/strategyMessage');
const { checkAvailabilities } = require('./utils/checkAvailabilities');
const { checkEnvironmentVariables } = require('./utils/checkEnvironmentVariables');
const { getCandles } = require('./utils/getCandles');
const { getAvailableFunds } = require('./utils/getAvailableFunds');
const { authentication } = require('./model/auth');

const broadCastChannel = new BroadcastChannel('botbase.broadcast');
async function main() {
  try {
    checkEnvironmentVariables(process.env);
    const botConfiguration = loadConfigurationFile(process.argv);
    log4js.configure({
      appenders: {
        main: { type: 'file', filename: `${botConfiguration.logging.logDir}/main.log` },
        candleChannelMinutePastTen: { type: 'file', filename: `${botConfiguration.logging.logDir}/channels-candles-one-min-ten-min-frame.log` },
        ticker: { type: 'file', filename: `${botConfiguration.logging.logDir}/ticker.log` },
        orders: { type: 'file', filename: `${botConfiguration.logging.logDir}/orders.log` },
      },
      categories: {
        default: { appenders: ['main'], level: 'trace' },
        candleChannelMinutePastTenCategory: { appenders: ['candleChannelMinutePastTen'], level: 'trace' },
        orders: { appenders: ['orders'], level: 'trace' },
      },
    });
    const client = new CoinbasePro(authentication);
    const mainLogger = log4js.getLogger('main');
    const candleChannelMinutePastTenLogger = log4js.getLogger('candleChannelMinutePastTenCategory');
    const allMarkets = [];
    mainLogger.info(' ***** BOTBASE STARTUP *****');
    mainLogger.info(`  Mode:${botConfiguration.main.mode}`);
    mainLogger.info('  [1] Setting strategies up:');
    botConfiguration.strategies.forEach((strategy, idx) => {
      const workerId = v4().substring(0, 8);
      mainLogger.info(`    ${idx + 1}/${botConfiguration.strategies.length} - Setting up instance for strategy ${strategy.name} id:${workerId}`);
      strategy.markets.forEach((market) => {
        if (allMarkets.indexOf(market) === -1) {
          allMarkets.push(market);
        }
      });
      const currentWorker = new Worker('./workers/strategy_worker.js', { workerData: { conf: botConfiguration, index: idx, uuid: workerId } });
      currentWorker.on('message', strategyMessage);
    });
    mainLogger.info('  [2] Getting accounts');
    const availableFunds = await getAvailableFunds(client);
    availableFunds.forEach((value, key) => {
        mainLogger.info(`    Currency:${key}, available funds:${value}`);
    });
    checkAvailabilities(availableFunds, botConfiguration);
    //mainLogger.info('  [3] Channels Setup');
    //mainLogger.info(`    Setup candlesPastTenMinutes for markets:${allMarkets}`);
    //setInterval(() => { getCandles(client, candleChannelMinutePastTenLogger, allMarkets, CandleGranularity.ONE_MINUTE, 10, broadCastChannel); }, 60000);
    mainLogger.info('  [3] Starting workers:');
    allMarkets.forEach((mkt, i) => {
      mainLogger.info(`      ${i + 1}/${allMarkets.length} - Starting market data worker for ${mkt}`);
      const marketDataWorker = new Worker('./workers/market_data_worker.js', { workerData: { conf: botConfiguration,market: mkt } });
    });
    mainLogger.info('    Market data worker:UP');
  } catch (error) {
    console.error(`Bailing out:${error.message}`);
    console.error(`Stack:${error.stack}`);
    process.exit(0);
  }
}

main();
