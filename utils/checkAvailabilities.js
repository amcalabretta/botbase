/* eslint max-len: ["error", { "code": 150 }] */
/**
 * Function checking whether the availabily currently in CB is enough for the strategies.
 */
const bigDecimal = require('js-big-decimal');

const checkAvailabilities = (availabilityMap, confData) => {
  const requestedMap = new Map();
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
    if (requestedMap.has('EUR')) { // sum
      const currentAmount = requestedMap.get('EUR');
      requestedMap.set('EUR', currentAmount.add(new bigDecimal(str.euroAmount)));
    } else { // add
      requestedMap.set('EUR', new bigDecimal(str.euroAmount));
    }
    if (requestedMap.has('USD')) { // sum
      const currentAmount = requestedMap.get('USD');
      requestedMap.set('USD', currentAmount.add(new bigDecimal(str.dollarAmount)));
    } else { // add
      requestedMap.set('USD', new bigDecimal(str.dollarAmount));
    }
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
