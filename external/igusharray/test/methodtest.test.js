/**
 * MIT License
 *
 * Copyright (c) 2019 StoneT2000 (Stone Tao) email <stonezt2019@gmail.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

 /**
  *
  * Unit Testing with jest
  * @author Stone Tao
  */
var seedrandom = require('seedrandom');


var IgushArray = require("../igushArray.js");
var igusharr = new IgushArray(100);
igusharr.push(3,4,5);
var k =igusharr.entries();


var arr = [];

function randomizeArray(size, spaceleft = 0, randomize = true, small = false) {
  igusharr = new IgushArray(size + spaceleft);
  arr = [];
  var random = seedrandom('hello ther1e');
  if (randomize === true) {
    for (let i = 0; i < size; i++) {
      let k;
      if (small === false) {
        k = random() * Math.pow(2,31) - Math.pow(2,30);
      }
      else {
        k = Math.round(random()*size);
      }
      arr.push(k);
      igusharr.push(k);
    }
  }
  else {
    for (let i = 0; i < size; i++) {
      arr.push(i);
      igusharr.push(i);
    }
  }
}

// test access
test('Test array access', () => {
  randomizeArray(100,4, false);
  expect(igusharr.get(1)).toBe(arr[1]);
  expect(igusharr.get(10)).toBe(arr[10]);
  randomizeArray(1000);
  expect(igusharr.get(1)).toBe(arr[1]);
  expect(igusharr.length).toBe(arr.length);
});
// test push
test('Test array pushing', () => {
  randomizeArray(100);
  expect(igusharr.toString()).toBe(arr.toString());
  randomizeArray(1000);
  expect(igusharr.toString()).toBe(arr.toString());
  expect(igusharr.push(3)).toBe(arr.push(3));
  expect(igusharr.push(3,2,5)).toBe(arr.push(3,2,5));
  expect(igusharr.toString()).toBe(arr.toString());
});

// test errors
test('Test array errors', () => {
  randomizeArray(100);
  try {
    //FIXME, not quite right use of jest i believe
    expect(igusharr._rangeCheckAdd(102)).toThrow(Error);
    expect(igusharr._rangeCheck(-1)).toThrow(Error);
    expect(igusharr._rangeCheck(100)).toThrow(Error);
  }
  catch(err){

  }
  //expect(igusharr.toString()).toBe(arr.toString());
  randomizeArray(1000);
  expect(igusharr.toString()).toBe(arr.toString());
});

// unshift test

test('Test array unshifting', () => {
  randomizeArray(123,32);
  expect(igusharr.unshift(-23,4,"#@#")).toBe(arr.unshift(-23,4,"#@#"));
  expect(igusharr.unshift(10,100,123)).toBe(arr.unshift(10,100,123));
  expect(igusharr.toString()).toBe(arr.toString());
  expect(igusharr.unshift(3.23)).toBe(arr.unshift(3.23));
  expect(igusharr.toString()).toBe(arr.toString());
  randomizeArray(302,1);
  expect(igusharr.unshift(10,100,123)).toBe(arr.unshift(10,100,123));
  expect(igusharr.toString()).toBe(arr.toString());
});

