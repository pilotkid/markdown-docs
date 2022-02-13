const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const exists = require('./utils/Exists');
const GlobAsync = require('./utils/GlobAsync');
const { generateFromFile } = require('./utils/RenderMarkdown');

/**
 * Converts an object and a Handlebars template into a HTML file.
 * @param {Object} data Data to be rendered
 * @param {String} filename Filename to be rendered
 * @returns HTML string
 */
function render(data, filename = './docs/template.handlebars') {
	let source = fs.readFileSync(filename, 'utf8').toString();
	let template = Handlebars.compile(source);
	return template(data);
}

/**
 * Get an A-Z or 0-9 character only name
 * @param {String} v Value to be normalized
 * @returns A normalized value only containing A-Z or 0-9
 */
function getID(v) {
	return v.replace(/[^a-zA-Z0-9]/g, '');
}

/**
 * Renders the markdown in the directory structure into a single HTML file.
 * @param {Object} config Configuration object
 * @returns {Object}
 * ```
 * {
 *   docStructure:{ },
 *   html: ''
 * }
 * ```
 */
async function generate(config = {}) {
	const structure = {};

	/**
	 * Gets a property from the structure object. If the property doesn't exist, it will be created.
	 * @param {Array} array Array of strings representing the path to the property.
	 * @returns The property of the structure object
	 */
	function getNode(array) {
		let node = structure;
		for (let i = 0; i < array.length; i++) {
			if (!node[array[i]]) {
				node[array[i]] = {};
			}
			node = node[array[i]];
		}
		return node;
	}

	//Get all the markdown files
	const mdFiles = await GlobAsync(
		path.join(process.cwd(), '/docs') + '/**/*.md'
	);

	for (let mdIndex = 0; mdIndex < mdFiles.length; mdIndex++) {
		const element = mdFiles[mdIndex];
		const pp = path.parse(element);
		const keys = pp.dir.split('/docs/groups/')[1].split('/'); //Get the keys from the path
		const node = getNode(keys); //get the node in the structure
		const id = getID(pp.name); //Create a unique id for the file

		// Generate the markdown
		const html = `<div class="markdown-body" id="${id}">${await generateFromFile(
			element
		)}</div>`;

		//Save the metadata about the files to the group
		if (node._files) {
			node._files.push(element);
			node._ids.push(id);
		} else {
			node._files = [element];
			node._ids = [id];
		}
		node[pp.name] = html;

		//If there is a config file, save the metadata to the config
		if (exists(path.resolve(pp.dir, 'config.json'))) {
			node._config = require(path.resolve(pp.dir, 'config.json'));
			if (node._config.rename) {
				const nodeRenameKeys = Object.keys(node._config.rename);
				for (let i = 0; i < nodeRenameKeys.length; i++) {
					const key = nodeRenameKeys[i];
					node._config.rename[getID(key.replace('.md', ''))] =
						node._config.rename[nodeRenameKeys[i]];
				}
			}
		}
	}

	//*************************
	//* SORT TOP LEVEL GROUPS *
	//*************************
	const my_groups = Object.keys(structure);
	const config_groups = config.groupOrder || [];
	const unknown_groups = [];

	for (let i = 0; i < my_groups.length; i++) {
		const group = my_groups[i];
		if (config_groups.indexOf(group) === -1) {
			unknown_groups.push(group);
		}
	}

	const topLevelGroups = [...config_groups, ...unknown_groups];

	if (unknown_groups.length) {
		console.error(
			'\n\n\t ⚠️  Unknown top-level groups: ' +
				unknown_groups.join(', ') +
				'\n\t' +
				'Not to worry, I will append them to the end of the list\n\n'
		);
	}

	//*************************
	//*     Generate HTML     *
	//*************************

	let bodyHTML = '';
	let navHTML = '';

	let navLinks = [];

	for (let i = 0; i < topLevelGroups.length; i++) {
		const group = topLevelGroups[i];
		const groupNode = structure[group];
		const groupConfig = groupNode._config || {};
		const groupName = groupConfig.groupName || group;
		const groupDescription = groupConfig.groupDescription || '';
		const groupId = 'group-' + group.replace(/[^a-zA-Z0-9]/g, '');

		/*
		 * Sort the api files files by preference in the config.json
		 */
		const node_apis = Object.keys(groupNode).filter((x) => x[0] !== '_');
		const configApis = (groupConfig.order || []).map((x) =>
			getID(x.replace('.md', ''))
		);
		const unkownApis = [];

		for (let ngi = 0; ngi < node_apis.length; ngi++) {
			const group = node_apis[ngi];
			if (configApis.indexOf(group) === -1) {
				unkownApis.push(group);
			}
		}
		const nodeApis = [...configApis, ...unkownApis];

		/*
		 *   Generate the group HTML
		 */

		let groupHTML = '';
		navHTML += `<li><a href="#${groupId}" >${groupName}</a></li>`; //Add the group to the nav
		navLinks.push({
			id: groupId,
			name: groupName,
			sub: [],
		});

		for (let ng = 0; ng < nodeApis.length; ng++) {
			const gName = nodeApis[ng];
			let visibleName = gName;
			if (groupConfig.rename && groupConfig.rename[gName]) {
				visibleName = groupConfig.rename[gName];
			}
			groupHTML += `<div class="api-group" id="${groupId}-${gName}">${groupNode[gName]}</div>`;
			navHTML += `<li><a href="#${groupId}-${gName}" class="sub">${visibleName}</a></li>`; //Add the group item to the nav
			navLinks[navLinks.length - 1].sub.push({
				name: visibleName,
				id: `${groupId}-${gName}`,
			});
		}

		groupHTML = `<div class="group" id="${groupId}">
            <h1 class="groupHeader">${groupName}</h1>
            <p class="groupDescription">${groupDescription}</p>
            <hr/>
            ${groupHTML}
            </div>`;

		bodyHTML += groupHTML; // Add the group to the body
	}

	//**************************************
	//*    Render Template & Save Output   *
	//**************************************
	config.outputPath = config.outputPath || './docs/dist';
	const rendered = render({
		content: bodyHTML,
		nav: navHTML,
		config,
		structure,
		navLinks,
	});

	const output = path.resolve(config.outputPath, 'index.html');

	if (!exists(config.outputPath)) fs.mkdirSync(config.outputPath);

	fs.writeFileSync(output, rendered);

	return {
		navLinks,
		structure,
		html: rendered,
	};
}
module.exports = {
	generate,
};
