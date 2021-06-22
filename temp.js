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
  
  try {
    
    if (isMainThread) {
      checkEnvironmentVariables(process.env);
      const appConfiguration = loadConfigurationFile(process.argv);
      const client = new CoinbasePro.AuthenticatedClient(
        process.env.apiKey,
        process.env.apiSecret,
        process.env.apiPassphrase,
      );
      const { port1, port2 } = new MessageChannel();
      const tickerChannel = new BroadcastChannel('ticker');
      const candleChannel = new BroadcastChannel('candles-every-minute-past-10-minutes');
      const logAppenders = {};
      const appendersName = ['main'];
      const logCategories = {};
      // logging configuration
      strategies.forEach((strategy) => {
        const identifier = v4();
        logAppenders[identifier] = { type: 'file', filename: `./logs/${strategy.name().replace(' ', '-')}-${identifier}.log` };
        logCategories[identifier] = { appenders: [identifier], level: 'trace' };
        appendersName.push(identifier);
        //console.log(` Strategy: ${strategy.name()}, logId:${identifier}`);
      });
      logCategories.default = { appenders: appendersName, level: 'error' };
      logAppenders.main = { type: 'file', filename: './logs/main.log' };
      log4js.configure({
        appenders: logAppenders,
        categories: logCategories,
      });
      const mainLogger = log4js.getLogger('main');
      mainLogger.debug(`Starting up...${strategies.length} strategy(ies) loaded`);
      const globalConfig = { strategies: [], markets: [] };
      strategies.forEach((strategy) => {
        strategy.markets().forEach((mkt) => {
          if (globalConfig.markets.indexOf(mkt) === -1) globalConfig.markets.push(mkt);
        });
        globalConfig.strategies.push({
          name: strategy.name(),
          type: strategy.type(),
          markets: strategy.markets().join(),
        });
      });
      // mainLogger.debug(`${stringTable.create(globalConfig.strategies)}`);
      // get every minute the market data of the previous 10 minutes
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
                if (err) console.log('%{err}');
                candleChannel.postMessage({ type: 'candles', market: mkt, payload: marketData });
              });
            });
          }),
        );
      }, 60000);
      strategies.forEach((strategy, idx) => {
        mainLogger.debug(` [${idx + 1}] Instantiating worker for ${strategy.name()} - ${strategy.type()}`);
        const identifier = v4();
        logAppenders[identifier] = { type: 'file', filename: `./logs/${strategy.name().replace(' ', '-')}-${identifier}.log` };
        appendersName.push(identifier);
        strategy.orderCallback = (order) => { port2.postMessage({ order }); };
        new Worker(__filename, { workerData: { strategy: idx, logId: identifier } });
      });
      console.log(`${JSON.stringify(logAppenders, null, 2)}`);
      console.log(`${appendersName}`);
      appendersName.forEach((n) => {
        console.log(` getting appender ${n}`);
        const logger = log4js.getLogger(n);
        logger.trace('Entering cheese testing');
        logger.debug('Got cheese.');
        logger.info('Cheese is Comté.');
        logger.warn('Cheese is quite smelly.');
        logger.error('Cheese is too ripe!');
        logger.fatal('Cheese was breeding ground for listeria.');
      });
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
      port1.on('message', (message) => console.log('received:', message));
    } else {
      const actualStrategy = strategies[workerData.strategy];
      // mainLogger.debug(`Worker instantiated for ${actualStrategy.name()}`);
      console.log(`${JSON.stringify(log4js.getLogger(workerData.logId))}`);
      log4js.getLogger(workerData.logId).debug('hello');
      actualStrategy.logger = log4js.getLogger(workerData.logId);
      // actualStrategy.logger.level = 'debug';
      // actualStrategy.logger.type = 'file';
      // actualStrategy.logger.filename = './logs/fff.log';
  
      if (actualStrategy.channels.indexOf('ticker') !== -1) {
        tickerChannel.onmessage = (event) => {
          if (event.data.type === 'ticker') {
            actualStrategy.ticker(event.data.price);
          }
        };
        // mainLogger.debug(' - Subscribed to ticker channel');
      }
      if (actualStrategy.channels.indexOf('candles-every-minute-past-10-minutes') !== -1) {
        candleChannel.onmessage = (event) => {
          actualStrategy.candles(event.data.payload);
        };
        // mainLogger.debug(' - Subscribed to channel candles-minute-10');
      }
    }
  } catch (Error) {
    console.error(`${Error}`);
  }
  