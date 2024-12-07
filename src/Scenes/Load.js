import "phaser";
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

    //load the YAML file in the preload function
    this.load.text('plantData', 'config/plants.yaml');
    this.load.text('worldData', 'config/world.yaml');

    this.load.image("tileset", "tilemap_packed.png");
    this.load.tilemapTiledJSON("tilemap", "tilemap.json");
    this.load.atlas("idle", "player_idle.png", "player_idle.json");

    // load plant sprites
    for (let i = 1; i <= 3; i++) {
      for (let j = 1; j <= 3; j++) {
        this.load.image("plant" + i + "_" + j, "plant" + i + "_" + j + ".png");
      }
    }
  }

  create() {
    console.log("Load finished...");

    //* EXTERNAL DSL PARSING *//
    // Parse YAML file and save data to the scene
    const worldData = this.cache.text.get("worldData");
    this.parsedWorldData = yaml.load(worldData);

    this.initConditions = this.parsedWorldData.init;
    this.winConditions = this.parsedWorldData.win_state;
    this.weatherProtocol = this.parsedWorldData.weather;

    console.log(this.initConditions);
    console.log(this.winConditions);
    console.log(this.weatherProtocol);

    //* INTERNAL DSL PARSING *//
    // Parse YAML file and save data to the scene
    const plantData = this.cache.text.get("plantData");
    this.parsedPlantData = yaml.load(plantData);

    this.sunlightRequirements = this.parsedPlantData.growthConditions.sunlightRequirements;
    this.waterRequirements = this.parsedPlantData.growthConditions.waterRequirements;
    this.plants = this.parsedPlantData.plants;

    this.plantTypes = this.parsedPlantData.plants.map(plant => ({
      name: plant.name,
      growthStages: plant.growthStages.map(stage => ({
        growthLvl: stage.growth_lvl,
        image: stage.image
      }))
    }));


    //* load parsed DSL data into game global variables *//
    this.game.globals = this.game.globals || {};

    // external DSL
    this.game.globals.initConditions = this.initConditions;
    this.game.globals.winConditions = this.winConditions;
    this.game.globals.weatherProtocol = this.weatherProtocol;

    // internal DSL
    this.game.globals.plantTypes = this.plantTypes;
    this.game.globals.sunlightRequirements = this.sunlightRequirements;
    this.game.globals.waterRequirements = this.waterRequirements;

    this.scene.start("menuScene"); // start next scene
  }
}
