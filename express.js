var express = require('express');
var router = express.Router();
var path = require('path');
var { generate } = require('./Generator');

var _config = require(path.resolve(process.cwd(), './docs/config.json'));
/**
 *
 * @param {Object} config (optional) Configuration object, defaults to `/docs/config.json`
 */
function route(config = _config) {
	router.get('/docs', async (req, res) => {
		if (config.generateOnRequest) {
			await generate(config);
		}
		res.sendFile(
			path.resolve(
				config.outputPath || path.resolve(process.cwd(), './docs/dist'),
				'index.html'
			)
		);
	});

	return router;
}

module.exports = route;
