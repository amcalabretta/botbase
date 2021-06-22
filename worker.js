const {
  Worker, isMainThread, workerData, BroadcastChannel, MessageChannel,
} = require('worker_threads');

const { loadAllStrategies } = require('./utils/loadAllStrategies');
const instance = loadStrategy(botConfiguration,idx);
console.log(`${JSON.stringify(workerData)}`);
