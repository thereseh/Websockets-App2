const lerp = (v0, v1, alpha) => {
  return (1 - alpha) * v0 + alpha * v1;
};

const redraw = (time) => {
  ctx.globalAlpha = 1;
  ctx.clearRect(0, 0, 950, 500);

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
    ctx.closePath();
    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.arc(user.x, user.y, user.rad+3, 0, 2 * Math.PI, false);
    ctx.stroke();
    ctx.closePath();
    ctx.font = "30px";
    ctx.textAlign = 'center';
    ctx.fillText(user.name,user.x, user.y-15);
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
    let grad= ctx.createLinearGradient(lines[i].moveTo.x1, lines[i].moveTo.y1, lines[i].lineTo.x2, lines[i].lineTo.y2);
    grad.addColorStop(0, lines[i].moveTo.c1);
    grad.addColorStop(1, lines[i].lineTo.c2);
    ctx.strokeStyle = grad;
    ctx.moveTo(lines[i].moveTo.x1, lines[i].moveTo.y1);
    ctx.lineTo(lines[i].lineTo.x2, lines[i].lineTo.y2);
    ctx.stroke();
    ctx.closePath();
  }
  
  for(let i = 0; i < particles.length; i++) {
    const p = particles[i];
    if(particles[i].alpha < 1) particles[i].alpha += 0.1;

    //circles[i].x = lerp(circles[i].prevX, circles[i].destX, circles[i].alpha);
    //circles[i].y = lerp(circles[i].prevY, circles[i].destY, circles[i].alpha);
    //ctx.save();
    ctx.globalAlpha = particles[i].globalAlpha;
    ctx.beginPath();
    ctx.arc(particles[i].destX, particles[i].destY, particles[i].rad, 0, 2 * Math.PI, false);
    ctx.fillStyle = particles[i].color;
    ctx.fill();
    //ctx.restore();
  }

  animationFrame = requestAnimationFrame(redraw);
};