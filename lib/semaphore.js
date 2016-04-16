;(function(global) {

'use strict';

/**
 * @param capacity
 * @returns {{capacity: (*|number), current: number, queue: Array, firstHere: boolean, take: semaphore.take, leave: semaphore.leave}}
 */
function semaphore(capacity) {
	var semaphore = {
		capacity: capacity || 1,
		current: 0,
		queue: [],
		firstHere: false,

		take: function() {
			if (semaphore.firstHere === false) {
        			semaphore.current++;
        			semaphore.firstHere = true;
        			var isFirst = 1;
      			} else {
        			var isFirst = 0;
      			}
			var item = { n: 1 };

			if (typeof arguments[0] == 'function') {
				item.task = arguments[0];
			} else {
				item.n = arguments[0];
			}

			if (arguments.length >= 2)  {
				if (typeof arguments[1] == 'function') item.task = arguments[1];
				else item.n = arguments[1];
			}

			var task = item.task;
			item.task = function() { task(semaphore.leave); };

			if (semaphore.current + item.n - isFirst > semaphore.capacity) {
        			if (isFirst === 1) {
        				semaphore.current--;
        				semaphore.firstHere = false;
        			}
				return semaphore.queue.push(item);
			}

			semaphore.current += item.n - isFirst;
			item.task(semaphore.leave);
      			if (isFirst === 1) semaphore.firstHere = false;
		},

		leave: function(n) {
			n = n || 1;

			semaphore.current -= n;

			if (!semaphore.queue.length) {
				if (semaphore.current < 0) {
					throw new Error('leave called too many times.');
				}

				return;
			}

			var item = semaphore.queue[0];

			if (item.n + semaphore.current > semaphore.capacity) {
				return;
			}

			semaphore.queue.shift();
			semaphore.current += item.n;

			if (typeof process != 'undefined' && process && typeof process.nextTick == 'function') {
				// node.js and the like
				process.nextTick(item.task);
			} else {
				setTimeout(item.task,0);
			}
		}
	};

	return semaphore;
};

if (typeof exports === 'object') {
    // node export
    module.exports = semaphore;
} else if (typeof define === 'function' && define.amd) {
    // amd export
    define(function () {
        return semaphore;
    });
} else {
    // browser global
    global.semaphore = semaphore;
}
}(this));
