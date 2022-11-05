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
 * Implementation of the IgushArray in JavaScript
 * @author Stone Tao
 *
 */
var RingBuffer = require("./util/ringBuffer.js");

module.exports = IgushArray;

function IgushArray(initialCapacity = 10) {
  this.capacity = initialCapacity;
  this.deqCapacity = Math.floor(Math.pow(this.capacity, 0.5));
  this.lastDeqCapacity = this.capacity % this.deqCapacity;
  this.listCapacity = Math.ceil(this.capacity / this.deqCapacity);

  this.data = new Array(this.listCapacity);
  this.length = 0;
  let i;
  for (i = 0; i < this.listCapacity - 1; i++) {
    this.data[i] = new RingBuffer(this.deqCapacity);
  }
  if (this.lastDeqCapacity != 0) {
    this.data[i] = new RingBuffer(this.lastDeqCapacity);
  } else {
    this.data[i] = new RingBuffer(this.deqCapacity);
  }
}
/* System Methods, outside of ECMA 262 specifications  */
IgushArray.prototype.setCapacity = function(newCapacity) {
  if (newCapacity < this.capacity) {
    throw new Error("New capacity: " + newCapacity + " is not larger than the old capacity of " + this.capacity);
  }
  this.capacity = newCapacity;

  // reset the deqCapacities to maintain optimal insert and remove times
  // quite costly

  let newDeqCapacity = Math.floor(Math.pow(this.capacity, 0.5));
  let newLastDeqCapacity = this.capacity % newDeqCapacity;
  let newListCapacity = Math.ceil(this.capacity / newDeqCapacity);

  if (newDeqCapacity != this.deqCapacity) {
    // deq capacity changed, which implies list capacity must change
    this.deqCapacity = newDeqCapacity;

    // go from 0 to listCapacity instead of listCapacity - 1 as list capacity must change, and the final fixedDeque
    // should now have normal deq size.
    for (let i = 0; i < this.listCapacity; i++) {
      this.data[i].setCapacity(this.deqCapacity);
    }
    // now we have to shift all data down to fill in holes, fairly costly to do

    let indexOfLastPartialFixedDeque = Math.ceil(this.length / newDeqCapacity);
    let j = 0;
    while (j < indexOfLastPartialFixedDeque) {
      let higherIndice = j + 1;

      // keep filling FixedDeque at indice j until it is full. Pop from FixedDeque higherIndice until it is empty
      // before moving on to next FixedDeque to pop from.
      while (!this.data[j].isFull()) {
        // data.get(j) fixedDeque has space left, fill it up with array data from next index.
        if (this.data[higherIndice].isEmpty()) {
          higherIndice++;
          if (higherIndice > this.listCapacity - 1) {
            break;
          }
        }
        else {
          let popped = this.data[higherIndice].popFront();
          this.data[j].push(popped);
        }
      }
      j++;
    }
  }

  //FIXME might be a redundant check, see how ArrayList ensureCapacity is implemented
  if (newListCapacity != this.listCapacity) {

    if (this.data[this.listCapacity - 1].size != this.deqCapacity) {
      // new list capacity means old last FixedDeque needs to be of size deqCapacity
      this.data[this.listCapacity - 1].setCapacity(this.deqCapacity);
    }
    // TUNE: Might be a better way to tell the backend to increase capacity of array to newListCapacity
    this.data = this.data.concat(new Array(newListCapacity - this.listCapacity));
    //should be equivalent to this: data.ensureCapacity(newListCapacity);

    // TUNE: The above method to set new capacity may cause some unwanted side effects, unknown if they occur:
    // 1. The backing array becomes holey
    // 2. Actual capacity is larger than expected

    let i = this.listCapacity;
    for (; i < newListCapacity - 1; i++) {
      this.data[i] = new RingBuffer(this.deqCapacity);
      //data.add(new FixedDeque<>(deqCapacity));
    }
    this.lastDeqCapacity = newLastDeqCapacity;

    if (this.lastDeqCapacity != 0) {
      this.data[i] = new RingBuffer(this.lastDeqCapacity);
      //data.add(new FixedDeque<E>(lastDeqCapacity));
    } else {
      this.data[i] = new RingBuffer(this.deqCapacity);
      //data.add(new FixedDeque<E>(deqCapacity));
    }

    this.listCapacity = newListCapacity;
  }
}

// Accessor method
IgushArray.prototype.get = function(index) {
  this._rangeCheck(index);
  let listIndex = Math.floor(index / this.deqCapacity);
  let deqIndex = index % this.deqCapacity;
  return this.data[listIndex].get(deqIndex);
}

