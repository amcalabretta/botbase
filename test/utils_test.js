const mocha = require('mocha');

const { describe } = mocha;
const { it } = mocha;
const assert = require('assert');
const { expect } = require('chai');
const { loadConfigurationFile } = require('../utils/utils');

describe('loadConfigurationFile with not valid argv', () => {
  it('Should throw an error if not 3 values are in argv', (done) => {
    assert.throws(() => { loadConfigurationFile(['1','2']) }, Error);
    assert.throws(() => { loadConfigurationFile(['1',]) }, Error);
    assert.throws(() => { loadConfigurationFile([]) }, Error);
    assert.throws(() => { loadConfigurationFile(['1','2','3','4']) }, Error);
    done();
  }).timeout(60000);
  it('Should throw an error with non existing file', (done) => {
    assert.throws(() => { loadConfigurationFile(['conf=./data/non_existent.yaml']) }, Error);
    done();
  }).timeout(60000);
});
