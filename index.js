;(function (global) {
  'use strict'

  var nextTick = function (fn) { setTimeout(fn, 0) }
  if (typeof process !== 'undefined' && process && typeof process.nextTick === 'function') {
    // node.js and the like
    nextTick = process.nextTick
  }

  function checkNumber (n) {
    if (typeof n !== 'number' || isNaN(n) || !isFinite(n)) {
      throw new TypeError('expected number, got ' + n)
    }
    if (n % 1 !== 0 || n < 1) {
      throw new RangeError('expected positive integer number, got ' + n)
    }
  }

  function checkFunction (f) {
    if (typeof f !== 'function') throw new TypeError('expected function, got ' + f)
  }

  function Semaphore (capacity) {
    if (!(this instanceof Semaphore)) return new Semaphore(capacity)

    this._capacity = capacity || 1
    checkNumber(this._capacity)

    this._current = 0
    this._queue = []
    this._leave = this.leave.bind(this)
  }

  Semaphore.prototype.take = function () {
    var item = {}
    if (typeof arguments[0] === 'function') {
      item.task = arguments[0]
      item.n = arguments[1] || 1
    } else {
      item.task = arguments[1]
      item.n = arguments[0] || 1
    }

    checkFunction(item.task)
    checkNumber(item.n)
    if (item.n > this._capacity) {
      throw new RangeError('expected number in [1, ' + this._capacity + '], got ' + item.n)
    }

    if (this._current + item.n > this._capacity) {
      this._queue.push(item)
    } else {
      this._current += item.n
      item.task(this._leave)
    }
  }

  Semaphore.prototype.leave = function (n) {
    n = n || 1
    checkNumber(n)

    this._current = Math.max(this._current - n, 0)

    if (this._queue.length === 0) return
    if (this._current + this._queue[0].n > this._capacity) return

    var item = this._queue.shift()
    this._current += item.n

    var leave = this._leave
    nextTick(function () { item.task(leave) })
  }

  if (typeof exports === 'object') {
    // node export
    module.exports = Semaphore
  } else if (typeof define === 'function' && define.amd) {
    // amd export
    define(function () { return Semaphore })
  } else {
    // browser global
    global.semaphore = global.Semaphore = Semaphore
  }
}(this))
