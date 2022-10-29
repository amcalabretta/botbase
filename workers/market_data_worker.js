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
const { authentication } = require('../model/auth');
const moment = require('moment');
const { CandleGranularity, CoinbasePro, WebSocketChannelName, WebSocketEvent } = require('coinbase-pro-node');
const Table = require('easy-table');
const {
    workerData, BroadcastChannel, parentPort
} = require('worker_threads');
const { MarketData } = require('../model/MarketData');

/** The ticker channel provides real-time price updates every time a match happens. 
 * It batches updates in case of cascading matches, greatly reducing bandwidth requirements. */
const tickerChannel = {
    name: WebSocketChannelName.TICKER,
    product_ids: [workerData.market],
};

/** To receive heartbeat messages for specific products once a second subscribe to the heartbeat channel. 
 * Heartbeats also include sequence numbers and last trade ids that can be used to verify 
 * no messages were missed. */
const heartbeatChannel = {
    name: WebSocketChannelName.HEARTBEAT,
    product_ids: [workerData.market],
};

/** The full channel provides real-time updates on orders and trades. 
 * These updates can be applied on to a level 3 order book snapshot to maintain 
 * an accurate and up-to-date copy of the exchange order book. */
const fullChannel = {
    name: WebSocketChannelName.FULL,
    product_ids: [workerData.market],
};

/** The easiest way to keep a snapshot of the order book is to use the level2 channel. 
 * It guarantees delivery of all updates, which reduce a lot of the overhead 
 * required when consuming the full channel. */
const l2Channel = {
    name: WebSocketChannelName.LEVEL2,
    product_ids: [workerData.market],
};




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
    })
    return t.toString();
}

log4js.configure({
    appenders: {
        local: { type: 'file', filename: `${workerData.conf.logging.logDir}/marketdata-worker-${workerData.market}.log` },
        ticker: { type: 'file', filename: `${workerData.conf.logging.logDir}/ticker.log` }
    },
    categories: {
        default: { appenders: ['local'], level: 'debug' }
    }
});



async function run() {
    const md = new MarketData(workerData.market);
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
            }).then((candles, i) => {
                log4js.getLogger().info(`${market} (${candles.length})\n ${serializeCandles(candles)}`);
                //channel.postMessage({ type: 'candlesPastTenMinutes', market: market, payload: {} });
            }).catch(error => log4js.getLogger().error(`Error:${error}`));
        }, 60000, workerData.market);
    }, 1000);
    client.ws.on(WebSocketEvent.ON_MESSAGE, message => {
        switch (message.type) {
            case 'received':
                log4js.getLogger().info(`-----"${JSON.stringify(message)}".`);
                break;
            case 'match':
                log4js.getLogger().info(`-----"${JSON.stringify(message)}".`);
                break;
            case 'ticker':
                md.ticker(message);
                break;
            case 'full':
                break;
            case 'heartbeat':
                md.heartBit(message);
                break;
            default:
            log4js.getLogger().info(`-----"${message.type}".`);
        }
    });

    client.ws.on(WebSocketEvent.ON_MESSAGE_ERROR, errorMessage => {
        throw new Error(`${errorMessage.message}: ${errorMessage.reason}`);
    });

    client.ws.on(WebSocketEvent.ON_OPEN, async () => {
        await client.ws.subscribe(tickerChannel);
        log4js.getLogger().info(`Channel:${tickerChannel.name}`)
        await client.ws.subscribe(heartbeatChannel);
        log4js.getLogger().info(`Channel:${heartbeatChannel.name}`)
        await client.ws.subscribe(fullChannel);
    });
    client.ws.connect();
}

run().catch(err => log4js.getLogger().error(err))