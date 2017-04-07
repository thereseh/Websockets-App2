// fast hashing library
const xxh = require('xxhashjs');
const User = require('./User.js');
const Circle = require('./Circle.js');
const physics = require('./physics.js');

const users = {};
const colors = ['#4ECDC4', '#FF6B6B', '#313638', '#FFE66D'];
// our socketio instance
let io;
// function to setup our socket server

const updateCircles = (circle, line) => {
  io.sockets.in('room1').emit('updateCircle', { circles: circle, lines: line });
};

const setupSockets = (ioServer) => {
  // set our io server instance
  io = ioServer;

  // on socket connections
  io.on('connection', (sock) => {
    const socket = sock;

    socket.join('room1'); // join user to our socket room

    // create a unique id
    const hash = xxh.h32(`${socket.id}${new Date().getTime()}`, 0xCAFEBABE).toString(16);
    const color = Math.floor(Math.random() * colors.length);
    console.log(colors[color]);
    // create a new character and store it by its unique id
    users[hash] = new User(hash, colors[color]);

    // add the id to the user's socket object for quick reference
    socket.hash = hash;

    // emit a joined event to the user and send them their character
    socket.emit('joined', users[hash]);
    // when this user sends the server a movement update
    socket.on('movementUpdate', (data) => {
      users[socket.hash] = data;
      io.sockets.in('room1').emit('updatedMovement', users[socket.hash]);
    });

    socket.on('addCircle', (data) => {
      const time = new Date().getTime();
      const x = data.pos.x;
      const y = data.pos.y;
      const c = {};
      c[time] = new Circle(x, y, time, users[data.hash].color);
      physics.addCircle(c[time]);
      io.sockets.in('room1').emit('addCircle', c[time]);
    });

    // when the user disconnects
    socket.on('disconnect', () => {
      // let everyone know this user left
      io.sockets.in('room1').emit('left', users[socket.hash]);
      // remove this user from our object
      delete users[socket.hash];
      socket.leave('room1');
    });
  });
};

module.exports.setupSockets = setupSockets;
module.exports.updateCircles = updateCircles;
