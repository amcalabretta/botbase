/* eslint max-len: ["error", { "code": 150 }] */
/**
 * Function checking whether the availabily currently in CB is enough for the strategies.
 */
const bigDecimal = require('js-big-decimal');

const ZERO = new bigDecimal(0);

const checkAvailabilities = (availabilityMap, confData) => {
  const requestedMap = new Map();
  requestedMap.set('USD', ZERO);
  requestedMap.set('EUR', ZERO);
  confData.strategies.forEach((str) => {
    str.markets.forEach((mkt, idx) => {
      const currency = mkt.substring(0, 3);
      const amount = new bigDecimal(str.cryptoAmounts[idx]);
      if (requestedMap.has(currency)) { // sum
        const currentAmount = requestedMap.get(currency);
        requestedMap.set(currency, currentAmount.add(amount));
      } else { // add
        requestedMap.set(currency, amount);
      }
    });
    requestedMap.set('EUR', requestedMap.get('EUR').add(new bigDecimal(str.euroAmount)));
    requestedMap.set('USD', requestedMap.get('USD').add(new bigDecimal(str.dollarAmount)));
  });

  availabilityMap.forEach((value, key) => {
    if (requestedMap.has(key)) {
      const availableAmount = new bigDecimal(value);
      if (availableAmount.compareTo(requestedMap.get(key)) === -1) {
        throw new Error(` Currency:${key}, funds:${availableAmount.getPrettyValue()}, needed:${requestedMap.get(key).getPrettyValue()}`);
      }
    }
  });
};

exports.checkAvailabilities = checkAvailabilities;
