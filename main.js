const {
  Worker, isMainThread, workerData, BroadcastChannel, MessageChannel,
} = require('worker_threads');
const log4js = require('log4js');
const { loadConfigurationFile } = require('./utils/loadConfigurationFile');
const { checkEnvironmentVariables } = require('./utils/checkEnvironmentVariables');
const CoinbasePro = require('coinbase-pro');
const moment = require('moment');
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
      ticker: { type: 'file', filename: `${botConfiguration.logging.logDir}/ticker.log` }
    },
    categories: {
      default:{appenders:['main'],level:'trace'},
      candleChannelMinutePastTenCategory: { appenders: ['candleChannelMinutePastTen'], level: 'trace' }
    },
  });
  const mainLogger = log4js.getLogger('main');
  const candleChannelMinutePastTenLogger = log4js.getLogger('candleChannelMinutePastTenCategory');
  let allMarkets = [];
  botConfiguration.strategies.forEach((strategy, idx) => {
    mainLogger.info(` Setting up instance for strategy ${strategy.name}`);
    strategy.markets.forEach((market)=>{
       if (allMarkets.indexOf(market) === -1) {
            mainLogger.info(`Adding market ${market} to the main engine`);
            allMarkets.push(market);
       }
    });
    new Worker('./worker.js', { workerData: { conf: botConfiguration, index: idx } });
  });
  mainLogger.info('Setting up the channels');
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
              mainLogger.info(` - Candles 10 mins:${marketData}`);
              broadCastChannel.postMessage({ type: 'candlesPastTenMinutes', market: mkt, payload: marketData });
            }
          });
        });
      }),
    );
  }, 60000);
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
} catch (error) {
  console.error(`${error.message}`);
}