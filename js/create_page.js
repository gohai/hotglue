/**
 *	js/create_page.js
 *	Frontend code for creating new pages
 *
 *	Copyright Gottfried Haider, Danja Vasiliev 2010.
 *	This source code is licensed under the GNU General Public License.
 *	See the file COPYING for more details.
 */

$(document).ready(function() {
	$('#create_page_btn').bind('click', function(e) {
		$('#create_page_btn').attr('disabled', 'disabled');
		// prevent spaces in urls
		$.glue.page = $.glue.page.split(' ').join('-');
		$.glue.backend({ method: 'glue.create_page', page: $.glue.page }, function(data) {
			var page_short = $.glue.page;
			var q_mark = $.glue.q;
			var a = page_short.split('.');
			if (a[1] == 'head') {
				var page_short = a[0];
			}
			window.location = $.glue.base_url+q_mark+page_short+'/edit';
		});
	});
});
