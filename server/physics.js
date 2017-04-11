// our socket code for physics to send updates back
const sockets = require('./sockets.js');
const Particle = require('./Particle.js');
const Circle = require('./Circle.js');

const circleList = []; // list of characters
const particleList = [];
let lines = [];
const maxParticles = 300;
const spread = Math.PI;

const getMagnitude = (x, y) => Math.sqrt((x * x) + (y * y));
const getRandomAngle = (x, y) => Math.atan2(y, x);
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
const addParticles = (i, j) => {
  const x = (circleList[i].destX + circleList[j].destX) / 2;
  const y = (circleList[i].destY + circleList[j].destY) / 2;
  const velX = Math.abs(circleList[i].velocityX) + Math.abs(circleList[j].velocityX);
  const velY = Math.abs(circleList[i].velocityY) + Math.abs(circleList[j].velocityY);
  const color = getColor(circleList[i].color, circleList[j].color, 0.5);
  for (let k = 0; k < 15; k++) {
    if (particleList.length >= maxParticles) break;
    const time = new Date().getTime();
    const particle = new Particle(x, y, spread, time);
    particle.angle = (getRandomAngle(x, y) + spread) - (Math.random() * spread * 2);
    particle.magnitude = getMagnitude(velX, velY);
    particle.velocityX = fromAngle(particle.angle, particle.magnitude).angX;
    particle.velocityY = fromAngle(particle.angle, particle.magnitude).angY;
    particle.color = color;
    particleList.push(particle);
  }
  circleList.splice(i, 1);
  circleList.splice(j - 1, 1);
};

const distance = (i, j) => {
  let dist = 0;
  const dx = circleList[i].destX - circleList[j].destX;
  const dy = circleList[i].destY - circleList[j].destY;
  dist = Math.sqrt((dx * dx) + (dy * dy));
  // Draw the line when distance is smaller
  // then the minimum distance
  if (dist <= 300) {
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
    lines.push(line);
  }
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
    if (dist <= circleList[i].rad + circleList[j].rad) {
      addParticles(i, j);
      sockets.collision(particleList);
    }
  }
};

const update = () => {
  for (let i = 0; i < circleList.length; i++) {
    // Change the velocities
    circleList[i].destX += circleList[i].velocityX;
    circleList[i].destY += circleList[i].velocityY;
    // We don't want to make the particles leave the
    // area, so just change their position when they
    // touch the walls of the window
    if (circleList[i].destX + circleList[i].rad > 950) circleList[i].destX = circleList[i].rad;
    else if (circleList[i].destX + circleList[i].rad < 10) {
      circleList[i].destX = 950 - circleList[i].rad;
    }
    if (circleList[i].destY + circleList[i].rad > 500) circleList[i].destY = circleList[i].rad;
    else if (circleList[i].destY + circleList[i].rad < 10) {
      circleList[i].destY = 500 - circleList[i].rad;
    }
    // Now we need to make them attract each other
    // so first, we'll check the distance between
    // them and compare it to the minDist we have
    // already set
    // We will need another loop so that each
    // particle can be compared to every other particle
    // except itself
    for (let j = i + 1; j < circleList.length; j++) {
      distance(i, j);
    }
  }

  for (let i = 0; i < particleList.length; i++) {
    particleList[i].lastUpdate = new Date().getTime();
     // console.log(`${particleList[i].lastUpdate} | ${particleList[i].created}`)
    if ((particleList[i].lastUpdate - particleList[i].created) > 3000) {
      particleList.splice(i, 1);
      i--;
    } else {
      particleList[i].destX += particleList[i].velocityX;
      particleList[i].destY += particleList[i].velocityY;
      particleList[i].globalAlpha -= 0.006;
    }
  }
  sockets.updateCircles(circleList, lines, particleList);
  lines = [];
};
// update our entire character list
const addCircle = (data, color) => {
  const time = new Date().getTime();
  const x = data.pos.x;
  const y = data.pos.y;
  const c = new Circle(x, y, time, color, data.hash);
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
