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

const dumpData = (marketData, logger) => {
  logger.info(' Data Dump');
  var key = hashMap.nextKey();
  while (key) {
    //logger.info(`Key ${key}, value:${JSON.stringify(hashMap.get(key))}`);
    const marketOrder = hashMap.get(key);
    logger.info(`Key ${key}, value:${JSON.stringify(hashMap.get(key))}`);
    key = hashMap.nextKey(key);
  }
}

const scheduler = (marketData, logger) => {
  cron.schedule('* * * * *', () => dumpData(marketData, logger));
}


log4js.configure({
  appenders: {
    local: {
      type: 'file',
      filename: `${workerData.conf.logging.logDir}/marketdata-worker-${workerData.market}.log`
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
  log4js.getLogger().info(`Starting up market data worker, market:${workerData.market}`);
  const client = new CoinbasePro(authentication);
  setTimeout(() => {
    setInterval(async (market) => {
      const time = await client.rest.time.getTime();
      const currentTimeStamp = moment(time.iso);
      const previousTimeStamp = moment(time.iso).subtract(10, 'minutes');
      log4js.getLogger().info(`From: ${previousTimeStamp.utc().format('YYYY-MM-DDTHH:mm:00.000Z')} To: ${currentTimeStamp.utc().format('YYYY-MM-DDTHH:mm:00.000Z')}`);
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
    switch (message.type) {
      case 'heartbeat':
        md.heartBit(message);
        break;
      /**
        A valid order has been received and is now active.
        This message is emitted for every single valid order as soon as
        the matching engine receives it whether it fills immediately or not.
      */
      case 'received':
        /**
     * The order is no longer on the order book. Sent for all orders for which there was a received message. This message
     * can result from an order being canceled or filled. There will be no more messages for this `order_id ` after a
     * done message. The `remaining_size` indicates how much of the order went unfilled; this will be "0" for `filled`
     * orders.
     *
     * All `market` orders will not have a `remaining_size` or `price` field as they are never on the open order book at
     * a given price.
     *
     * A `done` message will be sent for received orders which are fully filled or canceled due to self-trade prevention.
     * There will be no `open` message for such orders. All `done` messages for orders which are not on the book should
     * be ignored when maintaining a real-time order book.
     */
      case 'done':
      /**
     * The order is now open on the order book. This message will only be sent for orders which
     * are not fully filled immediately.
     * The `remaining_size` will indicate how much of the order is unfilled and going on the book.
     * */
      case 'open':
        md.orderAdded(message);
        break;
      default:
        //log4js.getLogger().info(`Unknown type:${message.type}`);
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
  scheduler(md, log4js.getLogger());
}

run().catch((err) => log4js.getLogger().error(err));
