const moment = require('moment');
/**
 * Function getting the candles from coinbase for a set of 
 */
const getCandles = async (client,logger,markets,granularity,numMinutes) => {
    const time = await client.rest.time.getTime();
    const begin = '2020-04-11T00:00:00.000Z';
    const end = '2020-04-11T10:00:00.000Z';
    const currentTimeStamp = moment(time.iso);
    const previousTimeStamp = moment(time.iso).subtract(numMinutes, 'minutes');
    logger.info(`Current: ${currentTimeStamp.utc().format('YYYY-MM-DDTHH:mm:00.000Z')}`);
    logger.info(`Previous: ${previousTimeStamp.utc().format('YYYY-MM-DDTHH:mm:00.000Z')}`);
    for (let i=0;i<markets.length;i++) {
        logger.info(`Market:${markets[i]}`);  
        const candles = await client.rest.product.getCandles(markets[i], {
            currentTimeStamp,
            granularity,
            start: previousTimeStamp,
          });
    }
}

exports.getCandles = getCandles;
