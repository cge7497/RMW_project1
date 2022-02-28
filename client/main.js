import * as utilities from "./utilities.js";
import * as classes from "./classes.js"

let w_ctx, p_ctx, bg_ctx;
let sq_walkers = [], arc_walkers = [];
let bgRects = [];
const player = {x: 300, y:300, width: 8, height: 8, newX: 300, newY: 300};

let xSpeed = 1, ySpeed = 2;
let flipPlayer = false;
let keysPressed = [];
let canvasWidth, canvasHeight;
let canvasData;
let sq_audio, arc_audio, g_spawn_audio, g_get_audio;
let walker_counter = 0;
let bg_dir_rad = 0, bg_dir_rad_Inc = 0;
let bg_color = "white", bg_color_rgb = [255, 255, 255], should_change_bg_color = false;
const WIDTH = 5;
const BG_DIR_MULTIPLIER = 1;
let camXOffset = 0, camYOffset = 0

//I created the sounds with SFXR (http://sfxr.me/)
function init() {
    sq_audio = new Audio("./sounds/blue_walker.wav");
    sq_audio.volume = 0.25;

    arc_audio = new Audio("./sounds/red_walker.wav");
    arc_audio.volume = 0.25;

    g_spawn_audio = new Audio("./sounds/green_spawn.wav");
    g_spawn_audio.volume = 0.25;

    g_get_audio = new Audio("./sounds/green_get.wav");
    g_get_audio.volume = 0.25;

    let p_canvas = document.querySelector("#canvas_player");
    let w_canvas = document.querySelector("#canvas_walkers");
    let bg_canvas = document.querySelector("#canvas_bg");
    let resetBtn = document.querySelector("#btn_reset");
    resetBtn.onclick = function () { location.reload() };
    w_ctx = w_canvas.getContext('2d');
    p_ctx = p_canvas.getContext('2d');
    bg_ctx = bg_canvas.getContext('2d');

    canvasWidth = w_canvas.width;
    canvasHeight = w_canvas.height;
    //document.addEventListener("click",mouseClick);
    document.addEventListener("keydown", keyDown);
    document.addEventListener("keyup", keyUp);

    utilities.drawPlayer(300, 300, p_ctx, false);

    for (let i = 0; i < 10; i++) {
        bgRects.push(new classes.bgRect(Math.random() * 640, Math.random() * 480, Math.random() * 10 + 30, Math.random() * 4 + 3, "rgba(0,0,0,0.3)"));
    }
    drawBG();

    w_ctx.fillStyle = "black";
    player.x = player.y = 300;

    setInterval(update, 1000 / 60);
    setInterval(drawBG, 1000 / 15);
}

function update(){
    updatePlayer();
    utilities.drawPlayer(player.x + camXOffset, player.y + camYOffset, p_ctx, flipPlayer);
    //utilities.drawDebugPlayer(player, p_ctx);
    drawLevel();
}

function updatePlayer() {
    let xDif = 0, yDif = 0;
    if (keysPressed[65]) xDif = -xSpeed;
    if (keysPressed[68]) xDif = xSpeed;

    yDif = ySpeed;
    // I should use variable for deep copy. Right now, it still references the variable value.
    // This is what led to it being affecting two times in a row before.
    //Gotta figure out deep and shallow copy stuff.
    player.newX = player.x + xDif;
    player.newY = player.y + yDif;

    let colls = CollisionsWithLevel(player); //returns a bool if not colliding, otherwise returns an array of collisions.
    if (colls.length==0){
        player.x +=xDif; player.y+=yDif;
        //console.log(`CamX: ${camXOffset}, Camy: ${camYOffset}`);
        //console.log(`PlayerX: ${player.x}, PlayerYa : ${player.y }`);
        camXOffset -= xDif;
        camYOffset -= yDif;
    }
    else {
        //Figure out which way they're colliding.
        //I followed this post: https://gamedev.stackexchange.com/questions/13774/how-do-i-detect-the-direction-of-2d-rectangular-object-collisions
        colls.forEach((r) => {
            if (collidedFromBottom(player, r) || collidedFromTop(player, r)) player.newY -=yDif;
            if (collidedFromLeft(player, r) || collidedFromRight(player, r)) player.newX -= xDif;
        });
        camXOffset += player.x - player.newX;
        camYOffset += player.y - player.newY;
        player.x = player.newX;
        player.y = player.newY;
    }

}

function drawLevel() {
    classes.rects.forEach((r) => {
        utilities.drawRectangle(r.x + camXOffset, r.y + camYOffset, r.width, r.height, p_ctx, r.color, true);
    })
}


