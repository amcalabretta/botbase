/**
 * Function checking an array of values (taken from process.argv)
 * to retrieve the configuration file
 */

const fs = require('fs');
const yaml = require('js-yaml');

const loadConfigurationFile = (argv) => {
  try {
    if (argv.length === 3) {
      const confParam = argv[2];
      const paramTokens = confParam.split('=');
      if (paramTokens.length === 2 && paramTokens[0] === '--conf') {
        return yaml.load(fs.readFileSync(paramTokens[1], 'utf8'));
      }
    }
    throw new Error('Usage: node main --conf=/path/to/yaml/file');
  } catch (e) {
    throw new Error(`${e}`);
  }
};

exports.loadConfigurationFile = loadConfigurationFile;
