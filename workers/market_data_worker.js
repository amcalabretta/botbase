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
const Table = require('easy-table');
const {
  workerData, BroadcastChannel
} = require('worker_threads');
const { authentication } = require('../model/auth');
const { MarketData } = require('../model/MarketData');

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

const log = (format, ...args) => log4js.getLogger().info(_printf(format, ...args));

const serializeCandles = (candles) => {
  const t = new Table();
  candles.forEach((c) => {
    t.cell('TS:', c.openTimeInMillis);
    t.cell('Low', c.low, Table.number(3));
    t.cell('High', c.high, Table.number(3));
    t.cell('Open', c.open, Table.number(3));
    t.cell('Close', c.close, Table.number(3));
    t.cell('Volume', c.volume, Table.number(3));
    t.cell('Raw TS', c.openTimeInISO);
    t.newRow();
  });
  return t.toString();
};

const dumpData = (marketData) => {
  log(` Data Dump:${marketData.orders.length()}`);
  let key = marketData.orders.nextKey();
  while (key) {
    const marketOrder = marketData.orders.get(key);
    log(`Key ${key}`);
    log(' side:%s, type:%s', marketOrder.side.description, marketOrder.type.description);
    log(' size:%s, price:%s', marketOrder.size.value, marketOrder.price.value);
    log(' statuses %d:', marketData.orders.get(key).statuses.length);
    marketData.orders.get(key).statuses.forEach((st) => {
      if (st.status === 'OPN') log('   status:%s,time:%s,remaining:%s', st.status, st.ts, st.remaining);
      else log('   status:%s,time:%s', st.status, st.ts);
    });
    key = marketData.orders.nextKey(key);
  }
};

const scheduler = (marketData) => {
  cron.schedule('* * * * *', () => dumpData(marketData));
};

log4js.configure({
  appenders: {
    local: {
      type: 'file',
      filename: `${workerData.conf.logging.logDir}/marketdata-worker-${workerData.market}.log`,
      layout: {
        type: 'pattern',
        pattern: '[%d{yyyy-MM-ddThh.mm.ss}] - %m'
      }
    },
    ticker: { type: 'file', filename: `${workerData.conf.logging.logDir}/ticker.log` },
    md: {
      type: 'file',
      filename: `${workerData.conf.logging.logDir}/marketdata-${workerData.market}.log`,
      layout: {
        type: 'pattern',
        pattern: '[%d{yyyy-MM-ddThh.mm.ss}] - %m'
      }
    }
  },
  categories: {
    default: { appenders: ['local'], level: 'debug' },
    md: { appenders: ['md'], level: 'debug' }
  }
});

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
    log4js.getLogger().info(`--- \n:${JSON.stringify(message, null, 2)}\n`);
    try {
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
    } catch (error) {
      log4js.getLogger().info(`Error with message: ${JSON.stringify(message)}`);
    }
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
  scheduler(md);
}

run().catch((err) => log4js.getLogger().error(err));
