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
    this.alpha = 0.5;
    this.direction = 0;
    this.rad = 6;
    this.color = color;
    this.name = '';
  }
}

module.exports = User;
