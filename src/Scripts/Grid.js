export class Grid {
  width; //not pixels. Number of tiles
  height;
  tiles;
  scene; //For drawing lines on

  constructor(width, height, scene){
    this.width = width;
    this.height = height;
    this.tiles = [];
    for(let x = 0; x < width; x++){
      for(let y = 0; y < height; y++){
        this.tiles.push({
          x: x,
          y: y
        })
      }
    }
    this.scene = scene;
  }

  makeGridLines(){
    let grid_lines = []
    //Draw vertical lines
    for(let x = 40; x < this.scene.width; x += 40){
      let line = new Phaser.Geom.Line(x, 0, x, this.scene.height);
      grid_lines.push(line);
    }
    for(let y = 40; y < this.scene.height; y += 40){
      let line = new Phaser.Geom.Line(0, y, this.scene.height, y);
      grid_lines.push(line);
    }
    this.scene.grid_lines = grid_lines;
  }
}