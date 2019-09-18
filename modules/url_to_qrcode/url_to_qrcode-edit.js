/**
 *	modules/url_to_qrcode/url_to_qrcode-edit.js
 *	Frontend code for QR code objects
 *
 *	Copyright Gottfried Haider 2019.
 *	This source code is licensed under the GNU General Public License.
 *	See the file COPYING for more details.
 *
 *	This interfaces with QRCode.js by @davidshimjs.
 */

$(document).ready(function() {
	//
	// menu items
	//
	var elem = $('<img src="'+$.glue.base_url+'modules/url_to_qrcode/url_to_qrcode.png" alt="btn" title="add the URL of the current page as QR code" width="32" height="32">');
	$(elem).bind('click', function(e) {
		// create new object
		$.glue.backend({ method: 'glue.create_object', 'page': $.glue.page }, function(data) {

			elem = $('<div class="url_to_qrcode resizable object" style="position: absolute;"></div>');
			$(elem).attr('id', data['name']);
			// move to mouseclick
			$(elem).css('left', (e.pageX-$(elem).outerWidth()/2)+'px');
			$(elem).css('top', (e.pageY-$(elem).outerHeight()/2)+'px');

			// create the QR code in a hidden div
			let qrcode_container = $('<div id="qrcode" style="visibility: hidden;">');
			$('body').append(qrcode_container);

			// actually request the code to be created
			let qrcode = new QRCode('qrcode', window.location.toString());

			// wait for the resulting img to be available
			let qrcode_wait = setInterval(function() {
				let qrcode_img = $(qrcode_container).children('img')
				if ($(qrcode_img).attr('src')) {
					clearInterval(qrcode_wait);

					// set elem background to QR code
					// XXX: why does this not work without reload
					$(elem).css('background-image', "url('" + $(qrcode_img).get(0).src + "')");
					$(elem).css('width', $(qrcode_img).width() + 'px');
					$(elem).css('height', $(qrcode_img).height() + 'px');
					$(elem).attr('title', window.location);

					// remove hidden div
					$(qrcode_container).remove();
					$.glue.object.register(elem);
					$.glue.object.save(elem);
				}
			}, 50);

		});
		$.glue.menu.hide();
	});
	$.glue.menu.register('new', elem, 12);
});
