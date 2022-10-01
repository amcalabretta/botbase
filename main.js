/* eslint max-len: ["error", { "code": 150 }] */
const { Worker, BroadcastChannel } = require('worker_threads');
const log4js = require('log4js');
const {Candle,CandleGranularity, CoinbasePro, ProductEvent,WebSocketChannelName,WebSocketEvent } = require('coinbase-pro-node');
const moment = require('moment');
const { v4 } = require('uuid');
const Table = require('easy-table');
const { loadConfigurationFile } = require('./utils/loadConfigurationFile');
const { strategyMessage } = require('./workers/strategyMessage');
const { checkAvailabilities } = require('./utils/checkAvailabilities');
const { checkEnvironmentVariables } = require('./utils/checkEnvironmentVariables');
const {getCandles} = require('./utils/getCandles');
const {authentication} = require('./model/auth');
const broadCastChannel = new BroadcastChannel('botbase.broadcast');
const orders = {};
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
    const availableFunds = new Map();
    const mainLogger = log4js.getLogger('main');
    const orderLogger = log4js.getLogger('orders');
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
      const currentWorker = new Worker('./workers/worker.js', { workerData: { conf: botConfiguration, index: idx, uuid: workerId } });
      //currentWorker.on('message', strategyMessage);
    });  
    mainLogger.info('  [2] Getting accounts');
    const accounts = await client.rest.account.listAccounts();
    accounts.forEach((account) => {
      if (account.balance > 0) {
        mainLogger.info(`    Currency: ${account.currency}  Balance: ${account.balance} Available: ${account.available}`);
        availableFunds.set(account.currency, account.available);
      }
    });
    checkAvailabilities(availableFunds, botConfiguration);
    mainLogger.info('  [3] Channels Setup');
    mainLogger.info(`    Setup candlesPastTenMinutes for markets:${allMarkets}`);
    setInterval( ()=> { getCandles(client, candleChannelMinutePastTenLogger,allMarkets,CandleGranularity.ONE_MINUTE,10); }, 60000 );
    const productId = 'BTC-USD';
    const begin = '2020-04-11T00:00:00.000Z';
    const end = '2020-04-11T10:00:00.000Z';
    const granularity = CandleGranularity.ONE_MINUTE;
    const candles = await client.rest.product.getCandles(productId, {
      end,
      granularity,
      start: begin,
    });
    //console.log(`done: ${JSON.stringify(candles)}`);
  } catch (error) {
    console.error(`${error.message}`);
    process.exit(0);
  }
}

main();
