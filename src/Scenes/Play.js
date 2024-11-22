import { Grid } from "../Scripts/Grid";
import { Player } from "../Scripts/Player";
import { Plant } from "../Scripts/Plant";

export class PlayScene extends Phaser.Scene {
    constructor() {
       super("playScene");
    }


    create() {
        this.graphics = this.add.graphics();

        //create tilemap & grid
        this.GRID_WIDTH = 10;
        this.GRID_HEIGHT = 10;
        this.GRID_SCALE = 2.5; //og tilemap size: 512x320
        this.width = 1280
        this.height = 800

        this.tilemap = this.make.tilemap({ key: "tilemap" });
        this.tileset = this.tilemap.addTilesetImage("tileset");
        this.layer = this.tilemap.createLayer("Main", this.tileset)
        this.layer.setScale(this.GRID_SCALE);
        this.grid = new Grid(this.GRID_WIDTH, this.GRID_HEIGHT, this)
        this.makeGridLines();

        //player movement keys
        this.leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        this.rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        this.upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        this.downKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);

        // this.time = new Clock(this);
        this.player = new Player(this, 140, 140, 'idle', 8, 40);
        this.player.scale = this.GRID_SCALE;
        console.log(this.player.y)

        //set game condition
        this.gameOver = false;
        this.endOfDay = false;
        this.plantOneCount = 0;
        this.plantTwoCount = 0;
        this.plantThreeCount = 0;

        const dayButton = this.add.text(
            100, 
            100, 
            'End Day', 
            { fontSize: '28px', fill: '#0F0' 
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
        })
        this.input.on('pointermove', (ptr) => {
            let cell = this.grid.getCellAt(ptr.x, ptr.y);
            let [x, y] = [ptr.x, ptr.y];
            let [w, h] = [this.levelsText.width, this.levelsText.height];
            if(x < w) w = 0;
            if(y < h) h = 0;
            this.levelsText.x = x - w;
            this.levelsText.y = y - h;

            this.levelsText.setText(
                `sun: ${cell.sun_lvl}\nrain: ${cell.rain_lvl}`
            )
        });
        
    }

    update() {
        this.player.update();
        if (!this.gameOver) {
            //console.log("Game is running...");

            //check if end conditions are met
            this.checkWin();

            if(this.endOfDay) {
                console.log("End of day...");
                this.plantOneCount += 1;
                this.plantTwoCount += 1;
                this.plantThreeCount += 1;

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
        if(this.plantOneCount >= 10 && this.plantTwoCount >= 10 && this.plantThreeCount >= 10) {
            console.log("You win!");
            this.gameOver = true;
        }
    }

    makeGridLines(){
    this.grid_lines = []
    //Draw vertical lines
    for(let x = 40; x < this.scene.width; x += 40){
      // let line = new Phaser.Geom.Line(x, 0, x, this.scene.height);
      this.add.line(x, 0, x, this.scene.height)
    }
    for(let y = 40; y < this.scene.height; y += 40){
      // let line = new Phaser.Geom.Line(0, y, this.scene.height, y);
      this.add.line(0, y, this.scene.height, y);
    }
  }
    
}
