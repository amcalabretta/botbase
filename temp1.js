const {
    Worker, isMainThread, workerData, BroadcastChannel, MessageChannel,
  } = require('worker_threads');
  const CoinbasePro = require('coinbase-pro');
  const stringTable = require('string-table');
  const moment = require('moment');
  const log4js = require('log4js');
  const { v4 } = require('uuid');
  const { wsUrl } = require('./model/constants');
  const { strategies } = require('./strategies/all_strategies');
  const { loadConfigurationFile } = require('./utils/loadConfigurationFile');
  const { checkEnvironmentVariables } = require('./utils/checkEnvironmentVariables');
  const botConfiguration = loadConfigurationFile(process.argv);
  const tickerChannel = new BroadcastChannel('ticker');
  const candleChannel = new BroadcastChannel('candles-every-minute-past-10-minutes');
const logAppenders = {};
  const appendersName = ['main'];
  const logCategories = {};
  strategies.forEach((strategy) => {
    const identifier = v4();
    logAppenders[identifier] = { type: 'file', filename: `${botConfiguration.logging.logDir}/${strategy.name().replace(' ', '-')}-${identifier.substring(0, 8)}.log` };
    logCategories[identifier] = { appenders: [identifier], level: 'trace' };
    appendersName.push(identifier);
    strategy.markets().forEach((mkt) => {
      if (globalConfig.markets.indexOf(mkt) === -1) globalConfig.markets.push(mkt);
    });
    strategy.logger = log4js.getLogger(identifier);
    strategy.orderCallback = (order) => { port2.postMessage({ order }); };
    globalConfig.strategies.push({
      name: strategy.name(),
      type: strategy.type(),
      markets: strategy.markets().join(),
      logId: identifier,
    });
  });
  logAppenders.main = { type: 'file', filename: `${botConfiguration.logging.logDir}/main.log` };
  logCategories.main = { appenders: ['main'], level: 'trace' };
  logCategories.default = { appenders: ['main'], level: 'trace' };
  log4js.configure({
    appenders: logAppenders,
    categories: logCategories,
  });
  const mainLogger = log4js.getLogger();
  
  if (isMainThread) {
    const { port1, port2 } = new MessageChannel();
    const globalConfig = { strategies: [], markets: [] };
    checkEnvironmentVariables(process.env);
    
    const client = new CoinbasePro.AuthenticatedClient(
      process.env.apiKey,
      process.env.apiSecret,
      process.env.apiPassphrase,
    );
    mainLogger.info(`Starting up...${strategies.length} strategy(ies) loaded`);
    mainLogger.debug(`\n${stringTable.create(globalConfig.strategies)}`);
    setInterval(() => {
      client.getTime().then(
        ((t) => {
          const currentTimeStamp = moment(t.iso);
          const previousTimeStamp = moment(t.iso).subtract(10, 'minutes');
          globalConfig.markets.forEach((mkt) => {
            client.getProductHistoricRates(mkt, {
              start: previousTimeStamp.utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
              end: currentTimeStamp.utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
              granularity: 60,
            }, (err, res, marketData) => {
              if (err) mainLogger.warn('%{err}');
              candleChannel.postMessage({ type: 'candles', market: mkt, payload: marketData });
            });
          });
        }),
      );
    }, 60000);
    mainLogger.debug(`Candle channels set for markets:${globalConfig.markets}`);
    const websocket = new CoinbasePro.WebsocketClient(
      globalConfig.markets,
      wsUrl,
      {
        key: process.env.apiKey,
        secret: process.env.apiSecret,
        passphrase: process.env.apiPassphrase,
      }, { channels: [{ name: 'ticker' }] },
    );
    websocket.on('message', (data) => {
      tickerChannel.postMessage(data);
    });
    mainLogger.debug(`Ticker channel set for markets:${globalConfig.markets}`);
    port1.on('message', (message) => mainLogger.debug('received:', message));
    mainLogger.debug('Feedback channel set');
    strategies.forEach((strategy, idx) => {
      mainLogger.debug(` [${idx + 1}] Instantiating worker for ${strategy.name()} - ${strategy.type()}, logger:${globalConfig.strategies[idx].logId}`);
      new Worker(__filename, { workerData: { strategy: idx } });
    });
  } else {
    const actualStrategy = strategies[workerData.strategy];
    if (actualStrategy.channels.indexOf('ticker') !== -1) {
      tickerChannel.onmessage = (event) => {
        if (event.data.type === 'ticker') {
          actualStrategy.ticker(event.data.price);
        }
      };
    }
    if (actualStrategy.channels.indexOf('candles-every-minute-past-10-minutes') !== -1) {
      candleChannel.onmessage = (event) => {
        actualStrategy.candles(event.data.payload);
      };
    }
  }
  
