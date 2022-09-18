
# BotBase

[![GitHub license](https://img.shields.io/github/license/amcalabretta/botbase?style=plastic)](https://github.com/amcalabretta/botbase/blob/master/LICENSE)
[![Issues](https://img.shields.io/github/issues/amcalabretta/botbase?style=plastic)](https://github.com/amcalabretta/botbase/issues)
[![Codacy grade](https://img.shields.io/codacy/grade/18b28f4cd13647bbb3d1e15d8c637b82?style=plastic)](https://app.codacy.com/gh/amcalabretta/botbase/dashboard?branch=master)
[![Code Climate maintainability](https://img.shields.io/codeclimate/maintainability/amcalabretta/botbase?style=plastic)](https://codeclimate.com/github/amcalabretta/botbase)
[![Travis (.com)](https://img.shields.io/travis/com/amcalabretta/botbase?style=plastic)](https://travis-ci.com/github/amcalabretta/botbase)
[![Codacy coverage](https://img.shields.io/codacy/coverage/18b28f4cd13647bbb3d1e15d8c637b82?style=plastic)](https://app.codacy.com/gh/amcalabretta/botbase/dashboard?branch=master)
[![Libraries.io dependency status for GitHub repo](https://img.shields.io/librariesio/github/amcalabretta/botbase?style=plastic)](https://libraries.io/github/amcalabretta/botbase)
[![GitHub Super-Linter](https://github.com/amcalabretta/botbase/workflows/Lint%20Code%20Base/badge.svg)](https://github.com/marketplace/actions/super-linter)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=amcalabretta_botbase&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=amcalabretta_botbase)


An experimental bot to automatically trade on coinbase

## Howtos

### How to set up the environment

Notice that, being based on the use of workers ([more details here](https://nodejs.org/api/worker_threads.html)), it required to use node version 16.2.0 at least, in  order to do so, run the following command to check the current version being used locally:

```bash
node -v
```

if the version is below 16.2 proceed as follows:

run the following command to see the list of node environments

```bash
nvm ls
```

if you already have version 16.2.0 run:

```bash
nvm use v16.2.0
```

else install it (it will set 16.2.0 as default automatically)

```bash
nvm install v16.2.0
```

The core part of the bot is the main.js file, in order to start it, load a set of strategies in the all_strategies.js file (under the strategies folder) and then export as *environment variables* the authentication data for codebase:

```bash
export key=<your-api-key>
export secret=<your-api-secret>
export name=<your-api-name>
```

for more details on how to create the values above, refer to the wiki.

### How to run it

To run the bot, type:
```bash
node main.js --conf=/path/to/the/configuration/yaml/file.yaml
```

### How to unit test

Unit tests are, as you probably guessed, in the 'test' directory, to run all the unit tests:

```bash 
npm test
```

to run the test and measure the coverage:

```bash
npm run test-coverage
```
after running the above command, coverage is shown in the *coverage/index.html* file:

to run the test continuously whilst you are developing:

```bash
npm run test-dev
```

you can also run continuous testing on a particular test (quite handy to have the results fast)


```bash
npm run test-dev path/to/your/test/file
```

Going further down, you can also continuously running a particular single test:

```bash
npm run test-dev-one --test_file=<file containing the test> --pattern='<Pattern in the description>'
```



