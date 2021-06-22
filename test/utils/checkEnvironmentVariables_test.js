const mocha = require('mocha');

const { describe } = mocha;
const { it } = mocha;
const assert = require('assert');
const { checkEnvironmentVariables } = require('../../utils/checkEnvironmentVariables');

describe('checkEnvironmentVariables', () => {
  it('Should not throw an error all the required values are in the process env', (done) => {
    checkEnvironmentVariables({
      apiKey: 'anApiKey',
      apiSecret: 'anApiSecret',
      apiPassphrase: 'anApiPassphrase',
    });
    done();
  });
  it('Should throw an error if any of the 3 variables are missing', (done) => {
    assert.throws(() => { checkEnvironmentVariables({ apiKey: 'ak', apiSecret: 'as' }); }, 'Error');
    assert.throws(() => { checkEnvironmentVariables({ apiKey: 'ak', apiPassphrase: 'app' }); }, 'Error');
    assert.throws(() => { checkEnvironmentVariables({ apiPassphrase: 'app', apiSecret: 'as' }); }, 'Error');
    done();
  });
});
