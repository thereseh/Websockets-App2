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

const updateC = (data) => {
  circles = [];
  lines = [];
  particles = [];
  circles = data.circles.slice();
  lines = data.lines.slice();
  particles = data.particles.slice();
};

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
  
  let name = document.querySelector("#username").value;
  users[hash].name = name;
  socket.emit('join', { name: name, hash: hash });
  requestAnimationFrame(redraw); //start animating
};

const addCircle = (data) => {
  circles.push(data);
};

const changeColor = (data) => {
  users[data.hash].color = data.color;
};

const changeName = (data) => {
  users[data.hash].name = data.name;
};