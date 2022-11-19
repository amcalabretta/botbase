/**
* Real implementation of the performance observer.
*/
/* eslint max-len: ["error", { "code": 250 }] */

const { performance, PerformanceObserver } = require('perf_hooks');
const IgushArray = require('../external/igusharray/igushArray');

class PerformanceMeasure {

    constructor(tag) {
        this.tag = tag;
        this.performance = new IgushArray(100);
        this.countStarts = 0;
        this.countEnds = 0;
        const observer = new PerformanceObserver(list => list.getEntries().forEach(
            entry => this.performance.push(entry)));
        observer.observe({ buffered: true, entryTypes: ['measure'] });
    }

    start = () => {
        performance.mark(`${this.tag}.start`);
        this.countStarts+=1;
    }

    end = () => {
        performance.mark(`${this.tag}.end`);
        performance.measure(this.tag, `${this.tag}.start`, `${this.tag}.end`);
        this.countEnds+=1;
    }

    log = () => {
        this.logger.info(`Got ${this.performance.length} events`);
        for (let i=0;i<this.performance.length;i++) {
            const entry = this.performance.shift();
            this.logger.info(`${JSON.stringify(entry)}`);
        }
    }
}

exports.PerformanceMeasure = PerformanceMeasure;
