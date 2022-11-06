const seedrandom = require('seedrandom');
const mocha = require('mocha');
const { describe } = mocha;
const { it } = mocha;
const assert = require('assert');
const IgushArray = require('../../../external/igusharray/igushArray');

let igusharr = new IgushArray(100);
igusharr.push(3, 4, 5);
const k = igusharr.entries();

let arr = [];

const randomizeArray = (size, spaceleft = 0, randomize = true, small = false) => {
  igusharr = new IgushArray(size + spaceleft);
  arr = [];
  const random = seedrandom('hello ther1e');
  if (randomize === true) {
    for (let i = 0; i < size; i++) {
      let k;
      if (small === false) {
        k = random() * Math.pow(2, 31) - Math.pow(2, 30);
      } else {
        k = Math.round(random() * size);
      }
      arr.push(k);
      igusharr.push(k);
    }
  } else {
    for (let i = 0; i < size; i++) {
      arr.push(i);
      igusharr.push(i);
    }
  }
}

const integerCompare = (a,b) => {
  if (a < b) return -1;
  else if (a===b) return 0;
  return 1;
}

describe('IgushArray', () => {

  it('Should implement the access function', (done) => {
    randomizeArray(100, 4, false);
    assert.strictEqual(igusharr.get(1), arr[1]);
    assert.strictEqual(igusharr.get(10), arr[10]);
    randomizeArray(1000);
    assert.strictEqual(igusharr.get(1), arr[1]);
    assert.strictEqual(igusharr.length, arr.length);
    done();
  });

  it('Should implement the push function', (done) => {
    randomizeArray(100);
    assert.strictEqual(igusharr.toString(), arr.toString());
    randomizeArray(1000);
    assert.strictEqual(igusharr.toString(), arr.toString());
    assert.strictEqual(igusharr.push(3), arr.push(3));
    assert.strictEqual(igusharr.push(3, 2, 5), arr.push(3, 2, 5));
    assert.strictEqual(igusharr.toString(), arr.toString());
    done();
  });

  it('should throw errors', (done) => {
    randomizeArray(100);
    assert.throws(() => igusharr._rangeCheckAdd(102), { name: 'Error', message: 'Mutating invalid position of 102 in IgushArray' });
    assert.throws(() => igusharr._rangeCheckAdd(-1), { name: 'Error', message: 'Mutating invalid position of -1 in IgushArray' });
    randomizeArray(1000);
    assert.strictEqual(igusharr.toString(), arr.toString());
    done();
  });

  it('Should implement the unshif function', (done) => {
    randomizeArray(123, 32);
    assert.strictEqual(igusharr.unshift(-23, 4, "#@#"), arr.unshift(-23, 4, "#@#"));
    assert.strictEqual(igusharr.unshift(10, 100, 123), arr.unshift(10, 100, 123));
    assert.strictEqual(igusharr.toString(), arr.toString());
    assert.strictEqual(igusharr.unshift(3.23), arr.unshift(3.23));
    assert.strictEqual(igusharr.toString(), arr.toString());
    randomizeArray(302, 1);
    assert.strictEqual(igusharr.unshift(10, 100, 123), arr.unshift(10, 100, 123));
    assert.strictEqual(igusharr.toString(), arr.toString());
    done();
  });

  it('Should throw an error when splicing (incomplete)', (done) => {
    randomizeArray(241);
    assert.throws(() => igusharr.splice(0,999), { name: 'Error', message: 'Not implemented' });
    done();
  });

  it('Should remove an element', (done) => {
    randomizeArray(10,10);
    for (let i = 0; i < 4; i++) {
      igusharr.remove(4);
      arr.splice(4,1);
    }
    done();
  });

  it('Should remove an item ', (done) => {
    randomizeArray(10,10);
    for (let i = 0; i < 4; i++) {
      igusharr.remove(4);
      arr.splice(4,1);
    }
    assert.strictEqual(igusharr.toString(), arr.toString());
    randomizeArray(300);
    for (let i = 0; i < 10; i++) {
      igusharr.remove(i);
      arr.splice(i, 1);
    }
    assert.strictEqual(igusharr.toString(), arr.toString());
    done();
  });

  it('Should shifting', (done) => {
    randomizeArray(100);
    for (let i = 0; i < 30; i++) {
      igusharr.shift();
      arr.shift();
    }
    assert.strictEqual(igusharr.toString(),arr.toString());
    randomizeArray(310,910);
    for (let i = 0; i < 310; i++) {
      igusharr.shift();
      arr.shift();
    }
    assert.strictEqual(igusharr.toString(),arr.toString());
    done();
  });

  it('Should implement the pop function', (done) => {
    randomizeArray(100);
    for (let i = 0; i < 30; i++) {
      assert.strictEqual(igusharr.pop(),arr.pop());
    }
    assert.strictEqual(igusharr.toString(),arr.toString());
    randomizeArray(310,90);
    for (let i = 0; i < 310; i++) {
      assert.strictEqual(igusharr.pop(),arr.pop());
    }
    assert.strictEqual(igusharr.toString(),arr.toString());
    done();
  });

  it('Capacity Checks', (done) => {
    randomizeArray(0,100); // all blank
    igusharr.setCapacity(200);
    assert.strictEqual(igusharr.toString(),arr.toString());
    randomizeArray(9,91); // 91 spaces blank
    igusharr.setCapacity(110);
    igusharr.setCapacity(112);
    assert.strictEqual(igusharr.toString(),arr.toString());
    randomizeArray(12);
    igusharr.setCapacity(30);
    assert.strictEqual(igusharr.toString(),arr.toString());
    randomizeArray(120);
    igusharr.setCapacity(300);
    assert.strictEqual(igusharr.toString(),arr.toString());
    randomizeArray(120,10);
    igusharr.push(1,2,3,4,5,6,7,8,9,10,11,12);
    arr.push(1,2,3,4,5,6,7,8,9,10,11,12);
    assert.strictEqual(igusharr.toString(),arr.toString());
    done();
  });

  it('Should throw an error when slicing (incomplete)', (done) => {
    randomizeArray(241);
    assert.throws(() => igusharr.slice(0,999), { name: 'Error', message: 'Not implemented' });
    done();
  });

  it('Should reverse', (done) => {
    randomizeArray(100);
    igusharr.reverse();
    arr.reverse();
    assert.strictEqual(igusharr.toString(),arr.toString());
    randomizeArray(103,23);
    igusharr.reverse();
    arr.reverse();
    assert.strictEqual(igusharr.toString(),arr.toString());
    done();
  });

  it('Test array sort (quicksort)', (done) => {
    randomizeArray(200);
    igusharr.sort();
    arr.sort();
    assert.strictEqual(igusharr.toString(),arr.toString());
    randomizeArray(139,40);
    igusharr.sort(integerCompare);
    arr.sort(integerCompare);
    assert.strictEqual(igusharr.toString(),arr.toString());
    done();
  });

  it('Test array entries', (done) => {
    randomizeArray(219);
    let itr = igusharr.entries();
    let itr2 = arr.entries();
    for (let i = 0; i < 219; i++) {
      const it1 = itr.next();
      const it2 = itr2.next();
      assert.strictEqual(it1.value[1],it2.value[1]);
    }
    done();
  });

  it('Test array isEmpty (true case)', (done) => {
    igusharr = new IgushArray(10);
    assert.strictEqual(igusharr.isEmpty(),true);
    done();
  });

  it('Test array isEmpty (false case)', (done) => {
    randomizeArray(23);
    assert.strictEqual(igusharr.isEmpty(),false);
    done();
  });

  it('Test concat', (done) => {
    randomizeArray(183);
    const igushConcat = igusharr.concat(arr); 
    const arrConcat = arr.concat(arr);
    assert.strictEqual(igushConcat.length,arrConcat.length);
    for (let i = 0; i<igushConcat.length;i++) {
      assert.strictEqual(igushConcat.get(i),arrConcat[i]);
    }
    done();
  });

  it('Test filter', (done) => {
    randomizeArray(383);
    const igushFilter = igusharr.filter(val => Math.floor(val) % 2);
    const arrFilter = arr.filter(val => Math.floor(val) % 2);
    for (let i = 0; i<igushFilter.length;i++) {
      assert.strictEqual(igushFilter.get(i),arrFilter[i]);
    }
    done();
  });

});

