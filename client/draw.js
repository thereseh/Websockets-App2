const lerp = (v0, v1, alpha) => {
  return (1 - alpha) * v0 + alpha * v1;
};

const redraw = (time) => {
  updatePosition();

  ctx.clearRect(0, 0, 800, 600);

  const keys = Object.keys(users);

  for(let i = 0; i < keys.length; i++) {

    const user = users[keys[i]];

    //if alpha less than 1, increase it by 0.01
    if(user.alpha < 1) user.alpha += 0.1;

    user.x = lerp(user.prevX, user.destX, user.alpha);
    user.y = lerp(user.prevY, user.destY, user.alpha);

    ctx.beginPath();
    ctx.arc(user.x, user.y, user.rad, 0, 2 * Math.PI, false);
    ctx.fillStyle = user.color;
    ctx.fill();
  }
  
  for(let i = 0; i < circles.length; i++) {
    const circle = circles[i];
    if(circles[i].alpha < 1) circles[i].alpha += 0.1;

    //circles[i].x = lerp(circles[i].prevX, circles[i].destX, circles[i].alpha);
    //circles[i].y = lerp(circles[i].prevY, circles[i].destY, circles[i].alpha);
    
    ctx.beginPath();
    ctx.arc(circles[i].destX, circles[i].destY, circles[i].rad, 0, 2 * Math.PI, false);
    ctx.fillStyle = circles[i].color;
    ctx.fill();
  }
  for(let i = 0; i < lines.length; i++) {
    ctx.beginPath();
    ctx.strokeStyle = "rgba(0,0,0,"+ (1.2-lines[i].alpha) +")";
    ctx.moveTo(lines[i].moveTo.x1, lines[i].moveTo.y1);
    ctx.lineTo(lines[i].lineTo.x2, lines[i].lineTo.y2);
    ctx.stroke();
    ctx.closePath();
  }

  animationFrame = requestAnimationFrame(redraw);
};