/**
 * Function bound to the message callback for startegy workers.
 */
const strategyMessage = (message) => {
  console.log('Here is the message passed by the main');
};

exports.strategyMessage = strategyMessage;
