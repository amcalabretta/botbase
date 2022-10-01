const moment = require('moment');
const Table = require('easy-table');
/**
 * Function getting the candles from coinbase for a set of 
 */
const getCandles = async (client,logger,markets,granularity,numMinutes,channel) => {
    const time = await client.rest.time.getTime();
    const currentTimeStamp = moment(time.iso);
    const previousTimeStamp = moment(time.iso).subtract(numMinutes, 'minutes');
    logger.info(`Current: ${currentTimeStamp.utc().format('YYYY-MM-DDTHH:mm:00.000Z')}`);
    logger.info(`Previous: ${previousTimeStamp.utc().format('YYYY-MM-DDTHH:mm:00.000Z')}`);
    for (let i=0;i<markets.length;i++) {
        logger.info(`Market:${markets[i]}`);  
        const candles = await client.rest.product.getCandles(markets[i], {
            end:currentTimeStamp.utc().format('YYYY-MM-DDTHH:mm:00.000Z'),
            granularity,
            start: previousTimeStamp.utc().format('YYYY-MM-DDTHH:mm:00.000Z')
          });
        const t = new Table();  
        candles.forEach(c=>{
            t.cell('TS:', c.openTimeInMillis);
            t.cell('Low', c.low, Table.number(3));
            t.cell('High', c.high, Table.number(3));
            t.cell('Open', c.open, Table.number(3));
            t.cell('Close', c.close, Table.number(3));
            t.cell('Volume', c.volume, Table.number(3));
            t.cell('Raw TS', c.openTimeInISO);
            t.newRow();
            logger.info(`${markets[i]} - \n ${t.toString()}`);
            channel.postMessage({ type: 'candlesPastTenMinutes', market: markets[i], payload: {} });
        })
    }
}

exports.getCandles = getCandles;
