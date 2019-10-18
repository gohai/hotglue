/**
 *	js/glue.js
 *	Auxiliary hotglue frontend code
 *
 *	Copyright Gottfried Haider, Danja Vasiliev 2010.
 *	This source code is licensed under the GNU General Public License.
 *	See the file COPYING for more details.
 */

$.glue = {};

// communication with the backend
$.glue.backend = function()
{
	let archive = new DatArchive(window.location);

	$(document).ready(function() {
		let loadPage = async function() {
			try {
				let page = await loadJsonObject('/content/' + $.glue.page + '/page');
				for (let property in page) {
					if (property == 'page-background-color') {
						$('html').css('background-color', page[property]);
					} else if (property == 'page-background-image') {
						$('html').css('background-image', 'url(' + page[property] + ')');
					} else if (property == 'page-title') {
						$('title').html(page[property]);
					} else {
						console.warn('Page property not yet supported', property);
					}
				}

				let grid = await loadJsonObject('/content/grid');
				if (grid.hasOwnProperty('x')) {
					$.glue.grid.x(grid.x);
				}
				if (grid.hasOwnProperty('y')) {
					$.glue.grid.y(grid.y);
				}

				let files = await archive.readdir('/content/' + $.glue.page);
				for (let i=0; i < files.length; i++) {
					// don't handle payload files
					if (files[i].indexOf('.') != -1) {
						continue;
					}
					if (['page'].includes(files[i])) {
						continue;
					}
					let html = await archive.readFile('/content/' + $.glue.page + '/' + files[i]);
					let elem = $(html);
					if (!elem[0]) {
						console.warn('Cannot parse HTML', files[i], html);
						continue;
					}
					// set id based on filename/
					elem[0].id = $.glue.page + '.' + files[i];
					$('body').append(elem);
					$.glue.object.register(elem);
				};
			} catch (e) {
				// the page might not yet exist
			}
		};

		let promptFork = async function() {
			let info = await archive.getInfo();
			if (info.isOwner) {
				return;
			}

			let div = $('<div id="glue-dat-fork-prompt" class="glue-ui">Want to make changes to this page that stick? <a href="#">Fork this archive</a> and you can!</div>');
			$(div).bind('click', function(e) {
				let forkArchive = async function() {
					$(div).html('Downloading the entire source archive...');
					await archive.download('/');
					$(div).html('Picking a new name...');
					let new_title = prompt('Enter a title for your fork', info.title + ' (copy)');
					if (new_title) {
						var fork = await DatArchive.fork(info.url, {title: new_title, prompt: false});
						if (fork) {
							$(div).html('About to redirect you to your fork...');
							await fork.download('/');
							// BUG: not all files are available locally at this point
							setTimeout(function() {
								window.location = fork.url;
							}, 2000);
						} else {
							$(div).remove();
						}
					} else {
						$(div).remove();
					}
				};
				forkArchive();
			});
			$('body').append(div);
		};

		let logEditor = async function() {
			let info = await archive.getInfo();
			if (!info.isOwner) {
				return;
			}

			let editors = await loadJsonObject('/content/editors.json', []);
			let url = window.location.protocol + '//' + window.location.host + '/';
			if (editors.length == 0 || editors[editors.length-1].url != url) {
				let default_editor = 'e.g. @username (or empty for anonymous edits)';
				let editor = prompt('What\'s your name?', default_editor);
				editor = (editor) ? editor : null;
				editor = (editor !== default_editor) ? editor : null;
				editors.push({ url: url, version: info.version, peers: info.peers, size: info.size, editor: editor, title: info.title, description: info.description, time: new Date().getTime() });
				await saveJsonObject('/content/editors.json', editors);
			}
		};

		loadPage();
		promptFork();
		logEditor();
	});

	let getRelatedFiles = async function(page, name) {
		let related = [];
		let files = await archive.readdir('/content/' + page);
		for (let i=0; i < files.length; i++) {
			if (files[i].indexOf(name) == 0) {
				related.push('/content/' + page + '/' + files[i]);
			}
		}
		return related;
	};

	let ensurePageExists = async function(page) {
		// create the page if it doesn't exist yet
		try {
			await archive.mkdir('/content/' + page);
		} catch (e) {
		}
	};

	// XXX: make globally accessible
	let loadJsonObject = async function(fn, fallback) {
		let obj;
		fallback = (fallback !== undefined) ? fallback : {};
		try {
			let str = await archive.readFile(fn);
			obj = JSON.parse(str);
			if (obj.constructor.name != fallback.constructor.name || obj === null) {
				throw 'Unexpected JSON file';
			}
			return obj;
		} catch (e) {
			return fallback;
		}
	};

	let saveJsonObject = async function(fn, obj) {
		await archive.writeFile(fn, JSON.stringify(obj, null, 2));
	};

	let updateJsonObject = async function(fn, properties) {
		let obj = await loadJsonObject(fn);
		for (let property in properties) {
			if (['method', 'name'].includes(property)) {
				continue;
			}
			obj[property] = properties[property];
		}
		await saveJsonObject(fn, obj);
	};

	let removeJsonObjectProperty = async function(fn, property) {
		let obj = await loadJsonObject(fn);
		if (obj.hasOwnProperty(property)) {
			delete obj[property];
			await saveJsonObject(fn, obj);
		}
	};

	return async function(param, func, print_errors) {
		if (param.method == 'glue.clone_object') {
			let timestamp = new Date().getTime();
			let id = param.name.split('.');
			await archive.copy('/content/' + id[0] + '.' + id[1] + '/' + id[2], '/content/' + id[0] + '.' + id[1] + '/' + timestamp);
			func(id[0] + '.' + id[1] + '.' + timestamp);
		} else if (param.method == 'glue.create_object') {
			ensurePageExists(param.page);
			// we don't create an empty file at this point
			let timestamp = new Date().getTime();
			func({name: param.page + '.' + timestamp});
		} else if (param.method == 'glue.create_page') {
			window.location.search = '?' + param.page.substring(0, param.page.length-5);
		} else if (param.method == 'glue.delete_object') {
			let id = param.name.split('.');
			// also delete payload files
			let files = await getRelatedFiles(id[0] + '.' + id[1], id[2]);
			for (let i=0; i < files.length; i++) {
				await archive.unlink(files[i]);
			}
		} else if (param.method == 'glue.delete_page') {
			await archive.rmdir('/content/' + param.page, {recursive: true});
		} else if (param.method == 'glue.load_object') {
			func({ '#data': {} });  // dummy
		} else if (param.method == 'glue.object_remove_attr') {
			let id = param.name.split('.');
			if (param.name.endsWith('.page')) {
				removeJsonObjectProperty('/content/' + id[0] + '.' + id[1] + '/' + page, attr);
			}
		} else if (param.method == 'glue.rename_page') {
			await archive.rename('/content/' + param.old + '.head', '/content/' + param.new + '.head');
			if (func) {
				func();
			}
		} else if (param.method == 'glue.revisions') {
			func(['head']);
		} else if (param.method == 'glue.save_state') {
			let id = param.name.split('.');
			// don't save ids with file
			let modified_html = param.html;
			modified_html.replace(' id="' + elem.id + '"', '');
			await archive.writeFile('/content/' + id[0] + '.' + id[1] + '/' + id[2], modified_html);
		} else if (param.method == 'glue.update_object') {
			let id = param.name.split('.');
			if (param.name.endsWith('.page')) {
				updateJsonObject('/content/' + id[0] + '.' + id[1] + '/page', param);
			} else {
				console.warn('Not yet implemented for objects', param);
			}
		} else if (param.method == 'glue.upload_files') {
			let timestamp = new Date().getTime();
			let reader = new FileReader();
			if (param.options.start) {
				param.options.start();
			}
			reader.onload = async function(e) {
				if (param.options.progress) {
					param.options.progress(e);
				}
				let buffer = e.target.result;
				// XXX: loop
				let fn = param.files[0].name.split('.');
				let ext = (1 < fn.length) ? fn[fn.length-1] : 'bin';
				await ensurePageExists(param.page);
				await archive.writeFile('/content/' + param.page + '/' + timestamp + '.' + ext, buffer);
				let html;
				if (['image/gif', 'image/jpeg', 'image/png', 'image/svg+xml'].includes(param.files[0].type)) {
					// special case for uploading the background image
					if (param.preferred_module && param.preferred_module == 'page') {
						updateJsonObject('/content/' + param.page + '/page', { 'page-background-image': '/content/' + param.page + '/' + timestamp + '.' + ext });
						param.options.finish({'#data': ['/content/' + param.page + '/' + timestamp + '.' + ext]});
						return;
					}

					html = '<div id="' + param.page + '.' + timestamp + '" class="image resizable object" style="position: absolute;"><img src="/content/' + param.page + '/' + timestamp + '.' + ext + '"></div>';
				} else if (['video/mp4', 'video/webm'].includes(param.files[0].type)) {
					// Beaker seems to have an issue with autplaying videos currently
					// default to something that will give a better experience now
					html = '<div id="' + param.page + '.' + timestamp + '" class="video resizable object" style="position: absolute;"><video src="/content/' + param.page + '/' + timestamp + '.' + ext + '" style="height: 100%; width: 100%;" controls loop></video></div>';
				} else {
					html = '<div id="' + param.page + '.' + timestamp + '" class="download object" title="download file" data-fn="' + timestamp + '.' + ext + '" data-mime="' + param.files[0].type + '" data-orig-fn="' + param.files[0].name + '" style="position: absolute;"><div class="download-ext">' + ext + '</div></div>';
				}
				// don't save ids with file
				let modified_html = html;
				modified_html.replace(' id="' + param.page + '.' + timestamp + '"', '');
				await archive.writeFile('/content/' + param.page + '/' + timestamp, modified_html);
				param.options.finish({'#data': [html]});
			};
			reader.readAsArrayBuffer(param.files[0]);
		} else if (param.method == 'image.resize') {
			func({});  // signal no refresh necessary
		} else if (param.method == 'page.clear_background_img') {
			removeJsonObjectProperty('/content/' + param.page + '/page', 'page-background-image');
			// XXX: also delete image file
		} else if (param.method == 'page.set_grid') {
			updateJsonObject('/content/grid', param);
		} else {
			console.warn('Not yet implemented', param);
		}
	};
}();

$.glue.error = function()
{
	return function(s) {
		if ($.glue.conf.show_frontend_errors) {
			alert('The glue gun manufacturer says: '+s);
		}
	};
}();
