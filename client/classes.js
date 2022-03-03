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



  {x: 1000, y: 36, width: 30, height: 1494, color: 'green'},
  {x: 0, y: 1500, width: 1030, height: 30, color: 'black'},
  {x: -700, y: 1500, width: 700, height: 30, color: 'yellow'},
  {x: 0, y: 0, width: 1030, height: 30, color: 'orange'},
];

const specialObjects = [
  {x: -540, y: 982, width: 16, height: 16, id: 'screwattack'},
  {x: -600, y: 1484, width: 16, height: 16, id: 'morphball'},
  {x: 296, y: -16, width: 16, height: 16, id: 'yellowswitch'},
];

export {bgRect, rects, specialObjects };
