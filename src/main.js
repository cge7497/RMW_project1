import * as utilities from "./utilities.js";
import * as classes from "./classes.js"

let w_ctx, p_ctx, bg_ctx;
let sq_walkers = [], arc_walkers = [];
let bgRects = [];
let px, py;
let xSpeed = 2, ySpeed = 4;
let flipPlayer = false;
let keysPressed = [];
let canvasWidth, canvasHeight;
let canvasData;
let sq_audio, arc_audio, g_spawn_audio, g_get_audio;
let walker_counter = 0;
let bg_dir_rad = 0, bg_dir_rad_Inc = 0;
let bg_color = "white", bg_color_rgb = [255, 255, 255], should_change_bg_color = false;
const WIDTH = 5;
const BG_DIR_MULTIPLIER = 20;
let camXOffset = 0, camYOffset = 0;

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

    w_ctx.fillStyle = "blue";
    utilities.drawRectangle(280, 304, 30, 30, p_ctx, "blue");
    w_ctx.fillStyle = "black";
    px = py = 300;

    setInterval(drawPlayer, 1000 / 60);
    setInterval(drawArcWalkers, 1000 / 30);
    setInterval(drawSquareWalkers, 1000 / 5);
    setInterval(drawBG, 1000 / 15);
}
function drawPlayer() {
    //console.log(`${camXOffset} y: ${camYOffset}`);

    var newX = px, newY = py;
    if (keysPressed[65]) newX -= xSpeed;
    if (keysPressed[68]) newX += xSpeed;

    newY += ySpeed;

    let collisions = isColliding(newX, newY);
    //console.log(collisions);
    //If there are any collisions at all
    //Think about what to actually write here.
    if (collisions) {
        if (!collisions[0] && !collisions[1])
            break;
        if (!collisions[2] && !collisions[3])
            break;
        px = newX; camXOffset += px - newX;
        py = newY; camYOffset += py - newY;
    }

    utilities.drawPlayer(px, py, p_ctx, flipPlayer);
    utilities.drawRectangle(280 + camXOffset, 304 + camYOffset, 30, 30, p_ctx, "blue");
    utilities.drawRectangle(280 + camXOffset, 800 + camYOffset, 30, 30, p_ctx, "red");
    utilities.drawRectangle(0 + camXOffset, 0 + camYOffset, 30, 1000, p_ctx, "blue");
}

function drawArcWalkers() {
    arc_walkers.forEach(function (walker) {
        if (walker.life <= 0) arc_walkers.splice(arc_walkers.indexOf(walker));
        utilities.drawNewWalkerArc(walker, w_ctx);
    }
    )
}

function drawSquareWalkers() {
    sq_walkers.forEach(function (walker) {
        if (walker.life <= 0) sq_walkers.splice(sq_walkers.indexOf(walker));
        utilities.drawNewWalkerSquare(walker, w_ctx);
    }
    )
}


function drawBG() {
    bg_ctx.clearRect(0, 0, 640, 480);
    if (should_change_bg_color) {
        bg_color_rgb = utilities.fadeBGColorToDarkBlue(bg_color_rgb);
        bg_color = "rgb(" + bg_color_rgb[0] + "," + bg_color_rgb[1] + "," + bg_color_rgb[2] + ")";
    }
    utilities.drawRectangle(0, 0, canvasWidth, canvasHeight, bg_ctx, bg_color);
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

        utilities.drawRectangle(rect.x, rect.y, rect.width, rect.height, bg_ctx, rect.color)
    }
    )
}

function isColliding(newX, newY) {
    //left, right, top down.
    const xCollOffsets = [-5, 0, -8, -8];
    const yCollOffsets = [-14, -14, -15, -1];
    let canvasData; let collisions = [];

    for (let i = 0; i < 4; i++) {
        //checking collision on the top.
        canvasData = p_ctx.getImageData(newX + xCollOffsets[i], newY + yCollOffsets[i], 7, 1);
        if (canvasData) {
            p_ctx.fillStyle = "black";
            let pixels = canvasData.data;
            if (checkDataForCollision(pixels)) collisions[i] = true;
        }
    }

    return collisions;
}

function checkDataForCollision(pixels) {
    for (var i = 0, l = pixels.length; i < l; i += 4) {
        //if the pixel on this canvas has a B value greater than 0.
        if (pixels[i + 2] > 0) { return true; }
        if (pixels[i + 1] > 100) { greenCollect(); return true; }
    }
    return false;
}

//Called when the green diamond is collected.
function greenCollect() {
    //This value affects bg_dir_rad in drawWalkers.
    //It not being 0 will make the clouds' horizontal and vertical speed change.
    bg_dir_rad_Inc = 0.01;
    g_get_audio.play();

    //Once the green diamond is collected, start changing the background color.
    should_change_bg_color = true;

    //remove the walkers so they are no longer updated.
    sq_walkers = [];
    arc_walkers = [];

    //clear the walkers that have already been drawn.
    w_ctx.clearRect(0, 0, canvasWidth, canvasHeight);
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
    //console.log(color);
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