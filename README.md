semaphore.js
============

Limit simultaneous access to a resource.

```javascript
// Create semaphore
var sem = require('semaphore')(capacity);

// Take semaphore
sem.take(function[, number])
sem.take(number, function)

// Leave semaphore
sem.leave([number])
```


```javascript
// Prevent database from dying by only allowing 1 request at a time
var cat = {

};

var sem = require('semaphore')(1);
var server = require('http').createServer(req, res) {
	sem.take(function() {
		expensive_database_operation(function(err, res) {
			sem.leave();

			if (err) return res.end("Error");

			return res.end(res);
		});
	});
});
```

```javascript
// Only serve 2 clients at a time.
var sem = require('semaphore')(2);
var server = require('http').createServer(req, res) {
	res.write("Then good day, madam!");

	sem.take(function() {
		res.end("We hope to see you soon for tea.");
	});
});
```