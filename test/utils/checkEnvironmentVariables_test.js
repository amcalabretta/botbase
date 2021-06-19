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
});