// splicing
test('Test array splicing', () => {
  randomizeArray(241);
  igusharr.remove(0);
  igusharr.remove(1);
  arr.splice(0,1);
  arr.splice(1,1);
  igusharr.splice(0,3,1,3);
  arr.splice(0,3,1,3);
  expect(igusharr.toString()).toBe(arr.toString());
  expect(igusharr.splice(0,3)).toStrictEqual(arr.splice(0,3));
  expect(igusharr.toString()).toBe(arr.toString());
  randomizeArray(100,200);
  igusharr.remove(12);
  igusharr.remove(12);
  arr.splice(12,1);
  arr.splice(12,1);
  expect(igusharr.splice(0,-1)).toStrictEqual(arr.splice(0,-1));
  expect(igusharr.splice(0,-1,3,4,5)).toStrictEqual(arr.splice(0,-1,3,4,5));
  expect(igusharr.splice(0,999)).toStrictEqual(arr.splice(0,999));
  expect(igusharr.toString()).toBe(arr.toString());
  randomizeArray(310,910);
  expect(igusharr.splice(9999)).toStrictEqual(arr.splice(9999));
  expect(igusharr.splice(300)).toStrictEqual(arr.splice(300));
  expect(igusharr.toString()).toBe(arr.toString());
  expect(igusharr.splice(-3)).toStrictEqual(arr.splice(-3));
  expect(igusharr.splice(-99999)).toStrictEqual(arr.splice(-99999));
  expect(igusharr.toString()).toBe(arr.toString());
});

test('Test array removing', () => {
  randomizeArray(10,10);
  for (let i = 0; i < 4; i++) {
    igusharr.remove(4);
    arr.splice(4,1);
  }
  expect(igusharr.toString()).toBe(arr.toString());
  randomizeArray(300);
  for (let i = 0; i < 10; i++) {
    igusharr.remove(i);
    arr.splice(i, 1);
  }
  expect(igusharr.toString()).toBe(arr.toString());
})

// test shifting
test('Test array shifting', () => {
  randomizeArray(100);
  for (let i = 0; i < 30; i++) {
    igusharr.shift();
    arr.shift();
  }
  expect(igusharr.toString()).toBe(arr.toString());
  randomizeArray(310,910);
  for (let i = 0; i < 310; i++) {
    igusharr.shift();
    arr.shift();
  }
  expect(igusharr.toString()).toBe(arr.toString());
});

test('Test array popping', () => {
  randomizeArray(100);
  for (let i = 0; i < 30; i++) {
    expect(igusharr.pop()).toBe(arr.pop());
  }
  expect(igusharr.toString()).toBe(arr.toString());
  randomizeArray(310,90);
  for (let i = 0; i < 310; i++) {
    expect(igusharr.pop()).toBe(arr.pop());
  }
  expect(igusharr.toString()).toBe(arr.toString());
});

// test capacity ensurance

test('Capacity Checks', () => {
  randomizeArray(0,100); // all blank
  igusharr.setCapacity(200);
  expect(igusharr.toString()).toBe(arr.toString());
  randomizeArray(9,91); // 91 spaces blank
  igusharr.setCapacity(110);
  igusharr.setCapacity(112);
  expect(igusharr.toString()).toBe(arr.toString());
  randomizeArray(12);
  igusharr.setCapacity(30);
  expect(igusharr.toString()).toBe(arr.toString());
  randomizeArray(120);
  igusharr.setCapacity(300);
  expect(igusharr.toString()).toBe(arr.toString());
  randomizeArray(120,10);
  igusharr.push(1,2,3,4,5,6,7,8,9,10,11,12);
  arr.push(1,2,3,4,5,6,7,8,9,10,11,12);
  expect(igusharr.toString()).toBe(arr.toString());
});

test('Test array slicing', () => {
  randomizeArray(100,100);
  expect(igusharr.slice(0,10)).toStrictEqual(arr.slice(0,10));
  let testArr = [];
  let truthArr = [];
  for (let i = 0; i < 10; i++) {
    testArr.push(igusharr.slice(i, 13));
    truthArr.push(arr.slice(i, 13));
    expect(igusharr.slice(i,i+1)).toStrictEqual(arr.slice(i,i+1));
    expect(igusharr.slice(i,i+6)).toStrictEqual(arr.slice(i,i+6));
  }
  testArr.push(igusharr.slice(1));
  truthArr.push(arr.slice(1));
  expect(testArr).toStrictEqual(truthArr);
  expect(igusharr.slice(100000)).toStrictEqual(arr.slice(10000));
  expect(igusharr.slice()).toStrictEqual(arr.slice());
});

