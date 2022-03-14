const { Worker, BroadcastChannel } = require('worker_threads');
const log4js = require('log4js');
const CoinbasePro = require('coinbase-pro');
const moment = require('moment');
const { v4 } = require('uuid');
const Table = require('easy-table');
const { loadConfigurationFile } = require('./utils/loadConfigurationFile');
const { checkAvailabilities } = require('./utils/checkAvailabilities');
const { checkEnvironmentVariables } = require('./utils/checkEnvironmentVariables');
const { wsUrl } = require('./model/constants');
const { BigDecimal } = require('./model/bigdecimal');

const broadCastChannel = new BroadcastChannel('botbase.broadcast');

async function main() {
  try {
    checkEnvironmentVariables(process.env);
    const botConfiguration = loadConfigurationFile(process.argv);
    const client = new CoinbasePro.AuthenticatedClient(
      process.env.apiKey,
      process.env.apiSecret,
      process.env.apiPassphrase,
    );
    log4js.configure({
      appenders: {
        main: { type: 'file', filename: `${botConfiguration.logging.logDir}/main.log` },
        candleChannelMinutePastTen: { type: 'file', filename: `${botConfiguration.logging.logDir}/channels-candles-every-minute-past-10-minutes.log` },
        ticker: { type: 'file', filename: `${botConfiguration.logging.logDir}/ticker.log` },
        orders: { type: 'file', filename: `${botConfiguration.logging.logDir}/orders.log` },
      },
      categories: {
        default: { appenders: ['main'], level: 'trace' },
        candleChannelMinutePastTenCategory: { appenders: ['candleChannelMinutePastTen'], level: 'trace' },
        orders: { appenders: ['orders'], level: 'trace' },
      },
    });
    const availableFunds = new Map();
    const mainLogger = log4js.getLogger('main');
    const allMarkets = [];
    mainLogger.info(' ***** BOTBASE STARTUP *****');
    mainLogger.info('  [1] Setting strategies up:');
    botConfiguration.strategies.forEach((strategy, idx) => {
      const workerId = v4().substring(0, 8);
      mainLogger.info(`    ${idx + 1}/${botConfiguration.strategies.length} - Setting up instance for strategy ${strategy.name} id:${workerId}`);
      strategy.markets.forEach((market) => {
        if (allMarkets.indexOf(market) === -1) {
          allMarkets.push(market);
        }
      });
      const currentWorker = new Worker('./worker.js', { workerData: { conf: botConfiguration, index: idx, uuid: workerId } });
    });
    const candleChannelMinutePastTenLogger = log4js.getLogger('candleChannelMinutePastTenCategory');
    mainLogger.info('  [2] Getting accounts');
    const accounts = await client.getAccounts();
    accounts.forEach((account) => {
      if (account.balance > 0) {
        mainLogger.info(`    Currency: ${account.currency}  Balance: ${account.balance} Available: ${account.available}`);
        availableFunds.set(account.currency, account.available);
      }
    });
    checkAvailabilities(availableFunds, botConfiguration);
    mainLogger.info('  [3] Channels Setup');
    setInterval(() => {
      client.getTime().then(
        ((t) => {
          const currentTimeStamp = moment(t.iso);
          const previousTimeStamp = moment(t.iso).subtract(10, 'minutes');
          candleChannelMinutePastTenLogger.info(`Current: ${currentTimeStamp.utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]')}`);  
          candleChannelMinutePastTenLogger.info(`Previous: ${previousTimeStamp.utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]')}`);
          allMarkets.forEach((mkt) => {
            client.getProductHistoricRates(mkt, {
              start: previousTimeStamp.utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
              end: currentTimeStamp.utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
              granularity: 60,
            }, (err, res, marketData) => {
              if (err) {
                mainLogger.warn('%{err}');
              } else {
                var t = new Table();
                marketData.forEach(m=>{
                  t.cell('Timestamp', moment.unix(m[0]).utc().format('DD/MM/YYYY@HH:mm:00'));
                  t.cell('Low', (new BigDecimal(m[1])).getValue());
                  t.cell('High', (new BigDecimal(m[2])).getValue());
                  t.cell('Open', (new BigDecimal(m[3])).getValue());
                  t.cell('Close', (new BigDecimal(m[4])).getValue());
                  t.cell('Volume', (new BigDecimal(m[5])).getValue());
                  t.newRow();
                });  
                candleChannelMinutePastTenLogger.info(`${mkt} - \n ${t.toString()}`);
                broadCastChannel.postMessage({ type: 'candlesPastTenMinutes', market: mkt, payload: marketData });
              }
            });
          });
        }),
      );
    }, 60000);

    mainLogger.info(`    Setup candlesPastTenMinutes for markets:${allMarkets}`);
    const websocket = new CoinbasePro.WebsocketClient(
      allMarkets,
      wsUrl,
      {
        key: process.env.apiKey,
        secret: process.env.apiSecret,
        passphrase: process.env.apiPassphrase,
      }, { channels: [{ name: 'ticker' }] },
    );
    websocket.on('message', (data) => {
      broadCastChannel.postMessage(data);
    });
    mainLogger.info(`    Setup ticker for markets:${allMarkets}`);
  } catch (error) {
    console.error(`${error.message}`);
    process.exit(0);
  }
}

main();
