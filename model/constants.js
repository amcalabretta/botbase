/**
 * Here all the constants used by the bot.
*/

/** Url used for websocket connection towards coinbase (real) */
const wsUrl = 'wss://ws-feed.pro.coinbase.com';

/** Url used for websocket connection towards coinbase (sandobox) */
const wsUrlSndBox = 'wss://ws-feed-public.sandbox.exchange.coinbase.com';

/** Url used for APIs (real) */
const restApiUrl = 'https://api.pro.coinbase.com';

/** Url used for APIs (sandobox) */
const restApiUrlSndBox = 'https://api-public.sandbox.exchange.coinbase.com';

/** Order type used by the strategies to communicate to the worker what to do */
const OrderType = {
  NO_OP: 'NO_OP',
  BUY_SELL: 'BUY_SELL',
  SELL_BUY: 'SELL_BUY'
};

exports.wsUrl = wsUrl;
exports.OrderType = OrderType;
exports.restApiUrl = restApiUrl;
exports.wsUrlSndBox = wsUrlSndBox;
exports.restApiUrlSndBox = restApiUrlSndBox;
