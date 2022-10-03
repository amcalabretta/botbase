const moment = require('moment');
const Table = require('easy-table');
/**
 * Function getting the candles from coinbase for a set of
 */
const getCandles = async (client, logger, markets, granularity, numMinutes, channel) => {
  const time = await client.rest.time.getTime();
  const currentTimeStamp = moment(time.iso);
  const previousTimeStamp = moment(time.iso).subtract(numMinutes, 'minutes');
  logger.info(`Current: ${currentTimeStamp.utc().format('YYYY-MM-DDTHH:mm:00.000Z')}`);
  logger.info(`Previous: ${previousTimeStamp.utc().format('YYYY-MM-DDTHH:mm:00.000Z')}`);
  const allCandles = [];
  for (const mkt in markets) {
    logger.info(`Market:${markets[mkt]}`);
    try {
      allCandles[mkt] = client.rest.product.getCandles(markets[mkt], {
        end:currentTimeStamp.utc().format('YYYY-MM-DDTHH:mm:00.000Z'),
        granularity,
        start: previousTimeStamp.utc().format('YYYY-MM-DDTHH:mm:00.000Z')
      });
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
        logger.info(`${markets[mkt]} - \n ${t.toString()}`);
        channel.postMessage({ type: 'candlesPastTenMinutes', market: markets[mkt], payload: {} });
      });
    } catch (error) {
      logger.error('Error');
    }
  }
  await Promise.all(allCandles);
};

exports.getCandles = getCandles;
