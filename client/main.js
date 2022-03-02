import * as utilities from "./utilities.js";
import * as classes from "./classes.js"

//Idea for favicon: Just the clouds with clear background. No player.
/*
Todo list: Figure out movement transferring.
Make items work- show the image below. Also, send a request to the server updating the player's items so next they log in their items are kept.
This also means they should be hidden on next playthrough... but that's not really important. Make the img element visible when collected.

Make sure stuff fits to rubric. Cloud ending, button that changes the color of blocks in the world. That'll be a big function for the server.
*/
let w_ctx, p_ctx, bg_ctx;
const sq_walkers = [], arc_walkers = [];
const bgRects = [];
const movementThisSecond = []; let updateMovement = true;

const imgs = {
    'screwattack': document.getElementById('screwattack'),
    'morphball': document.getElementById('morphball'),
};

const items = {
    'screwattack': { obtained: false, collected: collectScrewAttack },
    "morphball": { obtained: false, collected: collectMorphBall },
};

const player = { x: 300, y: 300, halfWidth: 4, halfHeight: 7, newX: 300, newY: 300 };

let xSpeed = 2, ySpeed = 3;
let flipPlayer = false; let canFlip = true;
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
const init = () => {
    //running init
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
    //let resetBtn = document.querySelector("#btn_reset");
    //resetBtn.onclick = function () { location.reload() };
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
    setInterval(sendMovementRequest, 1000);
    //setInterval(drawOtherPlayerMovement, 1000/30);
}

const update = () => {
    updatePlayer();
    utilities.drawPlayer(player.x + camXOffset, player.y + camYOffset, p_ctx, flipPlayer);
    utilities.drawDebugPlayer(player, p_ctx, camXOffset, camYOffset);
    drawLevel();
}

const updatePlayer = () => {
    let xDif = 0, yDif = 0;
    if (keysPressed[65]) xDif = -xSpeed;
    if (keysPressed[68]) xDif = xSpeed;

    if (flipPlayer) yDif = -ySpeed;
    else yDif = ySpeed;

    player.newX = player.x + xDif;
    player.newY = player.y + yDif;

    let colls = CollisionsWithLevel(player); //returns a bool if not colliding, otherwise returns an array of collisions.
    if (colls.length == 0) {
        player.x += xDif; player.y += yDif;
        //console.log(`CamX: ${camXOffset}, Camy: ${camYOffset}`);
        //console.log(`PlayerX: ${player.x}, PlayerYa : ${player.y }`);
        camXOffset -= xDif;
        camYOffset -= yDif;
    }
    else {
        //Figure out which way the collisions occurred, so the player can be moved in the correct direction.
        //I followed this post: https://gamedev.stackexchange.com/questions/13774/how-do-i-detect-the-direction-of-2d-rectangular-object-collisions
        colls.forEach((r) => {
            if (collidedFromBottom(player, r) || collidedFromTop(player, r)) { player.newY -= yDif; canFlip = true; }
            if (collidedFromLeft(player, r) || collidedFromRight(player, r)) { player.newX -= xDif; }
        });
        camXOffset += player.x - player.newX;
        camYOffset += player.y - player.newY;
        player.x = player.newX;
        player.y = player.newY;
    }
    CollisionsWithSpecialObjects(player);
}

const drawLevel = () => {
    classes.rects.forEach((r) => {
        utilities.drawRectangle(r.x + camXOffset, r.y + camYOffset, r.width, r.height, p_ctx, r.color, true);
    });
    classes.specialObjects.forEach((o) => {
        p_ctx.drawImage(imgs[o.id], o.x + camXOffset, o.y + camYOffset);
    });
};


const drawBG = () => {
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
};

const sendMovementRequest = () => {

};

const CollisionsWithLevel = (p) => {
    const coll_rects = [];
    classes.rects.forEach((r) => {
        if (p.newX - p.halfWidth < r.x + r.width && p.newX + (p.halfWidth) > r.x
            && p.newY - p.halfHeight < r.y + r.height && p.newY + p.halfHeight > r.y) {
            coll_rects.push(r);
        }
    })
    return coll_rects;
};

const CollisionsWithSpecialObjects = (p) => {
    classes.specialObjects.forEach((o) => {
        if (p.newX - p.halfWidth < o.x + o.width && p.newX + (p.halfWidth) > o.x
            && p.newY - p.halfHeight < o.y + o.height && p.newY + p.halfHeight > o.y) {
            //should give player this item... maybe it has an index, or a callback function
            items[o.id].collected();
            classes.specialObjects.splice(classes.specialObjects.indexOf(o), 1);
        }
    })
};

const mouseClick = (e) => {
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
};

//I followed/copied much of the following collision code from https://gamedev.stackexchange.com/questions/13774/how-do-i-detect-the-direction-of-2d-rectangular-object-collisions
// These functions test which direction two objects (usually the player and a rectangle) collided.
// It compares the player's old coordinates and new ones with the rectangles, to figure out which coordinate change triggered the collision.
const collidedFromRight = (p, r) => {
    return (p.x + p.halfWidth) <= r.x && // If the new coordinates were not overlapping...
        (p.newX + p.halfWidth) >= r.x; // and the new ones are.
};

const collidedFromLeft = (p, r) => {
    return (p.x - p.halfWidth) >= (r.x + r.width) &&
        (p.newX - p.halfWidth) < (r.x + r.width);
};

const collidedFromBottom = (p, r) => {
    return (p.y + p.halfHeight) < r.y &&
        (p.newY + p.halfHeight) >= r.y;
};

const collidedFromTop = (p, r) => {
    return (p.y - p.halfHeight) >= (r.y + r.height) && // was not colliding
        (p.newY - p.halfHeight) < (r.y + r.height);
};

//I made these functions so they can be accessed in the items object declaration (as they are referenced before defined).
function collectMorphBall() {
    document.getElementById('morphball').style.display = 'inline';
}

function collectScrewAttack() {
    document.getElementById('screwattack').style.display = 'inline';
}

const keyDown = (e) => {
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
            //Only flip the player if space was not pressed the previous frame, and the player can flip based on landing on grounds/items.
            if (!keysPressed[e.keyCode] && canFlip) {
                flipPlayer = !flipPlayer;
                canFlip = false;
            }
            keysPressed[e.keyCode] = true;
            break;
    }
};

const keyUp = (e) => {
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
};

export { init };