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
  {x: 280, y: 800, width: 31, height: 30, color: 'red'},
  {x: 0, y: 0, width: 30, height: 1000, color: 'blue'},
];

export { Walker, ArcWalker, bgRect, rects };
