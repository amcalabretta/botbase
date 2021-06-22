import { ContainerBuilder } from 'node-dependency-injection';
import WhiteShark from '../strategies/candlesticks/white_shark';

/** *
 * All the strategies shall be loaded here.
 */

const loadAllStrategies = (data) => {
    let container = new ContainerBuilder();
    let definition = container->register('app.synthetic_service');
    definition.synthetic = true;
    data.strategies.forEach(element => {
        console.log(` - ${element}`);
    });
    
    container.register('WhiteShark', WhiteShark);    
    container.set('strategies.white_shark', new WhiteShark());
    return container;
};
