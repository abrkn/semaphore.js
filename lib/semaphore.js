var util = require('util');

module.exports = function(capacity) {
	var semaphore = {
		capacity: capacity || 1,
		current: 0,		
		queue: [],

		take: function() {
			var item = { n: 1 };

			if (typeof arguments[0] == 'function') item.task = arguments[0];
			else if (typeof arguments[0] == 'object') item.args = arguments[0];
			else item.n = arguments[0];

			if (arguments.length == 2)  {
				if (typeof arguments[1] == 'function') item.task = arguments[1];
				else if (typeof arguments[1] == 'object') item.args = arguments[1];
				else item.n = arguments[1];
			}
			
			if (arguments.length == 3)  {
				if (typeof arguments[2] == 'function') item.task = arguments[2];
				else if (typeof arguments[2] == 'object') item.args = arguments[2];
				else item.n = arguments[2];
			}

			if (semaphore.current + item.n > semaphore.capacity) {
				return semaphore.queue.push(item);
			}

			semaphore.current += item.n;
			item.task(item.args);
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
			
			process.nextTick(function(){ item.task(item.args); });
		}
	};

	return semaphore
};
