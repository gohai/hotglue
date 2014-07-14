<?php

@require_once('config.inc.php');
require_once('html.inc.php');
// module glue gets loaded on demand
require_once('util.inc.php');


function parallax_alter_render_early($args)
{
	$elem = &$args['elem'];
	$obj = $args['obj'];
	if (!elem_has_class($elem, 'object')) {
		return false;
	}

	if (!$args['edit']) {
		// add parallax for viewing only
		if (!empty($obj['parallax-x']) || !empty($obj['parallax-y'])) {
			elem_css($elem, 'position', 'fixed');
			log_msg('error', 'foo');
			return true;
		}
	}
	return false;
}


function parallax_alter_render_late($args)
{
	$elem = $args['elem'];
	$html = &$args['html'];
	$obj = $args['obj'];
	if (!elem_has_class($args['elem'], 'object')) {
		return false;
	}

	if (!$args['edit']) {
		// add parallax for viewing only
		if (empty($obj['parallax-x']) && empty($obj['parallax-y'])) {
			// nothing to do
			return false;
		}
		// include jQuery
		$jquery = JQUERY;
		if (is_url($jquery)) {
			html_add_js($jquery, 1);
		} else {
			html_add_js(base_url().$jquery, 1);
		}
		// add a global event handler
		$script = '<script type="text/javascript">'.nl();
		$script .= tab().'var func = function(e) {'.nl();
		$script .= tab(2).'var $obj = $(\'#'.str_replace('.', '\\\\.', $obj['name']).'\');'.nl();
		$script .= tab(2).'var bodyOffset = document.body.getBoundingClientRect();'.nl();
		// x
		if (!empty($obj['parallax-x'])) {
			$s = str_ireplace('x', 'window.scrollX', $obj['parallax-x']);
			$s = str_ireplace('y', 'window.scrollY', $s);
			$script .= tab(2).'$obj.css(\'left\', (bodyOffset.left+'.intval($obj['object-left']).'+'.$s.'-window.scrollX)+\'px\');'.nl();
		} else {
			$script .= tab(2).'$obj.css(\'left\', (bodyOffset.left+'.intval($obj['object-left']).'-window.scrollX)+\'px\');'.nl();
		}
		// y
		if (!empty($obj['parallax-y'])) {
			$s = str_ireplace('y', 'window.scrollY', $obj['parallax-y']);
			$s = str_ireplace('x', 'window.scrollX', $s);
			$script .= tab(2).'$obj.css(\'top\', ('.intval($obj['object-top']).'+'.$s.'-window.scrollY)+\'px\');'.nl();
		} else {
			$script .= tab(2).'$obj.css(\'top\', ('.intval($obj['object-top']).'-window.scrollY)+\'px\');'.nl();
		}
		$script .= tab().'};'.nl();
		$script .= tab().'$(window).bind(\'scroll resize\', func);'.nl();
		$script .= tab().'$(document).ready(func);'.nl();
		$script .= '</script>'.nl();
		$html = $html.$script;
		return true;
	}
	return false;
}


function parallax_render_page_early($args)
{
	if ($args['edit']) {
		if (USE_MIN_FILES) {
			html_add_js(base_url().'modules/parallax/parallax-edit.min.js');
		} else {
			html_add_js(base_url().'modules/parallax/parallax-edit.js');
		}
	}
}
