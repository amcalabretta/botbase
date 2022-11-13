/* eslint max-len: ["error", { "code": 150 }] */
/**
 * function taking a string and returning an instance of an enumeration
 * implemented using a frozen object.
 */

const parseSymbol = (symbolObject, value) => {
  const foundInstance = Object.keys(symbolObject).filter((instance) => instance === value);
  if (foundInstance.length === 1) return foundInstance[0];
  throw new Error(`${value} is not a valid instance`);
};

exports.parseSymbol = parseSymbol;
