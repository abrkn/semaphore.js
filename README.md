# semaphore

[![NPM Package](https://img.shields.io/npm/v/semaphore.svg?style=flat-square)](https://www.npmjs.org/package/semaphore)
[![Build Status](https://img.shields.io/travis/abrkn/semaphore.js.svg?branch=master&style=flat-square)](https://travis-ci.org/abrkn/semaphore.js)

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)


## Installation

```
npm install semaphore
```

## Examples

Limit simultaneous access to a resource.

```javascript
// Create
const Semaphore = require('semaphore')
const sem = new Semaphore(capacity)

// Take
sem.take(fn[, n=1])
sem.take(n, fn)

// Leave
sem.leave([n])
```

```javascript
// Limit concurrent db access
const Semaphore = require('semaphore')
const sem = new Semaphore(1)
const server = require('http').createServer((req, res) => {
  sem.take(() => {
    expensive_database_operation((err, res) => {
      sem.leave()
      res.end(err === null ? res : 'error')
    })
  })
})
```

```javascript
// 2 clients at a time
const Semaphore = require('semaphore')
const sem = new Semaphore(2)
const server = require('http').createServer((req, res) => {
  res.write("Then good day, madam!")

  sem.take(() => {
    res.end("We hope to see you soon for tea.")
    sem.leave()
  })
})
```

```javascript
// Rate limit
const Semaphore = require('semaphore')
const sem = new Semaphore(10)
const server = require('http').createServer((req, res) => {
  sem.take(() => {
    res.end(".")
    setTimeout(() => sem.leave(), 500)
  })
})
```

## License

MIT
