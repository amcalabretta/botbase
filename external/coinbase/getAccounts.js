/**
 * Function checking an object (taken from process.env)
 * for the mandatory keys to access the coinbase API.
 */

 const {request} = require('undici');
 const CryptoJS = require('crypto-js');
 
 const sign = (str, secret) => {
    const hash = CryptoJS.HmacSHA256(str, secret);
    return hash.toString();
 }


 const getAccounts = async (env) => {
    console.log(`API Key:${env.apiKey}`);
    console.log(`API Secret:${env.apiSecret}`);
    console.log(`API Pass Phrase:${env.apiPassphrase}`);
    const apiSecret = env.apiSecret;
    const apiKey = env.apiKey;
    const apiPassphrase = env.apiPassphrase;
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const str = timestamp + 'GET' + '/api/v3/brokerage/accounts';
    const sig = sign(str, apiSecret);
    const url = 'https://coinbase.com/api/v3/brokerage/accounts';
    const {
        statusCode,
        headers,
        trailers,
        body
      } = await request(url,{headers: { 'CB-ACCESS-KEY':apiKey,'CB-ACCESS-SIGN':sig,'CB-ACCESS-TIMESTAMP': timestamp},});
      console.log(` Request done:\n status code:${statusCode}\n body:${JSON.stringify(body)}`);
  };

  exports.getAccounts = getAccounts;