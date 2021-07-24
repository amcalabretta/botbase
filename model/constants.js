/**
 * Here all the constants used by the bot.
*/

/** Url used for websocket connection towards coinbase */
const wsUrl = 'wss://ws-feed.pro.coinbase.com';

/** Order type used by the strategies to communicate to the worker what to do */
const OrderType = {
  NO_OP: 'NO_OP',
  BUY_SELL: 'BUY_SELL',
  SELL_BUY: 'SELL_BUY'
};

exports.wsUrl = wsUrl;
exports.OrderType = OrderType;
