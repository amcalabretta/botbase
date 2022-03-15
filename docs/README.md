[![Codacy coverage](https://img.shields.io/codacy/coverage/18b28f4cd13647bbb3d1e15d8c637b82?style=plastic)](https://app.codacy.com/gh/amcalabretta/botbase/dashboard?branch=master)




# Getting started
In order to use botbase, you will have to follow the following steps:

Clone the repository:
```bash

```

Botbase makes us of node's <a href="https://nodejs.org/docs/latest-v16.x/api/worker_threads.html" target="_blank">workers</a>, so you need to use a compatible node version (16.2.0 will work):
```bash
nvm use 16.2.0
```

## Configuration
As stated in the previous paragraph botbase runs with one configuration file that is passed via the command line, the yaml file used is hereby shown:


```yaml
main:
  mode: 'SYM'
logging:
  logDir: './logs'
  logLevel: 'debug'
tracking:
  track: true,
  trackDir: "./tracking"
flat: 
  maxLossEur: 300
  maxLossUsd: 300
strategies:
  - name: 'White Shark'
    markets: ['ADA-EUR']
    cryptoAmounts: [1000]
    euroAmount: 9
    dollarAmount: 0
    subConf:
      wickRatio: 0.05
      volumeRatio: 0.9
      numBearishCandles: 3
      gapRatio: 0.2
      buyRatio: 0.01
      sellRatio: 0.02
meta: | 
     Here is all my documentation and metadata
     blah blah blah.

```

## Running

You can run botbase in the following modes:

As-is
Docker
PM2


## For devs: how does it work


# Strategies

## Anatomy of a strategy

## Build your own strategy


### Define and validate the configuration
### Implementing the logic
### Unit testing
### Back testing

## Implemented Startegies
### White Shark
White shark strategy is based on a well known candlestick pattern
# Releases

# Misc
## Howtos

### How to generate the API keys on coinbase

### How to run botbase in the cloud: Azure

### How to run botbase in the cloud: Amazon

## FAQ

### Will i get rich by using botbase?
Botbase is intended to be used for people who knows how to trade and want a way to automate their trading, depending on how good your trading skills are, you might make some money, as for getting rich, I haven't heard (yet) of anybody succeeding in this matter.



