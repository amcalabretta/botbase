/* eslint max-len: ["error", { "code": 150 }] */
const { Worker, BroadcastChannel } = require('worker_threads');
const log4js = require('log4js');
const CoinbasePro = require('coinbase-pro');
const moment = require('moment');
const { v4 } = require('uuid');
const Table = require('easy-table');
const { loadConfigurationFile } = require('./utils/loadConfigurationFile');
const { checkAvailabilities } = require('./utils/checkAvailabilities');
const { checkEnvironmentVariables } = require('./utils/checkEnvironmentVariables');
const {
  wsUrl, restApiUrl, restApiUrlSndBox, wsUrlSndBox
} = require('./model/constants');

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
    const availableFunds = new Map();
    const mainLogger = log4js.getLogger('main');
    const orderLogger = log4js.getLogger('orders');
    const allMarkets = [];
    const client = new CoinbasePro.AuthenticatedClient(
      process.env.apiKey,
      process.env.apiSecret,
      process.env.apiPassphrase,
      botConfiguration.main.env === 'prod' ? restApiUrl : restApiUrlSndBox
    );
    mainLogger.info(' ***** BOTBASE STARTUP *****');
    mainLogger.info(`  Environment:${botConfiguration.main.env}`);
    mainLogger.info('  [1] Setting strategies up:');
    botConfiguration.strategies.forEach((strategy, idx) => {
      const workerId = v4().substring(0, 8);
      mainLogger.info(`    ${idx + 1}/${botConfiguration.strategies.length} - 
                     Setting up instance for strategy ${strategy.name} id:${workerId}`);
      strategy.markets.forEach((market) => {
        if (allMarkets.indexOf(market) === -1) {
          allMarkets.push(market);
        }
      });
      const currentWorker = new Worker('./worker.js', { workerData: { conf: botConfiguration, index: idx, uuid: workerId } });
      currentWorker.on('message', (incoming) => {
        // const payload = JSON.parse(`${incoming}`);
        orderLogger.info(`Change Strategy ID:${incoming.strategyId}, Order type:${incoming.order.type}`);

        // Limit order (buy)
        const params = {
          type: 'limit',
          side: 'buy',
          price: '75.00', // USD
          size: '1', // BTC
          product_id: 'BTC-USD',
        };

        /* const params = {
          type: 'market',
          side: 'buy',
          size: '1', // BTC
          product_id: 'BTC-USD',
        }; */

        client.placeOrder(params, (error, response) => {
          const { statusCode } = response;
          const responseBody = JSON.parse(response.body);
          const { id } = responseBody;
          orderLogger.info(`Status code:${statusCode}`);
          orderLogger.info(`Id :${id}`);
          if (orders[incoming.strategyId]) {
            orderLogger.info(`Pushing the order on the strategy ${incoming.strategyId}`);
            orders[incoming.strategyId].push(responseBody);
          } else {
            orderLogger.info(`Initializing orders on the strategy ${incoming.strategyId}`);
            orders[incoming.strategyId] = Array(10).fill(responseBody);
          }
          orderLogger.info(`order placed ${JSON.stringify(responseBody)}`);
        });
      });
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
          candleChannelMinutePastTenLogger.info(`Current: ${currentTimeStamp.utc().format('YYYY-MM-DDTHH:mm:00')}`);
          candleChannelMinutePastTenLogger.info(`Previous: ${previousTimeStamp.utc().format('YYYY-MM-DDTHH:mm:00')}`);
          allMarkets.forEach((mkt) => {
            client.getProductHistoricRates(mkt, {
              start: previousTimeStamp.utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
              end: currentTimeStamp.utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
              granularity: 60,
            }, (err, res, marketData) => {
              if (err) {
                mainLogger.warn('%{err}');
              } else {
                const t = new Table();
                marketData.forEach((m) => {
                  t.cell('Timestamp', moment.unix(m[0]).utc().format('DD/MM/YYYY@HH:mm:00'));
                  t.cell('Low', m[1], Table.number(3));
                  t.cell('High', m[2], Table.number(3));
                  t.cell('Open', m[3], Table.number(3));
                  t.cell('Close', m[4], Table.number(3));
                  t.cell('Volume', m[5], Table.number(3));
                  t.cell('Raw TS', m[0]);
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
      botConfiguration.main.env === 'prod' ? wsUrl : wsUrlSndBox,
      {
        key: process.env.apiKey,
        secret: process.env.apiSecret,
        passphrase: process.env.apiPassphrase,
      }, { channels: [{ name: 'ticker' }, { name:'orders' }] }
    );
    websocket.on('message', (data) => {
      mainLogger.info(`${JSON.stringify(data)}`);
      broadCastChannel.postMessage(data);
    });
    mainLogger.info(`    Setup ticker for markets:${allMarkets}`);
  } catch (error) {
    console.error(`${error.message}`);
    process.exit(0);
  }
}

main();
