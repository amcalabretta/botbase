var IgushArray = require("../igushArray.js");
var _printf = require('printf');
let printf = (format, ...args) => console.log(_printf(format, ...args));
const { PerformanceObserver, performance } = require('perf_hooks');

var seedrandom = require('seedrandom');

function clearAndInitialize(constructor, size, capacity) {
  var random = seedrandom('hello.');
  let i = 0;
  let arr = new constructor(capacity);
  if (!arr.add) { // case for clear and initializing built in arrays
    arr.add = function(index, item) {
      arr[index] = item;
    }
  }
  for (; i < size; i++) {
    arr.add(i, random() * 1000);
  }
  return arr;
}
function calcStats(stats) {
  let avg = 0;
  let max = 0;
  let min = Infinity;
  for (let  i = 0; i < stats.length; i++) {
    min = Math.min(min, stats[i]);
    max = Math.max(max, stats[i]);
    avg += stats[i];
  }
  avg = avg / stats.length;
  return {avg:avg,min:min,max:max}
}
function displayStats(name, size, stats) {
  let calcedStats = calcStats(stats);
  printf("%-20s%-24s%-24.4f%-24.4f%-24.4f",name, size, calcedStats.avg, calcedStats.max, calcedStats.min);
}
//tests the given function, which returns a time for how long the targetted process took. passes testFunctionArgs to it. Does this trials times
function testFunctionTime(name, testFunction, testFunctionArgs, trials) {
  let times = [];
  for (let i = 0 ; i < trials; i++) {
    times.push(testFunction(testFunctionArgs));
  }
  displayStats(name, testFunctionArgs.size, times);
}

/*
Returns average time to push data to the front of an array of this size for a certain number of executions over specified trials
Array is constructed with the given constructor, assuming new constructor(capacity) returns an empty array with that capacity and no elements
*/
function pushFrontTime(args) {
  let constructor = args.constructor;
  let size = args.size;
  let executions = args.executions;
  let time = 0;
  const obs = new PerformanceObserver((items) => {
    time = items.getEntries()[0].duration;
    performance.clearMarks();
  });
  obs.observe({ entryTypes: ['measure'] });
  let arr = clearAndInitialize(constructor, size, size + executions);
  performance.mark('A');
  for (let j = 0 ; j < executions; j++) {
    //arr.splice(0, 0, 0);
    arr.unshift(0);
  }
  performance.mark('B');
  performance.measure(executions + ' executions', 'A', 'B');
  return time;
}

function removeFrontTime(args) {
  let constructor = args.constructor;
  let size = args.size;
  let executions = args.executions;
  let f = args.function;
  let time = 0;
  const obs = new PerformanceObserver((items) => {
    time = items.getEntries()[0].duration;
    performance.clearMarks();
  });
  obs.observe({ entryTypes: ['measure'] });
  let arr = clearAndInitialize(constructor, size, size);
  performance.mark('A');
  for (let j = 0 ; j < executions; j++) {
    //arr.splice(0, 0, 0);
    arr.shift();
  }
  performance.mark('B');
  performance.measure(executions + ' executions', 'A', 'B');
  return time;
}

function sliceTime(args) {
  var random = seedrandom('hello.');
  let constructor = args.constructor;
  let size = args.size;
  let executions = args.executions;
  let time = 0;
  const obs = new PerformanceObserver((items) => {
    time = items.getEntries()[0].duration;
    performance.clearMarks();
  });
  obs.observe({ entryTypes: ['measure'] });
  let arr = clearAndInitialize(constructor, size, size);
  performance.mark('A');
  for (let j = 0 ; j < executions; j++) {
    //arr.splice(0, 0, 0);
    //arr[Math.floor(Math.random() * size];
    let k = Math.floor(random() * (size - 1));
    arr.slice(k,k + 1);
  }
  performance.mark('B');
  performance.measure(executions + ' executions', 'A', 'B');
  return time;
}

