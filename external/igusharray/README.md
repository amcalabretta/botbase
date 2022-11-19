# IgushArray Javascript

 An implementation of the [IgushArray](https://github.com/igushev/IgushArray) in javascript, with **O(1)** access and **O(N^1/2)** insertion and removal. This is a package on npm as well and can be installed directly by running

```bash
npm install igusharray
```

The javascript implementation of the IgushArray is a one for one replacement for the normal javascript array as it implements the same prototype methods as specified by [ECMA 262](https://www.ecma-international.org/publications/standards/Ecma-262.htm), with the only difference being that accessing elements in the IgushArray is done through the `get(index)` method instead of doing `array[index]`. In the rest of this readme, the normal javascript array will be referred to as the built in array.

You are welcome to **contribute** to this repository, just fork it, make a change, write what changes you made, and make the pull request! There's a list of things you can help out on in the **Todo** section of this readme.

## Overview

Comparisons of time complexities in key operations in similar data structures are shown below.

| Operation        | Array | IgushArray        | Linked List |
| ---------------- | ----- | ----------------- | ----------- |
| Access (Get)     | O (1) | **O (1)**         | O (N)       |
| Insert (Add)     | O (N) | **O (N**^**1/2)** | O (1)       |
| Erase (Remove)   | O (N) | **O (N**^**1/2)** | O (1)       |
| Push Back (Push) | O (1) | O (1)             | O (1)       |
| Push Front       | O (N) | **O (N**^**1/2)** | O (1)       |

More details on the general idea, motivation etc. can be found [here](https://github.com/igushev/IgushArray#overview)

It is important to note that this IgushArray needs to knows its capacity ahead of time. It is better to allocate more space than you need for this array as having to resize the array when more data is added than can be held will be very slow.

## Getting Started

Using the IgushArray is super simple, it only has one difference with the built in array, which is accessing elements.

To create an IgushArray with capacity 100, you will need to do the following

```javascript
const IgushArray = require("igusharray");
var myArray = new IgushArray(100); // equivalent to var myArray = new Array(100);
```

To add data, just treat it like a normal array

```javascript
myArray.push(1,2,3); // same as the built in array
// now myArray contains [1, 2, 3]
```

The difference comes with the replacement of the `[]`, which is commonly used to access and manipulate array data, with the methods `get` and `set`, akin to that of Java's ArrayList. `Splice` could also be used in place of `set` if wanted.

```javascript
myArray.set(1, 100); // equivalent to myArray[1] = 100
// myArray is now [1, 100, 3]
var sum = myArray.get(1) + myArray.get(2); // equivalent to myArray[1] + myArray[2];
// sum equals 100 + 3 = 103
```

Any **questions**? Post an **issue** in this repository on GitHub. But first, check out documentation on built in Arrays, done really nicely [here](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) on Mozilla web docs.

# Performance Tests

All results are in milliseconds and are the averages, comparing the IgushArray with the built in array. All tests performed with node js. All performance testing code can be run with

```bash
npm run perf
```

You can check the performance testing source code out, which is located at `test/perftest.js`

## Access by Index

In this test, random indices were accessed 100,000 times for 50 trials.

It can be seen that the IgushArray maintains **O(1)** access time complexity, equivalent to the built in array. However, there is a little extra overhead with the get operation and access times are longer, but still constant. Any possible blips in times may be due to the javascript garbage collector. With differences in 100,000 access times being a few milliseconds, the difference between individual access times is on the magnitude of 1/100,000 of milliseconds, or 10^-8 seconds, which is very minute, and well compensated by the massive improvements in run times of key operations such as push and shift.

| Array length | IgushArray | Built in Array |
| ------------ | ---------- | -------------- |
| 10           | 8.4758     | 7.1391         |
| 100          | 8.3802     | 7.0198         |
| 1,000        | 8.4587     | 7.1254         |
| 10,000       | 9.0495     | 7.0218         |
| 100,000      | 11.4949    | 7.1435         |
| 1,000,000    | 11.5610    | 8.1127         |

## Insertion / Push Front / Unshift

In this test, the operation was performed 10,000 times for 50 trials.

In this test, the arrays were initialized to a size of 10^k - 1000. The 1000 insertion/add operations that added values to the front of the arrays then filled the lists to size 10^k.

For every size of array, the IgushArray out performs the built in array by a massive amount.

| Array length | IgushArray | Built in Array |
| ------------ | ---------- | -------------- |
| 10           | 10.6954    | 17.9560        |
| 100          | 9.9862     | 17.8132        |
| 1,000        | 10.7669    | 18.9642        |
| 10,000       | 18.5716    | 32.3032        |
| 100,000      | 71.5691    | 224.6982       |

## Remove Front / Shift

In this test, the operation was performed 1000 times for 50 trials.

Each array was initialized to a size and capacity of 10^k. The 1000 remove front (shift) operations performed then reduced their sizes down to 10^k - 1000.

For every size of array, the IgushArray out performs the built in array by increasing factors as the size increases.

| Array length | IgushArray | Built in Array |
| ------------ | ---------- | -------------- |
| 10           | 0.0036     | 0.0856         |
| 100          | 0.0037     | 0.0458         |
| 1,000        | 0.0043     | 0.0908         |
| 10,000       | 0.0048     | 0.5619         |
| 100,000      | 0.0101     | 216.5328       |
| 1,000,000    | 0.0164     | Not Recorded   |

## Slice

In this test, the slice operation was performed 10,000 times for 50 trials

For both arrays, the same random slice is taken and the time it takes to slice is taken.

This is generally a constant time operation as seen in the result below. Additionally, the IgushArray is only slower by tenths of milliseconds for 10,000 operations, or otherwise slower on the magnitude of 10^-8 seconds, which is very small compared to the improvement in shift, unshift operations are.

| Array length | IgushArray | Built in Array |
| ------------ | ---------- | -------------- |
| 10           | 1.4548     | 1.1059         |
| 100          | 1.2613     | 0.9546         |
| 1,000        | 1.2429     | 1.0539         |
| 10,000       | 1.2485     | 1.0139         |
| 100,000      | 1.3619     | 1.0943         |

# Implementation

Please see [here](https://github.com/igushev/IgushArray#implementation) for an in depth explanation of how this is generally implemented.

For the Java version, the IgushArray is essentially an ArrayList of FixedDeques.

Each FixedDeque is a fixed length Deque (Double Ended Queue) implemented as a Circular/Ring Buffer. Additionally, to maintain **O(1)** access time complexity, the Circular/Ring Buffer is implemented with ArrayList, which works as a contiguous set of elements in memory.

# Method testing

[Jest](https://jestjs.io/) is used for unit testing (code coverage etc.) and the tests are all in the file `test/methodtest.test.js`

To install jest and test the code yourself, run the following in the root directory (same directory as package.json)

```bash
npm install --save-dev jest
npm run test
```

# Todo

- Complete implementations for missing methods that the built in array has
  - every
  - filter (missing handling this argument)
  - find (missing handling this argument)
  - findIndex
  - flat
  - flatMap
  - forEach
  - includes (mostly done)
  - map
  - reduceRight
  - some
  - toLocaleString
  - toSource
- Fine tune the implementations marked with the TUNE comment