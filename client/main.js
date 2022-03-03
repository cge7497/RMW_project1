import * as utilities from "./utilities.js";
import * as classes from "./classes.js"

/*
Todo list: Figure out movement transferring.
Delete unused code from it.
Also need function with GET parameters.

Make sure stuff fits to rubric. Cloud ending, button that changes the color of blocks in the world. That'll be a big function for the server.
*/
let w_ctx, p_ctx, bg_ctx;
const sq_walkers = [], arc_walkers = [];
const bgRects = [];
const movementThisSecond = {}; let otherPlayerMovement = {};
let updateMovement = true, otherPlayerMovementFrame = 0, playerMovementFrame = 0;

const imgs = {
    'screwattack': document.getElementById('screwattack'),
    'morphball': document.getElementById('morphball'),
    'yellowswitch': document.getElementById('yellowswitch'),
};

const items = {
    'screwattack': { obtained: false, collected: collectScrewAttack },
    'morphball': { obtained: false, collected: collectMorphBall },
    'yellowswitch': { collected: endGame }
};

const player = { x: 300, y: 300, halfWidth: 4, halfHeight: 7, newX: 300, newY: 300, scale: 1, name: '' };
let pColor = 0, bgRectColor = 0;

let xSpeed = 2, ySpeed = 3;
let flipPlayer = false; let canFlip = true; let infiniteFlip = false, inEndGame = false;
let canCrawl = false; const crawlTimerMax = 30; let hasMorphBall = false; let crawlInputTimer = 0;
let keysPressed = [];
let canvasWidth, canvasHeight;
let btn_audio, item_audio;
let walker_counter = 0;
let bg_dir_rad = 0, bg_dir_rad_Inc = 0;
let bg_color = "white", bg_color_rgb = [255, 255, 255], should_change_bg_color = false;
const WIDTH = 5;
const BG_DIR_MULTIPLIER = 1;
let camXOffset = 0, camYOffset = 0

//I created the sounds with SFXR (http://sfxr.me/)
const init = (obj, name) => {
    if (obj && obj.player) {
        player.name = obj.player.name;
        pColor = obj.player.color;
        console.log(pColor);
        if (obj.player.items) initItems(obj.player.items);
    }
    else {
        player.name = name;
    }

    movementThisSecond.name = player.name;
    movementThisSecond.color = pColor;
    movementThisSecond.movement = [];

    btn_audio = new Audio("buttonClick.wav");
    btn_audio.volume = 0.25;
    item_audio = new Audio("itemGet.wav");
    item_audio.volume = 0.25;

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
    setInterval(drawOtherPlayerMovement, 1000 / 30);
}

const update = () => {
    if (!inEndGame) {
        updatePlayer();
        utilities.drawPlayer(player.x + camXOffset, player.y + camYOffset, p_ctx, flipPlayer, player.scale);
        utilities.drawDebugPlayer(player, p_ctx, camXOffset, camYOffset);
    }
    else endGame();
    drawLevel();
}