function accessTimeBuiltInArray(args) {
  var random = seedrandom('hello.');
  let constructor = args.constructor;
  let size = args.size;
  let executions = args.executions;
  let time = 0;
  const obs = new PerformanceObserver((items) => {
    time = items.getEntries()[0].duration;
    performance.clearMarks();
  });
  obs.observe({ entryTypes: ['measure'] });
  let arr = clearAndInitialize(constructor, size, size);
  performance.mark('A');
  for (let j = 0 ; j < executions; j++) {
    //arr.splice(0, 0, 0);
    arr[Math.floor(random() * size)];
  }
  performance.mark('B');
  performance.measure(executions + ' executions', 'A', 'B');
  return time;
}

function accessTime(args) {
  var random = seedrandom('hello.');
  let constructor = args.constructor;
  let size = args.size;
  let executions = args.executions;
  let time = 0;
  const obs = new PerformanceObserver((items) => {
    time = items.getEntries()[0].duration;
    performance.clearMarks();
  });
  obs.observe({ entryTypes: ['measure'] });
  let arr = clearAndInitialize(constructor, size, size);
  performance.mark('A');
  for (let j = 0 ; j < executions; j++) {
    //arr.splice(0, 0, 0);
    arr.get(Math.floor(random() * (size - 1)));
  }
  performance.mark('B');
  performance.measure(executions + ' executions', 'A', 'B');
  return time;
}
//printf("%-20s%-24s%-24s%-24s%-24s\n", "List Type", "List Size", "Average(ms)", "Max(ms)", "Min(ms)");

printf("\nTesting IgushArray and built in Array push front/unshift methods | 10000 executions 50 trials \n");
printf("%-20s%-24s%-24s%-24s%-24s\n", "List Type", "List Size", "Average(ms)", "Max(ms)", "Min(ms)");
for (let i = 1; i < 6; i++) {
  testFunctionTime("Normal Array", pushFrontTime, {constructor:Array, size:Math.pow(10,i), executions:10000}, 50);
}
for (let i = 1; i < 6; i++) {
  testFunctionTime("IgushArray", pushFrontTime, {constructor:IgushArray, size:Math.pow(10,i), executions:10000}, 50);
}

printf("\nTesting IgushArray and built in Array remove front/shift methods | 10000 executions 50 trials \n");
printf("%-20s%-24s%-24s%-24s%-24s\n", "List Type", "List Size", "Average(ms)", "Max(ms)", "Min(ms)");

for (let i = 1; i < 6; i++) {
  testFunctionTime("Normal Array", removeFrontTime, {constructor:Array, size:Math.pow(10,i), executions:10000}, 50);
}
for (let i = 1; i < 7; i++) {
  testFunctionTime("IgushArray", removeFrontTime, {constructor:IgushArray, size:Math.pow(10,i), exeuctions:10000}, 50);
}

printf("\nTesting IgushArray and built in Array slice methods | 10000 executions 50 trials \n");
printf("%-20s%-24s%-24s%-24s%-24s\n", "List Type", "List Size", "Average(ms)", "Max(ms)", "Min(ms)");
for (let i = 1; i < 6; i++) {
  testFunctionTime("Normal Array", sliceTime, {constructor:Array, size:Math.pow(10,i), executions:10000}, 100);
}
for (let i = 1; i < 6; i++) {
  testFunctionTime("IgushArray", sliceTime, {constructor:IgushArray, size:Math.pow(10,i), executions:10000}, 100);
}

printf("\nTesting IgushArray and built in Array access methods | 100000 executions 50 trials \n");
printf("%-20s%-24s%-24s%-24s%-24s\n", "List Type", "List Size", "Average(ms)", "Max(ms)", "Min(ms)");
for (let i = 1; i < 7; i++) {
  testFunctionTime("Normal Array", accessTimeBuiltInArray, {constructor:Array, size:Math.pow(10,i), executions:100000}, 50);
}
for (let i = 1; i < 7; i++) {
  testFunctionTime("IgushArray", accessTime, {constructor:IgushArray, size:Math.pow(10,i), executions:100000}, 50);
}

//printf("\nTesting IgushArray and built in Array, creating 0 capacity array and just pushing elements in\n");
