const moment = require('moment');
const Table = require('easy-table');

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

/**
 * Function getting the candles from coinbase for a set of markets
 */
const getCandles = async (client, logger, markets, granularity, numMinutes, channel) => {
  const time = await client.rest.time.getTime();
  const currentTimeStamp = moment(time.iso);
  const previousTimeStamp = moment(time.iso).subtract(numMinutes, 'minutes');
  logger.info(`Current: ${currentTimeStamp.utc().format('YYYY-MM-DDTHH:mm:00.000Z')}`);
  logger.info(`Previous: ${previousTimeStamp.utc().format('YYYY-MM-DDTHH:mm:00.000Z')}`);
  const allCandles = [];
  markets.forEach((mkt, i) => {
    allCandles[mkt] = client.rest.product.getCandles(mkt, {
      end: currentTimeStamp.utc().format('YYYY-MM-DDTHH:mm:00.000Z'),
      granularity,
      start: previousTimeStamp.utc().format('YYYY-MM-DDTHH:mm:00.000Z')
    }).then((candles) => {
      logger.info(`${i + 1}/${markets.length} - :${mkt} \n ${serializeCandles(candles)}`);
      channel.postMessage({ type: 'candlesPastTenMinutes', market: mkt, payload: {} });
    }).catch((error) => logger.error(`Error:${error}`));
  });
  await Promise.all(allCandles);
};

exports.getCandles = getCandles;