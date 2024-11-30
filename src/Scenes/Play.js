import { Grid } from "../Scripts/Grid.js";
import { Player } from "../Scripts/Player.js";
//import { Plants } from "../Scripts/Plant.js";
import { plantHandler, updatePlants } from "../Scripts/Plant.js"
import { undo, redo, saveFile, loadFile } from "../Scripts/DataHandling.js";

export class PlayScene extends Phaser.Scene {
  constructor() {
    super("playScene");
  }

  init(data) {
    this.load = data.load;
    this.load_index = data.load_index;
  }

  create() {
    // create save array
    this.saveFiles = [];
    const savedData = localStorage.getItem('saveFiles');
    if (savedData) {
        const parsedData = (JSON.parse(savedData));
        this.saveFiles = parsedData;
    }
    this.sessionSaved = this.load;

    //create tilemap & grid
    this.GRID_WIDTH = 10;
    this.GRID_HEIGHT = 10;
    this.GRID_SCALE = 5; //og tilemap size: 512x320
    this.tile_size = 16 * this.GRID_SCALE;
    this.width = this.game.config.width - 100;
    this.height = this.game.config.height - 100;

    // init game world
    this.tilemap = this.make.tilemap({ key: "tilemap" });
    this.tileset = this.tilemap.addTilesetImage("tileset");
    this.layer = this.tilemap.createLayer("Main", this.tileset);
    this.layer.setScale(this.GRID_SCALE);
    this.grid = new Grid(this.GRID_WIDTH, this.GRID_HEIGHT, this, this.load);
    this.makeGridLines();

    //player movement keys
    this.leftKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.LEFT
    );
    this.rightKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.RIGHT
    );
    this.upKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.UP
    );
    this.downKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.DOWN
    );

    // this.time = new Clock(this);
    this.player = new Player(
      this,
      .5 * this.tile_size,
      .5 * this.tile_size,
      "idle",
      8,
      this.tile_size,
    );
    this.player.scale = this.GRID_SCALE;

    //set game condition
    this.gameOver = false;
    this.endOfDay = false;
    this.plantOneCount = 0;
    this.plantTwoCount = 0;
    this.plantThreeCount = 0;
    this.plantSprites = [];
    this.destroyedSprites = []; // for undo/redo
    this.grownPlants = [];
    this.ungrownPlants = [];

    // event handling
    this.undoStack = [];
    this.redoStack = [];

    this.weatherMap = [] // this.grid.render(this.tile_size);
    this.heatmapEnabled = false;
    this.autosaveEnabled = false;
    //Load save file data before we render the heatmap
    if(this.load){
      loadFile(this, savedData);
    }

    // buttons and toggles
    this.initUIX();
    console.log(this.autosaveEnabled, this.heatmapEnabled)
    if(this.autosaveEnabled === true){
      this.autosaveEnabled = !this.autosaveEnabled;
      this.autosaveToggle.emit("pointerup")
    }
    if(this.heatmapEnabled === true){
      this.heatmapEnabled = !this.heatmapEnabled;
      this.heatmapToggle.emit("pointerup")
    }

    // weather levels label on hover
    this.levelsText = this.add.text(0, 0, "", {
      color: "black",
      backgroundColor: "#64ffc4",
      fontSize: 32,
    });

    this.input.on("pointermove", (ptr) => this.cellPreview(ptr));
    this.input.on("pointerdown", (ptr) => {
      if (!(ptr.x >= this.width || ptr.y >= this.width)) {
        console.log("doot")
        plantHandler(ptr, this);
      }
    });
  }

  update() {
    this.player.update(this);
    if (!this.gameOver) {
      //check if end conditions are met
      this.checkWin();

      //check plants for growth in each tile
      if (this.endOfDay) {
        //console.log("checking grid");
        
        this.updateWorld("plant");
        this.updateWorld("weather");
        this.endOfDay = false;
      }
    } else {
      console.log("Game Over");
      this.scene.start("playScene");
    }
  }

  checkWin() {
    if (
      this.plantOneCount >= 3 && this.plantTwoCount >= 3 &&
      this.plantThreeCount >= 3
    ) {
      console.log("You win!");
      // autosave 
      saveFile(this, true);
      this.gameOver = true;
    }
  }

  makeGridLines() {
    //Draw vertical line
    for (let x = this.tile_size; x < this.width; x += this.tile_size) {
      // let line = new Phaser.Geom.Line(x, 0, x, this.scene.height);
      this.add.line(0, 0, x, 0, x, 2 * this.height, 0xffffff);
    }
    // horizontal lines
    for (let y = this.tile_size; y < this.height; y += this.tile_size) {
      // let line = new Phaser.Geom.Line(0, y, this.scene.height, y);
      this.add.line(0, 0, 0, y, 2 * this.height, y, 0xffffff);
    }
  }

  endDay() {
    let weatherState = this.grid.copyAttributesToArray(["sun_lvl", "rain_lvl"]);
    this.undoStack.push({weather: weatherState});
    let plantState = this.grid.copyAttributesToArray(["growth_lvl","plant_type"]);
    this.undoStack.push({growth: plantState});
    this.redoStack = [];
    // autosave 
    saveFile(this, true);
    this.endOfDay = true;
    console.log("end day");
  }

  quit() {
    console.log("Quitting game...");
    
    this.scene.stop();
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
    buttonBG.on("pointerover", () => {
      button.setStyle({ color: "#3CAD24" });
    });
    button.on("pointerover", () => {
      button.setStyle({ color: "#3CAD24" });
    });
    buttonBG.on("pointerout", () => {
      button.setStyle({ color: textColor });
    });
    button.on("pointerup", functionCall());
    buttonBG.on("pointerup", functionCall());
  }

  cellPreview(ptr) {
    if (!(ptr.x >= 800 || ptr.y >= 800)) {
      let [x, y] = [ptr.x, ptr.y];
      let [w, h] = [this.levelsText.width, this.levelsText.height];
      if (x < w) w = 0;
      if (y < h) h = 0;
      this.levelsText.x = x - w;
      this.levelsText.y = y - h;

      let [gridX, gridY] = [
        Math.floor(x / this.tile_size),
        Math.floor(y / this.tile_size),
      ];
      let cell = this.grid.getCell(gridX, gridY);
      this.levelsText.setText(
        `sun: ${cell.sun_lvl}\nrain: ${cell.rain_lvl}`,
      );
    }
  }

  updateWorld(target, arr) {
    switch(target){
      case "weather":
        if(this.heatmapEnabled){
          // destroy old heatmap
          if(this.weatherMap.length > 0) for(const rect of this.weatherMap) rect.destroy();
          this.weatherMap = [];
        }
        // check for an array to determine generation
        if (!arr) this.grid.updateWeather(); // new random
        else this.grid.setStateFromArray(arr); // set from array
        if(this.heatmapEnabled){
          // re-render heatmap
          this.weatherMap = this.grid.render(this.tile_size);
        }
        break;
      case "plant":
        if(arr) {
          this.grid.setStateFromArray(arr);
        }
        else {
          updatePlants(this); //end of day growth
        }
        break;
      default:
        throw new Error(`Unkown target: ${target}`)
    }

  }

  findSprite(x, y, arr){
    if(!arr){ arr = this.children.getAll().filter(child => child.name === "plant"); }
    for(const sprite of arr) {
      if(sprite.x === x && sprite.y === y) {
        return sprite;
      }
    }
    return null;
  }

  updateSprite(x, y, arr, newSprite) {
    for(let i = 0; i < arr.length; i++) {
      if(arr[i].x == x && arr[i].y == y) {
        arr[i] = newSprite;
        return arr[i];
      }
    }
    return null;
  }

  initUIX(){
    //buttons
    this.makeButton(
      75,
      860,
      100,
      50,
      "Undo",
      0xffffff,
      "16px",
      () => undo.bind(this),
    );
    this.makeButton(
      225,
      860,
      100,
      50,
      "Redo",
      0xffffff,
      "16px",
      () => redo.bind(this),
    );
    this.makeButton(
      375,
      860,
      100,
      50,
      "End Day",
      0xffffff,
      "16px",
      () => this.endDay.bind(this),
    );
    this.makeButton(
      575,
      860,
      100,
      50,
      "Save",
      0xffffff,
      "16px",
      () => saveFile.bind(this, this),
    );
    this.makeButton(
      725,
      860,
      100,
      50,
      "Quit",
      0xffffff,
      "16px",
      () => this.quit.bind(this),
    );

    // make toggle for autosaving
    this.autosaveToggle = this.add.rectangle(
      this.game.config.width - 50, 50, 50, 50, 0xFFFFFF)
      .setOrigin(0.5);
    this.add.text(this.autosaveToggle.x, this.autosaveToggle.y + 50, "autosave", {
      fontSize: 16,
      color: "#3CAD24",
    }).setOrigin(0.5);
    this.autosaveToggle.setInteractive();
    this.autosaveToggle.on("pointerover", () => {
      this.autosaveToggle.setFillStyle(0x3CAD24);
    });
    this.autosaveToggle.on("pointerout", () => {
      if(!this.autosaveEnabled) this.autosaveToggle.setFillStyle(0xFFFFFF);
    });
    this.autosaveToggle.on("pointerdown", () => {
      this.autosaveToggle.setFillStyle(0x3CAD24);
    });
    this.autosaveToggle.on("pointerup", () => {
      this.autosaveEnabled = !this.autosaveEnabled;
      if(this.autosaveEnabled) this.autosaveToggle.setFillStyle(0x06402B);
      else this.autosaveToggle.setFillStyle(0xFFFFFF);
    });

    // make toggle for heatmap
    this.heatmapToggle = this.add.rectangle(
      this.game.config.width - 50, 200, 50, 50, 0xFFFFFF)
      .setOrigin(0.5);
    this.add.text(this.heatmapToggle.x, this.heatmapToggle.y + 50, "weather\n layer", {
      fontSize: 16,
      color: "#3CAD24",
    }).setOrigin(0.5);
    this.heatmapToggle.setInteractive();
    this.heatmapToggle.on("pointerover", () => {
      this.heatmapToggle.setFillStyle(0x3CAD24);
    });
    this.heatmapToggle.on("pointerout", () => {
      if(!this.heatmapEnabled) this.heatmapToggle.setFillStyle(0xFFFFFF);
    });
    this.heatmapToggle.on("pointerdown", () => {
      this.heatmapToggle.setFillStyle(0x3CAD24);
    });
    this.heatmapToggle.on("pointerup", () => {
      this.heatmapEnabled = !this.heatmapEnabled;
      if(this.heatmapEnabled){ 
        this.heatmapToggle.setFillStyle(0x06402B);
        this.weatherMap = this.grid.render(this.tile_size);
      }
      else {
        this.heatmapToggle.setFillStyle(0xFFFFFF);
        if(this.weatherMap.length > 0) for(const rect of this.weatherMap) rect.destroy();
        this.weatherMap = [];
      }
    });
  }
}
