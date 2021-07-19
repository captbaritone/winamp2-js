// TODO: E\("([a-z]+)"\) -> "<$1>" or get rid of jQuery as a dependency
function E(t){
	return document.createElement(t);
}

$MenuBar.DIVIDER = "DIVIDER";
// TODO: maybe {hr: true} instead of $MenuBar.DIVIDER

function $MenuBar(menus){
	
	var $ = jQuery;
	var $G = $(self);

	var $menus = $(E("div")).addClass("menus");
	
	$menus.attr("touch-action", "none");
	var selecting_menus = false;
	
	var _html = function(menus_key){
		return menus_key.replace(/&(.)/, function(m){
			return "<span class='menu-hotkey'>" + m[1] + "</span>";
		});
	};
	var _hotkey = function(menus_key){
		return menus_key[menus_key.indexOf("&")+1].toUpperCase();
	};
	
	var close_menus = function(){
		$menus.find(".menu-button").trigger("release");
		// Close any rogue floating submenus
		$(".menu-popup").hide();
	};
	
	var is_disabled = function(item){
		if(typeof item.enabled === "function"){
			return !item.enabled();
		}else if(typeof item.enabled === "boolean"){
			return !item.enabled;
		}else{
			return false;
		}
	};
	
	// TODO: API for context menus (i.e. floating menu popups)
	function $MenuPopup(menu_items){
		var $menu_popup = $(E("div")).addClass("menu-popup");
		var $menu_popup_table = $(E("table")).addClass("menu-popup-table").appendTo($menu_popup);
		
		$.map(menu_items, function(item){
			var $row = $(E("tr")).addClass("menu-row").appendTo($menu_popup_table)
			if(item === $MenuBar.DIVIDER){
				var $td = $(E("td")).attr({colspan: 4}).appendTo($row);
				var $hr = $(E("hr")).addClass("menu-hr").appendTo($td);
			}else{
				var $item = $row.addClass("menu-item");
				var $checkbox_area = $(E("td")).addClass("menu-item-checkbox-area");
				var $label = $(E("td")).addClass("menu-item-label");
				var $shortcut = $(E("td")).addClass("menu-item-shortcut");
				var $submenu_area = $(E("td")).addClass("menu-item-submenu-area");
				
				$item.append($checkbox_area, $label, $shortcut, $submenu_area);
				
				$item.attr("tabIndex", -1);
				
				$label.html(_html(item.item));
				$shortcut.text(item.shortcut);
				
				$menu_popup.on("update", function(){
					$item.attr("disabled", is_disabled(item));
					if(item.checkbox && item.checkbox.check){
						$checkbox_area.text(item.checkbox.check() ? "✓" : "");
					}
				});
				$item.on("pointerover", function(){
					$menu_popup.triggerHandler("update");
					$item.focus();
				});
				
				if(item.checkbox){
					$checkbox_area.text("✓");
				}
				
				if(item.submenu){
					$submenu_area.html('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="11" viewBox="0 0 10 11" style="fill:currentColor;display:inline-block;vertical-align:middle"><path d="M7.5 4.33L0 8.66L0 0z"/></svg>');
					
					var $submenu_popup = $MenuPopup(item.submenu).appendTo("body");
					$submenu_popup.hide();
					
					var open_submenu = function(){
						$submenu_popup.show();
						$submenu_popup.triggerHandler("update");
						var rect = $submenu_area[0].getBoundingClientRect();
						$submenu_popup.css({
							position: "absolute",
							left: rect.right,
							top: rect.top,
						});
					};
					var open_tid, close_tid;
					$item.add($submenu_popup).on("pointerover", function(e){
						if(open_tid){clearTimeout(open_tid);}
						if(close_tid){clearTimeout(close_tid);}
					});
					$item.on("pointerover", function(e){
						if(open_tid){clearTimeout(open_tid);}
						if(close_tid){clearTimeout(close_tid);}
						open_tid = setTimeout(open_submenu, 200);
					});
					$item.add($submenu_popup).on("pointerout", function(){
						$menu_popup.closest(".menu-container").find(".menu-button").focus();
						if(open_tid){clearTimeout(open_tid);}
						if(close_tid){clearTimeout(close_tid);}
						close_tid = setTimeout(function(){
							$submenu_popup.hide();
						}, 200);
					});
					$item.on("click pointerdown", open_submenu);
				}
				
				var item_action = function(){
					if(item.checkbox){
						if(item.checkbox.toggle){
							item.checkbox.toggle();
						}
						$menu_popup.triggerHandler("update");
					}else if(item.action){
						close_menus();
						item.action();
					}
				};
				$item.on("pointerup", function(e){
					if(e.pointerType === "mouse" && e.button !== 0){
						return;
					}
					item_action();
				});
				$item.on("pointerover", function(){
					if(item.submenu){
						$menus.triggerHandler("info", "");
					}else{
						$menus.triggerHandler("info", item.description || "");
					}
				});
				$item.on("pointerout", function(){
					if($item.is(":visible")){
						$menus.triggerHandler("info", "");
						$menu_popup.closest(".menu-container").find(".menu-button").focus();
					}
				});
				
				$item.on("keydown", function(e){
					if(e.ctrlKey || e.shiftKey || e.altKey){
						return;
					}
					if(e.keyCode === 13){ // Enter
						e.preventDefault();
						item_action();
					}
				});
				
				$menu_popup.on("keydown", function(e){
					// TODO: finish implementing this
					// * make it work when menu opened with mouse
					// * make it focus the item
					if(e.ctrlKey || e.shiftKey || e.altKey){
						return;
					}
					if(String.fromCharCode(e.keyCode) === _hotkey(item.item)){
						e.preventDefault();
						$item.click();
					}
				});
			}
		});
		
		return $menu_popup;
	}
	
	var this_click_opened_the_menu = false;
	$.each(menus, function(menus_key, menu_items){
		var $menu_container = $(E("div")).addClass("menu-container").appendTo($menus);
		var $menu_button = $(E("div")).addClass("menu-button").appendTo($menu_container);
		var $menu_popup = $MenuPopup(menu_items).appendTo($menu_container);
		
		var menu_id = menus_key.replace("&", "").replace(/ /g, "-").toLowerCase();
		$menu_button.addClass("" + menu_id + "-menu-button");
		if(menu_id == "extras"){
			// TODO: refactor shared key string, move to function
			if(localStorage["jspaint extras menu visible"] != "true"){
				$menu_button.hide();
			}
		}
		
		$menu_popup.hide();
		$menu_button.html(_html(menus_key));
		$menu_button.attr("tabIndex", -1)
		$menu_container.on("keydown", function(e){
			var $focused_item = $menu_popup.find(".menu-item:focus");
			switch(e.keyCode){
				case 37: // Left
					$menu_container.prev().find(".menu-button").trigger("pointerdown");
					break;
				case 39: // Right
					if($focused_item.find(".menu-item-submenu-area:not(:empty)").length){
						$focused_item.click();
						$(".menu-popup .menu-item").first().focus();
						e.preventDefault();
					}else{
						$menu_container.next().find(".menu-button").trigger("pointerdown");
					}
					break;
				case 40: // Down
					if($menu_popup.is(":visible") && $focused_item.length){
						var $next = $focused_item.next();
						while($next.length && !$next.is(".menu-item")){
							$next = $next.next();
						}
						$next.focus();
					}else{
						$menu_button.trigger("pointerdown");
						$menu_popup.find(".menu-item").first().focus();
					}
					break;
				case 38: // Up
					if($menu_popup.is(":visible") && $focused_item.length){
						var $prev = $focused_item.prev();
						while($prev.length && !$prev.is(".menu-item")){
							$prev = $prev.prev();
						}
						$prev.focus();
					}else{
						$menu_button.trigger("pointerdown"); // or maybe do nothing?
						$menu_popup.find(".menu-item").last().focus();
					}
					break;
			}
		});
		$G.on("keydown", function(e){
			if(e.ctrlKey){ // Ctrl+...
				if(e.keyCode !== 17){ // anything but Ctrl
					close_menus();
				}
				return;
			}
			if(e.altKey){
				if(String.fromCharCode(e.keyCode) === _hotkey(menus_key)){
					e.preventDefault();
					$menu_button.trigger("pointerdown");
				}
			}
		});
		$menu_button.on("pointerdown pointerover", function(e){
			if(e.type === "pointerover" && !selecting_menus){
				return;
			}
			if(e.type !== "pointerover"){
				if(!$menu_button.hasClass("active")){
					this_click_opened_the_menu = true;
				}
			}
			
			close_menus();
			
			$menu_button.focus();
			$menu_button.addClass("active");
			$menu_popup.show();
			$menu_popup.triggerHandler("update");
			
			selecting_menus = true;
			
			$menus.triggerHandler("info", "");
		});
		$menu_button.on("pointerup", function(e){
			if(this_click_opened_the_menu){
				this_click_opened_the_menu = false;
				return;
			}
			if($menu_button.hasClass("active")){
				close_menus();
			}
		});
		$menu_button.on("release", function(e){
			selecting_menus = false;
			
			$menu_button.removeClass("active");
			$menu_popup.hide();
			
			$menus.triggerHandler("default-info");
		});
	});
	$G.on("keypress", function(e){
		if(e.keyCode === 27){ // Esc
			close_menus();
		}
	});
	$G.on("blur", function(e){
		// console.log("blur", e.target, document.activeElement);
		close_menus();
	});
	$G.on("pointerdown pointerup", function(e){
		if($(e.target).closest(".menus, .menu-popup").length === 0){
			// console.log(e.type, "occurred outside of menus (on ", e.target, ") so...");
			close_menus();
		}
	});
	
	return $menus;

}
