class Walker {
  constructor(x, y, width, color, life) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.color = color;
    this.life = life;
  }
}

// The arc walker is curved and warrants some additional properties.
class ArcWalker extends Walker {
  constructor(x, y, width, color, life) {
    super(x, y, width, color, life);

    // These properties are used to make the curved walkers curve smoothly.
    this.angle = 0;
    this.angleIncrement = Math.random() / 2 - 0.25;
    this.startX = x;
    this.startY = y;
    this.radius = 0;
  }
}

class bgRect {
  constructor(x, y, width, height, color) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.hSpeed = (height * width) / 15;
    this.vSpeed = 0;
  }
}

const rects = [
  {x: 280, y: 315, width: 31, height: 30, color: 'red'},
  {x: 0, y: 0, width: 30, height: 800, color: 'blue'},
  {x: 0, y: 950, width: 30, height: 502, color: 'blue'},
  
  //Screw Attack room
  {x: -200, y: 801, width: 30, height: 30, color: 'red'},
  {x: -200, y: 700, width: 200, height: 50, color: 'blue'},
  {x: -200, y: 998, width: 200, height: 50, color: 'blue'},
  {x: -650, y: 700, width: 200, height: 50, color: 'blue'},
  {x: -650, y: 998, width: 200, height: 50, color: 'blue'},
  {x: -650, y: 750, width: 50, height: 250, color: 'blue'},



  {x: 1000, y: 0, width: 30, height: 1500, color: 'green'},
  {x: 0, y: 1500, width: 1030, height: 30, color: 'black'},
  {x: 0, y: 0, width: 999, height: 30, color: 'lavender'},
];

const specialObjects = [
  {x: -540, y: 982, width: 16, height: 16, id: 'screwattack'},
  {x: 300, y: 982, width: 16, height: 16, id: 'morphball'},
];

export { Walker, ArcWalker, bgRect, rects, specialObjects };
