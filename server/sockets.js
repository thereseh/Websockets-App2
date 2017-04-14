// fast hashing library
const xxh = require('xxhashjs');
const User = require('./User.js');
const physics = require('./physics.js');

const users = {};
// some random color to start off with
const colors = ['#4ECDC4', '#FF6B6B', '#313638', '#FFE66D', '#AA80FF', '#ADEBAD', '#FFCC66',
  '#FF3399', '#0066CC'];
// our socketio instance
let io;
// method called from physics file, to send out the new info and positions of
// all the cirles and lines to all clients
const updateCircles = (circle, line, particle) => {
  io.sockets.in('room1').emit('updateCircle', { circles: circle, lines: line, particles: particle });
};
// method called from physics file, to send out an array of paricles after
// that two circles have collided
const collision = (p) => {
  io.sockets.in('room1').emit('collision', { particle: p });
};
// function to setup our socket server
const setupSockets = (ioServer) => {
  // set our io server instance
  io = ioServer;
  // on socket connections
  io.on('connection', (sock) => {
    const socket = sock;
    socket.join('room1'); // join user to our socket room

    // create a unique id
    const hash = xxh.h32(`${socket.id}${new Date().getTime()}`, 0xCAFEBABE).toString(16);

    // get a random color from array
    const color = Math.floor(Math.random() * colors.length);

    // create a new character and store it by its unique id, and give it a color
    users[hash] = new User(hash, colors[color]);

    // add the id to the user's socket object for quick reference
    socket.hash = hash;

    // emit a joined event to the user and send them their character
    socket.emit('joined', users[hash]);

    socket.on('join', (data) => {
      users[data.hash].name = data.name;
    });

    // when this user sends the server a movement update
    socket.on('movementUpdate', (data) => {
      users[socket.hash] = data;
      io.sockets.in('room1').emit('updatedMovement', users[socket.hash]);
    });

    // when a user adds a circle, get the color of the user
    // and call the physics file to create a circle
    socket.on('addCircle', (data) => {
      const c = users[data.hash].color;
      physics.addCircle(data, c);
    });

    // when a user changes color, store that on server
    // and emit to all clients to update their info
    socket.on('changeColor', (data) => {
      users[data.hash].color = data.color;
      io.sockets.in('room1').emit('changeColor', data);
    });

    // when a user changes name, store that on server
    // and emit to all clients to update their info
    socket.on('changeName', (data) => {
      users[data.hash].name = data.name;
      io.sockets.in('room1').emit('changeName', data);
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
module.exports.collision = collision;

