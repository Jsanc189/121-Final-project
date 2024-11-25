import { Weather, TileWeather } from "./Weather.js";

class Cell {
  constructor(x, y, sun_lvl, rain_lvl, plant) {
    this.x = x;
    this.y = y;
    this.sun_lvl = sun_lvl;
    this.rain_lvl = rain_lvl;
    this.plant = plant;
  }

  updateWeatherAtCell(sun_lvl, rain_lvl) {
    this.sun_lvl = sun_lvl;
    this.rain_lvl += Math.floor(rain_lvl / 2);
    //this.rain_lvl -= Math.floor(sun_lvl);
    if (this.rain_lvl < 0) this.rain_lvl = 0;
  }
}

export class Grid {
  constructor(width, height, scene){
    this.width = width;
    this.height = height;

    this.bytes = 4;
    const numCells = width * height;
    this.bytesPerCell = (4 * this.bytes) + this.bytes + (2 * this.bytes); // 4 floats (sun_lvl, rain_lvl, x, y) + 4 bytes for plant + 8 bytes plant data(type, growth, waterDiffusion, cell, x,y)
    this.tiles = new ArrayBuffer(numCells * this.bytesPerCell);
    this.view = new DataView(this.tiles);
    
    this.seed = Math.random();
    this.weather = new Weather({ seed: this.seed });

    for(let x = 0; x < height; x++){ 
      for(let y = 0; y < width; y++){
        const tileWeather = new TileWeather(x, y, this.weather).generate();
        let offset = (x * this.bytesPerCell * height) + (y * this.bytesPerCell)

        this.view.setFloat32(offset, x, true);
        offset += this.bytes;
        this.view.getFloat32(offset, y, true);
        offset += this.bytes;
        this.view.setFloat32(offset, tileWeather.sun, true);
        offset += this.bytes;
        this.view.setFloat32(offset, tileWeather.rain, true)
        offset += this.bytes;
      }
    }
    console.log(this.tiles)
    this.scene = scene;
  }

  getCellOffset(x, y) {
    return (x * this.bytesPerCell * this.height) + (y * this.bytesPerCell)
  }

  updateWeatherAtCell(x, y, sun_lvl, rain_lvl) {
    //set new sun level
    let cellOffset = getCellOffset(x, y) + (2 * this.bytesPerCell);
    this.view.setFloat32(cellOffset, sun_lvl);

    //set new rain level
    cellOffset += this.bytes;
    rain_lvl = this.view.getFloat32(cellOffset)
    const newRainLvl = Math.floor(rain_lvl / 2);
    if (newRainLvl < 0) newRainLvl = 0;
    this.view.setFloat32(cellOffset, newRainLvl);
  }

  updateWeather(seed = Math.random()){
    let width = this.width;
    let height = this.height;
    this.weather = new Weather({ seed: seed });

    for(let x = 0; x < height; x++){
      for(let y = 0; y < width; y++){
        let tileWeather = new TileWeather(x, y, this.weather).generate();
        this.updateWeatherAtCell(x, y, tileWeather.sun, tileWeather.rain);
      }
    }
  }

  // This probably doesn't work right now, but I don't think we're using it for anything important, so I took it out. 
  // Feel free to re-implement -liza
  // printAttribute(attribute){
  //   let width = this.width;
  //   let height = this.height;

  //   let result = "";
  //   for(let x = 0; x < height; x++){
  //     for(let y = 0; y < width; y++){
  //       let tile = this.tiles[x][y];
  //         if(!tile[attribute]){
  //             result += `   `;
  //         } else {
  //             result += `${tile[attribute]}`.padStart(2, " ");
  //             result += ` `;
  //         }
  //       }
  //       result += `\n`;
  //   }
  //   return result;
  // }

  getCellAt(phaserX, phaserY, tile_size){
    if (!(phaserX >= 800 || phaserY >= 800)) {
      const bufferX = Math.floor(phaserX / tile_size);
      const bufferY = Math.floor(phaserY / tile_size);
      return getCellOffset(bufferX, bufferY);
    } 
    return false;
  }

  getSunAtCell(cellOffset){
    return this.view.getFloat32(cellOffset + (2 * this.bytes));
  }

  getRainAtCell(cellOffset){
    return this.view.getFloat32(cellOffset + (3 * this.bytes));
  }

  getPlantData(cellOffset){
    //TO-DO
  }

