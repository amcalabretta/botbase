const mocha = require('mocha');

const { describe } = mocha;
const { it } = mocha;
const assert = require('assert');
const { loadConfigurationFile } = require('../../utils/loadConfigurationFile');

describe('loadConfigurationFile', () => {
  it('Should throw an error if not 3 values are in argv', (done) => {
    assert.throws(() => { loadConfigurationFile(['1', '2']); }, 'Error');
    assert.throws(() => { loadConfigurationFile(['1']); }, 'Error');
    assert.throws(() => { loadConfigurationFile([]); }, 'Error');
    assert.throws(() => { loadConfigurationFile(['1', '2', '3', '4']); }, 'Error');
    done();
  });
  it('Should throw an error with non existing file', (done) => {
    assert.throws(() => { loadConfigurationFile(['node', 'main', '--conf=./data/non_existent.yaml']); }, 'Error');
    done();
  });
  it('Should throw an error with configuration parameters that are not correct', (done) => {
    assert.throws(() => { loadConfigurationFile(['node', 'main', 'confff=./data/non_existent.yaml']); }, 'Error');
    assert.throws(() => { loadConfigurationFile(['node', 'main', 'confff=dss=./data/non_existent.yaml']); }, 'Error');
    done();
  });
  it('Should throw an error right file but wrong formats', (done) => {
    assert.throws(() => { loadConfigurationFile(['node', 'main', '--conf=./test/data/log_dir_not_given.yaml']); }, 'Error');
    done();
  });
  it('Should throw an error when log dir does not exists', (done) => {
    assert.throws(() => { loadConfigurationFile(['node', 'main', '--conf=./test/data/log_dir_not_existing.yaml']); }, 'Error');
    done();
  });
  it('Should read the logdir correctly', (done) => {
    const data = loadConfigurationFile(['node', 'main', '--conf=./test/data/real.yaml']);
    assert.strictEqual(data.logging.logDir, './test/fake');
    done();
  });
});
