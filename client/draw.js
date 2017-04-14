// calculats the lerp for smooth transition between frames
const lerp = (v0, v1, alpha) => {
  return (1 - alpha) * v0 + alpha * v1;
};

// keeps calling itself to redraw what's on canvas
const redraw = (time) => {
  ctx.globalAlpha = 1;
  ctx.clearRect(0, 0, 950, 500);

  // draws all the users
  const keys = Object.keys(users);
  for(let i = 0; i < keys.length; i++) {
    const user = users[keys[i]];

    //if alpha less than 1, increase it by 0.1
    if(user.alpha < 1) user.alpha += 0.1;

    // calc lerp for both x and y pos
    user.x = lerp(user.prevX, user.destX, user.alpha);
    user.y = lerp(user.prevY, user.destY, user.alpha);
    
    // begin to draw
    ctx.beginPath();
    ctx.arc(user.x, user.y, user.rad, 0, 2 * Math.PI, false);
    // all users set their own color
    ctx.fillStyle = user.color;
    ctx.fill();
    ctx.closePath();
    // the second circle to get a cool stroke of a larger radius, for to make the user stand out more from added circles
    ctx.beginPath();
    ctx.strokeStyle = strokeColor;
    ctx.arc(user.x, user.y, user.rad+4, 0, 2 * Math.PI, false);
    ctx.stroke();
    ctx.closePath();
    // draw the name of the user, centered above the user circles
    ctx.font = "30px";
    ctx.textAlign = 'center';
    ctx.fillText(user.name,user.x, user.y-15);
  }
  
  // draw added circles, all the calculations are happening on the server in the physics file
  for(let i = 0; i < circles.length; i++) {
    const circle = circles[i];
    if(circles[i].alpha < 1) circles[i].alpha += 0.1;

    ctx.beginPath();
    ctx.arc(circles[i].destX, circles[i].destY, circles[i].rad, 0, 2 * Math.PI, false);
    // color is same as the color the user had when adding the circle to the canvas
    ctx.fillStyle = circles[i].color;
    ctx.fill();
  }
  
  // draw all lines connecting circles, calculated on the server on physics file
  for(let i = 0; i < lines.length; i++) {
    ctx.beginPath();
    // gradient determined on the color the two particles have that the line is connecting
    let grad= ctx.createLinearGradient(lines[i].moveTo.x1, lines[i].moveTo.y1, lines[i].lineTo.x2, lines[i].lineTo.y2);
    grad.addColorStop(0, lines[i].moveTo.c1);
    grad.addColorStop(1, lines[i].lineTo.c2);
    ctx.strokeStyle = grad;
    ctx.moveTo(lines[i].moveTo.x1, lines[i].moveTo.y1);
    ctx.lineTo(lines[i].lineTo.x2, lines[i].lineTo.y2);
    ctx.stroke();
    ctx.closePath();
  }
  
  // draw particles when two circles collides, calculated on the server in physics file
  for(let i = 0; i < particles.length; i++) {
    const p = particles[i];
    if(particles[i].alpha < 1) particles[i].alpha += 0.1;

    // the alpha is lowered over time to make a better transition to when they are destroyed
    ctx.globalAlpha = particles[i].globalAlpha;
    ctx.beginPath();
    ctx.arc(particles[i].destX, particles[i].destY, particles[i].rad, 0, 2 * Math.PI, false);
    ctx.fillStyle = particles[i].color;
    ctx.fill();
  }

  // keep redrawing
  animationFrame = requestAnimationFrame(redraw);
};