  isAdjacentCell(cell1Offset, cell2Offset){
    const cell1X = this.view.getFloat32(cell1Offset);
    const cell1Y = this.view.getFloat32(cell1Offset + this.bytes);
    const cell2X = this.view.getFloat32(cell2Offset);
    const cell2Y = this.view.getFloat32(cell2Offset + this.bytes);

    if(Math.abs(cell1X - cell2X) == 1 && (0 <= Math.abs(cell1Y - cell2Y) && Math.abs(cell1Y - cell2Y)  <= 1)){
      return true;
    } 
    else if(Math.abs(cell1Y - cell2Y) == 1 && (0 <= Math.abs(cell1Y - cell2Y) && Math.abs(cell1X - cell2X) <= 1)){
      return true;
    }
    return false;
  }

  //utilized ChatGPT to generate this function
  // toByteArray() {
  //   const bytes = 4;
  //   const numCells = this.width * this.height;
  //   const bytesPerCell = (4 * bytes) + (3 * bytes); // 4 floats (sun_lvl, rain_lvl, x, y) + 4 bytes for plant + 8 bytes plant data(type, growth, waterDiffusion, cell, x,y)
  //   const buffer = new ArrayBuffer(numCells * bytesPerCell);
  //   const view = new DataView(buffer);

  //   // Iterate over each cell in the grid and write position, sun_lvl, and rain_lvl, and plant data to the buffer    let offset = 0;
  //   for (let x = 0; x < this.height; x++) {
  //     for (let y = 0; y < this.width; y++) {
  //       const cell = this.tiles[x][y]
  //       view.setFloat32(offset, cell.x, true);
  //       offset += bytes;
  //       view.getFloat32(offset, cell.y, true);
  //       offset += bytes;
  //       view.setFloat32(offset, cell.sun_lvl, true);
  //       offset += bytes;
  //       view.setFloat32(offset, cell.rain_lvl, true)
  //       offset += bytes;
        
  //       if(cell.plant) {
  //         view.setUint8(offset, cell.plant.type);
  //          offset += 1;
  //         view.setUint8(offset, cell.plant.growth_lvl);
  //          offset += 1;
  //         view.setUint8(offset, cell.plant.waterDiffusionRate);
  //         offset += 1;
  //         view.setUint16(offset, x, true);
  //         offset += 2
  //         view.setUint16(offset, y, true)
  //         offset += 2
  //       } else {
  //         view.setUint8(offset, 0);
  //         offset += 1
  //         view.setUint8(offset, 0);
  //         offset += 1
  //         view.setUint8(offset, 0, true);
  //         offset += 2
  //         view.setUint16(offset, 0, true);
  //         offset += 2
  //         view.setUint16(offset, 0, true)
  //         offset += 2
  //       }      
  //     }
  //   }
  //   return new Uint8Array(buffer)
  //  }

  // //utilized ChatGPT to generate this function
  // fromByteArray(byteArray, width, height) {
  //   const buffer = byteArray.buffer;
  //   const view = new DataView(buffer);
  //   const bytes = 4;
  //   const grid = new Grid(width, height, null);
  //   let offset = 0;

  //   // Iterate over each cell in the grid and read position, sun_lvl, and rain_lvl, and plant data from the buffer
  //   for (let x = 0; x < height; x++) {
  //     grid.tiles[x] = [];
  //     for (let y = 0; y < width; y++) {
  //       const xCoord = view.getFloat32(offset, true);
  //       offset += bytes;
  //       const cellY = view.getFloat32(offset, true);
  //       offset += bytes;
  //       const sunLvl = view.getFloat32(offset, true);
  //       offset += bytes;
  //       const rainLvl = view.getFloat32(offset, true);
  //       offset += bytes;

  //       const plantType = view.getUint8(offset);
  //       offset += 1;
  //       const growth_Lvl = view.getUint8(offset);
  //       offset += 1;
  //       const waterDiffusionRate = view.getUint8(offset);
  //       offset += 1;
  //       const plantX = view.getUint16(offset, true);
  //       offset += 2;
  //       const plantY = view.getUint16(offset, true);
  //       offset += 2;

  //       const tile = new Cell(xCoord, cellY, sunLvl, rainLvl, null);
  //       if(plantType > 0) {
  //         const plant = new Plant(null, plantType, {x: plantCellX, y: plantCellY});
  //         plant.growth_lvl = growth_Lvl
  //         plant.waterDiffusionRate = waterDiffusionRate
  //         tile.plant = plant

  //       }
  //       grid.tiles[x].push(tile);
  //     }
  //   }
  //   return grid
  // }
}