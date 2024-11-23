import { Grid } from "../Scripts/Grid.js";
import { Player } from "../Scripts/Player.js";
import { Plant } from "../Scripts/Plant.js";

export class PlayScene extends Phaser.Scene {
    constructor() {
       super("playScene");
    }


    create() {
        this.graphics = this.add.graphics();

        //create tilemap & grid
        this.GRID_WIDTH = 10;
        this.GRID_HEIGHT = 10;
        this.GRID_SCALE = 5; //og tilemap size: 512x320
        this.tile_size = 16 * this.GRID_SCALE
        this.width = 800
        this.height = 800

        this.tilemap = this.make.tilemap({ key: "tilemap" });
        this.tileset = this.tilemap.addTilesetImage("tileset");
        this.layer = this.tilemap.createLayer("Main", this.tileset);
        this.layer.setScale(this.GRID_SCALE);
        this.grid = new Grid(this.GRID_WIDTH, this.GRID_HEIGHT, this);
        this.makeGridLines();

        //player movement keys
        this.leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        this.rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        this.upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        this.downKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);

        // this.time = new Clock(this);
        this.player = new Player(this, .5*this.tile_size, .5*this.tile_size, 'idle', 8, this.tile_size);
        this.player.scale = this.GRID_SCALE;

        //set game condition
        this.gameOver = false;
        this.endOfDay = false;
        this.plantOneCount = 0;
        this.plantTwoCount = 0;
        this.plantThreeCount = 0;

        const buttonBG = this.add.rectangle(705, 860, 150, 50, 0xffffff, 1);
        const dayButton = this.add.text(
            650, 
            850, 
            'End Day', 
            { fontSize: '28px', fill: '#000' 
            }).setInteractive();

        dayButton.on('pointerover', () => {
            console.log('pointerOver!')
        });
        dayButton.on('pointerup', () => {
            this.endOfDay = true;
       
        });

        this.levelsText = this.add.text(0,0, "", {
            color: "black", 
            backgroundColor: "#64ffc4",
            fontSize: 32
        });

        this.input.on('pointermove', (ptr) => {
            if (!(ptr.x >= 800 || ptr.y >= 800)) {
                
            let cell = this.grid.getCellAt(ptr.x, ptr.y, this.tile_size);
            let [x, y] = [ptr.x, ptr.y];
            let [w, h] = [this.levelsText.width, this.levelsText.height];
            if(x < w) w = 0;
            if(y < h) h = 0;
            this.levelsText.x = x - w;
            this.levelsText.y = y - h;

            this.levelsText.setText(
                `sun: ${cell.sun_lvl}\nrain: ${cell.rain_lvl}`
            )
        }
        });
        this.input.on('pointerdown', (ptr) => {
            let cell = this.grid.getCellAt(ptr.x, ptr.y, this.tile_size);
            let player_cell = this.grid.getCellAt(this.player.x, this.player.y, this.tile_size);

            if (!(ptr.x >= 800 || ptr.y >= 800)) {
            if(this.grid.isAdjacentCell(cell, player_cell)){
                if (cell.plant == undefined) {
                    let randomType = Math.floor(Math.random() * 3 + 1);
                    let plantSprite = this.add.sprite((cell.y * this.tile_size + .5*this.tile_size), (cell.x * this.tile_size + .5*this.tile_size), "plant" + randomType + "_1").setScale(this.GRID_SCALE - 2);
                    cell.plant = new Plant(plantSprite, randomType, cell); 
                } else if (cell.plant) {
                    if (cell.plant.growth_lvl == 3) {
                        cell.plant.harvest();
                    }
                }

            }
        }
        });
        
    }

    update() {
        this.player.update();
        if (!this.gameOver) {
            //console.log("Game is running...");

            //check if end conditions are met
            this.checkWin();
        
            if(this.endOfDay) {
                for (let x = 0; x < this.grid.height; x++) {
                    for (let y = 0; y < this.grid.width; y++) {
                        if (this.grid.tiles[x][y].plant) {
                            this.grid.tiles[x][y].plant.update();
                            if (this.grid.tiles[x][y].plant.growth_lvl > 3) {
                                switch (this.grid.tiles[x][y].plant.type) {
                                    case 1:
                                        this.plantOneCount++;
                                        break;
                                    case 2:
                                        this.plantTwoCount++;
                                        break;
                                    case 3:
                                        this.plantThreeCount++;
                                        break;
                                }
                                this.grid.tiles[x][y].plant.sprite.destroy(true);
                                delete this.grid.tiles[x][y].plant;
                            }
                        }
                     }
                }
                console.log("End of day...");

                this.grid.updateWeather();
                console.log(`sun\n${this.grid.printAttribute("sun_lvl")}`);
                console.log(`rain\n${this.grid.printAttribute("rain_lvl")}`);

                this.endOfDay = false;
            } else {
                // console.log("Day is running...");
                //this.endOfDay = true;
            };

        } else {
            console.log("Game Over");
            this.scene.start("playScene");

        }
    }

    checkWin() {
        if(this.plantOneCount >= 3 && this.plantTwoCount >= 3 && this.plantThreeCount >= 3) {
            console.log("You win!");
            this.gameOver = true;
        }
    }

    makeGridLines(){
        // this.grid_lines = [];
        //Draw vertical line
        for(let x = (this.tile_size); x < this.width; x += (this.tile_size)){
            // let line = new Phaser.Geom.Line(x, 0, x, this.scene.height);
            this.add.line(0, 0, x, 0, x, 2 * this.height, 0xffffff);
        }
        // horizontal lines 
        for(let y = (this.tile_size); y < this.height; y += (this.tile_size)){
            // let line = new Phaser.Geom.Line(0, y, this.scene.height, y);
            this.add.line(0, 0, 0, y, 2 * this.height, y, 0xffffff);
        }
  }
    
}
