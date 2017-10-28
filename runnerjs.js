var canvas = document.getElementById('canvas');
var ctx = ctx = document.getElementById('canvas').getContext('2d');
var interval;

var ground = new Image();
var player = new Image();
var obstacles = new Array();
var obstacle = new Image();
ground.src = 'ground.png';
player.src = 'player.png';
obstacle.src = 'obstacle.png';

var CanvasXSize = 200;
var CanvasYSize = 200;
var speed = 5; // lower is faster
var scale = 1.05;
var y = -4.5; // vertical offset

var dx = 1;
var imgW;
var imgH;
var x = CanvasXSize;
var clearX;
var clearY;

var ground_level = CanvasYSize-75;
var obstacle_level = CanvasYSize-75;
var running = false;
var jump = false;
var a = 0.07;
var v0 = speed;
var player_x = 15;
var player_y = ground_level;
var hmax = 0;
var down = false;

var sep_long = 400;
var sep_mid = 300;
var sep_lit = 150;
var separation = sep_long;

var collision_offset = 2;
var score = document.getElementById('score');
var points = 0;
		
ground.onload = function() {
    imgW = ground.width * scale;
    imgH = ground.height * scale;
    
    if (imgW > CanvasXSize) { x = imgW; } // image larger than canvas
    if (imgW > CanvasXSize) { clearX = imgW; } // image width larger than canvas
    else { clearX = CanvasXSize; }
    if (imgH > CanvasYSize) { clearY = imgH; } // image height larger than canvas
    else { clearY = CanvasYSize; }
 
    // set refresh rate
    //return setInterval(draw, speed);
}

function clear() {
	// clear the canvas
    ctx.clearRect(0, 0, clearX, clearY);
	for(var i=0; i < obstacles.length; i++) {
		obstacles.splice(i,1);
	}
}

function draw() {
	// clear the canvas
    ctx.clearRect(0, 0, clearX, clearY);

	//---drawing ground ---//
    if (x < 0) { 
		x = imgW;
	}
    if (x < CanvasXSize) {
		ctx.drawImage(ground, x, y, imgW, imgH);
	}
    ctx.drawImage(ground, x - imgW, y,imgW, imgH);
	
	//---drawing player---
	if(jump) {
		if(player_y < hmax) {
			down = true;
		}
		if(down) {
			//switch movement
			down = true;
			player_y = player_y + a*Math.pow(speed,2);
			if(player_y >= ground_level) {
				player_y = ground_level;
				down = false;
				jump = false;
			}
		}
		else {
			player_y = player_y - a*Math.pow(speed,2);
		}
		ctx.drawImage(player,player_x,player_y,player.width,player.height);
		checkCollisionTriangle();
	}
	else {
		ctx.drawImage(player,player_x,player_y,player.width,player.height);
		checkCollisionTriangle();
	}
	
	//---creating obstacle---
	if(separation <=0) {
		var rand = Math.floor((Math.random() * 3) + 1);
		switch(rand) {
			case 1: {
				separation = sep_lit;
				break;
			}
			case 2: {
				separation = sep_mid;
				break;
			}
			case 3: {
				separation = sep_long;
				break;	
			}
		}
		createObstacle(rand);
	}
	
	//---draw obstacles---
	for(var i=0; i < obstacles.length; i++) {
		if(obstacles[i].x <= CanvasXSize - imgW) {
			obstacles.splice(i,1);
		}
		else {
			var temp = new Image();
			switch(obstacles[i].amount) {
				case 1: {
					temp.src = 'obstacle.png';
					break;
				}
				case 2: {
					temp.src = 'obstacle2.png';
					break;
				}
				case 3: {
					temp.src = 'obstacle3.png';
					break;
				}
			}
			ctx.drawImage(temp,obstacles[i].x,obstacle_level,obstacles[i].width,obstacles[i].height);
			obstacles[i].x -= dx;
		}
	}
	
	//---draw score---
	score.innerHTML = "Score: " + parseInt(points);
	
	separation -= dx;
    x -= dx;
	points += 0.05*dx;
}

function createObstacle (rand) {
	var ob = {amount:rand, x:CanvasXSize, y:obstacle_level, width:obstacle.width*rand, height: obstacle.height};
	obstacles.push(ob);
}

function checkCollisionRect() {
	for(var i=0;i<obstacles.length;i++) {
		if(player.x < obstacles[i].x + obstacles[i].width
		&& player.x + player.width - collision_offset > obstacles[i].x
		&& player_y < obstacles[i].y + obstacles[i].height
		&& player_y + player.height - collision_offset> obstacles[i].y) {
			clearInterval(interval);
			gameOver();
		}
	}
}

function checkCollisionTriangle() {
	for(var i=0;i<obstacles.length;i++) {
		if(linesintersect(player_x+player.width,player_y, player_x+player.width, player_y+player.height, obstacles[i].x, obstacles[i].y+obstacles[i].height,obstacles[i].x+obstacles[i].height/2, obstacles[i].y)
			|| linesintersect(player_x,player_y+player.height, player_x+player.width, player_y+player.height, obstacles[i].x, obstacles[i].y+obstacles[i].height,obstacles[i].x+obstacles[i].height/2, obstacles[i].y)
			|| linesintersect(player_x, player_y, player_x, player_y+player.height, obstacles[i].x + obstacles[i].width, obstacles[i].y+obstacles[i].height,obstacles[i].x+obstacles[i].width-obstacles[i].height/2, obstacles[i].y)
			|| linesintersect(player_x+player.width, player_y+player.height, player_x, player_y+player.height, obstacles[i].x + obstacles[i].width, obstacles[i].y+obstacles[i].height,obstacles[i].x+obstacles[i].width-obstacles[i].height/2, obstacles[i].y)
			|| linesintersect(player_x, player_y, player_x, player_y+player.height, obstacles[i].x+obstacles[i].height/2, obstacles[i].y, obstacles[i].x+obstacles[i].width-obstacles[i].height/2, obstacles[i].y)
			|| linesintersect(player_x,player_y+player.height, player_x+player.width, player_y+player.height, obstacles[i].x+obstacles[i].height/2, obstacles[i].y, obstacles[i].x+obstacles[i].width-obstacles[i].height/2, obstacles[i].y)) {
			clearInterval(interval);
			gameOver();
		}
	}
}

function linesintersect(px1,py1,px2,py2,qx1,qy1,qx2,qy2) {
	var a = (((qx1 - px1)*(py2 - py1)) - ((qy1 - py1)*(px2 - px1)));
    var b = (((qx2 - px1)*(py2 - py1) - (qy2 - py1)*(px2 - px1)));
    var c = (((px1 - qx1)*(qy2 - qy1) - (py1 - qy1)*(qx2 - qx1)));
    var d = (((px2 - qx1)*(qy2 - qy1) - (py2 - qy1)*(qx2 - qx1)));
    if((a * b < 0) && (c * d < 0)) {
        return true;
    }
    else {
        return false;
    }
}

function gameOver() {
	running = false;
	clear();
	//TODO sign with points
	
	points = 0;
}

canvas.addEventListener('click', function(e) {
  if (!running) {
    interval = setInterval(draw, speed);
    running = true;
  }
  else {
	  //TODO t-rex jumps
	  jump = true;
  }
});