test('Test array reverse', () => {
  randomizeArray(100);
  igusharr.reverse();
  arr.reverse();
  expect(igusharr.toString()).toBe(arr.toString());
  randomizeArray(103,23);
  igusharr.reverse();
  arr.reverse();
  expect(igusharr.toString()).toBe(arr.toString());
});
function integerCompare(a,b) {
  if (a < b) return -1;
  else if (a===b) return 0;
  return 1;
}
test('Test array sort (quicksort)', () => {
  randomizeArray(200);
  igusharr.sort();
  arr.sort();
  expect(igusharr.toString()).toBe(arr.toString());
  randomizeArray(139,40);
  igusharr.sort(integerCompare);
  arr.sort(integerCompare);
  expect(igusharr.toString()).toBe(arr.toString());
});

test('Test array iterable', () => {
  randomizeArray(319);
  expect([...igusharr]).toStrictEqual([...arr]);
  expect([...igusharr]).toStrictEqual([...arr]);
  randomizeArray(119,44);
  expect([...igusharr]).toStrictEqual([...arr]);
  expect([...igusharr]).toStrictEqual([...arr]);
});
test('Test array fill', () => {
  randomizeArray(219);
  expect([...igusharr.fill(23)]).toStrictEqual([...arr.fill(23)]);
  randomizeArray(119,44);
  expect([...igusharr.fill(23,1,5)]).toStrictEqual([...arr.fill(23,1, 5)]);
  expect([...igusharr.fill("#",29)]).toStrictEqual([...arr.fill("#",29)]);
});

test('Test array map', () => {
  randomizeArray(219);
  expect([...igusharr.fill(23)]).toStrictEqual([...arr.fill(23)]);
  randomizeArray(119,44);
  expect([...igusharr.fill(23,1,5)]).toStrictEqual([...arr.fill(23,1, 5)]);
  expect([...igusharr.fill("#",29)]).toStrictEqual([...arr.fill("#",29)]);
});

test('Test array entries', () => {
  randomizeArray(219);
  let itr = igusharr.entries();
  let itr2 = arr.entries();
  for (let i = 0; i < 219; i++) {
    expect(itr.next()).toStrictEqual(itr2.next());
  }
  itr = igusharr.entries();
  itr2 = arr.entries();
  for (let i = 0; i < 229; i++) {
    expect(itr.next()).toStrictEqual(itr2.next());
  }
});
test('Test array isEmpty', () => {
  randomizeArray(23);
  expect(igusharr.isEmpty()).toBe(false);
  arr = [];
  igusharr = new IgushArray(10);
  expect(igusharr.isEmpty()).toBe(true);
});
test('Test array concat', () => {
  randomizeArray(183);
  expect([...igusharr.concat(arr)]).toStrictEqual([...arr.concat(arr)]);
  randomizeArray(119,44);
  expect([...igusharr.concat(arr)]).toStrictEqual([...arr.concat(arr)]);
});
test('Test array filter', () => {
  randomizeArray(383);
  expect([...igusharr.filter(val => Math.floor(val) % 2)]).toStrictEqual([...arr.filter(val => Math.floor(val) % 2)]);

});
test('Test array keys', () => {
  randomizeArray(38);
  let ikeys = igusharr.keys();
  let akeys = arr.keys();
  let b = [];
  for (let e of ikeys) {
    b.push(e);
  }
  for (let i = 0; i < arr.length; i++) {
    expect(b[i]).toBe(arr[i]);
  }
});
test('Test array join', () => {
  randomizeArray(318);
  expect(igusharr.join(",12")).toBe(arr.join(",12"));
  randomizeArray(210);
  expect(igusharr.join()).toBe(arr.join());
});
test('Test array reduce', () => {
  randomizeArray(10, 0, false, true);
  expect(igusharr.reduce((a,c) => a + c)).toBe(arr.reduce((a,c) => a + c));
});
