/**
 * Function checking whether the availabily currently in CB is enough for the strategies.
 */
const bigDecimal = require('js-big-decimal');

const checkAvailabilities = (availabilityMap,confData) => {
    
    const requestedMap = new Map();
    confData.strategies.forEach( str=>{
        //console.log(`Strategy:${str.name}`);
        str.markets.forEach((mkt,idx)=>{
            const currency = mkt.substring(0,3);
            const amount = new bigDecimal(str.cryptoAmounts[idx]);
            //console.log(`${currency} - ${amount.getPrettyValue()}`);
            if (requestedMap.has(currency)) {//sum
                 const currentAmount = requestedMap.get(currency);
                 requestedMap.set(currency,currentAmount+amount);
            } else {//add
                requestedMap.set(currency, amount);
            }
        });
    });
    availabilityMap.forEach((value, key) => {
        if (requestedMap.has(key)) {
            const availableAmount = new bigDecimal(value);
            if (bigDecimal.compareTo(availableAmount, requestedMap.get(key)) === -1) {
                throw new Error(` Currency:${key}, available funds:${availableAmount.getPrettyValue()}, funds needed:${equestedMap.get(key).getPrettyValue()}`)
            }
        } 
    });
};

exports.checkAvailabilities = checkAvailabilities;
