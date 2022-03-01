//draws the player shape, which is a combination of canvas lines and arcs.
const drawPlayer = (x, y, p_ctx, flipPlayer) => {
  let scale = 1;
  if (flipPlayer) scale = -1;
  p_ctx.clearRect(0, 0, 640, 480);

  p_ctx.save();
  p_ctx.beginPath();
  p_ctx.arc(x, y - (3 * scale), 3, 0, 2 * Math.PI);
  //draws line body from head
  p_ctx.moveTo(x, y);
  p_ctx.lineTo(x, y + (5 * scale));
  p_ctx.lineTo(x - (2 * scale), y + (8 * scale)); //draws left leg
  p_ctx.moveTo(x, y + (5 * scale)); //moving to leg beginning
  p_ctx.lineTo(x + (2 * scale), y + (8 * scale)); //right leg
  p_ctx.moveTo(x - (3 * scale), y + (3 * scale));
  p_ctx.lineTo(x + (3 * scale), y + (3 * scale));
  p_ctx.stroke();
  p_ctx.closePath();
  p_ctx.restore();
}

const drawRectangle = (x, y, width, height, ctx, color, fill) => {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + width, y);
  ctx.lineTo(x + width, y + height);
  ctx.lineTo(x, y + height);
  ctx.closePath();
  if (fill) { ctx.fillStyle = color; ctx.fill() }
  else { ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.stroke(); }
  ctx.restore();
}

const fadeBGColorToDarkBlue = (color_rgb) => {
  if (color_rgb[0] > 15) color_rgb[0] -= 0.1;
  if (color_rgb[1] > 31) color_rgb[1] -= 0.1;
  if (color_rgb[2] > 56) color_rgb[2] -= 0.1;
  return color_rgb;
}

const drawDebugPlayer = (p, p_ctx, xCam, yCam) => {
  p_ctx.fillRect(p.x + xCam - p.width/2, p.y + yCam - p.height/2, p.width, p.height, 'blue');
}

export { drawPlayer, drawRectangle, fadeBGColorToDarkBlue, drawDebugPlayer }