[![GitHub license](https://img.shields.io/github/license/amcalabretta/botbase?style=plastic)](https://github.com/amcalabretta/botbase/blob/master/LICENSE)
[![GitHub license](https://img.shields.io/github/issues/amcalabretta/botbase?style=plastic)](https://github.com/amcalabretta/botbase/issues)


# BotBase
An experimental bot to automatically make trades on coinbase

## Howtos

### How to run it.

Notice that, being based on the use of workers ([more details here](https://nodejs.org/api/worker_threads.html)), it required to use node version 16.2.0 at least, in  order to do so, run the following command to check the current version being used locally:

```
node -v
```

if the version is below 16.2 proceed as follows:

run the following command to see the list of node environments

```
nvm ls
```

if you already have version 16.2.0 run:

```
nvm use v16.2.0
```

else install it (it will set 16.2.0 as default automatically)

```
nvm install v16.2.0
```

The core part of the bot is the main.js file, in order to start it, load a set of strategies in the all_strategies.js file (under the strategies folder) and then export as *environment variables* the authentication data for codebase:

```
export key=<your-api-key>
export secret=<your-api-secret>
export name=<your-api-name>
```

for more details on how to create the values above, refer to the wiki.

Now you are ready to run botbase:

```
node main.js
```

### How to unit test.

Unit tests are, as you probably guesses, in the 'test' directory, to run all the unit tests:

```
npm test
```

to run the test and measure the coverage:

```
npm test-coverage
```




