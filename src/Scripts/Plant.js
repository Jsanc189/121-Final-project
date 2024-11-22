export class Plant {
    constructor(type, grid) {
        // super("plantSprite");

        // initialize type of plant and initial growth level
        this.type = type;

        // store 8 tiles adjacent to the plant 
        this.grid = grid;

        // constants for types of plants
        const TYPE1 = 1;
        const TYPE2 = 2;
        const TYPE3 = 3;
    } 

    preload() {
    }

    init() {
        this.growthLevel = 1;
        this.sunLevel = 0;
        this.waterLevel = 0;
        this.waterDiffusionRate = 0;
    }

    // in play scene, iterate through
    update() {
        if (this.waterLevel >= 50) {
            this.waterDiffusionRate = this.waterLevel % 10;
        } else {
            this.waterDiffusionRate = 0;
        }

        switch(this.type) {
            case TYPE1:
                // check for plant type 1 growth conditions
                if (this.sunLevel >= 10 && this.waterLevel >= 10) {
                    this.growthLevel++;
                }
                this.setTexture("plant1_" + this.growthLevel);
                break;
            case TYPE2:
                // check for plant type 2 growth conditions
                if (this.sunLevel >= 20 && this.waterLevel >= 20) {
                    this.growthLevel++;
                }
                this.setTexture("plant2_" + this.growthLevel);
                break;
            case TYPE3: 
                // check for plant type 3 growth conditions
                if (this.sunLevel >= 30 && this.waterLevel >= 30) {
                    this.growthLevel++;
                }
                this.setTexture("plant3_" + this.growthLevel);
                break;
            default:
                // throw error?
                break;
        }

        this.grid.array.forEach(tile => {
            // update water level in adjacent tiles according to diffusion rate 
            tile.water += this.waterDiffusionRate;
        });
    }

}