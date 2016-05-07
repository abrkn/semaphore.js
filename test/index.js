var test = require('tape')
var Semaphore = require('../')

function Phone () {
  this.state = 'free'
}

Phone.prototype.dial = function (callback) {
  if (this.state === 'busy') return callback(new Error('The phone is busy'))
  this.state = 'busy'
  setTimeout(function () { callback(null) }, 100)
}

Phone.prototype.hangup = function (callback) {
  if (this.state === 'free') return callback(new Error('The phone is not in use'))
  this.state = 'free'
}

test('should not be using a bad example', function (t) {
  var phone = new Phone()

  // Call Bob
  phone.dial(function (err) {
    t.error(err)
    phone.hangup()
  })

  // Cannot call Bret, because the phone is already busy with Bob.
  phone.dial(function (err) {
    t.same(err.message, 'The phone is busy')
    t.end()
  })
})

test('should not break the phone', function (t) {
  var phone = new Phone()
  var sem = new Semaphore(1)

  // Call Jane
  sem.take(function () {
    phone.dial(function (err) {
      t.error(err)
      phone.hangup()
      sem.leave()
    })
  })

  // Call Jon (will need to wait for call with Jane to complete)
  sem.take(function () {
    phone.dial(function (err) {
      t.error(err)
      phone.hangup()
      sem.leave()
      t.end()
    })
  })
})

test('should not be slow', function (t) {
  var s = new Semaphore(3)
  var values = []

  function push (n) {
    values.push(n)
    s.leave
  }

  push(1)
  push(2)
  push(3)
  push(4)
  push(5)

  t.same(values, [1, 2, 3, 4, 5])
  t.end()
})

test('should not let past more than capacity', function (t) {
  var s = new Semaphore(3)
  var values = []
  var speed = 50

  s.take(function (leave) { values.push(1); setTimeout(leave, speed * 1) })
  s.take(function (leave) { values.push(2); setTimeout(leave, speed * 2) })
  s.take(function (leave) { values.push(3); setTimeout(leave, speed * 3) })
  s.take(function () { values.push(4) })
  s.take(function () { values.push(5) })

  ;(function tick (n) {
    switch (n) {
      case 0: // After 0 sec
        console.log('0 seconds passed.')
        t.same(s._current, s._capacity)
        t.same(s._queue.length, 2)
        t.same(values, [1, 2, 3])
        break
      case 1: // After 1 sec
        console.log('1 seconds passed.')
        t.same(s._current, s._capacity)
        t.same(s._queue.length, 1)
        t.same(values, [1, 2, 3, 4])
        break
      case 2: // After 2 sec
        console.log('2 seconds passed.')
        t.same(s._current, s._capacity)
        t.same(s._queue.length, 0)
        t.same(values, [1, 2, 3, 4, 5])
        break
      case 3: // After 3 sec
        console.log('3 seconds passed.')
        t.same(s._current, s._capacity - 1)
        t.same(s._queue.length, 0)
        t.same(values, [1, 2, 3, 4, 5])
        t.end()
        break
    }

    if (n < 3) setTimeout(tick.bind(null, n + 1), speed * 1.1)
  })(0)
})

test('should respect number', function (t) {
  t.test('should fail when taking more than the capacity allows', function (t) {
    var s = new Semaphore(1)
    t.throws(function () {
      s.take(2, function () {})
    }, /^RangeError: expected number in \[1, 1\], got 2$/)
    t.end()
  })

  t.test('should work fine with correct input values', function (t) {
    t.plan(3)

    var s = new Semaphore(10) // 10
    s.take(5, function (leave) { // 5
      t.pass()
      s.take(4, function () { // 1
        leave(4) // 5
        t.pass()

        s.take(5, function () {
          t.pass()
        }) // 0
      })
    })

    setTimeout(t.end, 25)
  })
})
