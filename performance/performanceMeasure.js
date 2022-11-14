/**
* Real implementation of the performance observer.
*/
/* eslint max-len: ["error", { "code": 250 }] */

const { performance, PerformanceObserver } = require('perf_hooks');


class PerformanceMeasure {

    constructor(tag) {
        this.tag = tag;
        const observer = new PerformanceObserver(list => list.getEntries().forEach(entry => console.info(entry)));
        observer.observe({ buffered: true, entryTypes: ['measure'] });
    }

    start = () => {
        performance.mark(`${this.tag}.start`);
    }

    end = () => {
        performance.mark(`${this.tag}.end`);
        performance.measure(this.tag, `${this.tag}.start`, `${this.tag}.end`);
    }
}

exports.PerformanceMeasure = PerformanceMeasure;
