let canvas;
let ctx;
let socket; 
let hash; //user's unique character id (from the server)
let animationFrame; //our next animation frame function

let users = {}; //character list
const circles = [];
const lines = [];

const getMousePos = (e, can) => {
    let rect = canvas.getBoundingClientRect();
          
  // get more accurate position on canvas
    let position = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    return position;
};


//handler for key up events
const mouseUpHandler = (e) => {
  let mouse = e;
  const user = users[hash];
  
  let pos = getMousePos(mouse, canvas);
  socket.emit('addCircle', { pos, hash });  
};

//handler for key up events
const mouseMoveHandler = (e) => {
  let mouse = e;
  const user = users[hash];

  let pos = getMousePos(mouse, canvas);
  if (pos.x >= 0 && pos.x <= 800 && pos.y >= 0 && pos.y <= 600) {
    user.destX = pos.x;
    user.destY = pos.y;
  }
};

const init = () => {
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