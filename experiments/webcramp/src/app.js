
var audio = new Audio;
var base_title = "WinAMP v0.2a";
var file_name;
var blob_url;

audio.onended = stop;

function stop() {
	URL.revokeObjectURL(blob_url);
	audio.pause();
	audio.src = "";
	audio.load();
	audio.currentTime = 0;

	$window.title(base_title);

	$(".menu-popup").triggerHandler("update");
};

function play_from_file(file) {
	blob_url = URL.createObjectURL(file);
	audio.src = blob_url;
	audio.play();
	file_name = file.name;
	$window.title(base_title + " - " + file_name);
};

var show_nothingness = true;
var menus = {
	"&MP3": [
		{
			item: "&Play...",
			action: () => {
				stop();

				$("<input type='file' accept='audio/mp3'>").click().change(function (e) {
					if (this.files[0]) {
						play_from_file(this.files[0]);
					}
				});
			},
		},
		{
			item: "&Stop",
			action: stop,
			enabled: () => audio.currentTime > 0,
		},
		{
			item: "P&ause",
			action: () => {
				audio.pause();
				$window.title(base_title + " - " + file_name + " - Paused");
			},
			enabled: () => !audio.paused,
		},
		{
			item: "&Unpause",
			action: () => {
				audio.play();
				$window.title(base_title + " - " + file_name);
			},
			enabled: () => audio.currentTime > 0 && audio.paused,
		},
		$MenuBar.DIVIDER,
		{
			item: "E&xit",
			action: () => {

			},
			enabled: false,
		}
	],
	"&Help": [
		{
			item: "&About...",
			action: () => {
				var $about_window = $Window({ title: "About WinAMP" });
				$about_window.$content.html(`
					WinAMP v0.2a<br>
					Compiled on Apr 21 1997 at 22:42:06<br>
					Copyright (C) 1997, Nullsoft<br>
					This program is freeware -- for more information,<br>
					please read the included README.TXT
				`);
				$about_window.$Button("OK", () => { });
			}
		},
	]
};
var $menubar = new $MenuBar(menus);

TITLEBAR_ICON_SIZE = 16;

function $Icon(path, size) {
	var $img = $("<img class='icon'/>");
	$img.attr({
		draggable: false,
		src: path,
		width: size,
		height: size,
	});
	return $img;
}

var $window = new $Window({ title: base_title, icon: "winamp-0.2.png" });
$window.$content.append($menubar);
$window.width(220);

$window.on("close", (event) => {
	event.preventDefault();
});

$window.center();
