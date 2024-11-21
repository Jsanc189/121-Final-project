import { Scene } from "phaser";
//import { playScene } from "./Scene";

// this is where we'll init and load assets (like tilemaps, tilesets, etc.)
export class Load extends Phaser.Scene {
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
        this.load.setPath("./assets/");
        this.load.image("tileset", "tilemap_packed.png");
        this.load.tilemapTiledJSON("tilemap", "tilemap.json")
        this.load.spritesheet('player', 'idle.png', {
            frameWidth: 16,
            frameHeight: 16,
        })
        
    }

    create() {
        console.log("Load finished...");
        this.scene.start("playScene"); // start next scene
    }
}