function drawBG() {
    bg_ctx.clearRect(0, 0, 640, 480);
    if (should_change_bg_color) {
        bg_color_rgb = utilities.fadeBGColorToDarkBlue(bg_color_rgb);
        bg_color = "rgb(" + bg_color_rgb[0] + "," + bg_color_rgb[1] + "," + bg_color_rgb[2] + ")";
    }
    utilities.drawRectangle(0, 0, canvasWidth, canvasHeight, bg_ctx, bg_color, true);
    bg_dir_rad += bg_dir_rad_Inc;
    bgRects.forEach(function (rect) {
        //bg_dir_rad is 0 at the start and changes value when the green diamond is collected.
        //When that happens, the rectangles's speeds will change slightly every time they are drawn.
        rect.hSpeed = Math.cos(bg_dir_rad) * BG_DIR_MULTIPLIER;
        rect.vSpeed = Math.sin(bg_dir_rad) * BG_DIR_MULTIPLIER;

        rect.x += rect.hSpeed;
        rect.y += rect.vSpeed;

        //makes the rectangle wrap around the screen.
        if (rect.x > canvasWidth + 20) { rect.x = -20 }
        else if (rect.x < -20) { rect.x = canvasWidth + 20 }
        if (rect.y > canvasHeight + 20) { rect.y = -20 }
        else if (rect.y < -20) { rect.y = canvasHeight + 20 }

        utilities.drawRectangle(rect.x, rect.y, rect.width, rect.height, bg_ctx, rect.color, true)
    }
    )
}

function CollisionsWithLevel(p) {
    
    const coll_rects = [];
    classes.rects.forEach((r) => {
        if (p.newX < r.x + r.width && p.newX + p.width > r.x
            && p.newY < r.y + r.height && p.newY + p.height > r.y) { 
                coll_rects.push(r);
            }
    })
    return coll_rects;
}

function mouseClick(e) {
    let x, y, color, type;
    //gets where the mouse is clicked on the canvas. If it is clicked in a valid position, then it creates a walker at that spot.
    x = e.pageX - e.target.offsetLeft;
    y = e.pageY - e.target.offsetTop;

    //If the click is not in the canvas, then return.
    if (e.target.localName != "canvas") return;
    type = Math.floor(Math.random() * 2);

    let greenWalkerRNG = Math.random();
    //If the player has put down 20 walkers, they'll start putting down green diamonds.
    if (walker_counter >= 20) {
        color = "green";
        w_ctx.save();
        utilities.drawGreenDiamond(x, y, WIDTH, WIDTH, w_ctx, "green");
        w_ctx.rotate(45 * Math.PI / 180);
        g_spawn_audio.play();
        w_ctx.restore();
        return;
    }
    //If it is a square walker it should be a shade of blue.
    //If it is an arc walker, it should be a shade of red.
    if (type == 0) {
        color = utilities.getRandomColorWithinRange(20, 20, 100, 0.5, 2, 2, 155, 0.5);
        sq_walkers.push(new classes.Walker(x, y, WIDTH, color, 100));
        sq_audio.play();
    }
    else if (type == 1) {
        color = utilities.getRandomColorWithinRange(100, 20, 20, 0.5, 155, 2, 2, .5);
        arc_walkers.push(new classes.ArcWalker(x, y, WIDTH, color, 80));
        arc_audio.play();
    }
    walker_counter += 1;
}

//I followed this post for advice on the following code. https://gamedev.stackexchange.com/questions/13774/how-do-i-detect-the-direction-of-2d-rectangular-object-collisions
function collidedFromLeft(p, r)
{
    return (p.x + p.width) < r.x && // was not colliding
           (p.newX + p.width) >= r.x;
}

function collidedFromRight(p, r)
{
    return p.x >= (r.x + r.width) && // was not colliding
           p.newX < (r.x + r.width);
}

function collidedFromTop(p, r)
{
    return (p.y + p.height) < r.y && // was not colliding
           (p.newY + p.height) >= r.y;
}

function collidedFromBottom(p, r)
{
    return p.y >= (r.y + r.height) && // was not colliding
           p.newY < (r.y + r.height);
}

function keyDown(e) {
    switch (e.keyCode) {
        //'A' press
        case 65:
            keysPressed[e.keyCode] = true;
            break;

        //'D' press
        case 68:
            keysPressed[e.keyCode] = true;
            break;

        //Space is pressed.
        case 32:
            e.preventDefault();
            //Only flip the player if space was not pressed the previous frame.
            if (!keysPressed[e.keyCode]) {
                ySpeed = -ySpeed;
                flipPlayer = !flipPlayer;
            }
            keysPressed[e.keyCode] = true;
            break;
    }
}

function keyUp(e) {
    switch (e.keyCode) {
        case 65:
            keysPressed[e.keyCode] = false;
            break;

        case 68:
            keysPressed[e.keyCode] = false;
            break;

        case 32:
            keysPressed[e.keyCode] = false;
            break;
    }
}
export { init };