class User {
  constructor(hash, color) {
    this.hash = hash;
    this.lastUpdate = new Date().getTime();
    this.x = 0;
    this.y = 0;
    this.prevX = 0;
    this.prevY = 0;
    this.destX = 0;
    this.destY = 0;
    this.height = 100;
    this.width = 100;
    this.alpha = 0.5;
    this.direction = 0;
    this.rad = 5;
    this.color = color;
  }
}

module.exports = User;
