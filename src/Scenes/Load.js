import { Scene } from "phaser";
import * as yaml from "js-yaml";
//import { playScene } from "./Scene";

// this is where we'll init and load assets (like tilemaps, tilesets, etc.)
export class Load extends Phaser.Scene {
  constructor() {
    super("loadScene");
  }

  preload() {
    //loading bar to show progress
    let loadingBar = this.add.graphics();
    this.load.on("progress", (value) => {
      loadingBar.clear(); // reset fill style
      loadingBar.fillStyle(0xdfe036, 1); // (color, alpha)
      loadingBar.fillRect(
        0,
        this.sys.game.config.height / 2,
        this.sys.game.config.width * value,
        50,
      );
    });

    this.load.on("complete", () => {
      loadingBar.destroy();
    });

    // load assets here
    this.load.setPath("./assets/");

    // load YAML file
    this.load.text("plantData", "config/plantData.yaml");

    this.load.image("tileset", "tilemap_packed.png");
    this.load.tilemapTiledJSON("tilemap", "tilemap.json");
    this.load.atlas("idle", "player_idle.png", "player_idle.JSON");

    // load plant sprites
    for (let i = 1; i <= 3; i++) {
      for (let j = 1; j <= 3; j++) {
        this.load.image("plant" + i + "_" + j, "plant" + i + "_" + j + ".png");
      }
    }
  }

  create() {
    console.log("Load finished...");

    //Parse YAML file and save data to the scene
    const yamlText = this.cache.text.get("plantData");
    this.registry.set("plantData", yaml.load(yamlText));

    this.scene.start("menuScene"); // start next scene
  }
}
