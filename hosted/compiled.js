"use strict";

var lerp = function lerp(v0, v1, alpha) {
  return (1 - alpha) * v0 + alpha * v1;
};

var redraw = function redraw(time) {
  updatePosition();

  ctx.clearRect(0, 0, 800, 600);

  var keys = Object.keys(users);

  for (var i = 0; i < keys.length; i++) {

    var user = users[keys[i]];

    //if alpha less than 1, increase it by 0.01
    if (user.alpha < 1) user.alpha += 0.1;

    user.x = lerp(user.prevX, user.destX, user.alpha);
    user.y = lerp(user.prevY, user.destY, user.alpha);

    ctx.beginPath();
    ctx.arc(user.x, user.y, user.rad, 0, 2 * Math.PI, false);
    ctx.fillStyle = user.color;
    ctx.fill();
  }

  for (var _i = 0; _i < circles.length; _i++) {
    var circle = circles[_i];
    if (circles[_i].alpha < 1) circles[_i].alpha += 0.1;

    //circles[i].x = lerp(circles[i].prevX, circles[i].destX, circles[i].alpha);
    //circles[i].y = lerp(circles[i].prevY, circles[i].destY, circles[i].alpha);

    ctx.beginPath();
    ctx.arc(circles[_i].destX, circles[_i].destY, circles[_i].rad, 0, 2 * Math.PI, false);
    ctx.fillStyle = circles[_i].color;
    ctx.fill();
  }
  for (var _i2 = 0; _i2 < lines.length; _i2++) {
    ctx.beginPath();
    ctx.strokeStyle = "rgba(0,0,0," + (1.2 - lines[_i2].alpha) + ")";
    ctx.moveTo(lines[_i2].moveTo.x1, lines[_i2].moveTo.y1);
    ctx.lineTo(lines[_i2].lineTo.x2, lines[_i2].lineTo.y2);
    ctx.stroke();
    ctx.closePath();
  }

  animationFrame = requestAnimationFrame(redraw);
};
'use strict';

var canvas = void 0;
var ctx = void 0;
var socket = void 0;
var hash = void 0; //user's unique character id (from the server)
var animationFrame = void 0; //our next animation frame function

var users = {}; //character list
var circles = [];
var lines = [];

var getMousePos = function getMousePos(e, can) {
  var rect = canvas.getBoundingClientRect();

  // get more accurate position on canvas
  var position = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
  return position;
};

//handler for key up events
var mouseUpHandler = function mouseUpHandler(e) {
  var mouse = e;
  var user = users[hash];

  var pos = getMousePos(mouse, canvas);
  socket.emit('addCircle', pos);
};

//handler for key up events
var mouseMoveHandler = function mouseMoveHandler(e) {
  var mouse = e;
  var user = users[hash];

  var pos = getMousePos(mouse, canvas);
  if (pos.x >= 0 && pos.x <= 800 && pos.y >= 0 && pos.y <= 600) {
    user.destX = pos.x;
    user.destY = pos.y;
  }
};

var init = function init() {
  canvas = document.querySelector('#canvas');
  ctx = canvas.getContext('2d');

  socket = io.connect();

  socket.on('joined', setUser); //when user joins
  socket.on('updatedMovement', update); //when players move
  socket.on('left', removeUser); //when a user leaves
  socket.on('addCircle', addCircle);
  socket.on('updateCircle', updateC);

  document.body.addEventListener('mouseup', mouseUpHandler);
  document.body.addEventListener('mousemove', mouseMoveHandler);
};

window.onload = init;
'use strict';

//when we receive a character update
var update = function update(data) {
  // add if we do not have that character (based on their id)
  if (!users[data.hash]) {
    users[data.hash] = data;
    return;
  }

  //if we received an old message, just drop it
  if (users[data.hash].lastUpdate >= data.lastUpdate) {
    return;
  }

  //grab the character based on the character id we received
  var user = users[data.hash];
  //update their direction and movement information
  //but NOT their x/y since we are animating those
  user.prevX = data.prevX;
  user.prevY = data.prevY;
  user.destX = data.destX;
  user.destY = data.destY;
  user.alpha = 0.5;
};

var updateC = function updateC(data) {
  circles = [];
  lines = [];
  var c = data.circles;
  // console.dir(data);
  // console.dir(data.circles);
  // console.dir(data.lines);
  // console.log(`length: ${data.circles.length}`);
  circles = data.circles.slice();
  lines = data.lines.slice();
};

//function to remove a character from our character list
var removeUser = function removeUser(data) {
  //if we have that character, remove them
  if (users[data.hash]) {
    delete users[data.hash];
  }
};

//function to set this user's character
var setUser = function setUser(data) {
  hash = data.hash; //set this user's hash to the unique one they received
  users[hash] = data; //set the character by their hash

  requestAnimationFrame(redraw); //start animating
};

var addCircle = function addCircle(data) {
  circles.push(data);
};

//update this user's positions based on keyboard input
var updatePosition = function updatePosition() {
  var user = users[hash];

  //move the last x/y to our previous x/y variables
  user.prevX = user.x;
  user.prevY = user.y;

  //reset this character's alpha so they are always smoothly animating
  user.alpha = 0.5;

  //send the updated movement request to the server to validate the movement.
  socket.emit('movementUpdate', user);
};
