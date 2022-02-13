#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const exists = require('../utils/Exists');
const dir = __dirname;

function getTemplate(f) {
	let p = path.resolve(dir, 'template', f);
	return fs.readFileSync(p, 'utf8');
}

if (!exists('./docs')) fs.mkdirSync('./docs');

if (!exists('./docs/template.handlebars')) {
	fs.writeFileSync('./docs/template.handlebars', getTemplate('template.html'));
}

if (!exists('./docs/config.json'))
	fs.writeFileSync('./docs/config.json', getTemplate('config.json'), 'utf8');

if (!exists('./docs/groups')) fs.mkdirSync('./docs/groups');

if (!exists('./docs/groups/Introduction')) {
	fs.mkdirSync('./docs/groups/Introduction');
	fs.writeFileSync(
		'./docs/groups/Introduction/Index.md',
		getTemplate('GettingStarted.md')
	);
}

if (!exists('./docs/groups/Example')) {
	fs.mkdirSync('./docs/groups/Example');
	fs.writeFileSync(
		'./docs/groups/Example/ApiRoute1.md',
		getTemplate('Example1.md')
	);
	fs.writeFileSync(
		'./docs/groups/Example/ApiRoute2.md',
		getTemplate('Example2.md')
	);
	fs.writeFileSync(
		'./docs/groups/Example/config.json',
		getTemplate('groupConfig.json'),
		'utf8'
	);
}

console.log('✅ Initialized docs folder.');
