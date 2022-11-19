/* eslint max-len: ["error", { "code": 120 }] */
/**
 * This worker polls coinbase for market data, share the marketes with:
 *
 * https://stackoverflow.com/questions/21892985/is-there-any-way-to-share-variables-between-multiple-workers-in-nodejs
 *
 * or
 *
 * https://nodejs.org/api/worker_threads.html#workershare_env
 */

const log4js = require('log4js');
const moment = require('moment');
const cron = require('node-cron');
const _printf = require('printf');

const {
  CandleGranularity, CoinbasePro, WebSocketChannelName, WebSocketEvent
} = require('coinbase-pro-node');

const {
  workerData, BroadcastChannel
} = require('worker_threads');
const serializeCandles = require('../utils/serializeCandles');
const { authentication } = require('../model/auth');
const { MarketData } = require('../model/MarketData');
const { performanceFactory } = require('../performance/performanceFactory');

/** Websocket channels */
const wsChannels = [
  {
    name: WebSocketChannelName.TICKER,
    product_ids: [workerData.market],
  },
  {
    name: WebSocketChannelName.HEARTBEAT,
    product_ids: [workerData.market],
  },
  {
    name: WebSocketChannelName.FULL,
    product_ids: [workerData.market],
  },

  {
    name: WebSocketChannelName.LEVEL2,
    product_ids: [workerData.market],
  },
];

const broadCastChannel = new BroadcastChannel('botbase.broadcast');

// TODO: try to generalise this function, maybe a constant for 'INFO' etc to be passed before 'format'?
const log = (format, ...args) => log4js.getLogger().info(_printf(format, ...args));

const scheduler = (marketData, performanceMeasure) => {
  cron.schedule('* * * * *', () => performanceMeasure.log());
};

log4js.configure({
  appenders: {
    local: {
      type: 'file',
      filename: `${workerData.conf.logging.logDir}/marketdata-worker-${workerData.market}.log`,
      layout: {
        type: 'pattern',
        pattern: '[%d{yyyy-MM-ddThh.mm.ss}] - %m'
      },
      maxLogSize: 104856,
      backups: 3,
      compress: true
    },
    ticker: { type: 'file', filename: `${workerData.conf.logging.logDir}/ticker.log` },
    md: {
      type: 'file',
      filename: `${workerData.conf.logging.logDir}/marketdata-${workerData.market}.log`,
      layout: {
        type: 'pattern',
        pattern: '[%d{yyyy-MM-ddThh.mm.ss}] - %m'
      }
    },
    perf: {
      type: 'file',
      filename: `${workerData.conf.logging.logDir}/marketdata-worker-${workerData.market}-performance.log`,
      layout: {
        type: 'pattern',
        pattern: '[%d{yyyy-MM-ddThh.mm.ss}] - %m'
      }
    },
  },
  categories: {
    default: { appenders: ['local'], level: 'debug' },
    md: { appenders: ['md'], level: 'debug' },
    perf: { appenders: ['perf'], level: 'debug' },
  }
});

const performanceMeasure = performanceFactory(workerData.conf, `market.data.worker.${workerData.market}`);
performanceMeasure.logger = log4js.getLogger('perf');

async function run() {
  const md = new MarketData(workerData.market, log4js.getLogger('md'));
  log(`Starting up market data worker, market:${workerData.market}`);
  const client = new CoinbasePro(authentication);
  setTimeout(() => {
    setInterval(async (market) => {
      const time = await client.rest.time.getTime();
      const currentTimeStamp = moment(time.iso);
      const previousTimeStamp = moment(time.iso).subtract(10, 'minutes');
      client.rest.product.getCandles(market, {
        end: currentTimeStamp.utc().format('YYYY-MM-DDTHH:mm:00.000Z'),
        CandleGranularity,
        start: previousTimeStamp.utc().format('YYYY-MM-DDTHH:mm:00.000Z')
      }).then((candles) => {
        log4js.getLogger().info(`${market} (${candles.length})\n ${serializeCandles(candles)}`);
        broadCastChannel.postMessage({ type: 'candlesPastTenMinutes', market, payload: candles });
      }).catch((error) => log4js.getLogger().error(`Error:${error}`));
    }, 60000, workerData.market);
  }, 1000);
  client.ws.on(WebSocketEvent.ON_MESSAGE, (message) => {
    performanceMeasure.start();
    // log4js.getLogger().info(`--- \n:${JSON.stringify(message, null, 2)}\n`);
    switch (message.type) {
      case 'heartbeat':
        md.heartBit(message);
        break;
      case 'received':
        md.orderReceived(message);
        break;
      case 'done':
        md.orderDone(message);
        break;
      case 'open':
        md.orderOpen(message);
        break;
      default:
      // log4js.getLogger().info(`Unknown type:${message.type}`);
    }
    performanceMeasure.end();
  });

  client.ws.on(WebSocketEvent.ON_MESSAGE_ERROR, (errorMessage) => {
    throw new Error(`${errorMessage.message}: ${errorMessage.reason}`);
  });

  client.ws.on(WebSocketEvent.ON_OPEN, async () => {
    wsChannels.forEach((wsChannel) => {
      log4js.getLogger().info(`Subscribing to ${wsChannel.name}`);
      client.ws.subscribe(wsChannel);
    });
  });
  client.ws.connect();
  scheduler(md, performanceMeasure);
}

run().catch((err) => {
  log(`Error ${err} see stack below`);
  log(`${err.stack}`);
});
