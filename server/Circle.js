class Circle {
  constructor(x, y, time, color, hash) {
    this.created = time;
    this.lastUpdate = new Date().getTime();
    this.x = 0;
    this.y = 0;
    this.prevX = x;
    this.prevY = y;
    this.destX = x;
    this.destY = y;
    this.alpha = 0.5;
    this.angle = 0;
    this.rad = 5;
    this.velocityY = 0;
    this.velocityX = 0;
    this.color = color;
    this.magnitude = 0;
    this.user = hash;
  }
}

module.exports = Circle;
