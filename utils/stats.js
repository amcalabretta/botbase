const { BigDecimal } = require('../model/bigdecimal');

// ('previous mean' * '(count -1)') + 'new value') / 'count'
const calculateMean = (previousMean, count, currentNumber) => {
  if (count === 0) return currentNumber;
  const countAsBD = new BigDecimal(count);
  const countMinusOne = new BigDecimal(count - 1);
  const k = previousMean.multiply(countMinusOne);
  const j = k.add(currentNumber);
  return j.divide(countAsBD);
};

exports.calculateMean = calculateMean;
