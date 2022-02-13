const glob = require('glob');

function GlobAsync(src, options = undefined) {
	if (options === undefined) {
		return new Promise((resolve, reject) => {
			glob(src, (e, d) => {
				if (e) {
					reject(e);
					return;
				}

				resolve(d);
			});
		});
	} else {
		return new Promise((resolve, reject) => {
			glob(src, options, (e, d) => {
				if (e) {
					reject(e);
					return;
				}

				resolve(d);
			});
		});
	}
}

module.exports = GlobAsync;
