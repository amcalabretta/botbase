'use strict'
const { Worker, isMainThread, workerData, BroadcastChannel, MessageChannel } = require('worker_threads');
const CoinbasePro = require('coinbase-pro');
const stringTable = require('string-table');
const { wsUrl } = require('./model/constants');
const { strategies } = require('./strategies/all_strategies');
const moment = require('moment');
const client = new CoinbasePro.AuthenticatedClient(
  process.env.apiKey,
  process.env.apiSecret,
  process.env.apiPassphrase
);
const { port1, port2 } = new MessageChannel();

const tickerChannel = new BroadcastChannel('ticker');
const candleChannel = new BroadcastChannel('candles-every-minute-past-10-minutes');

if (isMainThread) {
  console.log(`Starting up...${strategies.length} strategy(ies) loaded`);
  let globalConfig = {strategies:[],markets:[]};
  strategies.forEach(strategy=>{
    strategy.markets().forEach(mkt=>{
      if (globalConfig.markets.indexOf(mkt)===-1) globalConfig.markets.push(mkt);
    })
    globalConfig.strategies.push({type:strategy.type(),
      markets:strategy.markets().join()})
  });
  console.log(`${stringTable.create(globalConfig.strategies)}`);
  //get every minute the market data of the previous 10 minutes
  setInterval(()=>{
    client.getTime().then(
      (t=>{
        const currentTimeStamp = moment(t.iso);
        const previousTimeStamp = moment(t.iso).subtract(10, 'minutes');  
        globalConfig.markets.forEach(mkt=>{
          client.getProductHistoricRates(mkt, {
            start:previousTimeStamp.utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
            end:currentTimeStamp.utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
            granularity:60
          }, (err,res,marketData)=>{
            if (err) console.log(`%{err}`);
            candleChannel.postMessage({type:'candles',market:mkt,payload:marketData});
          });      
        })
      }))}, 60000);
  strategies.forEach((strategy,idx)=>{
    console.log(` [${idx+1}] Instantiating worker for ${strategy.type()}`)
    strategy.orderCallback = (order) => {port2.postMessage({ 'order':order  })}
    new Worker(__filename,{workerData:{strategy:idx}});
  });
  const websocket = new CoinbasePro.WebsocketClient(
    globalConfig.markets,
    wsUrl,
    {
      key: process.env.apiKey,
      secret: process.env.apiSecret,
      passphrase: process.env.apiPassphrase,
    },{ channels: [{"name": "ticker"}] });
  websocket.on('message', data => {
    tickerChannel.postMessage(data);
  });
  port1.on('message', (message) => console.log('received:', message));
} else {
    console.log(`Worker instantiated for ${strategies[workerData.strategy].type()}`);
    let order = {};
    if (strategies[workerData.strategy].channels.indexOf('ticker')!==-1) {
      tickerChannel.onmessage = (event) => {
        if (event.data.type==='ticker') {
          strategies[workerData.strategy].ticker(event.data.price); 
        }
      }
      console.log(' - Subscribed to ticker channel');
    }
    if (strategies[workerData.strategy].channels.indexOf('candles-every-minute-past-10-minutes')!==-1) {
      candleChannel.onmessage = (event) => {
        strategies[workerData.strategy].candles(event.data.payload);
        port2.postMessage({ foo: 'bar' });
      }
      console.log(' - Subscribed to channel candles-minute-10');
    }
}