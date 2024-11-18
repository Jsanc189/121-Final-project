import { Scene } from "phaser";
import { blankScene } from "./Scene";

// this is where we'll init and load assets (like tilemaps, tilesets, etc.)
export class Load extends Scene {
    constructor() {
        super("loadScene");
    }

    preload() {

        //loading bar to show progress
        let loadingBar = this.add.graphics();
        this.load.on('progress', (value) => {
            loadingBar.clear(); // reset fill style
            loadingBar.fillStyle(0xFFFFFF, 1); // (color, alpha)
            loadingBar.fillRect(0, this.sys.game.config.height / 2, this.sys.game.config.width * value, 50);
        });

        this.load.on('complete', () =>{
            loadingBar.destroy();
        });

        // load assets here
        //this.load.setPath("./assets/");
        
    }

    create() {
        console.log("Load finished...");
        this.scene.start("blankScene"); // start next scene
    }
}