// use this if index != 0 or this.length
IgushArray.prototype.add = function(index, item) {
  this._rangeCheckAdd(index);
  let listIndex = Math.floor(index / this.deqCapacity);
  let deqIndex = index % this.deqCapacity;
  let deque = this.data[listIndex];
  if (!deque.add(deqIndex, item)) {
    // if fail to add, then deque must be full
    // O(n^1/2) insertion process into N^1/2 capacity deque
    // remove end of the deque to give space for element and avoid expanding deque size
    let removedElement = this.data[listIndex].remove(this.data[listIndex].size - 1);
    this.data[listIndex].add(deqIndex, item);
    this._shiftUp(listIndex + 1, removedElement);

  }
  this.length++;
}
/**
 * @param index the index of the element to be removed
 * @returns the removed element from the IgushArray; undefined if array is empty.
 */
IgushArray.prototype.remove = function(index) {
  this._rangeCheck(index);
  let listIndex = Math.floor(index / this.deqCapacity);
  let deqIndex = index % this.deqCapacity;
  let deque = this.data[listIndex];
  let removedElement = deque.remove(deqIndex);
  this._shiftDown(listIndex + 1);
  this.length--;
  return removedElement;
}

// Like splice(index, 1, item), but less checks
IgushArray.prototype.set = function(index, item) {
  let listIndex = Math.floor(index / this.deqCapacity);
  let deqIndex = index % this.deqCapacity;
  return this.data[listIndex].set(deqIndex, item);
}

IgushArray.prototype._rangeCheck = function(index) {
  if (index >= this.length || index < 0) {
    throw new Error("Accessing invalid position of " + index + " in IgushArray");
  }
}
IgushArray.prototype._rangeCheckAdd = function(index) {
  if (index > this.length || index < 0) {
    throw new Error("Mutating invalid position of " + index + " in IgushArray");
  }
}

// does not check for capacity, essentially add(0, item), but optimized, less space used and less calculations
IgushArray.prototype._pushFront = function(item) {
  if (this.data[0].isFull()) {
    let removedElement = this.data[0].remove(this.data[0].size - 1);
    this._shiftUp(1, removedElement);
  }
  this.data[0].add(0, item);
  this.length++;
}

IgushArray.prototype._shiftUp = function(listIndex, frontElement) {
  while (listIndex < this.listCapacity) {
    let deque = this.data[listIndex];

    // We shiftUp the deques if they are full, otherwise we just add to the final non full deque and stop the
    // shifting process
    if (deque.isFull()) {
      frontElement = deque.shiftUp(frontElement);
    } else {
      deque.add(0, frontElement);
      break;
    }
    listIndex += 1;
  }
}

IgushArray.prototype._shiftDown = function(listIndex) {
  let endElement;
  let currListIndex = Math.ceil(this.length / this.deqCapacity - 1); //FIXME this could be done better
  if (currListIndex == listIndex - 1) {
    return;
  }
  let deque = this.data[currListIndex];
  endElement = deque.remove(0);
  currListIndex -= 1;

  while (currListIndex >= listIndex) {
    deque = this.data[currListIndex];

    // Move the first element of the previous deque to the end of the current deque
    endElement = deque.shiftDown(endElement);

    currListIndex -= 1;
  }

  deque = this.data[currListIndex];
  deque.push(endElement);
}

// TUNE: can be made faster with less calculations of listIndex
IgushArray.prototype.toString = function() {
  let str = "";
  for (let i = 0; i < this.length; i++) {
    let listIndex = Math.floor(i / this.deqCapacity);
    let deqIndex = i % this.deqCapacity;
    str += this.data[listIndex].get(deqIndex) + ",";
  }
  return str.substring(0, str.length - 1);
}

// Implement iterable with generator
IgushArray.prototype[Symbol.iterator] = function*() {
  var nextIndex = 0;
  for (; nextIndex < this.length; nextIndex++) {
     yield this.get(nextIndex);
  }
}

// Methods that replicate the same methods specified by ECMA script 262 for arrays

/**
 * Adds one or more elements to the end of an array and returns the new length of the array.
 * NOTE, this is faster than using add(index, item)
 */
IgushArray.prototype.push = function(...items) {
  if (items.length + this.length > this.capacity) {
    this.setCapacity(Math.ceil((this.capacity + items.length) * 1.5));
  }
  //TUNE: can reduce number of calcs of listIndex
  for (let i = 0; i < items.length; i++) {
    let listIndex = Math.floor(this.length / this.deqCapacity);
    let deqIndex = this.length % this.deqCapacity;
    this.data[listIndex].push(items[i])
    this.length += 1;
  }

  return this.length;
}


