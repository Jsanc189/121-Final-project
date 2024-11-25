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

        //buttons
        this.makeButton(100, 860, 150, 50, 'Save', 0xffffff, '16px', () => this.saveFile.bind(this));
        this.makeButton(350, 860, 150, 50, 'Quit', 0xffffff, '16px', () => this.quit.bind(this));
        this.makeButton(705, 860, 150, 50, 'End Day', 0xffffff, '16px', () => this.endDay.bind(this));



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
            //check if end conditions are met
            this.checkWin();
        
            //check plants for growth in each tile
            if(this.endOfDay) {
                console.log("checking grid");
                for (let x = 0; x < this.grid.height; x++) {
                    for (let y = 0; y < this.grid.width; y++) {
                        const tile = this.grid.tiles[x][y];
                        const plant = tile.plant;

                        if(!plant) continue;

                        plant.update();

                        if (plant.growth_lvl > 3) {
                            switch (plant.type) {
                                case 1:
                                    this.plantOneCount++
                                    break;
                                case 2:
                                    this.plantTwoCount++;
                                    break;
                                case 3:
                                    this.plantThreeCount++;
                                    break;
                            }
                            plant.sprite.destroy(true);
                            delete tile.plant;
                        }
                     }
                }
                this.grid.updateWeather();
                console.log(`sun\n${this.grid.printAttribute("sun_lvl")}`);
                console.log(`rain\n${this.grid.printAttribute("rain_lvl")}`);

                this.endOfDay = false;
            }

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

  endDay() {
    console.log(this.endOfDay);
    this.endOfDay = true;
    console.log(this.endOfDay);
    console.log("ending day");
  };



//   function setGrid() {

//   }

  saveFile() {
    console.log('Saving game...');

    this.sys.game.saveFile1 = this.grid;
    console.log(this.sys.game.saveFile1);
  }

  quit() {
    console.log('Quitting game...');
    this.scene.start("menuScene");
  }

 makeButton(x, y, width, height, text, textColor, textSize, functionCall) {
    const buttonBG = this.add.rectangle(x, y, width, height, 0xFFFFFF);
    const button = this.add.text(x, y, text, {
        fontSize: textSize, 
        color: textColor,
    }).setOrigin(0.5);
    buttonBG.setInteractive();
    button.setInteractive();
    buttonBG.on('pointerover',() => {button.setStyle({color: '#3CAD24'})});
    button.on('pointerover',() => {button.setStyle({color: '#3CAD24'})});
    buttonBG.on('pointerout',() => {button.setStyle({color: textColor})});
    button.on('pointerup', functionCall());
    buttonBG.on('pointerup', functionCall());
  }
}
