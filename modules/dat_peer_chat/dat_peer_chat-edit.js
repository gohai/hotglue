/**
 *	modules/dat_peer_chat/dat_peer_chat-edit.js
 *	Frontend code for objects allowing seeding users to chat with each other
 *
 *	Copyright Gottfried Haider 2019.
 *	This source code is licensed under the GNU General Public License.
 *	See the file COPYING for more details.
 */

$(document).ready(function() {
	//
	// menu items
	//
	var elem = $('<img src="'+$.glue.base_url+'modules/dat_peer_chat/dat_peer_chat.png" alt="btn" title="add a chat box between seeding visitors to this site" width="32" height="32">');
	$(elem).bind('click', function(e) {
		// create new object
		$.glue.backend({ method: 'glue.create_object', 'page': $.glue.page }, function(data) {
			let html = '<div class="dat_peer_chat resizable object" style="position: absolute;">\
			<div class="dat_peer_chat-messages">\
			</div>\
			<div class="footer">\
			<input type="text" class="dat_peer_chat-text" placeholder="Message to other peers here"> <button type="button" class="dat_peer_chat-send">Send</button>\
			</div>\
			</div>';
			var elem = $(html);
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


	// give focus to the chat box when clicked
	$('.dat_peer_chat-text').live('click', function(e) {
		$(this).focus();
	});

	// update session data
	$('.dat_peer_chat-send').live('click', function(e) {
		let text = $(this).siblings('.dat_peer_chat-text').val();
		$(this).siblings('.dat_peer_chat-text').val('');
		let messages = $(this).parent().siblings('.dat_peer_chat-messages');
		(async function() {
			if (!experimental || !experimental.datPeers) {
				$(messages).html('datPeers API not available, make sure you have this experimental feature <a href="https://beakerbrowser.com/docs/apis/experimental-datpeers">enabled in your dat.json</a>.');
				return;
			}
			experimental.datPeers.setSessionData({msg: text, time: new Date().getTime()});
			$(messages).append('<p>' + text + '</p>');
			$(messages).each(function() {
				this.scrollTop = this.scrollHeight;
			});
		})();
	});

	// listen for updates
	if (experimental && experimental.datPeers) {
		experimental.datPeers.addEventListener('session-data', function(peer) {
			console.log(peer);
			let messages = $('.dat_peer_chat-messages');
			$(messages).append('<p>' + peer.sessionData.msg + '</p>');
			$(messages).each(function() {
				this.scrollTop = this.scrollHeight;
			});
		});
	}

});
