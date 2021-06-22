/**
 * Function checking an object (taken from process.env)
 * for the mandatory keys to access the coinbase API.
 */

const checkEnvironmentVariables = (env) => {
  const errorMessage = ['Environemnt Variable(s) Missing:'];
  if (!env.apiKey) {
    errorMessage.push('\n - apiKey');
  }
  if (!env.apiSecret) {
    errorMessage.push('\n - apiSecret');
  }
  if (!env.apiPassphrase) {
    errorMessage.push('\n - apiPassphrase');
  }
  if (errorMessage.length > 1) {
    throw new Error(`${errorMessage.join('')}`);
  }
};

exports.checkEnvironmentVariables = checkEnvironmentVariables;
