var Note = {
	WHITE : {
		C3 : 48,
		D3 : 50,
		E3 : 52,
		F3 : 53,
		G3 : 55,
		A3 : 57,
		B3 : 59,
		C4 : 60,
		D4 : 62,
		E4 : 64,
		F4 : 65,
		G4 : 67,
		A4 : 69,
		B4 : 71,
		C5 : 72,
		D5 : 74,
		E5 : 76,
		F5 : 77,
		G5 : 79,
		A5 : 81,
		B5 : 83
	}
};

var KEY = {
	A : 65,
	S : 83,
	D : 68,
	F : 70,
	G : 71,
	H : 72,
	J : 74,
	DEL : 46,
	END : 35,
	PAGEDOWN : 34,
	NUM4 : 100,
	NUM5 : 101,
	NUM6 : 102,
	NUMPLUS : 107,
	//
	W : 87,
	E : 69,
	T : 84,
	Y : 89,
	U : 85,
	HOME : 36,
	PAGEUP : 33,
	NUM8 : 104,
	NUM9 : 105
};
function KEYMAP(Key) {
	switch (Key) {
		case KEY.A:
			return Note.WHITE.C3;
			break;
		case KEY.S:
			return Note.WHITE.D3;
			break;
		case KEY.D:
			return Note.WHITE.E3;
			break;
		case KEY.F:
			return Note.WHITE.F3;
			break;
		case KEY.G:
			return Note.WHITE.G3;
			break;
		case KEY.H:
			return Note.WHITE.A3;
			break;
		case KEY.J:
			return Note.WHITE.B3;
			break;
		case KEY.DEL:
			return Note.WHITE.C4;
			break;
		case KEY.END:
			return Note.WHITE.D4;
			break;
		case KEY.PAGEDOWN:
			return Note.WHITE.E4;
			break;
		case KEY.NUM4:
			return Note.WHITE.F4;
			break;
		case KEY.NUM5:
			return Note.WHITE.G4;
			break;
		case KEY.NUM6:
			return Note.WHITE.A4;
			break;
		case KEY.NUMPLUS:
			return Note.WHITE.B4;
			break;
		//B
		case KEY.W:
			return Note.WHITE.C3 + 1;
			break;
		case KEY.E:
			return Note.WHITE.D3 + 1;
			break;
		case KEY.T:
			return Note.WHITE.F3 + 1;
			break;
		case KEY.Y:
			return Note.WHITE.G3 + 1;
			break;
		case KEY.U:
			return Note.WHITE.A3 + 1;
			break;
		case KEY.HOME:
			return Note.WHITE.C4 + 1;
			break;
		case KEY.PAGEUP:
			return Note.WHITE.D4 + 1;
			break;
		case KEY.NUM8:
			return Note.WHITE.F4 + 1;
			break;
		case KEY.NUM9:
			return Note.WHITE.G4 + 1;
			break;

	}

}

var MUSIC = 0;
var CHAT_MESSAGE = 1;
var UP = 0;
var DOWN = 1;

var USER = {
	MusicType : -1,
	pressedKeys : [],
	DATAType : MUSIC,
	MODE : MUSIC
};

var OTHER = {
	pressedKeys : []
};

