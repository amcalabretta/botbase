const mocha = require('mocha');

const { describe } = mocha;
const { it } = mocha;
const assert = require('assert');
const { checkAvailabilities } = require('../../utils/checkAvailabilities');
const { loadConfigurationFile } = require('../../utils/loadConfigurationFile');

describe('checkAvailabilities', () => {
  it('Should throw an error when one crypto funds are not available (LTC)', (done) => {
    const availableFunds = new Map();
    availableFunds.set('LTC', 34.354543543);
    availableFunds.set('ETH', 12);
    availableFunds.set('BTC', 7);
    const data = loadConfigurationFile(['node', 'main', '--conf=./test/data/checkAvailabilities.yaml']);
    assert.throws(() => checkAvailabilities(availableFunds, data), { name: 'Error', message: ' Currency:LTC, funds:34.354543543, needed:55' });
    done();
  });

  it('Should throw an error when one crypto funds are not available (ETH)', (done) => {
    const availableFunds = new Map();
    availableFunds.set('LTC', 56);
    availableFunds.set('ETH', 12);
    availableFunds.set('BTC', 7);
    const data = loadConfigurationFile(['node', 'main', '--conf=./test/data/checkAvailabilities.yaml']);
    assert.throws(() => checkAvailabilities(availableFunds, data), { name: 'Error', message: ' Currency:ETH, funds:12, needed:20' });
    done();
  });

  it('Should throw an error when one crypto funds are not available (BTC)', (done) => {
    const availableFunds = new Map();
    availableFunds.set('LTC', 56);
    availableFunds.set('ETH', 20);
    availableFunds.set('BTC', 7);
    const data = loadConfigurationFile(['node', 'main', '--conf=./test/data/checkAvailabilities.yaml']);
    assert.throws(() => checkAvailabilities(availableFunds, data), { name: 'Error', message: ' Currency:BTC, funds:7, needed:8' });
    done();
  });

  it('Should not throw an error when all the crypto funds are available', (done) => {
    const availableFunds = new Map();
    availableFunds.set('LTC', 56);
    availableFunds.set('ETH', 20);
    availableFunds.set('BTC', 9);
    const data = loadConfigurationFile(['node', 'main', '--conf=./test/data/checkAvailabilities.yaml']);
    checkAvailabilities(availableFunds, data);
    done();
  });

  it('Should throw an error when EUROS are not available', (done) => {
    const availableFunds = new Map();
    availableFunds.set('EUR', 12);
    const data = loadConfigurationFile(['node', 'main', '--conf=./test/data/checkAvailabilities.yaml']);
    assert.throws(() => checkAvailabilities(availableFunds, data), { name: 'Error', message: ' Currency:EUR, funds:12, needed:564.6' });
    done();
  });

  it('Should throw an error when USD are not available', (done) => {
    const availableFunds = new Map();
    availableFunds.set('USD', 11);
    const data = loadConfigurationFile(['node', 'main', '--conf=./test/data/checkAvailabilities.yaml']);
    assert.throws(() => checkAvailabilities(availableFunds, data), { name: 'Error', message: ' Currency:USD, funds:11, needed:22' });
    done();
  });

  it('Should not throw an error when all the fiat funds are available', (done) => {
    const availableFunds = new Map();
    availableFunds.set('LTC', 56);
    availableFunds.set('ETH', 20);
    availableFunds.set('BTC', 9);
    availableFunds.set('EUR', 600);
    availableFunds.set('USD', 23);
    const data = loadConfigurationFile(['node', 'main', '--conf=./test/data/checkAvailabilities.yaml']);
    checkAvailabilities(availableFunds, data);
    done();
  });
});
