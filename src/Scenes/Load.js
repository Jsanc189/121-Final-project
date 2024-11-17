import { Scene } from "phaser";
import { blankScene } from "./Scene";

// this is where we'll init and load assets (like tilemaps, tilesets, etc.)
export class Load extends Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        this.load.setPath("./assets/");
    }

    create() {
        console.log("Load finished...");
        this.scene.start("blankScene"); // start next scene
    }
}