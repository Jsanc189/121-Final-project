// constants for types of plants
const TYPE1 = 1;
const TYPE2 = 2;
const TYPE3 = 3;

// import { Grid } from "./Grid.js";

export class Plants {
  constructor(scene) {
    // pass in scene from Play.js
    this.scene = scene;

    // pass in grid to reference and edit
    this.grid = scene.grid;

    this.image;
  }

  plant(cell) {
    // phaser xy coordinates of tile
    this.x = cell.x;
    this.y = cell.y;

    cell.plant_img = "plant" + this.plant_type + "_" + this.growth_lvl;

    // add an image to represent the plant
    this.image = this.scene.add.image(
      this.x * this.scene.tile_size,
      this.y * this.scene.tile_size,
      cell.plant_img,
    ).setScale(this.scene.GRID_SCALE);

    this.grid.setCell(this.x, this.y, plant_img)
  }

  endDay() {
    for (let x = 0; x < this.grid.height; x++) {
      for (let y = 0; y < this.grid.width; y++) {
        let cell = this.grid.getCellAt(x, y);
        switch (cell.plant_type) {
          case TYPE1:
            // check for plant type 1 growth conditions
            if (cell.sun_lvl >= 10 && cell.rain_lvl >= 10) {
                cell.growth_lvl++;
            }
            this.image.setTexture("plant1_" + cell.growth_lvl);
            break;
          case TYPE2:
            // check for plant type 2 growth conditions
            if (cell.sun_lvl >= 20 && cell.rain_lvl >= 20) {
                cell.growth_lvl++;
            }
            this.image.setTexture("plant2_" + cell.growth_lvl);
            break;
          case TYPE3:
            // check for plant type 3 growth conditions
            if (cell.sun_lvl >= 30 && cell.rain_lvl >= 30) {
                cell.growth_lvl++;
            }
            this.image.setTexture("plant3_" + cell.growth_lvl);
            break;
          default:
            // throw error?
            break;
        }
      }
    }
  }

  diffuseWater() {
  }

  populateGrid() {
  }

  harvest() {

  }
}
