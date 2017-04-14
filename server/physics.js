// our socket code for physics to send updates back
const sockets = require('./sockets.js');
const Particle = require('./Particle.js');
const Circle = require('./Circle.js');

const circleList = []; // array of circles
const particleList = []; // array of particles
let lines = []; // array of lines
const maxParticles = 300; // a max just so it doesn't get too crazy
const spread = Math.PI; // to get even circular distribution on collision

// helper function for magnitude
const getMagnitude = (x, y) => Math.sqrt((x * x) + (y * y));

// helper function for random angle
const getRandomAngle = (x, y) => Math.atan2(y, x);

// helper function to get velocity from angle
const fromAngle = (angle, mag) => {
  const aX = mag * Math.cos(angle);
  const aY = mag * Math.sin(angle);
  return { angX: aX, angY: aY };
};

// color blend code from https://coderwall.com/p/z8uxzw/javascript-color-blender
const intToHex = (num) => {
  let hex = Math.round(num).toString(16);
  if (hex.length === 1) { hex = `0${hex}`; }
  return hex;
};
// color blend code from https://coderwall.com/p/z8uxzw/javascript-color-blender
// takes two hex, converts it into integers, calculates
// the mix of two colors and then converts it back to hex
const getColor = (col1, col2, percentage) => {
  let color1 = col1;
  let color2 = col2;
  if (color1.length === 4) {
    color1 = color1[1] + color1[1] + color1[2] + color1[2] + color1[3] + color1[3];
  } else {
    color1 = color1.substring(1);
  }
  if (color2.length === 4) {
    color2 = color2[1] + color2[1] + color2[2] + color2[2] + color2[3] + color2[3];
  } else {
    color2 = color2.substring(1);
  }

  color1 = [parseInt(color1[0] + color1[1], 16),
    parseInt(color1[2] + color1[3], 16), parseInt(color1[4] + color1[5], 16)];
  color2 = [parseInt(color2[0] + color2[1], 16),
    parseInt(color2[2] + color2[3], 16), parseInt(color2[4] + color2[5], 16)];
  let color3 = [
    ((1 - percentage) * color1[0]) + (percentage * color2[0]),
    ((1 - percentage) * color1[1]) + (percentage * color2[1]),
    ((1 - percentage) * color1[2]) + (percentage * color2[2]),
  ];

  color3 = `#${intToHex(color3[0])}${intToHex(color3[1])}${intToHex(color3[2])}`;
  return color3;
};

/* On collision, creates particles.
  Takes the average x and y pos of the two cirlcles,
  as well as their average (abs)velocity (was the easist way to fake ellastic collision) */
const addParticles = (i, j) => {
  // get average x and y pos on canvas
  const x = (circleList[i].destX + circleList[j].destX) / 2;
  const y = (circleList[i].destY + circleList[j].destY) / 2;

  // get average x and y velocity
  const velX = Math.abs(circleList[i].velocityX) + Math.abs(circleList[j].velocityX);
  const velY = Math.abs(circleList[i].velocityY) + Math.abs(circleList[j].velocityY);

  // get the mix of the two colors
  const color = getColor(circleList[i].color, circleList[j].color, 0.5);

  // create about 15 particles each collision (less if we reach max)
  for (let k = 0; k < 15; k++) {
    // continue to make particle if we haven't reached max
    if (particleList.length >= maxParticles) break;
    // time they were created
    const time = new Date().getTime();
    // create particle
    const particle = new Particle(x, y, spread, time);
    // get a random angle
    particle.angle = (getRandomAngle(x, y) + spread) - (Math.random() * spread * 2);
    // get magnitude
    particle.magnitude = getMagnitude(velX, velY);
    // get random direction to head towards
    particle.velocityX = fromAngle(particle.angle, particle.magnitude).angX;
    particle.velocityY = fromAngle(particle.angle, particle.magnitude).angY;
    // color
    particle.color = color;
    particleList.push(particle);
  }
  // remove the two circles that collided
  circleList.splice(i, 1);
  circleList.splice(j - 1, 1);
};

