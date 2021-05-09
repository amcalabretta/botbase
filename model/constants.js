/** 
 * Here all the constants used by the bot.
*/

/** Url used for websocket connection towards coinbase */
const wsUrl = 'wss://ws-feed.pro.coinbase.com';

/** Order type used by the strategies to communicate to the worker what to do */
const orderType = {
    NO_OP: 'NOOP',
    BUY_SELL: 'BUY_SELL',
    SELL_BUY: 'SELL_BUY'
}

exports.wsUrl = wsUrl;
exports.orderType = orderType;