/**
 * Simple function converting a market (like 'BTC-USD')
 * into a more concise form (like 'btc.usd)
 */
const mktRegEx = new RegExp('[A-Z]{3}-[A-Z]{3}');

const allowedFlats = ['EUR', 'USD', 'GBP'];
const serializeMarket = (mkt) => {
  const matched = mkt.match(mktRegEx);
  if (!matched) throw new Error(`Market ${mkt} does not match`);
  const tokens = mkt.split('-');
  if (tokens.length == 2 && allowedFlats.includes(tokens[1])) {
    return `${tokens[0]}.${tokens[1]}`.toLowerCase();
  }
  throw new Error(`Market ${mkt} does not match`);
};

exports.serializeMarket = serializeMarket;