// calculate the distance between circles
const distance = (i, j) => {
  let dist = 0;
  const dx = circleList[i].destX - circleList[j].destX;
  const dy = circleList[i].destY - circleList[j].destY;

  // the dist between these two circles
  dist = getMagnitude(dx, dy);

  // get the line when distance is lesser or equal to 300
  if (dist <= 300) {
    // create a line object to be drawn in client
    const line = {};
    const x1 = circleList[i].destX;
    const y1 = circleList[i].destY;
    const x2 = circleList[j].destX;
    const y2 = circleList[j].destY;
    const c1 = circleList[i].color;
    const c2 = circleList[j].color;
    line.moveTo = { x1, y1, c1 };
    line.lineTo = { x2, y2, c2 };
    line.alpha = ((1.2 - dist) / 120);
    // push object to array
    lines.push(line);
  }

  // if the distance is equal to or lesser than 80
  // then start attract the particles toward each other
  if (dist <= 80) {
    // Some acceleration for the partcles
    // depending upon their distance
    const ax = dx / 4000;
    const ay = dy / 4000;
    // Apply the acceleration on the particles
    circleList[i].velocityX -= ax;
    circleList[i].velocityY -= ay;
    circleList[j].velocityX += ax;
    circleList[j].velocityY += ay;
    // if the distance happen to be lesser than or equal to the
    // sum of their radiuses, then they are colliding
    if (dist <= circleList[i].rad + circleList[j].rad) {
      // create particles
      addParticles(i, j);
      // send the array of particles to the client through sockets
      sockets.collision(particleList);
    }
  }
};

// update the position of the circles
// circle web matrix code is inspired from here:
// http://cssdeck.com/labs/html5-canvas-particles-web-matrix
const update = () => {
  for (let i = 0; i < circleList.length; i++) {
    // calculate the future position
    circleList[i].destX += circleList[i].velocityX;
    circleList[i].destY += circleList[i].velocityY;

    // check if the circles are heading towards the end of canvas
    // then wrap them
    if (circleList[i].destX + circleList[i].rad > 950) circleList[i].destX = circleList[i].rad;
    else if (circleList[i].destX + circleList[i].rad < 10) {
      circleList[i].destX = 950 - circleList[i].rad;
    }
    if (circleList[i].destY + circleList[i].rad > 500) circleList[i].destY = circleList[i].rad;
    else if (circleList[i].destY + circleList[i].rad < 10) {
      circleList[i].destY = 500 - circleList[i].rad;
    }

    // second loop, compare the distance from this circle to all
    // the other circles
    for (let j = i + 1; j < circleList.length; j++) {
      distance(i, j);
    }
  }

  // check lifespan of particles
  for (let i = 0; i < particleList.length; i++) {
    // update the timestamp
    particleList[i].lastUpdate = new Date().getTime();
    // if the latest timestamp is more than 3 sec older than when created
    // delete the particle (splice from array)
    if ((particleList[i].lastUpdate - particleList[i].created) > 3000) {
      particleList.splice(i, 1);
      i--;
      // else, lower the alpha a little bit each update
      // for better transition
    } else {
      particleList[i].destX += particleList[i].velocityX;
      particleList[i].destY += particleList[i].velocityY;
      particleList[i].globalAlpha -= 0.006;
    }
  }
  // send out updated circle, line and particle array
  sockets.updateCircles(circleList, lines, particleList);
  // empty the line array
  lines = [];
};

// create a circlee
const addCircle = (data, color) => {
  const time = new Date().getTime();
  const x = data.pos.x;
  const y = data.pos.y;
  const c = new Circle(x, y, time, color, data.hash);
  // get random angle, magnitude and velocity, to create random movement upon creation
  c.angle = (getRandomAngle(x, y) + spread) - (Math.random() * spread * 2);
  c.magnitude = getMagnitude(((Math.random() * (0.3 - 0.1)) + 0.1),
                             ((Math.random() * (0.3 - 0.1)) + 0.1));
  c.velocityX = fromAngle(c.angle, c.magnitude).angX;
  c.velocityY = fromAngle(c.angle, c.magnitude).angY;
  circleList.push(c);
};

// check for collisions every 20ms
setInterval(() => {
  update();
}, 20);

module.exports.addCircle = addCircle;
