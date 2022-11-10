const IgushArray = require('../external/igusharray/igushArray');
const seedrandom = require('seedrandom');

const NS_PER_SEC = 1e9;
const MS_PER_NS = 1e-6;
const _printf = require('printf');
let printf = (format, ...args) => console.log(_printf(format, ...args));
const Table = require('easy-table');
const { array } = require('joi');


const calcStats = (stats) => {
  let avg = 0;
  let max = 0;
  let min = Infinity;
  for (let  i = 0; i < stats.length; i++) {
    min = Math.min(min, stats.get(i));
    max = Math.max(max, stats.get(i));
    avg += stats.get(i);
  }
  avg = avg / stats.length;
  return {avg:avg,min:min,max:max}
}


const testInsert = () => {
  const t = new Table();
  printf(' Testing insertion:');
  const random = seedrandom('hello ther1e');
  for (let i = 10; i < 100000000; i *= 10) {
     const trackIgush = new IgushArray(i);
     const trackArray = new IgushArray(i);
     //inititailize the arrays at i;
     let igusharr = new IgushArray(i);
     let normalArr = new Array(i)
     for (let j=0;j<i;j++) {
        const k = random() * Math.pow(2, 31) - Math.pow(2, 30);
        const startIgush = process.hrtime();
        igusharr.push(k);
        const diffIgush = process.hrtime(startIgush);
        const timeIgush = diffIgush[0] * NS_PER_SEC + diffIgush[1]  * MS_PER_NS;
        //console.log(`${timeIgush.toFixed(8)} ms`);
        trackIgush.push(timeIgush);
        //normalArr.push(k);
        const startArr = process.hrtime();
        normalArr.push(k);
        const diffArr = process.hrtime(startArr);
        const timeArr = diffArr[0] * NS_PER_SEC + diffArr[1]  * MS_PER_NS;
        trackArray.push(timeArr);
     }
     const igushStats = calcStats(trackIgush);
     const arrStats = calcStats(trackArray);
     t.cell('Length:', i);
     t.cell('Average (Igush)', igushStats.avg, Table.number(8));
     t.cell('Average (Array)', arrStats.avg, Table.number(8));
     t.cell('Min (Igush)', igushStats.min, Table.number(8));
     t.cell('Min (Array)', arrStats.min, Table.number(8));
     t.cell('Max (Igush)', igushStats.max, Table.number(8));
     t.cell('Max (Array)', arrStats.max, Table.number(8));
     t.newRow();
  }
  console.log(`${t.toString()}`);
}

testInsert();
