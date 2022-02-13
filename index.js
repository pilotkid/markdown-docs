const { generate } = require('./Generator');
const { resolve } = require('path');

let config;
try {
	config = require(resolve(process.cwd(), './docs/config.json'));
} catch {
	console.error('\t❌  config.json not found');
	console.error('\tRun `npx init-docs` to create a demo structure');
	return;
}

if (config.autoGenerate) {
	generate(config);
}

module.exports.generate = generate;
module.exports.express = {
	route: require('./express'),
	filePath: resolve(
		process.cwd(),
		config.outputPath || './docs/dist',
		'index.html'
	),
};