// Mutator methods


// NOTE: This is unlike the built in array's copyWithin method as this is unable to retrieve/copy data from a lower level like memmove
// in C / C++
IgushArray.prototype.copyWithin = function(target = 0, start = 0, end = this.length) {
  if (target < 0) {
    target = this.length + target;
  }
  if (target >= this.length) {
    return;
  }
  if (end < 0) {
    end = this.length + end;
  }
}
IgushArray.prototype.fill = function(value, start = 0, end = this.length) {
  for (let i = start; i < end; i++) {
    this.set(i, value);
  }
  return this;
}
IgushArray.prototype.pop = function() {
  return this.remove(this.length - 1);
}
IgushArray.prototype.reverse = function() {
  let i = 0;
  for (; i < this.length / 2 - 1; i++) {
    let tmp = this.set(i, this.get(this.length - i - 1));
    this.set(this.length - i - 1, tmp);
  }
  if (this.length % 2 == 0) {
    // one more swap
    let tmp = this.set(i, this.get(i + 1));
    this.set(i + 1, tmp);
  }
}

IgushArray.prototype.shift = function() {
  return this.remove(0);
}

// Randomized Quick sort, default sorts by unicode value / string as specified by ECMA 262
IgushArray.prototype.sort = function(compareFunction = defaultSortCompare) {
  this._quicksort(0, this.length - 1, compareFunction);
}

//inclusive end and start
IgushArray.prototype._quicksort = function(start, end, compareFunction) {
  if (start < end) {
    let pivotIndex = this._partitionQuickSort(start, end, compareFunction);
    this._quicksort(start, pivotIndex - 1, compareFunction);
    this._quicksort(pivotIndex + 1, end, compareFunction);
  }

}

IgushArray.prototype._partitionQuickSort = function(start, end, compareFunction) {
  let pivotIndex = Math.round(Math.random() * (end - start) + start);
  let pivot = this.get(pivotIndex);
  let ptmp = this.set(pivotIndex, this.get(end));
  this.set(end, ptmp);
  let i = start - 1;
  for (let j = start; j < end; j++) {
    let potItem = this.get(j);
    if (compareFunction(potItem, pivot) <= 0) {
      i++;
      // swap i and j to have the element less than or equal to the pivot on the left of the pivot location i
      let tmp = this.set(i, this.get(j));
      this.set(j, tmp);

    }
  }
  pivotIndex = (i + 1);
  let ftmp = this.set(pivotIndex, this.get(end));
  this.set(end, ftmp);

  return pivotIndex;
}
function defaultSortCompare(j, k) {
  return (j.toString()).localeCompare(k.toString()); // if localeCompare is not available, returns undefined, and undefined <= 0 is false
  // no swap change usually
}
//FIXME incomplete
IgushArray.prototype.splice = function(start, deleteCount, ...items) {

  if (start > this.length) {
    start = this.length;
  }
  else if (start < 0) {
    if (Math.abs(start) > this.length) {
      start = 0;
    }
    else {
      start = this.length + start;
    }
  }
  if (!deleteCount) {
     deleteCount = this.length - Math.abs(start);
  }
  if (deleteCount < 0) {
    deleteCount = 0;
  }
  else if (deleteCount > this.length - start) {
    deleteCount = this.length - start;
  }
  let spliced = new Array(deleteCount);
  for (let i = 0; i < deleteCount; i++) {
    spliced[i] = this.remove(start);
  }
  for (let i = items.length - 1; i >= 0; i--) {
    this.add(start, items[i]);
  }
  return spliced;

}

//FIXME, need to add checks for various uses of start and end, based on ECMA 262
IgushArray.prototype.slice = function(start = 0, end = this.length) {
  if (start > this.length) {
    return [];
  }
  if (end >= this.length) {
    end = this.length;
  }
  if (end < 0) {

  }
  let startListIndex = Math.floor(start / this.deqCapacity);
  let startDeqIndex = start % this.deqCapacity;

  let endListIndex = Math.floor(end / this.deqCapacity);
  let endDeqIndex = end % this.deqCapacity;

  // if same list, return normal slice
  if (startListIndex == endListIndex) {
    //slice method takes O(n) as the built in slice method for js arrays should be O(n), unless V8 / other engines optimize it?
    return this.data[startListIndex].slice(startDeqIndex, endDeqIndex);
  }

  let sliced = new Array(end - start);
  let startSlice = this.data[startListIndex].slice(startDeqIndex, this.data[startListIndex].capacity);


  let i = 0; // index on sliced array

  // fill in initial deque
  for (; i < startSlice.length; i++) {
    sliced[i] = startSlice[i];
  }

  // fill in middle deques
  let k = startListIndex + 1; //list index
  for (; k <= endListIndex - 1; k++) {
    let selectedSlice = this.data[k].slice(0, this.data[k].capacity)
    for (let j = 0; j < selectedSlice.length; j++) {
      sliced[i] = selectedSlice[j];
      i++;
    }
  }

  // fill in final deques
  let  endSlice = this.data[endListIndex].slice(0, endDeqIndex);
  for (j = 0; j < endDeqIndex; j++) {
    sliced[i] = endSlice[j];
    i++;
  }
  return sliced;

}

