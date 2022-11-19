const Table = require('easy-table');

const serializeCandles = (candles) => {
  const t = new Table();
  candles.forEach((c) => {
    t.cell('TS:', c.openTimeInMillis);
    t.cell('Low', c.low, Table.number(3));
    t.cell('High', c.high, Table.number(3));
    t.cell('Open', c.open, Table.number(3));
    t.cell('Close', c.close, Table.number(3));
    t.cell('Volume', c.volume, Table.number(3));
    t.cell('Raw TS', c.openTimeInISO);
    t.newRow();
  });
  return t.toString();
};

exports.serializeCandles = serializeCandles;
