import { Grid } from "../Scripts/Grid.js";
import { Player } from "../Scripts/Player.js";
import { plantHandler, updatePlants } from "../Scripts/Plant.js"
import { undo, redo, saveFile, loadFile } from "../Scripts/DataHandling.js";
import { initUIX, cellPreview } from "../Scripts/UIX.js";
import { languages } from "../Scripts/Text.js"


export class PlayScene extends Phaser.Scene {
  constructor() {
    super("playScene");
  }

  init(data) {
    this.load = data.load;
    this.load_index = data.load_index;
    this.initState = this.game.globals.initConditions;
  }

  create() {
    console.log("Language:", this.game.globals.language);
    // create save array
    this.saveFiles = [];
    const savedData = localStorage.getItem('saveFiles');
    if (savedData) {
        const parsedData = (JSON.parse(savedData));
        this.saveFiles = parsedData;
    }
    this.sessionSaved = this.load;

    //create tilemap & grid
    this.grid_dims = structuredClone(this.initState.grid)
    this.tile_size = this.grid_dims.tile_size * this.grid_dims.scale;
    
    // play window
    this.width = this.game.config.width - 100;
    this.height = this.game.config.height - 100;

    // init game world
    this.tilemap = this.make.tilemap({ key: "tilemap" });
    this.tileset = this.tilemap.addTilesetImage("tileset");
    this.layer = this.tilemap.createLayer("Main", this.tileset);
    this.layer.setScale(this.grid_dims.scale);
    this.grid = new Grid(this, this.grid_dims, this.load);
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
    this.player.scale = this.grid_dims.scale;

    //set game condition
    this.gameStates = structuredClone(this.initState.game);
    this.counts = structuredClone(this.initState.counts);
    this.winCounts = structuredClone(this.game.globals.winConditions.counts);
    this.plantSprites = [];
    this.destroyedSprites = []; // for undo/redo
    this.grownPlants = [];
    this.ungrownPlants = [];

    // event handling
    this.undoStack = [];
    this.redoStack = [];

    this.weatherMap = []
    this.toggles = structuredClone(this.initState.toggles);
    //Load save file data before we render the heatmap
    if(this.load){
      loadFile(this, savedData);
    }

    // buttons and toggles
    // undo, redo, endDay, saveFile, quit
    initUIX(this, undo, redo, this.endDay, saveFile, this.quit);
    if(this.toggles.autosave === true){
      this.toggles.autosave = !this.toggles.autosave;
      this.autosaveToggle.emit("pointerup")
    }
    if(this.toggles.heatmap === true){
      this.toggles.heatmap = !this.toggles.heatmap;
      this.heatmapToggle.emit("pointerup")
    }

    // weather levels label on hover
    this.levelsText = this.add.text(0, 0, "", {
      color: "black",
      backgroundColor: "#64ffc4",
      fontSize: 32,
    });

    this.input.on("pointermove", (ptr) => cellPreview(this, ptr));
    this.input.on("pointerdown", (ptr) => {
      if (!(ptr.x >= this.width || ptr.y >= this.height)) {
        console.log("doot");

        // Get the cell offset for the player's current position
        const playerCellOffset = this.grid.getCellAt(this.player.x, this.player.y, this.tile_size);
        if (playerCellOffset === false) {
            console.log("Player is out of bounds!");
            return;
        }

        // Get the cell offset for the clicked position
        const clickedCellOffset = this.grid.getCellAt(ptr.x, ptr.y, this.tile_size);
        if (clickedCellOffset === false) {
            console.log("Clicked position is out of bounds!");
            return;
        }

        // Check if the clicked cell is adjacent to the player's cell
        if (!this.grid.isAdjacentCell(playerCellOffset, clickedCellOffset)) {
            console.log("Clicked cell is not adjacent to the player's cell!");
            return;
        }
        const clickedCell = this.grid.getCell(
            Math.floor(ptr.x / this.tile_size),
            Math.floor(ptr.y / this.tile_size)
        );
        const plantTypes = this.game.globals.plantTypes;
        const pixelCoord = {
            x: (Math.floor(ptr.x / this.tile_size) + 0.5) * this.tile_size,
            y: (Math.floor(ptr.y / this.tile_size) + 0.5) * this.tile_size
        }
        plantHandler(this, pixelCoord, clickedCell, plantTypes);
      }
    });
  }

  update() {
    this.player.update(this);
    if (!this.gameStates.gameOver) {
      //check if end conditions are met
      this.checkWin();

      //check plants for growth in each tile
      if (this.gameStates.eod) {
        this.updateWorld("plant");
        this.updateWorld("weather");
        this.gameStates.eod = false;
      }
    } else {
      console.log("Game Over");
      this.scene.start("playScene");
    }
  }

  checkWin() {
    if (this.allCountsSatisfied()) {
      console.log("You win!");
      // autosave 
      saveFile(this, true);
      this.gameStates.gameOver = true;
    }
  }

  allCountsSatisfied(){
    for(const id in this.counts){
      if(this.counts[id] !== this.winCounts[id]) return false;
    }
    return true;
  }

  makeGridLines() {
    let drawToWidth = this.grid_dims.scale * this.grid_dims.tile_size * this.grid_dims.width;
    let drawToHeight = this.grid_dims.scale * this.grid_dims.tile_size * this.grid_dims.height;

    //Draw vertical line
    for (let x = this.tile_size; x < drawToWidth; x += this.tile_size) {
      this.add.line(0, 0, x, 0, x, 2 * drawToHeight, 0xffffff);
    }
    // horizontal lines
    for (let y = this.tile_size; y < drawToHeight; y += this.tile_size) {
      this.add.line(0, 0, 0, y, 2 * drawToWidth, y, 0xffffff);
    }
  }

  endDay() {
    let state = this.grid.copyAttributesToArray(["sun_lvl", "rain_lvl", "growth_lvl", "plant_type"]);
    this.undoStack.push({weather: state, growth: state});
    this.redoStack = [];
    // autosave 
    saveFile(this, true);
    this.gameStates.eod = true;
    console.log("end day");
  }

  quit() {
    console.log("Quitting game...");
    
    this.scene.stop();
    this.scene.start("menuScene");
  }

  updateWorld(target, arr) {
    switch(target){
      case "weather":
        // destroy old heatmap
        if(this.toggles.heatmap){
          if(this.weatherMap.length > 0){ 
            for(const rect of this.weatherMap){ rect.destroy(); }
          }
          this.weatherMap = [];
        }

        // update world weather
        if (!arr) this.grid.updateWeather(); // new random
        else this.grid.setStateFromArray(arr); // set from array

        // re-render heatmap
        if(this.toggles.heatmap){
          this.weatherMap = this.grid.render(this.tile_size);
        }
        break;
      case "plant":
        if(arr) { this.grid.setStateFromArray(arr); }
        else { updatePlants( //end of day growth 
            this,
            this.game.globals.plantTypes,
            {
                sun: this.game.globals.sunlightRequirements,
                water: this.game.globals.waterRequirements
            }
        ); } 
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
        arr[i] = newSprite; // destroy arr[i] before setting to new sprite??
        return arr[i];
      }
    }
    return null;
  }
}