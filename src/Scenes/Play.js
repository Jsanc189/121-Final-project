import { Grid } from "../Scripts/Grid.js";
import { Player } from "../Scripts/Player.js";
import { Plants } from "../Scripts/Plant.js";

export class PlayScene extends Phaser.Scene {
  constructor() {
    super("playScene");
  }

  create() {
    this.graphics = this.add.graphics();

    //create tilemap & grid
    this.GRID_WIDTH = 10;
    this.GRID_HEIGHT = 10;
    this.GRID_SCALE = 5; //og tilemap size: 512x320
    this.tile_size = 16 * this.GRID_SCALE;
    this.width = 800;
    this.height = 800;

    // init game world
    this.tilemap = this.make.tilemap({ key: "tilemap" });
    this.tileset = this.tilemap.addTilesetImage("tileset");
    this.layer = this.tilemap.createLayer("Main", this.tileset);
    this.layer.setScale(this.GRID_SCALE);
    this.grid = new Grid(this.GRID_WIDTH, this.GRID_HEIGHT, this);
    this.makeGridLines();
    this.weatherMap = this.grid.render(this.tile_size);
    this.plantHandler = this.updateWorldPlants(this);

    //player movement keys
    this.leftKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.LEFT,
    );
    this.rightKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.RIGHT,
    );
    this.upKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    this.downKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.DOWN,
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

    // create plants
    this.plants = new Plants(this);

    //set game condition
    this.gameOver = false;
    this.endOfDay = false;
    this.plantOneCount = 0;
    this.plantTwoCount = 0;
    this.plantThreeCount = 0;

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

    // weather levels label on hover
    this.levelsText = this.add.text(0, 0, "", {
      color: "black",
      backgroundColor: "#64ffc4",
      fontSize: 32,
    });

    // event handling
    this.undoStack = [];
    this.redoStack = [];

    this.bus = new EventTarget();
    this.bus.addEventListener("weather-changed", () => this.gridChanged());
    this.bus.addEventListener("plant-changed", () => this.gridChanged());
    console.log(this.bus);

    this.input.on("pointermove", (ptr) => this.cellPreview(ptr));
    this.input.on("pointerdown", (ptr) => {
      if (!(ptr.x >= this.width || ptr.y >= this.width)) {
        this.plantHandler.put(ptr);
      }
    });
  }

  update() {
    this.player.update();
    if (!this.gameOver) {
      //check if end conditions are met
      this.checkWin();

      //check plants for growth in each tile
      if (this.endOfDay) {
        //console.log("checking grid");
        for (let x = 0; x < this.grid.height; x++) {
          for (let y = 0; y < this.grid.width; y++) {
            const tile = this.grid.getCellAt(x, y, this.tile_size);
            const plant = tile.plant;
            if (!plant) continue;
            this.plantHandler.updateCount(plant);
          }
        }
        this.updateWorldWeather();
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
    let state = this.grid.copyAttributesToArray(["sun_lvl", "rain_lvl"]);
    this.undoStack.push(state);
    this.redoStack = [];

    //console.log(this.endOfDay);
    this.endOfDay = true;
    //console.log(this.endOfDay);
    console.log("end day");
  }

  undo() {
    let popped = this.undoStack.pop();
    if (popped) {
      this.redoStack.push(popped);
      this.updateWorldWeather(popped);

      console.log("undone");
    } else console.log("undo failed: nothing to undo");
  }

  redo() {
    let popped = this.redoStack.pop();
    if (popped) {
      this.undoStack.push(popped);
      this.updateWorldWeather(popped);

      console.log("redone");
    } else console.log("redo failed: nothing to redo");
  }

  saveFile() {
    console.log('Saving game...');
    
    const gridState = this.grid.copyAttributesToArray(["sun_lvl", "rain_lvl"]); // Assuming this returns the grid state as an array
    const playerState = {
        x: this.player.x,
        y: this.player.y,
    };

    const saveData = {
        grid: gridState,
        player: playerState,
        plantCounts: {
            plantOneCount: this.plantOneCount,
            plantTwoCount: this.plantTwoCount,
            plantThreeCount: this.plantThreeCount
        },
        undoStack: this.undoStack,
        redoStack: this.redoStack
    };

    localStorage.setItem('saveFile1', JSON.stringify(saveData));
    console.log('Game saved:', saveData);
}

loadFile() {
    console.log('Loading game...');

    const savedData = localStorage.getItem('saveFile1');
    if (savedData) {
        const parsedData = JSON.parse(savedData);

        // Restore grid state
        this.grid.setStateFromArray(parsedData.grid);

        // Restore player state
        this.player.setPosition(parsedData.player.x, parsedData.player.y);

        // Restore plant counts
        this.plantOneCount = parsedData.plantCounts.plantOneCount;
        this.plantTwoCount = parsedData.plantCounts.plantTwoCount;
        this.plantThreeCount = parsedData.plantCounts.plantThreeCount;

        // Restore undo/redo stacks
        this.undoStack = parsedData.undoStack || [];
        this.redoStack = parsedData.redoStack || [];

        console.log('Game loaded:', parsedData);
    } else {
        console.log('No saved game found.');
    }
}



  quit() {
    console.log("Quitting game...");
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

    updateWorldPlants(init) {
        const scene = init;
    
        function put(ptr) {
            const tileSize = scene.tile_size;
    
            // Get the cell offset for the player's current position
            const playerCellOffset = scene.grid.getCellAt(scene.player.x, scene.player.y, tileSize);
            if (playerCellOffset === false) {
                console.log("Player is out of bounds!");
                return;
            }
    
            // Get the cell offset for the clicked position
            const clickedCellOffset = scene.grid.getCellAt(ptr.x, ptr.y, tileSize);
            if (clickedCellOffset === false) {
                console.log("Clicked position is out of bounds!");
                return;
            }
    
            // Check if the clicked cell is adjacent to the player's cell
            if (!scene.grid.isAdjacentCell(playerCellOffset, clickedCellOffset)) {
                console.log("Clicked cell is not adjacent to the player's cell!");
                return;
            }
    
            // Retrieve the clicked cell's data
            const clickedCell = scene.grid.getCell(
                Math.floor(ptr.x / tileSize),
                Math.floor(ptr.y / tileSize)
            );
    
            // Check if the cell already has a plant
            if (clickedCell.plant_type === 0) {
                // No plant exists, plant a new one
                const randomType = Math.floor(Math.random() * 3) + 1;
    
                // Create a sprite for the new plant
                const plantSprite = scene.add.sprite(
                    (Math.floor(ptr.x / tileSize) + 0.5) * tileSize,
                    (Math.floor(ptr.y / tileSize) + 0.5) * tileSize,
                    `plant${randomType}_1`
                ).setScale(scene.GRID_SCALE - 2);
    
                // Create a new Plant instance
                const newPlant = new Plant(plantSprite, randomType, clickedCell);
    
                // Update the grid cell with the plant data
                scene.grid.setCell(
                    Math.floor(ptr.x / tileSize),
                    Math.floor(ptr.y / tileSize),
                    {
                        ...clickedCell,
                        plant_type: randomType,
                        growth_lvl: newPlant.growth_lvl, // Starts at 1 by default
                    }
                );
    
                console.log(`Planted a type ${randomType} plant at (${ptr.x}, ${ptr.y}).`);
            } else {
                console.log("Cell already has a plant!");
            }
    
            // Notify the scene of a plant update
            scene.notify("plant-changed");
        }
    
        return { put };
    }
    
    // TODO: make these functional again
//     updateWorldPlants(init){
//         const scene = init;
        

//         function put(ptr){   
//             const tileSize = scene.tile_size;     
//             let playerCellOffset = scene.grid.getCellAt(scene.player.x, scene.player.y, tileSize);
//             const clickedCellOffset = scene.grid.getCellAt(ptr.x, ptr.y, tileSize);
//             console.log(`putting a plant at (${ptr.x}, ${ptr.y})...`);
            
            

//             if(scene.grid.isAdjacentCell(clickedCellOffset, playerCellOffset)){
//                 const cellPlant = scene.grid.getCell(ptr.x, ptr.y);
// Z
//                 if (cellPlant == undefined) {
//                      const randomType = Math.floor(Math.random() * 3 )+ 1;
//                      const plantSprite = scene.add.sprite((clickedCellOffset.y * this.tile_size + .5 * this.tile_size), (clickedCellOffset.x * this.tile_size + .5*this.tile_size), "plant" + randomType + "_1").setScale(this.GRID_SCALE - 2)
//                      const newPlant = new Plant(plantSprite, randomType, )
//                      grid.setCell(ptr.x, ptr.y, {
//                         ...cellPlant,
//                         plant_type: randomType,
//                         growth_lvl: newGrowthLevel
//                      });

//                 }
//             }


//             //    if (cellPlant == undefined) {
//             //        let randomType = Math.floor(Math.random() * 3 + 1);
//             //        let plantSprite = this.add.sprite((cellOffset.y * this.tile_size + .5*this.tile_size), (cellOffset.x * this.tile_size + .5*this.tile_size), "plant" + randomType + "_1").setScale(this.GRID_SCALE - 2);
//             //        cell.plant = new Plant(plantSprite, randomType, cellOffset); 
//             //    } else if (cellPlant) {
//             //        if (cellPlant.growth_lvl == 3) {
//             //            cellPlant.harvest();
//             //        }
//             //    }
//             //}
//             scene.notify("plant-changed")
//         }

//         function updateCount(plant){
//             console.log(`updating plants counts...`)
//             //plant.update();
//             //if (plant.growth_lvl > 3) {
//             //    switch (plant.type) {
//             //        case 1:
//             //            this.plantOneCount++
//             //            break;
//             //        case 2:
//             //            this.plantTwoCount++;
//             //            break;
//             //        case 3:
//             //            this.plantThreeCount++;
//             //            break;
//             //    }
//             //    plant.sprite.destroy(true);
//             //    delete tile.plant;
//             //}
//             scene.notify("plant-changed")

//         }       
//         return { put, updateCount } 
//     }

  updateWorldWeather(arr) {
    // destroy old heatmap
    for (const rect of this.weatherMap) rect.destroy();
    this.weatherMap = [];

    // check for an array to determine generation
    if (!arr) this.grid.updateWeather();
    // new random
    else this.grid.setStateFromArray(arr); // set from array

    // re-render heatmap
    this.weatherMap = this.grid.render(this.tile_size);

    this.notify("weather-changed");
  }

  gridChanged() {
    console.log("new grid state");
  }

  notify(name) {
    this.bus.dispatchEvent(new Event(name));
  }
}
