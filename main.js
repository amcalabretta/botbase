const { BroadcastChannel } = require('worker_threads');
const log4js = require('log4js');
const CoinbasePro = require('coinbase-pro');
const moment = require('moment');
const { loadConfigurationFile } = require('./utils/loadConfigurationFile');
const { checkAvailabilities } = require('./utils/checkAvailabilities');
const { checkEnvironmentVariables } = require('./utils/checkEnvironmentVariables');
const { wsUrl } = require('./model/constants');

const broadCastChannel = new BroadcastChannel('botbase.broadcast');

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
  const candleChannelMinutePastTenLogger = log4js.getLogger('candleChannelMinutePastTenCategory');
  mainLogger.info(' ***** BOTBASE STARTUP *****');
  mainLogger.info('  Getting accounts');
  client.getAccounts((err, payload) => {
    if (err) throw new Error(`Cannot retrieve accounts:${err}`);
    const accounts = JSON.parse(payload.body);
    mainLogger.info(`  Accounts:${accounts.length}`);
    accounts.forEach((account) => {
      mainLogger.info(`   Currency: ${account.currency}  Balance: ${account.balance} Available: ${account.available}`);
      availableFunds.set(account.currency, account.available);
    });
    checkAvailabilities(availableFunds, botConfiguration);
    mainLogger.info('  Channels Setup');
    setInterval(() => {
      client.getTime().then(
        ((t) => {
          const currentTimeStamp = moment(t.iso);
          const previousTimeStamp = moment(t.iso).subtract(10, 'minutes');
          allMarkets.forEach((mkt) => {
            client.getProductHistoricRates(mkt, {
              start: previousTimeStamp.utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
              end: currentTimeStamp.utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
              granularity: 60,
            }, (err, res, marketData) => {
              if (err) {
                mainLogger.warn('%{err}');
              } else {
                candleChannelMinutePastTenLogger.info(`${marketData}`);
                broadCastChannel.postMessage({ type: 'candlesPastTenMinutes', market: mkt, payload: marketData });
              }
            });
          });
        }),
      );
    }, 60000);
    mainLogger.info(` - [Done] Setup candlesPastTenMinutes for markets:${allMarkets}`);
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
    mainLogger.info(` - [Done] Setup ticker for markets:${allMarkets}`);
  });
} catch (error) {
  console.error(`${error.message}`);
  process.exit(0);
}