IgushArray.prototype.unshift = function(...items) {
  if (items.length + this.length > this.capacity) {
    this.setCapacity(Math.ceil((this.capacity + items.length) * 1.5));
  }
  for (let i = items.length -1; i >= 0; i--) {
    this._pushFront(items[i]);
  }
  return this.length;
}

IgushArray.prototype.isEmpty = function() {
  return this.length == 0 ? true : false;
}

// concats another array, (msut be iterable)
IgushArray.prototype.concat = function(arr) {
  let newSize = this.length + arr.length;
  let newIgushArray = new this.constructor(newSize);
  let igushItr = this.entries();
  let arrItr = arr.entries();
  while(true) {
    let next = igushItr.next();
    if (next.done == false) {
      newIgushArray.push(next.value[1]);
    }
    else {
      break;
    }
  }
  while(true) {
    let next = arrItr.next();
    if (next.done == false) {
      newIgushArray.push(next.value[1]);
    }
    else {
      break;
    }
  }
  return newIgushArray;
}

IgushArray.prototype.entries = function() {
  let index = 0;
  let thisArray = this;
  const itr = {
     next: function() {
         let result;
         if (index < thisArray.length) {
             result = { value: [index, thisArray.get(index)], done: false }
             index++;
             return result;
         }
         return { value: undefined, done: true }
     }
  };
  return itr;
}

/**
 * Like the built in array filter function, but this one specifically returns a new array with the same length as the original
 */
IgushArray.prototype.filter = function(filter) {
  let newIgushArray = new this.constructor(this.length);
  for (let i = 0; i < this.length; i++) {
    let val = this.get(i);
    if (filter(val)) {
      newIgushArray.push(val);
    }
  }
  return newIgushArray;
}

IgushArray.prototype.find = function(finder) {
  for (let i = 0; i < this.length; i++) {
    let val = this.get(i);
    if (finder(val)) {
      return val;
    }
  }
}
IgushArray.prototype.keys = function() {
  return this[Symbol.iterator]();
}

// TUNE: extremely slow due to concatenation
IgushArray.prototype.join = function(seperator = ",") {
  let str = "";
  let i = 0;
  for (; i < this.length - 1; i++) {
    str += this.get(i) + seperator;
  }
  str+= this.get(i);
  return str;
}
IgushArray.prototype.includes = function(valueToFind, fromIndex = 0) {
  if (fromIndex < 0) {
    fromIndex = this.length + fromIndex;
  }
  for (let i = fromIndex; i < this.length; i++) {
    if (this.get(i) === valueToFind) {
      return true;
    }
  }
  return false;
}
IgushArray.prototype.indexOf = function(valueToFind, fromIndex = 0) {
  if (fromIndex < 0) {
    fromIndex = this.length + fromIndex;
  }
  if (fromIndex < 0) {
    fromIndex = 0;
  }

  for (let i = fromIndex; i < this.length; i++) {
    if (this.get(i) === valueToFind) {
      return i;
    }
  }
  return -1;
}
IgushArray.prototype.lastIndexOf = function(valueToFind, fromIndex = this.length - 1) {
  if (fromIndex < 0) {
    fromIndex = this.length + fromIndex;
  }
  else if (fromIndex >= this.length) {
    fromIndex = this.length - 1;
  }

  // if still 0, return -1;
  if (fromIndex < 0) {
    return -1;
  }

  for (let i = fromIndex; i >= 0; i--) {
    if (this.get(i) === valueToFind) {
      return i;
    }
  }
  return -1;
}
IgushArray.prototype.reduce = function (reduce, initialValue) {
  if (!initialValue) {
    initialValue = this.get(0);
  }
  let accumulator = initialValue;
  for (let i = 1; i < this.length; i++) {
    accumulator = reduce(accumulator, this.get(i), i, this);
  }
  return accumulator;
}
