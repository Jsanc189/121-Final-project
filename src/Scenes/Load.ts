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
    this.load.on("progress", (value: number) => {
      loadingBar.clear(); // reset fill style
      loadingBar.fillStyle(0xdfe036, 1); // (color, alpha)
      loadingBar.fillRect(
        0,
        this.game.height / 2,
        this.game.width * value,
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

    //* EXTERNAL DSL PARSING *//
    // Parse YAML file and save data to the scene
    const worldData = this.cache.text.get("worldData");
    const parsedWorldData = yaml.load(worldData);

    //console.log(this.parsedWorldData);

    let initConditions = parsedWorldData.init;
    let winConditions = parsedWorldData.win_state;
    let weatherProtocol = parsedWorldData.weather;

    console.log(initConditions);
    console.log(winConditions);
    console.log(weatherProtocol);

    //* INTERNAL DSL PARSING *//
    // Parse YAML file and save data to the scene
    const plantData = this.cache.text.get("plantData");
    let parsedPlantData = yaml.load(plantData);

    console.log(parsedPlantData);

    let sunlightRequirements = parsedPlantData.growthConditions.sunlightRequirements;
    let waterRequirements = parsedPlantData.growthConditions.waterRequirements;
    // let plants = parsedPlantData.plants;

    let plantTypes = parsedPlantData.plants.map(plant => ({
      name: plant.name,
      growthStages: plant.growthStages.map(stage => ({
        growthLvl: stage.growth_lvl,
        image: stage.image
      }))
    }));

    //* load parsed DSL data into game global variables *//
    this.game.globals = this.game.globals || {};

    // external DSL
    this.game.globals.initConditions = initConditions;
    this.game.globals.winConditions = winConditions;
    this.game.globals.weatherProtocol = weatherProtocol;

    // internal DSL
    this.game.globals.plantTypes = plantTypes;
    this.game.globals.sunlightRequirements = sunlightRequirements;
    this.game.globals.waterRequirements = waterRequirements;

    this.scene.start("menuScene"); // start next scene
  }
}
