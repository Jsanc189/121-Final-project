import { Grid } from "../Scripts/Grid.js";
import { Player } from "../Scripts/Player.js";
//import { Plants } from "../Scripts/Plant.js";

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
      this.loadFile(savedData);
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
        this.plantHandler(ptr);
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
      this.saveFile(true);
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
    this.saveFile(true);
    this.endOfDay = true;
    console.log("end day");
  }

  undo() {
    let popped = this.undoStack.pop();
    if (popped) {
      this.redoStack.push(popped);
      if(popped.weather) this.updateWorld("weather", popped.weather);
      if(popped.plant){ 
        // update sprites
        let destroy = this.plantSprites.pop();
        this.findSpriteAt(destroy.x, destroy.y).destroy();
        this.destroyedSprites.push(destroy);
        
        this.updateWorld("plant", popped.plant); 
      }
      if(popped.harvested){
        let restore = this.destroyedSprites.pop();
        console.log(popped.harvested, restore)

        this.renderPlantSprites([restore]);
        this.plantSprites.push(restore);

        this.updatePlantCount(restore.type, -1);
        this.updateWorld("plant", popped.harvested); 
      }
      if(popped.growth){
        let restore = this.grownPlants.pop();
        this.ungrownPlants.push(restore);
        restore.forEach(plant => {  
          let restoreToLevel = plant.growth_lvl-1;
          if(restoreToLevel < 1) restoreToLevel = 1;
          let plantSprite = {
            x: (plant.x + 0.5) * this.tile_size,
            y: (plant.y + 0.5) * this.tile_size,
            img: `plant${plant.plant_type}_${restoreToLevel}`
          }
          this.updateSprite(
            (plant.x + 0.5) * this.tile_size,
            (plant.y + 0.5) * this.tile_size,
            this.plantSprites,
            plantSprite
          );
          this.renderPlantSprites([plantSprite]);
          plant.growth_lvl = restoreToLevel;
          console.log(plant, popped)
        });
      }

      console.log("undone");
    } else console.log("undo failed: nothing to undo");
  }

  redo() {
    let popped = this.redoStack.pop();
    if (popped) {
      this.undoStack.push(popped);
      if(popped.weather) this.updateWorld("weather", popped.weather);
      if(popped.plant){ 
        // update sprites
        let restore = this.destroyedSprites.pop();
        this.renderPlantSprites([restore]);
        this.plantSprites.push(restore);
        
        this.updateWorld("plant", popped.plant); 
      }
      if(popped.harvested){
        let destroy = this.plantSprites.pop();
        this.findSpriteAt(destroy.x, destroy.y).destroy();
        this.destroyedSprites.push(destroy);

        this.updatePlantCount(destroy.type, 1);
        this.updateWorld("plant", popped.harvested);  
      }
      if(popped.growth){
        let restore = this.ungrownPlants.pop();
        this.grownPlants.push(restore);
        restore.forEach(plant => {  
          let restoreToLevel = plant.growth_lvl+1;
          if(restoreToLevel > 3) restoreToLevel = 3;
          let plantSprite = {
            x: (plant.x + 0.5) * this.tile_size,
            y: (plant.y + 0.5) * this.tile_size,
            img: `plant${plant.plant_type}_${restoreToLevel}`
          }
          this.updateSprite(
            (plant.x + 0.5) * this.tile_size,
            (plant.y + 0.5) * this.tile_size,
            this.plantSprites,
            plantSprite
          );
          this.renderPlantSprites([plantSprite]);
          plant.growth_lvl = restoreToLevel;
          console.log(plant, popped)
        });
      }

      console.log("redone");
    } else console.log("redo failed: nothing to redo");
  }

  saveFile(isAuto) {
    if(isAuto === true && this.autosaveEnabled === false) return;
    console.log('Saving game...');
    
    const gridState = this.grid.copyAttributesToArray(["sun_lvl", "rain_lvl", "plant_type", "growth_lvl"]); // Assuming this returns the grid state as an array
    console.log("Grid state:")
    console.log(gridState)
    const playerState = {
        x: this.player.x,
        y: this.player.y,
    };

    const saveData = {
        grid: gridState,
        player: playerState,
        toggles: {
          autosave: this.autosaveEnabled,
          heatmap: this.heatmapEnabled
        },
        plantCounts: {
            plantOneCount: this.plantOneCount,
            plantTwoCount: this.plantTwoCount,
            plantThreeCount: this.plantThreeCount
        },
        plantSprites: {
          active: this.plantSprites,
          destroyed: this.destroyedSprites
        },
        undoStack: this.undoStack,
        redoStack: this.redoStack
    };

    // push to save files array
    if(isAuto === true){
      this.handleAutosave(saveData);
    } else{ 
      this.scene.pause();
      this.scene.start("savesScene", {mode: "save", saveData: saveData, scene: this});
    }

    localStorage.setItem('saveFiles', JSON.stringify(this.saveFiles));
    console.log('Game saved:', this.saveFiles);
}

