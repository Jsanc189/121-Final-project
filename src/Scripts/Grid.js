import { Weather, TileWeather } from "./Weather.js";

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

    for(let x = 0; x < height; x++){
      this.tiles[x] = [];
      for(let y = 0; y < width; y++){
        let tileWeather = new TileWeather(x, y, this.weather).generate();
        this.tiles[x].push(new Cell(
          x, y, tileWeather.sun, tileWeather.rain
        ));
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
}

class Cell {
  constructor(x, y, sun_lvl, rain_lvl, plant){
    this.x = x;
    this.y = y;
    this.sun_lvl = sun_lvl;
    this.rain_lvl = rain_lvl;
    this.plant = plant;
  }

  updateWeatherAtCell(sun_lvl, rain_lvl){
    this.sun_lvl = sun_lvl;
    this.rain_lvl = rain_lvl;
  }
}