// our socket code for physics to send updates back
const sockets = require('./sockets.js');

const circleList = []; // list of characters
let lines = [];

const distance = (i, j) => {
  let dist = 0;
  const dx = circleList[i].destX - circleList[j].destX;
  const dy = circleList[i].destY - circleList[j].destY;
  dist = Math.sqrt((dx * dx) + (dy * dy));
  // Draw the line when distance is smaller
  // then the minimum distance
  if (dist <= 90) {
    const line = {};
    const x1 = circleList[i].destX;
    const y1 = circleList[i].destY;
    const x2 = circleList[j].destX;
    const y2 = circleList[j].destY;
    const c1 = circleList[i].color;
    const c2 = circleList[j].color;
    line.moveTo = { x1, y1, c1 };
    line.lineTo = { x2, y2, c2 };
    line.alpha = ((1.2 - dist) / 90);
    lines.push(line);
    // Some acceleration for the partcles
    // depending upon their distance
    const ax = dx / 2000;
    const ay = dy / 2000;
    // Apply the acceleration on the particles
    circleList[i].velocityX -= ax;
    circleList[i].velocityY -= ay;
    circleList[j].velocityX += ax;
    circleList[j].velocityY += ay;
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
    if (circleList[i].destX + circleList[i].rad > 800) circleList[i].destX = circleList[i].rad;
    else if (circleList[i].destX + circleList[i].rad < 10) {
      circleList[i].destX = 800 - circleList[i].rad;
    }
    if (circleList[i].destY + circleList[i].rad > 600) circleList[i].destY = circleList[i].rad;
    else if (circleList[i].destY + circleList[i].rad < 10) {
      circleList[i].destY = 600 - circleList[i].rad;
    }
    if (circleList[i].destX + circleList[i].rad > 800 && circleList[i].destY + circleList[i].rad > 600) {
      
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
  sockets.updateCircles(circleList, lines);
  lines = [];
};
// update our entire character list
const addCircle = (circle) => {
  circleList.push(circle);
};

// check for collisions every 20ms
setInterval(() => {
  update();
}, 20);

module.exports.addCircle = addCircle;
