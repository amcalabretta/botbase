/* eslint max-len: ["error", { "code": 120 }] */
/**
 * Function checking an array of values (taken from process.argv)
 * to retrieve the configuration file
 */

const fs = require('fs');
const yaml = require('js-yaml');

const checkArgs = (argv) => {
  if (argv.length === 3) {
    const confParam = argv[2];
    const paramTokens = confParam.split('=');
    if (paramTokens.length === 2 && paramTokens[0] === '--conf') {
      return yaml.load(fs.readFileSync(paramTokens[1], 'utf8'));
    }
  }
  throw new Error('Usage: node main --conf=/path/to/yaml/file');
};

const loadConfigurationFile = (argv) => {
  const data = checkArgs(argv);
  if (!data.logging.logDir) throw new Error('Logging directory not found');
  if (!fs.existsSync(data.logging.logDir)) throw new Error(`Logging directory  ${data.logging.logDir} does not exists`);
  return data;
};

exports.loadConfigurationFile = loadConfigurationFile;
