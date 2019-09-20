/**
 *	modules/qrcode_navigate/qrcode_navitate-edit.js
 *	Frontend code for navigating by reading a QR code from the camera
 *
 *	Copyright Gottfried Haider 2019.
 *	This source code is licensed under the GNU General Public License.
 *	See the file COPYING for more details.
 */

$(document).ready(function() {
	let elem = $('<img src="'+$.glue.base_url+'modules/qrcode_navigate/qrcode_navigate.png" alt="btn" title="navigate to a URL read from a QR code via the camera" width="32" height="32">');

	$(elem).bind('click', function(e) {
		let video = $('<video id="qrcode_navigate-video" title="click to close"></video>');
		$('body').append(video);

		let scanner = new Instascan.Scanner({ video: document.getElementById('qrcode_navigate-video') });
		scanner.addListener('scan', function (content) {
			window.open(content,'_blank');
			scanner.stop();
			$(video).remove();
		});
		$(video).bind('click', function(e) {
			scanner.stop();
			$(video).remove();
		});
		Instascan.Camera.getCameras().then(function (cameras) {
		if (cameras.length > 0) {
			scanner.start(cameras[0]);
		} else {
			console.error('No cameras found');
		}
		}).catch(function (e) {
			console.error(e);
		});

		$.glue.menu.hide();
	});

	$.glue.menu.register('page', elem);
});
