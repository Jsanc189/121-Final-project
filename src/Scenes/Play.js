import { weather } from "../Scripts/Weather";
import { Grid } from "../Scripts/Grid";
import { Player } from "../Scripts/Player";

export class PlayScene extends Phaser.Scene {
    constructor() {
       super("playScene");
    }


    create() {
        this.graphics = this.add.graphics();

        //create tilemap & grid
        this.GRID_WIDTH = 32;
        this.GRID_HEIGHT = 20;
        this.GRID_SCALE = 2.5; //og tilemap size: 512x320
        this.width = 1280
        this.height = 800

        this.tilemap = this.make.tilemap({ key: "tilemap" });
        this.tileset = this.tilemap.addTilesetImage("tileset");
        this.layer = this.tilemap.createLayer("Main", this.tileset)
        this.layer.setScale(this.GRID_SCALE);
        this.grid = new Grid(this.GRID_WIDTH, this.GRID_HEIGHT, this)
        this.grid.makeGridLines();
        this.graphics.lineStyle(1, 0xffffff, 1);
        this.graphics.beginPath();
        for(let line in this.grid_lines){
          this.graphics.strokeLineShape(line);
        }
        this.graphics.strokeLineShape(0, 0, 1280, 800);

        //player movement keys
        this.leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        this.rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        this.upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        this.downKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);

        this.player = new Player(this, 140, 140, 'player', 8, 5);
        this.player.scale = 2.5;
        console.log(this.player.y)

        //set game condition
        this.gameOver = false;
        this.endOfDay = false;
        this.plantOneCount = 0;
        this.plantTwoCount = 0;
        this.plantThreeCount = 0;

        // weather grid that updates at end of day
        this.weather = this.getWeather(this.GRID_WIDTH, this.GRID_HEIGHT);

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

                this.weather = this.getWeather(this.GRID_WIDTH, this.GRID_HEIGHT);
                console.log(`sun:\n${this.weather.sun.toString()}`);
                console.log(`rain:\n${this.weather.rain.toString()}`);

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
    
    getWeather(w, h){
        return weather({
            width: w,
            height: h
        });
    }
}
