
const { PerformanceMeasure } = require('./performanceMeasure');
const { EmptyPerformanceMeasure } = require('./emptyPerformanceMeasure');

const performanceFactory = (conf, tag) => {
  if (conf.measurePerf) return new PerformanceMeasure(tag);
  else return new EmptyPerformanceMeasure(tag);
};

exports.performanceFactory = performanceFactory;