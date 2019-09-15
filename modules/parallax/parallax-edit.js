$(document).ready(function() {
	var elem;
	elem = $('<img src="'+$.glue.base_url+'modules/parallax/parallax.png" alt="btn" title="make the object react to scrolling the page (affects viewing mode only)" width="32" height="32">');
	$(elem).bind('click', function(e) {
		var obj = $(this).data('owner');
		$.glue.backend({ method: 'glue.load_object', name: $(obj).attr('id')}, function(data) {
			var old_val = '';
			if (data['parallax-x'] !== undefined) {
				old_val = data['parallax-x'];
			}
			var x = prompt('Enter parallax formula for x (e.g. 0.5*x)', old_val);
			if (x === null || x === false) {
				return;
			}

			old_val = '';
			if (data['parallax-y'] !== undefined) {
				old_val = data['parallax-y'];
			}
			var y = prompt('Enter parallax formula for y (e.g. 0.5*y)', old_val);
			if (y === null || y === false) {
				return;
			}

			if (x === '') {
				// delete parallax
				$.glue.backend({ method: 'glue.object_remove_attr', name: $(obj).attr('id'), attr: 'parallax-x' });
			} else {
				// set parallax
				$.glue.backend({ method: 'glue.update_object', name: $(obj).attr('id'), 'parallax-x': x });
			}
			if (y === '') {
				// delete parallax
				$.glue.backend({ method: 'glue.object_remove_attr', name: $(obj).attr('id'), attr: 'parallax-y' });
			} else {
				// set parallax
				$.glue.backend({ method: 'glue.update_object', name: $(obj).attr('id'), 'parallax-y': y });
			}
		});
	});
	$.glue.contextmenu.register('object', 'object-parallax', elem, 11);
});
