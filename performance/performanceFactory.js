const { PerformanceMeasure } = require('./performanceMeasure');
const { EmptyPerformanceMeasure } = require('./emptyPerformanceMeasure');

const performanceFactory = (conf, tag) => {
  if (conf.measurePerf) return new PerformanceMeasure(tag);
  return new EmptyPerformanceMeasure();
};

exports.performanceFactory = performanceFactory;
