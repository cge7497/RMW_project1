//draws the player shape, which is a combination of canvas lines and arcs.
function drawPlayer(x,y,p_ctx,flipPlayer)
{
	var scale=1;
	if (flipPlayer) scale=-1;
    p_ctx.clearRect(0,0,640,480);

    p_ctx.save();
    p_ctx.beginPath();
    p_ctx.arc(x,y-(3 * scale),3,0,2*Math.PI);
    //draws line body from head
    p_ctx.moveTo(x,y);
    p_ctx.lineTo(x,y+(5*scale));
    p_ctx.lineTo(x-(2*scale),y+(8*scale)); //draws left leg
    p_ctx.moveTo(x,y+(5*scale)); //moving to leg beginning
    p_ctx.lineTo(x+(2*scale),y+(8*scale)); //right leg
    p_ctx.moveTo(x-(3*scale),y+(3*scale));
    p_ctx.lineTo(x+(3*scale),y+(3*scale));
    p_ctx.stroke();
    p_ctx.closePath();
    p_ctx.restore();
}

function drawNewWalkerSquare(walker, w_ctx)
{
    walker.life-=1;
    if (walker.life<=0) return;
    //Should the walker move vertically or horizontally?
    if(flipWeightedCoin()){
        walker.x += flipWeightedCoin() ? -walker.width : walker.width; //left or right
    }else{
        walker.y += flipWeightedCoin() ? -walker.width : walker.width; //up or down
    }
    drawRectangle(walker.x-walker.width/2,walker.y-walker.width/2,walker.width,walker.width,w_ctx,walker.color);
}

function drawNewWalkerArc(walker, w_ctx)
{
	walker.life-=1;
    if (walker.life<=0) return;
    walker.angle+=walker.angleIncrement;

    //Should the arc start a new curve?
    //It becomes more likely as the angle increases.
    //(I would like to make the values work together more smoothly.)
    if (flipWeightedCoin(Math.abs(walker.angle/(Math.PI*10))))
    {
        newCurve(walker);
    }

    w_ctx.save();
    w_ctx.strokeStyle=walker.color;
    w_ctx.lineWidth=walker.width;
    w_ctx.beginPath();
    w_ctx.moveTo(walker.x,walker.y);

    walker.x=Math.cos(walker.angle) * walker.radius + walker.startX;
    walker.y=Math.sin(walker.angle) * walker.radius + walker.startY;

    w_ctx.lineTo(walker.x,walker.y);
	w_ctx.stroke();
    w_ctx.closePath();
	w_ctx.restore();
}
//sets up the values for a new curve that an arc walker will traverse.
function newCurve(walker)
{
    walker.angle=Math.random() * 2 * Math.PI;
    walker.angleIncrement=Math.random()/100 + 0.1;
    walker.radius=Math.random() * 8 + 8;
    walker.startX=walker.x;
    walker.startY=walker.y;
}

function flipWeightedCoin(weight = 0.5){
    return Math.random() < weight;
}

function drawRectangle(x,y,width,height,ctx,color)
{
    ctx.save();
    ctx.fillStyle=color;
    ctx.beginPath();
    ctx.moveTo(x,y);
    ctx.lineTo(x+width,y);
    ctx.lineTo(x+width,y+height);
    ctx.lineTo(x,y+height);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

function getRandomColorWithinRange(r,g,b,a,rMin=0,gMin=0,bMin=0,aMin=0)
{
	return "rgba(" + (Math.random() * r + rMin) + "," + (Math.random() * g + gMin) + "," + (Math.random() * b + bMin) + "," + (Math.random() * a + aMin) + ")";
}

function drawGreenDiamond(x,y,width,height,w_ctx,color)
{
    w_ctx.save();
    w_ctx.strokeStyle=color;
    w_ctx.beginPath();
    w_ctx.moveTo(x,y-height/2);
    w_ctx.lineTo(x+width/2,y);
    w_ctx.lineTo(x,y+height/2);
    w_ctx.lineTo(x-width/2,y);
    w_ctx.closePath();
    w_ctx.stroke();
    w_ctx.restore();
}

function fadeBGColorToDarkBlue(color_rgb)
{
    if (color_rgb[0]>15) color_rgb[0]-=0.1;
    if (color_rgb[1]>31) color_rgb[1]-=0.1;
    if (color_rgb[2]>56) color_rgb[2]-=0.1;
    return color_rgb;
}
export {drawPlayer, drawNewWalkerSquare, drawNewWalkerArc, drawRectangle, getRandomColorWithinRange, newCurve, drawGreenDiamond, fadeBGColorToDarkBlue}