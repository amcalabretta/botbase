const moment = require('moment');
/**
 * Function getting the candles from coinbase for a set of 
 */
const getCandles = async (client,logger,markets,granularity,numMinutes) => {
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
        logger.info(`Candles:${JSON.stringify(candles)}`);  
    }
}

exports.getCandles = getCandles;
