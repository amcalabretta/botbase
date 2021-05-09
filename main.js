'use strict'
const { Worker, isMainThread, workerData, BroadcastChannel} = require('worker_threads');

const CoinbasePro = require('coinbase-pro');
//const sleep = require('sleep');
const { wsUrl } = require('./model/constants');
const { strategies } = require('./strategies/all_strategies');

//const client = new CoinbasePro.AuthenticatedClient(
//  process.env.apiKey,
//  process.env.apiSecret,
//  process.env.apiPassphrase
//);

const tickerChannel = new BroadcastChannel('ticker');

if (isMainThread) {
  console.log(`Starting up...${strategies.length} strategy(ies) defined`);
  strategies.forEach((strategy,idx)=>{
    console.log(` [${idx+1}] ${strategy.type()}`)
    new Worker(__filename,{workerData:{strategy:idx}});
  });
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
    tickerChannel.postMessage(data);
      //console.log(`Type: ${data.type}`);
      //console.log(` getting stuff:${JSON.stringify(data)}`);
  });
} else {//worker part
    console.log(`Worker instantiated for ${strategies[workerData.strategy].type()}`);
    tickerChannel.onmessage = (event) => {
      console.log(`[Worker: ticker]`)
    }
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