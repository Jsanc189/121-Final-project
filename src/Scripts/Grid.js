import { Weather, TileWeather } from './Weather.js';

export class Grid {
  constructor(width, height, scene) {
    this.width = width;
    this.height = height;
    this.scene = scene;

    // 18 bytes per cell: x, y, sun_lvl, rain_lvl, plant_type, growth_lvl, water_diffusion_rate
    const bytesPerCell = 19;
    this.byteArray = new ArrayBuffer(width * height * bytesPerCell);
    this.view = new DataView(this.byteArray);

    // Initialize weather system
    this.weather = new Weather(); // Global weather instance

    // Initialize the byte array with cell and weather data
    let offset = 0;
    for (let x = 0; x < height; x++) {
      for (let y = 0; y < width; y++) {
        if(offset + bytesPerCell > this.byteArray.byteLength) {
          throw new Error("Offset out of bounds at " + offset);
        };

        // Generate weather using TileWeather
        const tileWeather = new TileWeather(x, y, this.weather).generate();

        // Store cell and weather data in the byte array
        this.view.setFloat32(offset, x, true); // x
        offset += 4;
        this.view.setFloat32(offset, y, true); // y
        offset += 4;
        this.view.setFloat32(offset, tileWeather.sun, true); // sun_lvl
        offset += 4;
        this.view.setFloat32(offset, tileWeather.rain, true); // rain_lvl
        offset += 4;
        this.view.setUint8(offset, 0); // plant_type
        offset += 1;
        this.view.setUint8(offset, 0); // growth_lvl
        offset += 1;
        this.view.setUint8(offset, 0); // water_diffusion_rate
        offset += 1;
      }
    }
  }

  getCell(x, y) {
    const bytesPerCell = 18;
    const offset = (x * this.width + y) * bytesPerCell;

    return {
      x: this.view.getFloat32(offset, true),
      y: this.view.getFloat32(offset + 4, true),
      sun_lvl: this.view.getFloat32(offset + 8, true),
      rain_lvl: this.view.getFloat32(offset + 12, true),
      plant_type: this.view.getUint8(offset + 16),
      growth_lvl: this.view.getUint8(offset + 17),
      water_diffusion_rate: this.view.getUint8(offset + 18),
    };
  }

  setCell(x, y, data) {
    const bytesPerCell = 18;
    const offset = (x * this.width + y) * bytesPerCell;

    this.view.setFloat32(offset, data.x, true);
    this.view.setFloat32(offset + 4, data.y, true);
    this.view.setFloat32(offset + 8, data.sun_lvl, true);
    this.view.setFloat32(offset + 12, data.rain_lvl, true);
    this.view.setUint8(offset + 16, data.plant_type || 0);
    this.view.setUint8(offset + 17, data.growth_lvl || 0);
    this.view.setUint8(offset + 18, data.water_diffusion_rate || 0);
  }

  updateWeather(seed = Math.random()) {
    // Update the global weather instance
    this.weather = new Weather({ seed: seed });

    for (let x = 0; x < this.height; x++) {
      for (let y = 0; y < this.width; y++) {
        // Generate new weather values for each cell
        const tileWeather = new TileWeather(x, y, this.weather).generate();

        // Update weather values in the byte array
        const cell = this.getCell(x, y);
        cell.sun_lvl = tileWeather.sun;
        cell.rain_lvl += tileWeather.rain;
        this.setCell(x, y, cell);
      }
    }
  }

  render() {
    for (let x = 0; x < this.height; x++) {
      for (let y = 0; y < this.width; y++) {
        const cell = this.getCell(x, y);
        const color = Phaser.Display.Color.GetColor(
          cell.sun_lvl * 2.55,
          cell.rain_lvl * 2.55,
          0
        );
        this.scene.add.rectangle(cell.x * 40, cell.y * 40, 40, 40, color);
      }
    }
  }

  getCellOffset(x, y) {
    return (x * this.bytesPerCell * this.height) + (y * this.bytesPerCell)
  }

  getCellAt(phaserX, phaserY, tile_size){
    if (!(phaserX >= 800 || phaserY >= 800)) {
      const bufferX = Math.floor(phaserX / tile_size);
      const bufferY = Math.floor(phaserY / tile_size);
      return this.getCellOffset(bufferX, bufferY);
    } 
    console.log("couldn't get cell: out of bounds");
    return false;
  }

  getSunAtCell(cellOffset){
    return this.view.getFloat32(cellOffset + (2 * this.bytes));
  }

  getRainAtCell(cellOffset){
    return this.view.getFloat32(cellOffset + (3 * this.bytes));
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


}
