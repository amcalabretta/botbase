'use strict'
const { Worker, isMainThread, parentPort } = require('worker_threads');
const CoinbasePro = require('coinbase-pro');
const sleep = require('sleep');


//const client = new CoinbasePro.AuthenticatedClient(
//  process.env.apiKey,
//  process.env.apiSecret,
//  process.env.apiPassphrase
//);

if (isMainThread) {
  console.log(` Starting up..`);
  const websocket = new CoinbasePro.WebsocketClient(
    ['LTC-EUR'],
    'wss://ws-feed.pro.coinbase.com',
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
  /* const apiKey = process.env.apiKey
  const apiSecret = process.env.apiSecret
  const apiPassphrase = process.env.apiPassphrase
  const now = new Date();
  const fifteen_minutes_ago = new Date();
  fifteen_minutes_ago.setMinutes(fifteen_minutes_ago.getMinutes() - 15);   */
  //authedClient.getCoinbaseAccounts(acc=>{console.log(`caccount ${acc}`)});
  //authedClient.getAccounts(acc=>{console.log(`account ${acc}`)});
  //authedClient.getPaymentMethods(p=>console.log(`p:${p}`));
  //authedClient.getOrders(o=>console.log(`order:${o}`));
  //const websocket = new CoinbasePro.WebsocketClient(['LTC-EUR']);
  //authedClient.getProductTicker('ETH-USD', t=>console.log(`t:${t}`));
  //websocket.subscribe({ product_ids: ['LTC-USD'], channels: ['ticker', 'user'] });
  //websocket.on('message', data => {
  //  console.log(` getting stuff:${JSON.stringify(data)}`);
  //});
  //websocket.on('error', err => {
  //  console.log(`Error:${err}`);
  //});
  //websocket.on('close', () => {
  //  console.log(' closed');
  //});
  //authedClient.getFundings({}, f=>{console.log(`${f}`)});
  // Create the worker.
  //const worker1 = new Worker(__filename);
  //const worker2 = new Worker(__filename);
  // Listen for messages from the worker and print them.
  //worker1.on('message', (msg) => { console.log(msg); });
  //worker2.on('message', (msg) => { console.log(msg); });
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