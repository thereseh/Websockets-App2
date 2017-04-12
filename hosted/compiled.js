"use strict";

var lerp = function lerp(v0, v1, alpha) {
  return (1 - alpha) * v0 + alpha * v1;
};

var redraw = function redraw(time) {
  ctx.globalAlpha = 1;
  ctx.clearRect(0, 0, 950, 500);

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
    ctx.closePath();
    ctx.beginPath();
    ctx.strokeStyle = strokeColor;
    ctx.arc(user.x, user.y, user.rad + 3, 0, 2 * Math.PI, false);
    ctx.stroke();
    ctx.closePath();
    ctx.font = "30px";
    ctx.textAlign = 'center';
    ctx.fillText(user.name, user.x, user.y - 15);
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
    var grad = ctx.createLinearGradient(lines[_i2].moveTo.x1, lines[_i2].moveTo.y1, lines[_i2].lineTo.x2, lines[_i2].lineTo.y2);
    grad.addColorStop(0, lines[_i2].moveTo.c1);
    grad.addColorStop(1, lines[_i2].lineTo.c2);
    ctx.strokeStyle = grad;
    ctx.moveTo(lines[_i2].moveTo.x1, lines[_i2].moveTo.y1);
    ctx.lineTo(lines[_i2].lineTo.x2, lines[_i2].lineTo.y2);
    ctx.stroke();
    ctx.closePath();
  }

  for (var _i3 = 0; _i3 < particles.length; _i3++) {
    var p = particles[_i3];
    if (particles[_i3].alpha < 1) particles[_i3].alpha += 0.1;

    //circles[i].x = lerp(circles[i].prevX, circles[i].destX, circles[i].alpha);
    //circles[i].y = lerp(circles[i].prevY, circles[i].destY, circles[i].alpha);
    //ctx.save();
    ctx.globalAlpha = particles[_i3].globalAlpha;
    ctx.beginPath();
    ctx.arc(particles[_i3].destX, particles[_i3].destY, particles[_i3].rad, 0, 2 * Math.PI, false);
    ctx.fillStyle = particles[_i3].color;
    ctx.fill();
    //ctx.restore();
  }

  animationFrame = requestAnimationFrame(redraw);
};
'use strict';

var canvas = void 0;
var ctx = void 0;
var socket = void 0;
var hash = void 0; //user's unique character id (from the server)
var animationFrame = void 0; //our next animation frame function
var loggedIn = false;
var users = {}; //character list
var circles = [];
var particles = [];
var lines = [];
var strokeColor = "black";

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
  if (loggedIn) {
    var mouse = e;
    var user = users[hash];
    var pos = getMousePos(mouse, canvas);
    if (pos.x > 0 && pos.x < 950 && pos.y > 0 && pos.y < 500) {
      if (user) {
        socket.emit('addCircle', { pos: pos, hash: hash });
      }
    }
  }
};

//handler for key up events
var mouseMoveHandler = function mouseMoveHandler(e) {
  var mouse = e;
  var user = users[hash];

  var pos = getMousePos(mouse, canvas);
  if (pos.x > 0 && pos.x < 950 && pos.y > 0 && pos.y < 500) {
    if (user) {
      user.prevX = user.x;
      user.prevY = user.y;
      user.destX = pos.x;
      user.destY = pos.y;
      user.alpha = 0.5;
      socket.emit('movementUpdate', user);
    }
  }
};

var connectSocket = function connectSocket(e) {
  socket = io.connect();
  socket.on('joined', setUser); //when user joins
  socket.on('updatedMovement', update); //when players move
  socket.on('left', removeUser); //when a user leaves
  socket.on('addCircle', addCircle);
  socket.on('updateCircle', updateC);
  socket.on('collision', collision);
  socket.on('changeColor', changeColor);
  socket.on('changeName', changeName);
};

var init = function init() {
  canvas = document.querySelector('#canvas');
  ctx = canvas.getContext('2d');

  var connect = document.querySelector("#connect");
  var change = document.querySelector("#update");
  var op1 = document.querySelector("#option1");
  var op2 = document.querySelector("#option2");
  var op3 = document.querySelector("#option3");

  document.body.addEventListener('mouseup', mouseUpHandler);
  document.body.addEventListener('mousemove', mouseMoveHandler);
  connect.addEventListener('click', function () {
    console.log('connect');
    loggedIn = true;
    connectSocket();
    document.querySelector('.can').style.display = "block";
    document.querySelector('.login').style.display = "none";
  });
  change.addEventListener('click', function () {
    var name = document.querySelector("#newUsername").value;
    socket.emit('changeName', { hash: hash, name: name });
  });
  op1.addEventListener('click', function () {
    console.log('click');
    canvas.style.backgroundColor = "black";
    strokeColor = "white";
  });
  op2.addEventListener('click', function () {
    canvas.style.backgroundColor = "white";
    strokeColor = "black";
  });
  op3.addEventListener('click', function () {
    canvas.style.backgroundColor = "#8c8c8c";
    strokeColor = "white";
  });
  var color = document.querySelector('#colorDrop');
  color.addEventListener('click', function (e) {
    var color = e.target.attributes[1].value;
    socket.emit('changeColor', { hash: hash, color: color });
  });
};

window.onload = init;
"use strict";

//when we receive a character update
var update = function update(data) {
  // add if we do not have that character (based on their id)
  if (!users[data.hash]) {
    users[data.hash] = data;
    return;
  }

  //if we received an old message, just drop it
  //if(users[data.hash].lastUpdate >= data.lastUpdate) {
  //  return;
  //}

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
  particles = [];
  circles = data.circles.slice();
  lines = data.lines.slice();
  particles = data.particles.slice();
};

var collision = function collision(data) {
  particles = [];
  particles = data.particle.slice();
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

  var name = document.querySelector("#username").value;
  users[hash].name = name;
  socket.emit('join', { name: name, hash: hash });
  requestAnimationFrame(redraw); //start animating
};

var addCircle = function addCircle(data) {
  circles.push(data);
};

var changeColor = function changeColor(data) {
  console.dir(data);
  users[data.hash].color = data.color;
};

var changeName = function changeName(data) {
  console.dir(data);
  users[data.hash].name = data.name;
};
