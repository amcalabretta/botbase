/**
 * Function checking whether the availabily currently in CB is enough for the strategies.
 */
const bigDecimal = require('js-big-decimal');


const checkAvailabilities = (availabilityMap,confData) => {
    availabilityMap.forEach((value, key) => {
        //console.log(`m[${key}] = ${value}`);
    });
    const requestedMap = new Map();
    confData.strategies.forEach( str=>{
        console.log(`Strategy:${str.name}`);
        str.markets.forEach((mkt,idx)=>{
            const currency = mkt.substring(0,3);
            const amount = new bigDecimal(str.cryptoAmounts[idx]);
            console.log(`${currency} - ${amount.getPrettyValue()}`);
            if (requestedMap.has(currency)) {
                
            }
        });
    });
};

exports.checkAvailabilities = checkAvailabilities;
