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
    //this.rain_lvl -= Math.floor(sun_lvl);
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
    if (!(x >= 800 || y >= 800)) {
      return this.tiles[Math.floor(y / tile_size)][Math.floor(x / tile_size)];
    } else {
      return;
    }
  }

  isAdjacentCell(cell1, cell2){
    console.log(cell1.x - cell2.x);
    console.log(cell1.y - cell2.y);
    if(Math.abs(cell1.x - cell2.x) == 1 && (0 <= Math.abs(cell1.y - cell2.y) && Math.abs(cell1.y - cell2.y)  <= 1)){
      return true;
    } else if(Math.abs(cell1.y - cell2.y) == 1 && (0 <= Math.abs(cell1.x - cell2.x) && Math.abs(cell1.x - cell2.x) <= 1)){
      return true;
    }
    return false;
  }

  //utilized ChatGPT to generate this function
  toByteArray() {
    const bytes = 4;
    const numCells = this.width * this.height;
    const bytesPerCell = (4 * bytes) + (3 * bytes); // 4 floats (sun_lvl, rain_lvl, x, y) + 4 bytes for plant + 8 bytes plant data(type, growth, waterDiffusion, cell, x,y)
    const buffer = new ArrayBuffer(numCells * bytesPerCell);
    const view = new DataView(buffer);

    // Iterate over each cell in the grid and write position, sun_lvl, and rain_lvl, and plant data to the buffer    let offset = 0;
    for (let x = 0; x < this.height; x++) {
      for (let y = 0; y < this.width; y++) {
        const cell = this.tiles[x][y]
        view.setFloat32(offset, cell.x, true);
        offset += bytes;
        view.getFloat32(offset, cell.y, true);
        offset += bytes;
        view.setFloat32(offset, cell.sun_lvl, true);
        offset += bytes;
        view.setFloat32(offset, cell.rain_lvl, true)
        offset += bytes;
        
        if(cell.plant) {
          view.setUint8(offset, cell.plant.type);
           offset += 1;
          view.setUint8(offset, cell.plant.growth_lvl);
           offset += 1;
          view.setUint8(offset, cell.plant.waterDiffusionRate);
          offset += 1;
          view.setUint16(offset, x, true);
          offset += 2
          view.setUint16(offset, y, true)
          offset += 2
        } else {
          view.setUint8(offset, 0);
          offset += 1
          view.setUint8(offset, 0);
          offset += 1
          view.setUint8(offset, 0, true);
          offset += 2
          view.setUint16(offset, 0, true);
          offset += 2
          view.setUint16(offset, 0, true)
          offset += 2
        }      
      }
    }
    return new Uint8Array(buffer)
   }

  //utilized ChatGPT to generate this function
  fromByteArray(byteArray, width, height) {
    const buffer = byteArray.buffer;
    const view = new DataView(buffer);
    const bytes = 4;
    const grid = new Grid(width, height, null);
    let offset = 0;

    // Iterate over each cell in the grid and read position, sun_lvl, and rain_lvl, and plant data from the buffer
    for (let x = 0; x < height; x++) {
      grid.tiles[x] = [];
      for (let y = 0; y < width; y++) {
        const xCoord = view.getFloat32(offset, true);
        offset += bytes;
        const cellY = view.getFloat32(offset, true);
        offset += bytes;
        const sunLvl = view.getFloat32(offset, true);
        offset += bytes;
        const rainLvl = view.getFloat32(offset, true);
        offset += bytes;

        const plantType = view.getUint8(offset);
        offset += 1;
        const growth_Lvl = view.getUint8(offset);
        offset += 1;
        const waterDiffusionRate = view.getUint8(offset);
        offset += 1;
        const plantX = view.getUint16(offset, true);
        offset += 2;
        const plantY = view.getUint16(offset, true);
        offset += 2;

        const tile = new Cell(xCoord, cellY, sunLvl, rainLvl, null);
        if(plantType > 0) {
          const plant = new Plant(null, plantType, {x: plantCellX, y: plantCellY});
          plant.growth_lvl = growth_Lvl
          plant.waterDiffusionRate = waterDiffusionRate
          tile.plant = plant

        }
        grid.tiles[x].push(tile);
      }
    }
    return grid
  }
}