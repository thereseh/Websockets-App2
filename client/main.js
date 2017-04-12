let canvas;
let ctx;
let socket; 
let hash; //user's unique character id (from the server)
let animationFrame; //our next animation frame function
let loggedIn = false;
let users = {}; //character list
const circles = [];
const particles = [];
const lines = [];
let strokeColor = "black";

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
  if (loggedIn) {
  let mouse = e;
  const user = users[hash];
  let pos = getMousePos(mouse, canvas);
  if (pos.x > 0 && pos.x < 950 && pos.y > 0 && pos.y < 500) {
    if (user) {
      socket.emit('addCircle', { pos, hash });
    }
  }
  }
};

//handler for key up events
const mouseMoveHandler = (e) => {
  let mouse = e;
  const user = users[hash];

  let pos = getMousePos(mouse, canvas);
  if (pos.x > 0 && pos.x < 950 && pos.y > 0 && pos.y < 500) {
    if (user) {
    user.prevX = user.x;
    user.prevY = user.y;
    user.destX = pos.x;
    user.destY = pos.y;
    user.alpha = 0.3;
    socket.emit('movementUpdate', user);
    }
  }
};

const connectSocket = (e) => {
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

const init = () => {
  canvas = document.querySelector('#canvas');
  ctx = canvas.getContext('2d');

  const connect = document.querySelector("#connect");
  const change = document.querySelector("#update");
  const op1 = document.querySelector("#option1");
  const op2 = document.querySelector("#option2");
  const op3 = document.querySelector("#option3");

  document.body.addEventListener('mouseup', mouseUpHandler);
  document.body.addEventListener('mousemove', mouseMoveHandler);
  connect.addEventListener('click', () => {
    console.log('connect');
    loggedIn = true;
    connectSocket();
    document.querySelector('.can').style.display = "block";
    document.querySelector('.login').style.display = "none";
  }); 
  change.addEventListener('click', () => {
    let name = document.querySelector("#newUsername").value;
      socket.emit('changeName', { hash: hash, name: name });
  });
  op1.addEventListener('click', () => {
    canvas.style.backgroundColor = "black";
    strokeColor = "white";
  });
  op2.addEventListener('click', () => {
    canvas.style.backgroundColor = "white";
    strokeColor = "black";
  });
  op3.addEventListener('click', () => {
    canvas.style.backgroundColor = "#8c8c8c";
    strokeColor = "white";
  });
  const color = document.querySelector('#colorDrop');
  color.addEventListener('click', (e) => {
    e.preventDefault();
    let color = e.target.attributes[1].value;
    socket.emit('changeColor', { hash, color }); 
  });
};

window.onload = init;