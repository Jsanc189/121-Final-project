export class Plant extends Phaser.Sprite {
    constructor(type, adjacentPlants) {
        super("plantSprite");

        // initialize type of plant and initial growth level
        this.type = type;
        this.adjacentPlants = adjacentPlants;

        const TYPE1 = 1;
        const TYPE2 = 2;
        const TYPE3 = 3;
    } 

    init() {
        this.growthLevel = 0;
        this.sunLevel = 0;
        this.waterLevel = 0;
    }

    // in play scene, iterate through
    update() {
        switch(this.type) {
            case TYPE1:
                // check for plant type 1 growth conditions
                break;
            case TYPE2:
                // check for plant type 2 growth conditions
                break;
            case TYPE3: 
                // check for plant type 3 growth conditions
                break;
            default:
                // throw error
                break;
        }

        this.adjacentPlants.array.forEach(plant => {
            // update water level in adjacent tiles?
        });
    }

}