//import { ContainerBuilder } from 'node-dependency-injection';
const  {WhiteShark} = require('../strategies/candlesticks/white_shark');
//const { ContainerBuilder } = require('node-dependency-injection');

const strategyFactory = (conf) => {
      switch (conf.name) {
          case 'White Shark': return new WhiteShark(conf);
          default: throw new Error(`Strategy ${conf.name} not existing`);
      }
}


/** *
 * All the strategies shall be loaded here.


const loadAllStrategies = (data) => {
    let container = new ContainerBuilder();
    let definition = container.register('app.synthetic_service');
    definition.synthetic = true;
    data.strategies.forEach(element => {
        console.log(` - ${element}`);
    });
    container.register('WhiteShark', WhiteShark);    
    container.set('strategies.white_shark', new WhiteShark());
    return container;
}; */


//exports.loadAllStrategies = loadAllStrategies;
//exports.mainContainer = container;
exports.strategyFactory = strategyFactory;