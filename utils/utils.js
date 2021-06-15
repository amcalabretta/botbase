/**
 * Function checking an array of values (taken from process.argv)
 * to retrieve the configuration file
 */

 const fs = require('fs');
 const yaml = require('js-yaml');
 
 const loadConfigurationFile = (argv) => {
   if (argv.length !== 3) {
     throw new Error('');
   }
   const confParam = argv[2];
   const paramTokens = confParam.split("=");
   if (paramTokens.length!==2) throw new Error('File');
   
   
   try {
     let data = yaml.safeLoad(fs.readFileSync('./data.yaml', 'utf8'));
   } catch (e) {
     throw new Error('File');
   }
 };
 
 exports.loadConfigurationFile = loadConfigurationFile;
 