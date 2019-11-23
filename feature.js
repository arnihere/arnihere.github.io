var script = document.createElement('script');
script.src = 'https://code.jquery.com/jquery-3.4.1.min.js';
script.type = 'text/javascript';
var canvas = document.querySelector('canvas');

var context = canvas.getContext('2d');

var width = canvas.width = window.innerWidth;
var height = canvas.height = window.innerHeight;
var element = document.getElementById("introContainer");

var balls = [];
function random(min, max){
    var num = min + Math.floor(Math.random() * (max - min + 1));
    return num;
}

function Ball(x, y, velX, velY, color, size){
    this.x = x;
    this.y = y;
    this.velX = velX;
    this.velY = velY;
    if (velX == 0) this.velX = 0.4;
    if (velY == 0) this.velY = -0.4;

    this.color = color;
    this.size = size;
}
Ball.prototype.draw = function(){
    var rectObject = element.getBoundingClientRect();

    context.beginPath();
    context.fillStyle = this.color;
    context.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
    context.fill();
}

Ball.prototype.update = function(){

    if (this.x >= width || this.y >= height){
        this.x = random(0, width);
        this.y = random(0, height);
    }
    else{
        this.x += this.velX;
        this.y += this.velY;
    }
}
while (balls.length < 10){
    size = 2;
    var ball = new Ball(random(0, width), random(0, height), random(-1,1), random(-1,1), '#606060', size);
    balls.push(ball);
}

 Ball.prototype.neighbors = function(){
    var radius = 221;
    var temp = 0;
    while (temp < radius){
        for (var i = 0; i < balls.length; i++){
            var dist = Math.sqrt((this.x - balls[i].x) * (this.x - balls[i].x) + (this.y - balls[i].y) * (this.y - balls[i].y));
            if (dist <= radius){
                drawLine(this.x, this.y, balls[i].x, balls[i].y, dist);
            }
        }temp += 1;
    }
}



var drawLine = (a,b,c,d, factor) =>{
    context.beginPath();
    context.moveTo(a,b);
    context.lineTo(c,d);
    context.lineWidth = 0.001;

    context.strokeStyle = "rgb(" + factor + "," + factor + "," + factor + ")";
    context.stroke();

}

function loop(){
    context.fillStyle = 'rgba(218,213,221,1)';
    context.fillRect(0,0,width,height);
    for (var i = 0; i < balls.length; i++){
        balls[i].draw();
        balls[i].update();
    }for (var i = 0; i < balls.length; i++){
        balls[i].neighbors();
    }
    
    requestAnimationFrame(loop);
}

loop();