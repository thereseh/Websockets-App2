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

  //grab the character based on the character id we received
  const user = users[data.hash];
  //update their direction and movement information
  //but NOT their x/y since we are animating those
  user.prevX = data.prevX;
  user.prevY = data.prevY;
  user.destX = data.destX;
  user.destY = data.destY;
  user.alpha = 0.5;
};

const updateC = (data) => {
  circles = [];
  lines = [];
  let c = data.circles;
  // console.dir(data);
  // console.dir(data.circles);
  // console.dir(data.lines);
  // console.log(`length: ${data.circles.length}`);
  circles = data.circles.slice();
  lines = data.lines.slice();
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
  
  requestAnimationFrame(redraw); //start animating
};

const addCircle = (data) => {
  circles.push(data);
}

//update this user's positions based on keyboard input
const updatePosition = () => {
  const user = users[hash];

  //move the last x/y to our previous x/y variables
  user.prevX = user.x;
  user.prevY = user.y;
  
  //reset this character's alpha so they are always smoothly animating
  user.alpha = 0.5;

  //send the updated movement request to the server to validate the movement.
  socket.emit('movementUpdate', user);
};