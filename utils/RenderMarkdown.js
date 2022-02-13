const showdown = require('showdown');
showdown.setFlavor('github');

const classMap = {
	h1: 'md-h1',
	h2: 'md-h2',
	h3: 'md-h3',
	h4: 'md-h4',
	h5: 'md-h5',
	h6: 'md-h6',
};

const bindings = Object.keys(classMap).map((key) => ({
	type: 'output',
	regex: new RegExp(`<${key}(.*)>`, 'g'),
	replace: `<${key} class="${classMap[key]}" $1>`,
}));

const converter = new showdown.Converter({
	extensions: [...bindings],
});
converter.setOption('headerLevelStart', 2);
async function generateFromString(text) {
	return new Promise((resolve, reject) => {
		try {
			const html = converter.makeHtml(text);
			resolve(html);
		} catch (err) {
			console.log(err);
			reject(err);
		}
	});
}

function generateFromFile(file) {
	return new Promise((resolve, reject) => {
		try {
			const fs = require('fs');
			fs.readFile(file, 'utf8', (err, data) => {
				if (err) {
					reject(err);
					return;
				}

				generateFromString(data).then(resolve).catch(reject);
			});
		} catch (err) {
			reject(err);
		}
	});
}

module.exports = {
	generateFromString,
	generateFromFile,
};
