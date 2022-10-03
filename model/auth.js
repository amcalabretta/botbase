const auth = {
  apiKey: process.env.apiKey,
  apiSecret: process.env.apiSecret,
  passphrase: process.env.apiPassphrase,
  useSandbox: false,
};

exports.authentication = auth;
