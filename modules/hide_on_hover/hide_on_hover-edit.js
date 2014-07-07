$(document).ready(function() {
	var elem;
	elem = $('<div style="height: 32px; width: 32px;" title="hide the object when the mouse cursor is hovering over it (affects viewing mode only)">');
	$(elem).bind('glue-menu-activate', function(e) {
		var obj = $(this).data('owner');
		if ($(obj).data('hide_on_hover-hide') === undefined) {
			$(this).removeClass('glue-menu-enabled');
			$(this).removeClass('glue-menu-disabled');
			var that = this;
			$.glue.backend({ method: 'glue.load_object', name: $(obj).attr('id') }, function(data) {
				if (data['hide_on_hover-hide'] == 'hide') {
					$(that).addClass('glue-menu-enabled');
					$(obj).data('hide_on_hover-hide', 'hide');
				} else {
					$(that).addClass('glue-menu-disabled');
					$(obj).data('hide_on_hover-hide', '');		
				}
			});
		} else {
			if ($(obj).data('hide_on_hover-hide') == 'hide') {
				$(this).addClass('glue-menu-enabled');
				$(this).removeClass('glue-menu-disabled');
			} else {
				$(this).removeClass('glue-menu-enabled');
				$(this).addClass('glue-menu-disabled');
			}
		}
	});
	$(elem).bind('click', function(e) {
		var obj = $(this).data('owner');
		if ($(this).hasClass('glue-menu-enabled')) {
			$(this).removeClass('glue-menu-enabled');
			$(this).addClass('glue-menu-disabled');
			$(obj).data('hide_on_hover-hide', '');
			$.glue.backend({ method: 'glue.object_remove_attr', name: $(obj).attr('id'), attr: 'hide_on_hover-hide' });
		} else if ($(this).hasClass('glue-menu-disabled')) {
			$(this).addClass('glue-menu-enabled');
			$(this).removeClass('glue-menu-disabled');
			$(obj).data('hide_on_hover-hide', 'hide');
			$.glue.backend({ method: 'glue.update_object', name: $(obj).attr('id'), 'hide_on_hover-hide': 'hide' });
		}
	});
	$.glue.contextmenu.register('object', 'object-hide_on_hover', elem, 11);
});
