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

  getCellAt(x, y){
    return this.tiles[Math.floor(y / 40)][Math.floor(x / 40)];
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

    this.rain_lvl += Math.floor(rain_lvl/2);
    this.rain_lvl -= Math.floor(sun_lvl); 
    if(this.rain_lvl < 0) this.rain_lvl = 0;
  }
}