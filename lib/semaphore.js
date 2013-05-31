var util = require('util');

module.exports = function(capacity) {
	var semaphore = {
		capacity: capacity || 1,
		current: 0,		
		queue: [],

		take: function() {
			var item = { n: 1 };

			if (typeof arguments[0] == 'function') item.task = arguments[0];
			else item.n = arguments[0];

			if (arguments.length >= 2)  {
				if (typeof arguments[1] == 'function') item.task = arguments[1];
				else item.n = arguments[1];
			}

			var task = item.task;
			item.task = function() { task(semaphore.leave); };

			if (semaphore.current + item.n > semaphore.capacity) {
				return semaphore.queue.push(item);
			}

			semaphore.current += item.n;
			item.task();
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

			semaphore.queue = semaphore.queue.splice(1);
			semaphore.current += item.n;

			process.nextTick(item.task);
		}
	};

	return semaphore
};
