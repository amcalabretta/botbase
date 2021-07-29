
    const allMarkets = [];
    botConfiguration.strategies.forEach((strategy, idx) => {
      const identifier = v4().substring(0, 8);
      mainLogger.info(`Setting up instance for strategy ${strategy.name} - id:${identifier}`);
      strategy.markets.forEach((market) => {
        if (allMarkets.indexOf(market) === -1) {
          mainLogger.info(` - Adding market ${market} to the main engine`);
          allMarkets.push(market);
        }
      });
      const worker = new Worker('./worker.js', { workerData: { conf: botConfiguration, index: idx, uuid: identifier } });
      worker.on('message',
        incomingMessage => {
          const order = incomingMessage.order;
          orderLogger.info(`Received order from strategy:${incomingMessage.strategyId}, type ${order.type}`);
        }
      );
    });
  });
        
        
        
        
        
        
      });;