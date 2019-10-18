/**
 *	modules/dat_seed/dat_seed-edit.js
 *	Frontend code for objects allowing users to seed the current site
 *
 *	Copyright Gottfried Haider 2019.
 *	This source code is licensed under the GNU General Public License.
 *	See the file COPYING for more details.
 */

$(document).ready(function() {
	//
	// menu items
	//
	var elem = $('<img src="'+$.glue.base_url+'modules/dat_seed/dat_seed.png" alt="btn" title="ask visitors to re-seed your site" width="32" height="32">');
	$(elem).bind('click', function(e) {
		// create new object
		// XXX: can we write to the manifest file?
		$.glue.backend({ method: 'glue.create_object', 'page': $.glue.page }, function(data) {
			var elem = $('<div class="dat_seed resizable object" style="position: absolute;" title="click to help distribute this page" onclick="(async function() { try { await experimental.library.requestAdd(window.location.toString()); } catch(e) { if (e.message.includes(\'Archive is owned by user\')) alert(\'Visitors would be prompted to seed your archive when they click this button\'); else console.error(e); } })();"></div>');
			$(elem).attr('id', data['name']);
			$('body').append(elem);
			// make width and height explicit
			$(elem).css('width', $(elem).width()+'px');
			$(elem).css('height', $(elem).height()+'px');
			// move to mouseclick
			$(elem).css('left', (e.pageX-$(elem).outerWidth()/2)+'px');
			$(elem).css('top', (e.pageY-$(elem).outerHeight()/2)+'px');
			$.glue.object.register(elem);
			$.glue.object.save(elem);
		});
		$.glue.menu.hide();
	});
	$.glue.menu.register('new', elem, 12);
});