handleAutosave(saveData){
  // if we're in a loaded file, save to same index
  if(this.load === true){
    this.saveFiles[this.load_index] = saveData;
    return;
  }
  // if not, find first null in saveFiles
  let saved = false;
  for(let i = 0; i < this.saveFiles.length; i++){
    if(this.saveFiles[i] === null){
      this.saveFiles[i] = saveData;
      this.load = true;
      this.load_index = i;
      return;
    }
  }
  // no null found
  if(!saved){
    // if there's space, push
    if(this.saveFiles.length < this.game.MAX_SAVES){
      this.saveFiles.push(saveData); 
      this.load = true;
      this.load_index = this.saveFiles.length - 1;
      return;
    }
    // if no space, ask if user wants to overwrite
    else{
      const overwrite = window.confirm("All save slots in use. Overwrite?");
      // if user declines, turn off autosave
      if(!overwrite){ 
        this.autosaveToggle.emit("pointerup");
        return;
      }
      // is user accepts, let them pick which slot to overwrite
      else{
        this.scene.pause();
        this.scene.start("savesScene", {mode: "save", saveData: saveData, scene: this});
        return;
      }
    }
  }
}

loadFile(savedData) {
    console.log('Loading game...');

    // index with whatever save the player wants to get
    //const savedData = localStorage.getItem('saveFiles');

    if (savedData) {
        const parsedData = (JSON.parse(savedData));
        this.saveFiles = parsedData;

        // get session data by index
        const sessionData = parsedData[this.load_index];
        // Restore grid state
        this.grid.setStateFromArray(sessionData.grid);

        // Restore player state
        this.player.setPosition(sessionData.player.x, sessionData.player.y);
        this.autosaveEnabled = sessionData.toggles.autosave;
        this.heatmapEnabled = sessionData.toggles.heatmap;

        // Restore plant counts
        this.plantOneCount = sessionData.plantCounts.plantOneCount;
        this.plantTwoCount = sessionData.plantCounts.plantTwoCount;
        this.plantThreeCount = sessionData.plantCounts.plantThreeCount;

        // restore sprites
        this.plantSprites = sessionData.plantSprites.active;
        this.renderPlantSprites(this.plantSprites);
        this.destroyedSprites = sessionData.plantSprites.destroyed;
        //this.setPlantsFromData(); //untested

        // Restore undo/redo stacks
        this.undoStack = sessionData.undoStack || [];
        this.redoStack = sessionData.redoStack || [];

        console.log('Game loaded:', sessionData);
    } else {
        console.log('No saved game found.');
    }
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

  plantHandler(ptr) {
    const tileSize = this.tile_size;

    // Get the cell offset for the player's current position
    const playerCellOffset = this.grid.getCellAt(this.player.x, this.player.y, tileSize);
    if (playerCellOffset === false) {
        console.log("Player is out of bounds!");
        return;
    }

    // Get the cell offset for the clicked position
    const clickedCellOffset = this.grid.getCellAt(ptr.x, ptr.y, tileSize);
    if (clickedCellOffset === false) {
        console.log("Clicked position is out of bounds!");
        return;
    }

    // Check if the clicked cell is adjacent to the player's cell
    if (!this.grid.isAdjacentCell(playerCellOffset, clickedCellOffset)) {
        console.log("Clicked cell is not adjacent to the player's cell!");
        return;
    }

    // Retrieve the clicked cell's data
    const clickedCell = this.grid.getCell(
        Math.floor(ptr.x / tileSize),
        Math.floor(ptr.y / tileSize)
    );

    // Check if the cell already has a plant
    if (clickedCell.plant_type === 0) {
        // No plant exists, plant a new one
        const randomType = Math.floor(Math.random() * 3) + 1;

        // Create a sprite for the new plant
        let plantX = (Math.floor(ptr.x / tileSize) + 0.5) * tileSize;
        let plantY = (Math.floor(ptr.y / tileSize) + 0.5) * tileSize;
        const plantSprite = this.add.sprite(
            plantX, 
            plantY, 
            `plant${randomType}_1`
        ).setScale(this.GRID_SCALE - 2)
        .setName("plant");

        this.plantSprites.push({
          x: plantX,
          y: plantY,
          img: `plant${randomType}_1`
        }); 

        // save grid state before changing
        let plantState = this.grid.copyAttributesToArray(["plant_type"]);
        this.undoStack.push({plant: plantState});

        // Update the grid cell with the plant data
        this.grid.setCell(
            Math.floor(ptr.x / tileSize),
            Math.floor(ptr.y / tileSize),
            {
                ...clickedCell,
                plant_type: randomType,
                growth_lvl: 1,
            }
        );

        console.log(`Planted a type ${randomType} plant at (${ptr.x}, ${ptr.y}).`);
        clickedCell.plant_type = randomType;
    } else {
        let x =  (Math.floor(ptr.x / tileSize) + 0.5) * tileSize;
        let y =  (Math.floor(ptr.y / tileSize) + 0.5) * tileSize;
        if(clickedCell.growth_lvl >= 3){
          console.log("Harvesting plant!");

          let plantState = this.grid.copyAttributesToArray(["plant_type"]);
          this.undoStack.push({harvested: plantState});

          let harvestSprite = this.findSpriteAt(x, y);
          this.destroyedSprites.push({
            x: x,
            y: y,
            img: `plant${clickedCell.plant_type}_${clickedCell.growth_lvl}`,
            type: clickedCell.plant_type
          });
          harvestSprite.destroy();

          // update plant type count
          this.updatePlantCount(clickedCell.plant_type, 1);

        }
    }
  }
  
  updatePlantCount(type, amount){
    switch(type){
      case 1:
        this.plantOneCount += amount;
        break;
      case 2:
        this.plantTwoCount += amount;
        break;
      case 3:
        this.plantThreeCount += amount;
        break;
      default:
        throw new Error(`Unknown plant type: ${type}`);
    }
  }

  renderPlantSprites(sprites){
    for(const plant of sprites){
      // if there's already a cell here, destroy it so we aren't rendering
      //  sprites on top of each other
      let cellSprite = this.findSpriteAt(plant.x, plant.y);
      if(cellSprite){
        cellSprite.destroy();
      }
      this.add.sprite(plant.x, plant.y, plant.img)
        .setScale(this.GRID_SCALE - 2)
        .setName("plant");
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
          this.updatePlants(); //end of day growth
        }
        break;
      default:
        throw new Error(`Unkown target: ${target}`)
    }

  }

  findSpriteAt(x, y) {
    // get scene children and filter by name (plant)
    const objects = this.children.getAll().filter(child => child.name === "plant");
    for (let obj of objects) {
        if (obj.x === x && obj.y === y) {
            return obj; // return the plant at x y
        }
    }
    return null; // If no object matches
  }

  findSpriteInArray(x, y, arr) {
    for(const sprite of arr) {
      if(sprite.x == x && sprite.y == y) {
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


  updatePlants() {
    let dayGrowth = [];
    for (let x = 0; x < this.grid.height; x++) {
      for (let y = 0; y < this.grid.width; y++) {
        const cell = this.grid.getCell(x, y); //get the tile of the plant
        const plant = cell.plant_type;

        //skip if no plant or plan is full grown
        if (plant == 0 ||  cell.growth_lvl >= 3) continue;

        //find correct sprite 
        const plantSprite = this.findSpriteInArray( (x + 0.5) * this.tile_size, (y + 0.5) * this.tile_size, this.plantSprites);
        switch (cell.plant_type) {
          case 1:
            if (cell.sun_lvl >= 10 && cell.rain_lvl >= 10) { // check for plant type 1 growth conditions
                const newGrowth = cell.growth_lvl + 1; //increase growth level
                plantSprite.img = "plant1_" + newGrowth;
                this.grid.setCell(x, y, { ...cell, growth_lvl: newGrowth }); //update the growth level in the grid
                console.log("Plant 1 grew!" + newGrowth)

            }
            break;
          case 2:
            if (cell.sun_lvl >= 15 && cell.rain_lvl >= 20) { // check for plant type 2 growth conditions
                const newGrowth = cell.growth_lvl + 1; //increase growth level
                plantSprite.img = "plant2_" + newGrowth;
                this.grid.setCell(x, y, { ...cell, growth_lvl: newGrowth }); //update the growth level in the grid
                console.log("Plant 2 grew!" + newGrowth);

            }
            break;
          case 3:
            if (cell.sun_lvl >= 20 && cell.rain_lvl >= 30) { // check for plant type 3 growth conditions
                const newGrowth = cell.growth_lvl + 1; //increase growth level
                plantSprite.img = "plant3_" + newGrowth;
                console.log(toString(plantSprite.img));
                this.grid.setCell(x, y, { ...cell, growth_lvl: newGrowth }); //update the growth level in the grid
                console.log("Plant 3 is ready to harvest! " + newGrowth)
            }
            break;
        }
        this.updateSprite(plantSprite.x, plantSprite.y, this.plantSprites, plantSprite);
        if(cell.growth_lvl > 1) dayGrowth.push(cell);
      }
    }
    this.grownPlants.push(dayGrowth);
    this.renderPlantSprites(this.plantSprites);
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
      () => this.undo.bind(this),
    );
    this.makeButton(
      225,
      860,
      100,
      50,
      "Redo",
      0xffffff,
      "16px",
      () => this.redo.bind(this),
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
      () => this.saveFile.bind(this),
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
