/**
* Real implementation of the performance observer.
*/
/* eslint max-len: ["error", { "code": 250 }] */

const { performance, PerformanceObserver } = require('perf_hooks');
const IgushArray = require('../external/igusharray/igushArray');
const { BigDecimalZero, BigDecimal } = require('../model/bigdecimal');
const { calculateMean } = require('../utils/stats');

class PerformanceMeasure {
  constructor(tag) {
    this.tag = tag;
    this.data = new IgushArray(100);
    this.countEnds = 0;
    const observer = new PerformanceObserver((list) => list.getEntries().forEach(
      (entry) => this.data.push(entry)
    ));
    observer.observe({ buffered: true, entryTypes: ['measure'] });
  }

  start = () => {
    performance.mark(`${this.tag}.start`);
  };

  end = () => {
    performance.mark(`${this.tag}.end`);
    performance.measure(this.tag, `${this.tag}.start`, `${this.tag}.end`);
    this.countEnds += 1;
  };

  log = () => {
    let currentMean = BigDecimalZero;
    const evtNum = this.data.length;
    for (let i = 0; i < evtNum; i += 1) {
      const entry = this.data.shift();
      currentMean = calculateMean(currentMean, i, new BigDecimal(entry.duration));
    }
    this.logger.info(`Events: ${evtNum} Mean(ms):${currentMean.getValue()}`);
  };
}

exports.PerformanceMeasure = PerformanceMeasure;
