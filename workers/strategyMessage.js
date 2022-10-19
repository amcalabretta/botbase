/**
 * Function bound to the message callback for startegy workers.
 */
const strategyMessage = (message) => {
  console.log(`Message passed by the Main:${message}`);
};

exports.strategyMessage = strategyMessage;
