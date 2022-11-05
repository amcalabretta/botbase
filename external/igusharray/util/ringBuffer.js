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
 * Ring Buffer implementation that works as a Deque and uses a contiguous block of memory for data
 * Is a faster Ring buffer implementation as it doesn't do range checks. Meant to be only used with IgushArray. It expects to be used
 * logically correct
 * To achieve high efficiency, undefined elements may not be used with this array or it will break
 */

module.exports = RingBuffer;

function RingBuffer(capacity = 10) {
   this.capacity = capacity;
   this.data = new Array(this.capacity);
   this.begin = 0;
   this.end = -1;
   this.size = 0;
 }
RingBuffer.prototype.isFull = function() {
  return this.size === this.capacity;
}
RingBuffer.prototype.isEmpty = function() {
  return this.size === 0;
}
RingBuffer.prototype.get = function(index) {
  return this.data[(this.begin + index) % this.size];
}
RingBuffer.prototype.set = function(index, val) {
  let oldVal = this.data[(this.begin + index) % this.size];
  this.data[(this.begin + index) % this.size] = val;
  return oldVal;
}

/**
 * Adds/Inserts element with value val to index i
 * @return true if val can be added to index i in this RingBuffer
 */
RingBuffer.prototype.add = function(index, val) {
  if (this.size < this.capacity) {
    let pos;
    // TUNE: try to find a nice way to remove the check for size == 0. RingBuffer is a backing data structure, so its possible probably
    // perform check in igusharray.js possibly
    if (this.size === 0) {
      pos = (this.begin + index);
    }
    else {
      pos = (this.begin + index) % (this.size + 1);
    }

    if (this.data[pos] === undefined) {
      this.data[pos] = val;
    }
    else {
      // shifting the backing array, using absolute indices
      let shifted = this.data.slice(pos, this.size)
      this.data[pos] = val;
      for (let j = 0; j < shifted.length; j++) {
        this.data[pos + j + 1] = shifted[j];
      }
    }

    if (index === this.size) {
      // adding to end
      this.size += 1;
      this.end = (this.end + 1) % this.size; // always moves up
      if (pos <= this.begin) {
        this.begin = (this.begin + 1) % this.size;
      }
    } else {
      this.size += 1;
      if (pos < this.begin) {
        this.begin = (this.begin + 1) % this.size;
      }
      if (pos <= this.end) {
        this.end = (this.end + 1) % this.size;
      }
    }
    return true;
  }
  return false;
}
//To be used only if this.size < this.capacity
RingBuffer.prototype.push = function(val) {
  return this.add(this.size, val);
}

RingBuffer.prototype.pushFront = function(val) {
  return this.add(0, val);
}

RingBuffer.prototype.popFront = function() {
  return this.remove(0);
}

// should be within proper range. This isn't checked btw
RingBuffer.prototype.remove = function(i) {
  let pos;
  if (this.size === 0) {
    return undefined;
  }
  else {
    pos = (this.begin + i) % (this.size);
  }
  let removed = this.data[pos];
  let shifted = this.data.slice(pos + 1, this.size);
  this.data.copyWithin(pos, pos + 1, this.size);
  this.data[this.size] = undefined;
  this.size--;

  if (pos < this.begin) {
    this.begin = this.size === 0 ? this.begin - 1 : (this.begin - 1 + this.size) % this.size;
  }
  else if (pos === this.begin && pos === this.size) { // TUNE: possible redundant check at pos === this.begin
    this.begin = 0;
  }
  if (pos <= this.end) {
    this.end = this.size === 0 ? this.end - 1 : (this.end - 1 + this.size) % this.size;
  }
  return removed;
}

// expected to be used only when size isnt 0
// expected to supply start and end value
RingBuffer.prototype.slice = function(start, end) {
  let absStart = (this.begin + start) % this.size;
  if (this.begin <= this.end) {
    return this.data.slice(absStart, (this.begin + end));
  }

  // meaning absStart wrapped around array, can just return a single slice
  if (absStart < start + this.begin) {
    //TUNE: slice may be a slower operation
    return this.data.slice(absStart, (this.begin + end) % this.size);
  }
  else {
    // begin and end in reverse order, abs start is not wrapped, so concat two slices
    //TUNE: concat might be a slow operation
    return this.data.slice(absStart, this.size).concat(this.data.slice(0, (this.begin + end) % this.size));
  }
  // S = this.size
  //      E B S
  // [2,3,4,0,1, undefined, undefined]


}

RingBuffer.prototype.clear = function() {
  this.data = new Array(this.capacity);
  begin = 0;
  end = -1;
}

/**
 * Returns the last element and moves a element to the front of the ring buffer. To be used only when deque is full
 *
 * @param element the element to shift to the front of the deque
 * @return the last element which is removed.
 */
RingBuffer.prototype.shiftUp = function(element) {

  let oldElement = this.set(this.size - 1, element);
  this.end = (this.end - 1 + this.capacity) % this.capacity;
  this.begin = (this.begin - 1 + this.capacity) % this.capacity;
  return oldElement;
}

/**
 * Returns the first element and moves a element to the end of the ring buffer. To be used only when deque is full
 *
 * @param element the element to shift to the end of the deque
 * @return the first element which is removed.
 */
RingBuffer.prototype.shiftDown = function(element) {

  let oldElement = this.set(0, element);
  this.end = (this.end + 1) % this.capacity;
  this.begin = (this.begin + 1) % this.capacity;
  return oldElement;
}

//FIXME: Remove newCapacity check here in future.
/**
 * Set capacity to a new capacity
 * @param newCapacity the new capacity to expand this RingBuffer to
 */
RingBuffer.prototype.setCapacity = function(newCapacity) {
  if (newCapacity < this.capacity) {
    throw Error("Cannot set a smaller capacity of " + newCapacity + " than the existing capacity of " + this.capacity);
  }
  // I believe java implementation of increasing capacity uses Arrays.copyOf, which creates a new Array

  // Three methods to test:
  // 1. new array and copying this.data into it and replacing this.data
  // 2. change length value of this.data?
  // 3. push into this.data? Could have adverse effects to what the true capacity is given for the this.data
  this.capacity = newCapacity
  newData = new Array(this.capacity);
  for (let i = 0; i < this.size; i++) {
    newData[i] = this.data[i];
  }
  this.data = newData;
}