const updatePlayer = () => {
    let xDif = 0, yDif = 0;
    if (keysPressed[65]) xDif = -xSpeed;
    if (keysPressed[68]) xDif = xSpeed;
    //else if (crawlInc<crawlIncMax) 

    if (flipPlayer) yDif = -ySpeed;
    else yDif = ySpeed;

    //If the player hasn't crawled recently (so we don;t get a duplicate input)
    if (canCrawl) {
        if (keysPressed[87]) {
            camYOffset -= utilities.handlePlayerCrawl(player, flipPlayer); //make sure the camera stays centered on player despite edits to their y coordinates caused by crawling.
            canCrawl = false;
            crawlInputTimer = crawlTimerMax;
            xDif = 0; yDif = 0;//making the player not move horizontally when changing to/from ball prevents some collision errors.
        }
    }
    else if (hasMorphBall) {
        crawlInputTimer -= 1;
        if (crawlInputTimer <= 0) canCrawl = true;
    }

    player.newX = player.x + xDif;
    player.newY = player.y + yDif;

    let colliding = CollisionsWithLevel(player, xDif, yDif); //returns a bool if not colliding, otherwise returns an array of collisions.
    if (!colliding) {
        player.x += xDif; player.y += yDif;
        camXOffset -= xDif;
        camYOffset -= yDif;
    }
    else {
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

const sendMovementRequest = async () => {
    if (movementThisSecond && !inEndGame) {
        otherPlayerMovement = await utilities.sendMovement(movementThisSecond);
        movementThisSecond.movement=[];
        otherPlayerMovementFrame = 0;
        playerMovementFrame = 0;
    }
};

const drawOtherPlayerMovement = () => {
    if (inEndGame) return;

    //store this player's coordinate
    movementThisSecond.movement.push({ x: player.x, y: player.y, flipped: flipPlayer });

    playerMovementFrame += 1;
    let keys;
    if (otherPlayerMovement.movement) {
        // I got this Object.keys() function from https://stackoverflow.com/questions/37673454/javascript-iterate-key-value-from-json
        // It gets the property names (meaning the player names) of the movementJSONObject.
        keys = Object.keys(otherPlayerMovement.movement);
    }
    else return;
    keys.splice(keys.indexOf(player.name), 1);
    if (keys.length < 1) return;

    w_ctx.clearRect(0, 0, 640, 480);
    keys.forEach((m) => {
        const f = otherPlayerMovement.movement[m].movement[otherPlayerMovementFrame];
        if (f) utilities.drawPlayer(f.x + camXOffset, f.y + camYOffset, w_ctx, f.flipped, 1, `${otherPlayerMovement.movement[m].color}55`, false);
    });
    otherPlayerMovementFrame += 1;
};

//Returns true if there are collisions. It also fixes these collisions.
const CollisionsWithLevel = (p, xDif, yDif) => {
    let colliding = false;
    classes.rects.forEach((r) => {
        if (p.newX - p.halfWidth < r.x + r.width && p.newX + (p.halfWidth) > r.x
            && p.newY - p.halfHeight < r.y + r.height && p.newY + p.halfHeight > r.y) {
            colliding = true;
            if (utilities.collidedFromBottom(p, r) || utilities.collidedFromTop(p, r)) {
                p.newY -= yDif;
                if (!infiniteFlip) canFlip = true; //If the player doesn't have the screw attack/infinite flip, then continue updating canFlip
            }
            else if (utilities.collidedFromLeft(p, r) || utilities.collidedFromRight(p, r)) {
                p.newX -= xDif;
            }
        }
    });
    return colliding;
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

function initItems(items) {
    if (items['morphball']) {
        collectMorphBall(false);
    }
    if (items['screwattack']) {
        collectScrewAttack(false);
    }
}

//I made these functions so they can be accessed in the items object declaration (as they are referenced before defined).
function collectMorphBall(shouldSendPost = true) {
    document.getElementById('morphball').style.display = 'inline';
    document.getElementById('moveInstructions').innerHTML = `Use '<strong>A</strong>', '<strong>D</strong>', and '<strong>W</strong>' to move, `;
    canCrawl = true; hasMorphBall = true;
    if (shouldSendPost === true) {
        utilities.updatePlayer(player.name, 'morphball');
        item_audio.play();
    }
}

function collectScrewAttack(shouldSendPost = true) {
    document.getElementById('screwattack').style.display = 'inline';
    document.getElementById('spaceInstructions').innerHTML = `<strong>SPACE</strong> to ultra flip`
    infiniteFlip = true;
    if (shouldSendPost === true) {
        utilities.updatePlayer(player.name, 'screwattack');
        item_audio.play();
    }
}

function endGame() {
    if (!inEndGame) {
        bgRects.push(new classes.bgRect(Math.random() * 640, Math.random() * 480, Math.random() * 10 + 30, Math.random() * 4 + 3, pColor));
        btn_audio.play();
    }
    if (bgRectColor < 255) bgRectColor += 0.2;
    bgRects.forEach((r) => {
        if (bgRects.indexOf(r) != bgRects.length - 1) {
            r.color = `rgba(${bgRectColor}, ${bgRectColor}, ${bgRectColor}, 0.1)`;
        }
        else {
            //toString(16) converts the number to hexadecimal. I got it from https://www.w3docs.com/snippets/javascript/how-to-convert-decimal-to-hexadecimal-in-javascript.html
            r.color = `${pColor}${bgRectColor.toString(16).substring(0, 2)}`;
        }
    });
    classes.rects.forEach((r) => {
        r.color = `rgba(${bgRectColor}, ${bgRectColor}, ${bgRectColor}, 0.5)`;
    });
    inEndGame = true;
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

        //'W' press, which should only do something after the player collects the morph ball
        case 87:
            if (canCrawl) {
                keysPressed[e.keyCode] = true;
            }
            break;

        //Space is pressed.
        case 32:
            e.preventDefault();
            //Only flip the player if space was not pressed the previous frame, and the player can flip based on landing on grounds/items.
            if (!keysPressed[e.keyCode]) {
                if (canFlip || infiniteFlip) {
                    flipPlayer = !flipPlayer;
                    canFlip = false;
                }
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

        case 87:
            keysPressed[e.keyCode] = false;
            break;

        case 32:
            keysPressed[e.keyCode] = false;
            break;
    }
};

export { init };