// constants for types of plants
const TYPE1 = 1;
const TYPE2 = 2;
const TYPE3 = 3;

export class Plant {
    constructor(type, cell) {
        // super("plantSprite");

        // initialize type of plant and initial growth level
        this.type = type;

        // store 8 tiles adjacent to the plant 
        this.cell = cell;
    } 

    init() {
        this.growth_lvl = 1;
        this.waterDiffusionRate = 0;
    }

    // in play scene, iterate through
    update() {
        if (this.cell.rain_lvl >= 50) {
            this.waterDiffusionRate = this.cell.rain_lvl % 10;
        } else {
            this.waterDiffusionRate = 0;
        }

        switch(this.type) {
            case TYPE1:
                // check for plant type 1 growth conditions
                if (this.cell.sun_lvl >= 10 && this.cell.rain_lvl >= 10) {
                    this.growth_lvl++;
                }
                //console.log(this.cell.rect);
                //this.setTexture("plant1_" + this.growth_lvl);
                break;
            case TYPE2:
                // check for plant type 2 growth conditions
                if (this.cell.sun_lvl >= 20 && this.cell.rain_lvl >= 20) {
                    this.growth_lvl++;
                }
                //this.cell.rect.setTexture("plant2_" + this.growth_lvl);
                break;
            case TYPE3: 
                // check for plant type 3 growth conditions
                if (this.cell.sun_lvl >= 30 && this.cell.rain_lvl >= 30) {
                    this.growth_lvl++;
                }
                //this.cell.rect.setTexture("plant3_" + this.growth_lvl);
                break;
            default:
                // throw error?
                break;
        }

        // this.grid.array.forEach(tile => {
        //     // update water level in adjacent tiles according to diffusion rate 
        //     tile.rain_lvl += this.waterDiffusionRate;
        // });
    }

    harvest() {
        this.destroy();
    }

}