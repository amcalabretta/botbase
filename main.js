'use strict'
const { Worker, isMainThread, workerData, BroadcastChannel } = require('worker_threads');
const CoinbasePro = require('coinbase-pro');
const { wsUrl } = require('./model/constants');
const { strategies } = require('./strategies/all_strategies');

const client = new CoinbasePro.AuthenticatedClient(
  process.env.apiKey,
  process.env.apiSecret,
  process.env.apiPassphrase
);

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
    },{ channels: [{"name": "ticker"}] });
  websocket.on('message', data => {
    tickerChannel.postMessage(data);
  });
} else {
    console.log(`Worker instantiated for ${strategies[workerData.strategy].type()}`);
    tickerChannel.onmessage = (event) => {
      if (event.data.type==='ticker') {
        const order = strategies[workerData.strategy].ticker(event.data.price); 
        console.log(`[${strategies[workerData.strategy].type()}(${event.data.price})] Order:${order.orderType}`);
      }
    }
}