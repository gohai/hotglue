<?php

@require_once('config.inc.php');
require_once('html.inc.php');
// module glue gets loaded on demand
require_once('util.inc.php');


function hide_on_hover_alter_render_early($args)
{
	$elem = &$args['elem'];
	$obj = $args['obj'];
	if (!elem_has_class($elem, 'object')) {
		return false;
	}

	if (!$args['edit']) {
		// for click-through
		if (isset($obj['hide_on_hover-hide']) && $obj['hide_on_hover-hide'] == 'hide') {
			elem_css($elem, 'pointer-events', 'none');
			return true;
		}
	}
	return false;
}


function hide_on_hover_alter_render_late($args)
{
	$elem = $args['elem'];
	$html = &$args['html'];
	$obj = $args['obj'];
	if (!elem_has_class($args['elem'], 'object')) {
		return false;
	}

	if (!$args['edit']) {
		if (isset($obj['hide_on_hover-hide']) && $obj['hide_on_hover-hide'] == 'hide') {
			// include jQuery
			$jquery = JQUERY;
			if (is_url($jquery)) {
				html_add_js($jquery, 1);
			} else {
				html_add_js(base_url().$jquery, 1);
			}
			// add a global event handler
			$script = '<script type="text/javascript">'.nl();
			$script .= tab().'$(document).ready(function() {'.nl();
			$script .= tab(2).'$(document).bind(\'mousemove\', function(e) { var d = $(\'#'.str_replace('.', '\\\\.', $obj['name']).'\'); var o = d.offset(); if (o.left <= e.pageX && e.pageX <= o.left+d.width() && o.top <= e.pageY && e.pageY <= o.top+d.height()) { d.css(\'visibility\', \'hidden\'); } else { d.css(\'visibility\', \'visible\') }; });'.nl();
			$script .= tab().'});'.nl();
			$script .= '</script>'.nl();
			$html = $html.$script;
			return true;
		}
	}
	return false;
}


function hide_on_hover_render_page_early($args)
{
	if ($args['edit']) {
		if (USE_MIN_FILES) {
			html_add_js(base_url().'modules/hide_on_hover/hide_on_hover-edit.min.js');
		} else {
			html_add_js(base_url().'modules/hide_on_hover/hide_on_hover-edit.js');
		}
		html_add_css(base_url().'modules/hide_on_hover/hide_on_hover-edit.css');
	}
}
