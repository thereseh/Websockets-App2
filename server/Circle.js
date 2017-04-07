class Circle {
  constructor(x, y, time, color) {
    this.created = time;
    this.lastUpdate = new Date().getTime();
    this.x = 0;
    this.y = 0;
    this.prevX = x;
    this.prevY = y;
    this.destX = x;
    this.destY = y;
    this.alpha = 0.5;
    this.direction = 0;
    this.frame = 0;
    this.frameCount = 0;
    this.rad = 5;
    this.velocityY = 0;
    this.velocityX = 0;
    this.color = color;
  }
}

module.exports = Circle;
