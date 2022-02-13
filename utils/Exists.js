const fs = require('fs');
function exists(f) {
	try {
		fs.accessSync(f, fs.constants.R_OK);
	} catch {
		return false;
	}

	return true;
}

module.exports = exists;
