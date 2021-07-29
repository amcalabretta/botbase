const mocha = require('mocha');

const { describe } = mocha;
const { it } = mocha;
const assert = require('assert');
const { checkAvailabilities } = require('../../utils/checkAvailabilities');
const { loadConfigurationFile } = require('../../utils/loadConfigurationFile');
describe('checkAvailabilities', () => {
    
    it('Should throw an error when funds are not available', (done) => {
        const availableFunds = new Map();
        availableFunds.set('LTC', 34.354543543);
        const data = loadConfigurationFile(['node', 'main', '--conf=./test/data/checkAvailabilities.yaml']);
        assert.throws(() => { checkAvailabilities(availableFunds, data) }, 'Error');
        done();
    });

    it('Should not throw an error when funds are available', (done) => {
        const availableFunds = new Map();
        availableFunds.set('LTC', 55.354543543);
        const data = loadConfigurationFile(['node', 'main', '--conf=./test/data/checkAvailabilities.yaml']);
        checkAvailabilities(availableFunds, data)
        done();
    });
});
