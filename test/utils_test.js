const mocha = require('mocha');

const { describe } = mocha;
const { it } = mocha;
const assert = require('assert');
const { expect } = require('chai');
const { loadConfigurationFile } = require('../utils/utils');

describe('loadConfigurationFile', () => {
  it('Should throw an error if not 3 values are in argv', (done) => {
    assert.throws(() => { loadConfigurationFile(['1','2']) }, 'Error');
    assert.throws(() => { loadConfigurationFile(['1',]) }, 'Error');
    assert.throws(() => { loadConfigurationFile([]) }, 'Error');
    assert.throws(() => { loadConfigurationFile(['1','2','3','4']) }, 'Error');
    done();
  });
  it('Should throw an error with non existing file', (done) => {
    assert.throws(() => { loadConfigurationFile(['node','main','conf=./data/non_existent.yaml']) }, 'Error');
    done();
  });
  it('Should throw an error with configuration parameters that are not correct', (done) => {
    assert.throws(() => { loadConfigurationFile(['node','main','confff=./data/non_existent.yaml']) }, 'Error');
    assert.throws(() => { loadConfigurationFile(['node','main','confff=dss=./data/non_existent.yaml']) }, 'Error');
    done();
  });
  it('Should throw an error right file but not existing log dir', (done) => {
    assert.throws(() => { loadConfigurationFile(['node','main','conf=./test/data/not_correct.yaml'])}, 'Error');
    done();
  });
});
