var KEY = {
	RIGHT : 39,
	LEFT : 37,
	SHIFT : 16
};
var CANVAS = {
	width : 1000,
	height : 600
};

var Game = {
	timer : {},
	Point : 0,
	CountdownTimer : {},
	CountdownTimes : {},
	Countdown : 30,
	drawtimer : {}

};

var fruits = {
	fruit : {
		FType : [],
		X : [],
		Y : []
	},
	img : [],
	maxfruits : 5,
	timer : {},
	H : 50,
	W : 50
};

var character = {
	X : 450,
	Y : 500,
	H : 100,
	W : 100,
	pressedKeys : [],
	timer : {}
};

var audio = {};
/*************************/

$(function() {

	character.img = new Image();
	character.img.src = "img/character.png";

	for (var i = 0; i <= 5; i++) {
		fruits.img[i] = new Image();
		fruits.img[i].src = "img/fruit" + i + ".png";

	}
	audio = document.getElementById("BGM");
	audio.volume = .7;
	var btnOverSound = document.getElementById("btnover");
	btnOverSound.volume = .5;
	var btnActiveSound = document.getElementById("btnactive");
	btnActiveSound.volume = .5;

	$(document).keydown(function(e) {
		character.pressedKeys[e.which] = true;
	});
	$(document).keyup(function(e) {
		character.pressedKeys[e.which] = false;
	});

	$("a[href='#game']").hover(function() {
		btnOverSound.play();
	}, function() {
		btnOverSound.pause();
	}).click(function() {
		btnActiveSound.play();
		audio.play();
		
		$("#game-scene").addClass('show-scene');
		Game.CountdownTimes = Game.Countdown;
		Game.CountdownTimer = setInterval(countTimer, 1000);
		Game.drawtimer = setInterval(drawAll, 15);
		character.timer = setInterval(moveCharacter, 30);
		fruits.timer = setInterval(moveFruit, 40);

		return false;
	});

	$("a[href='#Retry']").hover(function() {
		btnOverSound.play();
	}, function() {
		btnOverSound.pause();
	}).click(function() {
		btnActiveSound.play();

		Retry();

		return false;
	});

});
function countTimer() {
	Game.CountdownTimes--;
	if (Game.CountdownTimes <= 0) {
		Game.CountdownTimes = 0;
		gameEnd();
	}

	if (fruits.maxfruits > fruits.fruit.FType.length) {
		createFruit();
	}

}

function drawAll() {
	var canvas = document.getElementById("game-canvas");
	var ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, CANVAS.width, CANVAS.height);

	ctx.drawImage(character.img, character.X, character.Y, character.W, character.H);

	for (var i = 0; i < fruits.fruit.X.length; i++) {
		ctx.drawImage(fruits.img[fruits.fruit.FType[i]], fruits.fruit.X[i], fruits.fruit.Y[i], fruits.W, fruits.H);
	}

	ctx.font = "26px Arial";
	ctx.textAlign = "left";
	ctx.fillStyle = "#000000";
	ctx.fillText("Point:" + Game.Point, 10, 30);

	ctx.font = "26px Arial";
	ctx.textAlign = "left";
	ctx.fillStyle = "#000000";
	ctx.fillText("Time:" + Game.CountdownTimes + "s", CANVAS.width / 2 - 50, 30);

	ctx.restore();

}

function gameEnd() {

	clearInterval(fruits.timer);
	clearInterval(character.timer);
	clearInterval(Game.CountdownTimer);

	$(".score").html(Game.Point);

	$("#popup").removeClass("hide");

}

function Retry() {
	audio.play();
	$("#popup").addClass("hide");
	//clearInterval(Game.drawtimer);

	for (var i = 0; i < fruits.maxfruits; i++) {
		fruits.fruit.FType.pop();
		fruits.fruit.X.pop();
		fruits.fruit.Y.pop();
	}

	Game.Point = 0;
	Game.CountdownTimes = Game.Countdown;
	Game.CountdownTimer = setInterval(countTimer, 1000);
	//Game.drawtimer = setInterval(drawAll, 15);
	character.timer = setInterval(moveCharacter, 30);
	fruits.timer = setInterval(moveFruit, 40);
}

function moveCharacter() {

	var NewX;
	var off = 1;

	if (character.pressedKeys[KEY.SHIFT]) {
		off = 2;
	}

	if (character.pressedKeys[KEY.LEFT]) {

		NewX = character.X - (15 * off);
	} else if (character.pressedKeys[KEY.RIGHT]) {
		NewX = character.X + (15 * off);
	}

	if (NewX > 0 && NewX < CANVAS.width - character.W) {
		character.X = NewX;
	}

	checkCollide();

}

function createFruit() {

	fruits.fruit.FType.push(Math.floor(Math.random() * 6));
	fruits.fruit.X.push(Math.floor(Math.random() * (CANVAS.width - fruits.W - 30) + 15));
	fruits.fruit.Y.push(0);

};

function reFruit(i) {
	var FType = Math.floor(Math.random() * 100);
	if (FType <= 30) {
		fruits.fruit.FType.splice(i, 1, 0);
	} else if (FType < 50) {
		fruits.fruit.FType.splice(i, 1, 1);
	} else if (FType <= 70) {
		fruits.fruit.FType.splice(i, 1, 2);
	} else if (FType <= 85) {
		fruits.fruit.FType.splice(i, 1, 3);
	} else if (FType <= 95) {
		fruits.fruit.FType.splice(i, 1, 4);
	} else {
		fruits.fruit.FType.splice(i, 1, 5);
	}

	fruits.fruit.X.splice(i, 1, Math.floor(Math.random() * (CANVAS.width - fruits.W - 30) + 15));
	fruits.fruit.Y.splice(i, 1, 0);
}

function moveFruit() {

	for (var i = 0; i < fruits.fruit.X.length; i++) {
		var NewY = fruits.fruit.Y[i];
		NewY = NewY + 10;
		if (NewY > 0 && NewY < CANVAS.height - fruits.H) {
			fruits.fruit.Y[i] = NewY;
		} else if (NewY >= CANVAS.height - fruits.H) {
			reFruit(i);
		}
	}

}

function checkCollide() {

	for (var i = 0; i < fruits.fruit.X.length; i++) {
		var Y = fruits.fruit.Y[i];
		var X = fruits.fruit.X[i];
		if (Y + fruits.H > character.Y) {
			if (character.X <= X && X <= character.X + character.W || character.X <= X + fruits.W && X + fruits.W <= character.X + character.W) {
				reFruit(i);
				Game.Point = Game.Point + (fruits.fruit.FType[i] + 1) * 100;
			}
		}

	}
}
