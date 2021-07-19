// TODO: E\("([a-z]+)"\) -> "<$1>" or get rid of jQuery as a dependency
function E(t){
	return document.createElement(t);
}

// TODO: remove!
var $G = $(window);

$Window.Z_INDEX = 5;

function $Window(options){
	options = options || {};
	
	var $w = $(E("div")).addClass("window").appendTo("body");
	$w.$titlebar = $(E("div")).addClass("window-titlebar").appendTo($w);
	$w.$title = $(E("span")).addClass("window-title").appendTo($w.$titlebar);
	$w.$x = $(E("button")).addClass("window-close-button window-button button").appendTo($w.$titlebar);
	$w.$content = $(E("div")).addClass("window-content").appendTo($w);
	
	var $component = options.$component;
	if(options.icon){
		$w.icon_name = options.icon;
		$w.$icon = $Icon(options.icon, TITLEBAR_ICON_SIZE).prependTo($w.$titlebar);
	}
	if($component){
		$w.addClass("component-window");
	}
	
	$w.attr("touch-action", "none");
	
	$w.$x.on("click", function(){
		$w.close();
	});
	$w.$x.on("mousedown selectstart", function(e){
		e.preventDefault();
	});
	
	$w.css({
		position: "absolute",
		zIndex: $Window.Z_INDEX++
	});
	$w.bringToFront = function(){
		$w.css({
			zIndex: $Window.Z_INDEX++
		});
	};
	$w.on("pointerdown", function(){
		$w.bringToFront();
	});
	
	$w.on("keydown", function(e){
		if(e.ctrlKey || e.altKey || e.shiftKey){
			return;
		}
		var $buttons = $w.$content.find("button.button");
		var $focused = $(document.activeElement);
		var focused_index = $buttons.index($focused);
		// console.log(e.keyCode);
		switch(e.keyCode){
			case 40: // Down
			case 39: // Right
				if($focused.is("button")){
					if(focused_index < $buttons.length - 1){
						$buttons.get(focused_index + 1).focus();
						e.preventDefault();
					}
				}
				break;
			case 38: // Up
			case 37: // Left
				if($focused.is("button")){
					if(focused_index > 0){
						$buttons.get(focused_index - 1).focus();
						e.preventDefault();
					}
				}
				break;
			case 32: // Space
			case 13: // Enter (doesn't actually work in chrome because the button gets clicked immediately)
				if($focused.is("button")){
					$focused.addClass("pressed");
					var release = function(){
						$focused.removeClass("pressed");
						$focused.off("focusout", release);
						$(window).off("keyup", keyup);
					};
					var keyup = function(e){
						if(e.keyCode === 32 || e.keyCode === 13){
							release();
						}
					};
					$focused.on("focusout", release);
					$(window).on("keyup", keyup);
				}
				break;
			case 9: // Tab
				// wrap around when tabbing through controls in a window
				var $controls = $w.$content.find("input, textarea, select, button, a");
				var focused_control_index = $controls.index($focused);
				if(focused_control_index === $controls.length - 1){
					e.preventDefault();
					$controls[0].focus();
				}
				break;
			case 27: // Esc
				$w.close();
				break;
		}
	});
	// @TODO: restore last focused controls when clicking/mousing down on the window
	
	$w.applyBounds = function(){
		$w.css({
			left: Math.max(0, Math.min(innerWidth - $w.width(), $w[0].getBoundingClientRect().left)),
			top: Math.max(0, Math.min(innerHeight - $w.height(), $w[0].getBoundingClientRect().top)),
		});
	};
	
	$w.center = function(){
		$w.css({
			left: (innerWidth - $w.width()) / 2,
			top: (innerHeight - $w.height()) / 2,
		});
		$w.applyBounds();
	};
	
	
	$G.on("resize", $w.applyBounds);
	
	var drag_offset_x, drag_offset_y;
	var drag = function(e){
		$w.css({
			left: e.clientX - drag_offset_x,
			top: e.clientY - drag_offset_y,
		});
	};
	$w.$titlebar.attr("touch-action", "none");
	$w.$titlebar.on("mousedown selectstart", function(e){
		e.preventDefault();
	});
	$w.$titlebar.on("pointerdown", function(e){
		if($(e.target).is("button")){
			return;
		}
		drag_offset_x = e.clientX - $w[0].getBoundingClientRect().left;
		drag_offset_y = e.clientY - $w[0].getBoundingClientRect().top;
		$G.on("pointermove", drag);
	});
	$G.on("pointerup", function(e){
		$G.off("pointermove", drag);
	});
	$w.$titlebar.on("dblclick", function(e){
		if($component){
			$component.dock();
		}
	});
	
	$w.$Button = function(text, handler){
		var $b = $(E("button"))
			.appendTo($w.$content)
			.addClass("dialogue-button")
			.text(text)
			.on("click", function(){
				if(handler){
					handler();
				}
				$w.close();
			});
		return $b;
	};
	$w.title = function(title){
		if(title){ // TODO: !== undefined
			$w.$title.text(title);
			return $w;
		}else{
			return $w.$title.text();
		}
	};
	$w.close = function(){
		var e = $.Event("close");
		$w.trigger(e);
		if(e.isDefaultPrevented()){
			return;
		}
		if($component){
			$component.detach();
		}
		$w.remove();
		$w.closed = true;
	};
	$w.closed = false;
	
	if(options.title){
		$w.title(options.title);
	}
	
	if(!$component){
		$w.center();
	}
	
	return $w;
}

function $FormWindow(title){
	var $w = new $Window();
	
	$w.title(title);
	$w.$form = $(E("form")).appendTo($w.$content);
	$w.$main = $(E("div")).appendTo($w.$form);
	$w.$buttons = $(E("div")).appendTo($w.$form).addClass("button-group");
	
	$w.$Button = function(label, action){
		var $b = $(E("button")).appendTo($w.$buttons).text(label);
		$b.on("click", function(e){
			// prevent the form from submitting
			// @TODO: instead, prevent the form's submit event
			e.preventDefault();
			
			action();
		});
		
		// this should really not be needed @TODO
		$b.addClass("button dialogue-button");
		
		$b.on("pointerdown", function(){
			$b.focus();
		});
		
		return $b;
	};
	
	return $w;
};
