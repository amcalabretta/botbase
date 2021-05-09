'use strict'
const { Worker, isMainThread, parentPort } = require('worker_threads');
const CoinbasePro = require('coinbase-pro');
const sleep = require('sleep');
const { wsUrl } = require('./model/constants')

//const client = new CoinbasePro.AuthenticatedClient(
//  process.env.apiKey,
//  process.env.apiSecret,
//  process.env.apiPassphrase
//);

if (isMainThread) {
  console.log(`Starting up..`);
  const websocket = new CoinbasePro.WebsocketClient(
    ['LTC-EUR'],
    wsUrl,
    {
      key: process.env.apiKey,
      secret: process.env.apiSecret,
      passphrase: process.env.apiPassphrase,
    },
    { channels: ['full', 'level2'] }
  );
  websocket.on('message', data => {
      console.log(`Type: ${data.type}`);
      //console.log(` getting stuff:${JSON.stringify(data)}`);
  });
  
} else {
  //parentPort.postMessage('This is Worker');
}

/*
if (typeof(someObject.quack) == "function")
{
    // This thing can quack
}
*/

/**
 * 
 * process.argv.forEach(function (val, index, array) {
    console.log(index + ': ' + val);
  });
 */

//https://github.com/ttezel/nn (try with various inputs)