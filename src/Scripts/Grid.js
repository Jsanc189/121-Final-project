import { Weather, TileWeather } from "./Weather.js";

class Cell {
  constructor(x, y, sun_lvl, rain_lvl, plant) {
    this.x = x;
    this.y = y;
    this.sun_lvl = sun_lvl;
    this.rain_lvl = rain_lvl;
    this.plant = plant;
    this.rect = new Phaser.Geom.Rectangle(x * 40, y * 40, 40, 40);
  }

  updateWeatherAtCell(sun_lvl, rain_lvl) {
    this.sun_lvl = sun_lvl;
    this.rain_lvl += Math.floor(rain_lvl / 2);
    this.rain_lvl -= Math.floor(sun_lvl);
    if (this.rain_lvl < 0) this.rain_lvl = 0;
  }
}

export class Grid {
  width; //not pixels. Number of tiles
  height;
  tiles;
  scene; //For drawing lines on

  constructor(width, height, scene){
    this.width = width;
    this.height = height;
    this.tiles = [];
    
    this.seed = Math.random();
    this.weather = new Weather({ seed: this.seed });

    for(let x = 0; x < height; x ++){
      this.tiles[x] = [];
      for(let y = 0; y < width; y ++){
        const tileWeather = new TileWeather(x, y, this.weather).generate();
        const newTile = new Cell(x, y, tileWeather.sun, tileWeather.rain);
        this.tiles[x].push(newTile);

        // scene.graphics.setInteractive({ useHandCursor: true, 
        //     hitArea: newTile.rect,
        //     hitAreaCallback: Phaser.Geom.Rectangle.Contains,
        // })
      }
    }
    console.log(this.tiles)
    this.scene = scene;
  }

  updateWeather(seed = Math.random()){
    let width = this.width;
    let height = this.height;
    this.weather = new Weather({ seed: seed });

    for(let x = 0; x < height; x++){
      for(let y = 0; y < width; y++){
        let tileWeather = new TileWeather(x, y, this.weather).generate();
        this.tiles[x][y].updateWeatherAtCell(tileWeather.sun, tileWeather.rain);
      }
    }
  }

  printAttribute(attribute){
    let width = this.width;
    let height = this.height;

    let result = "";
    for(let x = 0; x < height; x++){
      for(let y = 0; y < width; y++){
        let tile = this.tiles[x][y];
          if(!tile[attribute]){
              result += `   `;
          } else {
              result += `${tile[attribute]}`.padStart(2, " ");
              result += ` `;
          }
        }
        result += `\n`;
    }
    return result;
  }

  getCellAt(x, y, tile_size){
    return this.tiles[Math.floor(y / tile_size)][Math.floor(x / tile_size)];
  }

  isAdjacentCell(cell1, cell2){
    console.log(cell1.x - cell2.x);
    console.log(cell1.y - cell2.y)
    if(Math.abs(cell1.x - cell2.x) == 1 || Math.abs(cell1.y - cell2.y) == 1){
      return true;
    }
    return false;
  }
}

class Cell {
  constructor(x, y, sun_lvl, rain_lvl, plant){
    this.x = x;
    this.y = y;
    this.sun_lvl = sun_lvl;
    this.rain_lvl = rain_lvl;
    this.plant = plant;
    // this.rect = new Phaser.Geom.Rectangle(x * 40, y * 40, 40, 40);
  }

  updateWeatherAtCell(sun_lvl, rain_lvl){
    this.sun_lvl = sun_lvl;

    this.rain_lvl += Math.floor(rain_lvl/2);
    this.rain_lvl -= Math.floor(sun_lvl); 
    if(this.rain_lvl < 0) this.rain_lvl = 0;
  }
}