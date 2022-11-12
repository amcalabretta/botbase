/* eslint max-len: ["error", { "code": 150 }] */
/**
 * function taking a string and returning an instance of an enumeration 
 * implemented using the native js 'Symbol'.
 */

const parseSymbol = (symbolObject, value) => {
    for (const instance in  symbolObject) {
        if (instance===value) return symbolObject[value];
    }
    throw new Error(`${value} is not a valid instance`);
};

exports.parseSymbol = parseSymbol;