$(function() {

	if (window["WebSocket"]) {
		USER.socket = new WebSocket("ws://127.0.0.1:8000");
		USER.socket.onopen = function(e) {
			console.log('WebSocket connection established.');
		};

		USER.socket.onmessage = function(e) {
			// check if the received data is chat message or line segment
			console.log("onmessage event:", e.data);
			var data = JSON.parse(e.data);
			if (data.dataType == CHAT_MESSAGE) {
				$("#chat-history").append("<li>" + data.sender + " said: " + data.message + "</li>");
				$("#chat-history").scrollTop($("#chat-history")[0].scrollHeight);

			} else if (data.dataType == MUSIC) {
				if (data.state == DOWN) {
					sendnoteon(data.chn, data.note);
					OTHER.pressedKeys[data.note] = true;

				} else {
					sendnoteoff(data.chn, data.note);
					OTHER.pressedKeys[data.note] = false;

				}

			}

		};

		// on close event
		USER.socket.onclose = function(e) {
			console.log('WebSocket connection closed.');
		};

		// on error event
		USER.socket.onerror = function(e) {
			console.log('WebSocket error.');
		};
	}

	player = MIDI.Player;
	MIDI.loader = new widgets.Loader;
	MIDI.loadPlugin({
		soundfontUrl : "./soundfont/",
		//instruments : ["acoustic_drum_steel"],
		instruments : ["acoustic_grand_piano", "acoustic_guitar_steel"],
		callback : function() {
			MIDI.loader.stop();
			MIDI.programChange(0, 0);
			MIDI.programChange(1, 25);
			$("#game").removeClass("movetop");

			for (var i = 48; i <= 83; i++) {
				USER.pressedKeys[i] = false;
			}

			setInterval(draw, 50);
		}
	});

	$(document).keydown(function(e) {
		//console.log(e.which);
		if (e.which == 27) {
			USER.MODE = !USER.MODE;
			console.log(USER.MODE);
		}
		if (USER.MODE == MUSIC && USER.pressedKeys[KEYMAP(e.which)] != true) {
			USER.pressedKeys[KEYMAP(e.which)] = true;
			//send note to everyone
			//sendnoteon(USER.MusicType, KEYMAP(e.which));
			sendMusic(USER.MusicType, KEYMAP(e.which), DOWN);
		}

	});

	$(document).keyup(function(e) {
		if (USER.MODE == MUSIC && USER.pressedKeys[KEYMAP(e.which)] == true) {
			USER.pressedKeys[KEYMAP(e.which)] = false;
			//send note to everyone
			//sendnoteoff(USER.MusicType, KEYMAP(e.which));
			sendMusic(USER.MusicType, KEYMAP(e.which), UP);
		}
	});

	$("a[href='#Next']").click(function() {
		$("#Piano").addClass("moveright");
		$("#Guitar").removeClass("moveleft");
		sendnoteon(0, 60);
	});

	$("a[href='#Previous']").click(function() {
		$("#Guitar").addClass("moveleft");
		$("#Piano").removeClass("moveright");
		sendnoteon(1, 60);
	});

	$("a[href='#Piano']").click(function() {
		$("#Guitar").addClass("hide");
		$("#Piano").addClass("hide");
		$("#maingame").removeClass("movetop");
		sendnoteon(0, 61);
		USER.MusicType = 0;
	});
	$("a[href='#Guitar']").click(function() {
		$("#Guitar").addClass("moveleft");
		$("#Piano").addClass("hide");
		$("#maingame").removeClass("movetop");
		sendnoteon(1, 61);
		USER.MusicType = 1;
	});
	$("a[href='#return']").click(function() {
		$("#maingame").addClass("movetop");
		$("#Guitar").removeClass();
		$("#Guitar").addClass("scene");
		$("#Guitar").addClass("moveleft");
		$("#Piano").removeClass();
		$("#Piano").addClass("scene");
		USER.MusicType = -1;
	});

	$("#send").click(sendMessage);

	$("#chat-input").keypress(function(event) {
		if (event.keyCode == '13') {
			sendMessage();
		}
	});

});
/*
 function KeyEvent(message) {
 console.log(message);
 var delay = 0;
 // play one note every quarter second
 var note = message;
 // the MIDI note
 var velocity = 127;
 // how hard the note hits
 // play the note
 MIDI.setVolume(0, 127);
 MIDI.noteOn(0, note, velocity, delay);
 //MIDI.noteOff(0, note, delay);
 }
 */
function sendnoteon(chn, note) {

	var delay = 0;
	var velocity = 127;
	MIDI.setVolume(0, 127);
	MIDI.noteOn(chn, note, velocity, delay);
}

function sendnoteoff(chn, note) {
	var delay = 0;
	MIDI.noteOff(chn, note, delay + 0.5);
}

function draw() {

	var canvas = document.getElementById("gamepad");
	var ctx = canvas.getContext("2d");
	var blackkey;

	var times = 0;
	var temp;
	for (var i = 0; i < 13; i++) {
		if (USER.pressedKeys[48 + times] == true) {
			ctx.fillStyle = "#f00";
		} else if (OTHER.pressedKeys[48 + times] == true) {
			ctx.fillStyle = "#00f";
		} else {
			ctx.fillStyle = "#fff";
		}

		ctx.fillRect(20 + (41 * i), 0, 40, 200);
		temp = i % 7;
		if (temp == 2 || temp == 6) {
			times++;
		} else {
			times += 2;
		}
	}
	times = 0;
	for (var i = 0; i < 13 - 1; i++) {

		blackkey = i % 7;
		if (blackkey == 0 || blackkey == 1 || blackkey == 3 || blackkey == 4 || blackkey == 5) {
			if (USER.pressedKeys[49 + times] == true) {
				ctx.fillStyle = "#f00";
			} else if (OTHER.pressedKeys[49 + times] == true) {
				ctx.fillStyle = "#00f";
			} else {
				ctx.fillStyle = "#000";
			}
			ctx.fillRect(7 + (41 * (i + 1)), 0, 25, 100);
			times += 2;
		} else {
			times++;
		}

	}

}

function sendMessage() {
	var message = $("#chat-input").val();
	var data = {};
	data.name = $("#chat-name").val();
	data.dataType = CHAT_MESSAGE;
	data.message = message;
	USER.socket.send(JSON.stringify(data));
	$("#chat-input").val("");
}

function sendMusic(chn, note, state) {
	var data = {};
	data.dataType = MUSIC;
	data.chn = chn;
	data.note = note;
	data.state = state;
	data.pressedKeys = OTHER.pressedKeys;
	USER.socket.send(JSON.stringify(data));
}