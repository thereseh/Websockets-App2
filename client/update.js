//when we receive a character update
const update = (data) => {
  
  // add if we do not have that character (based on their id)
  if(!users[data.hash]) {
    users[data.hash] = data;
    return;
  }

  //if we received an old message, just drop it
  if(users[data.hash].lastUpdate >= data.lastUpdate) {
    return;
  }
  
  // if the data is this user, don't bother
  if(data.hash === hash) {
    return;
  }

  //grab the character based on the character id we received
  const user = users[data.hash];
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
const updateC = (data) => {
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
const collision = (data) => {
  particles = [];
  particles = data.particle.slice(); 
};

//function to remove a character from our character list
const removeUser = (data) => {
  //if we have that character, remove them
  if(users[data.hash]) {
    delete users[data.hash];
  }
};

//function to set this user's character
const setUser = (data) => {
  hash = data.hash; //set this user's hash to the unique one they received
  users[hash] = data; //set the character by their hash
  
  // get name from when user connected
  let name = document.querySelector("#username").value;
  users[hash].name = name;
  // tell server
  socket.emit('join', { name: name, hash: hash });
  requestAnimationFrame(redraw); //start animating
};

// when a user changes their color, the server gives us the hash and color
// so we can update the list here on client side
const changeColor = (data) => {
  users[data.hash].color = data.color;
};

// when a user changes their name, the server gives us the hash and color
// so we can update the list here on client side
const changeName = (data) => {
  users[data.hash].name = data.name;
};