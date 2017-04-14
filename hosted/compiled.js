"use strict";

// calculats the lerp for smooth transition between frames
var lerp = function lerp(v0, v1, alpha) {
  return (1 - alpha) * v0 + alpha * v1;
};

// keeps calling itself to redraw what's on canvas
var redraw = function redraw(time) {
  ctx.globalAlpha = 1;
  ctx.clearRect(0, 0, 950, 500);

  // draws all the users
  var keys = Object.keys(users);
  for (var i = 0; i < keys.length; i++) {
    var user = users[keys[i]];

    //if alpha less than 1, increase it by 0.1
    if (user.alpha < 1) user.alpha += 0.1;

    // calc lerp for both x and y pos
    user.x = lerp(user.prevX, user.destX, user.alpha);
    user.y = lerp(user.prevY, user.destY, user.alpha);

    // begin to draw
    ctx.beginPath();
    ctx.arc(user.x, user.y, user.rad, 0, 2 * Math.PI, false);
    // all users set their own color
    ctx.fillStyle = user.color;
    ctx.fill();
    ctx.closePath();
    // the second circle to get a cool stroke of a larger radius, for to make the user stand out more from added circles
    ctx.beginPath();
    ctx.strokeStyle = strokeColor;
    ctx.arc(user.x, user.y, user.rad + 4, 0, 2 * Math.PI, false);
    ctx.stroke();
    ctx.closePath();
    // draw the name of the user, centered above the user circles
    ctx.font = "30px";
    ctx.textAlign = 'center';
    ctx.fillText(user.name, user.x, user.y - 15);
  }

  // draw added circles, all the calculations are happening on the server in the physics file
  for (var _i = 0; _i < circles.length; _i++) {
    var circle = circles[_i];
    if (circles[_i].alpha < 1) circles[_i].alpha += 0.1;

    ctx.beginPath();
    ctx.arc(circles[_i].destX, circles[_i].destY, circles[_i].rad, 0, 2 * Math.PI, false);
    // color is same as the color the user had when adding the circle to the canvas
    ctx.fillStyle = circles[_i].color;
    ctx.fill();
  }

  // draw all lines connecting circles, calculated on the server on physics file
  for (var _i2 = 0; _i2 < lines.length; _i2++) {
    ctx.beginPath();
    // gradient determined on the color the two particles have that the line is connecting
    var grad = ctx.createLinearGradient(lines[_i2].moveTo.x1, lines[_i2].moveTo.y1, lines[_i2].lineTo.x2, lines[_i2].lineTo.y2);
    grad.addColorStop(0, lines[_i2].moveTo.c1);
    grad.addColorStop(1, lines[_i2].lineTo.c2);
    ctx.strokeStyle = grad;
    ctx.moveTo(lines[_i2].moveTo.x1, lines[_i2].moveTo.y1);
    ctx.lineTo(lines[_i2].lineTo.x2, lines[_i2].lineTo.y2);
    ctx.stroke();
    ctx.closePath();
  }

  // draw particles when two circles collides, calculated on the server in physics file
  for (var _i3 = 0; _i3 < particles.length; _i3++) {
    var p = particles[_i3];
    if (particles[_i3].alpha < 1) particles[_i3].alpha += 0.1;

    // the alpha is lowered over time to make a better transition to when they are destroyed
    ctx.globalAlpha = particles[_i3].globalAlpha;
    ctx.beginPath();
    ctx.arc(particles[_i3].destX, particles[_i3].destY, particles[_i3].rad, 0, 2 * Math.PI, false);
    ctx.fillStyle = particles[_i3].color;
    ctx.fill();
  }

  // keep redrawing
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
var circles = []; // circles
var particles = []; // particles after collision
var lines = []; // list of lines between circles
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
      user.lastUpdate = new Date().getTime();
      user.alpha = 0.3;
      socket.emit('movementUpdate', user);
    }
  }
};

// When the user connects, set up socket pipelines
var connectSocket = function connectSocket(e) {
  socket = io.connect();
  socket.on('joined', setUser); //when user joins
  socket.on('updatedMovement', update); //when players move
  socket.on('left', removeUser); //when a user leaves
  socket.on('updateCircle', updateC); // update circle list
  socket.on('collision', collision); // if circles collides
  socket.on('changeColor', changeColor); // when a user changes color
  socket.on('changeName', changeName); // when a user changes name
};

var init = function init() {
  canvas = document.querySelector('#canvas');
  ctx = canvas.getContext('2d');

  // connect to socket
  var connect = document.querySelector("#connect");
  // when changing name
  var change = document.querySelector("#update");
  // for radio buttons
  var op1 = document.querySelector("#option1");
  var op2 = document.querySelector("#option2");
  var op3 = document.querySelector("#option3");

  // mouse event handlers
  document.body.addEventListener('mouseup', mouseUpHandler);
  document.body.addEventListener('mousemove', mouseMoveHandler);

  // when connecting, display canvas and hide the log in objecs
  connect.addEventListener('click', function () {
    console.log('connect');
    loggedIn = true;
    connectSocket();
    document.querySelector('.can').style.display = "block";
    document.querySelector('.login').style.display = "none";
  });

  // when changing the name, emit to server
  change.addEventListener('click', function () {
    var name = document.querySelector("#newUsername").value;
    socket.emit('changeName', { hash: hash, name: name });
  });

  // when changing the background color
  // also change the strokecolor of the surrounding cirlce of the user
  op1.addEventListener('click', function () {
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

  // detect which color that was clicked on in the dropdow
  // the HEX color is declared as an attribute
  var color = document.querySelector('#colorDrop');
  color.addEventListener('click', function (e) {
    e.preventDefault();
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
  if (users[data.hash].lastUpdate >= data.lastUpdate) {
    return;
  }

  // if the data is this user, don't bother
  if (data.hash === hash) {
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
  user.alpha = 0.25;
};

/* update the list of cirlces and lines.
  Their position is calculated on the server, so it only has to happen
  once, and then be broadcasted to all clients (and will be the same) */
var updateC = function updateC(data) {
  circles = [];
  lines = [];
  particles = [];

  // slice trick, propably doesn't work in older versions of JS
  circles = data.circles.slice();
  lines = data.lines.slice();
  particles = data.particles.slice();
};

/* if two circles have collided, we are being sent particles from the server
   to be drawn, keep renewing the whole array for changes */
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

  // get name from when user connected
  var name = document.querySelector("#username").value;
  users[hash].name = name;
  // tell server
  socket.emit('join', { name: name, hash: hash });
  requestAnimationFrame(redraw); //start animating
};

// when a user changes their color, the server gives us the hash and color
// so we can update the list here on client side
var changeColor = function changeColor(data) {
  users[data.hash].color = data.color;
};

// when a user changes their name, the server gives us the hash and color
// so we can update the list here on client side
var changeName = function changeName(data) {
  users[data.hash].name = data.name;
};
