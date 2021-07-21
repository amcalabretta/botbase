/**
 * Function checking an array of values (taken from process.argv)
 * to retrieve the configuration file
 */

const fs = require('fs');
const yaml = require('js-yaml');

const loadConfigurationFile = (argv) => {
  if (argv.length !== 3) {
    throw new Error('Usage: node main --conf=/path/to/yaml/file');
  }
  const confParam = argv[2];
  const paramTokens = confParam.split('=');
  if (paramTokens.length !== 2) throw new Error('Usage: node main --conf=/path/to/yaml/file');
  if (paramTokens[0] !== '--conf') throw new Error('Usage: node main --conf=/path/to/yaml/file, firts token is not --conf');
  try {
    const data = yaml.load(fs.readFileSync(paramTokens[1], 'utf8'));
    if (!data.logging.logDir) throw new Error(`Logging directory not found in file ${paramTokens[1]}`);
    if (!fs.existsSync(data.logging.logDir)) throw new Error(`Logging directory  ${data.logging.logDir} does not exists`);
    return data;
  } catch (e) {
    throw new Error(`${e}`);
  }
};

exports.loadConfigurationFile = loadConfigurationFile;
