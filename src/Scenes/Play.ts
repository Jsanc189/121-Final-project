import { Grid } from "../Scripts/Grid.js";
import { Player } from "../Scripts/Player.js";
import { plantHandler, updatePlants } from "../Scripts/Plant.js"
import { undo, redo, saveFile, loadFile } from "../Scripts/DataHandling.js";
import { initUIX, cellPreview } from "../Scripts/UIX.js";

export class PlayScene extends Phaser.Scene {
    private saveFiles: any[] = [];
    private GRID_WIDTH = 10;
    private GRID_HEIGHT = 10;
    private GRID_SCALE = 5;
    private tile_size: number;
    width: number;
    height: number;
    private sessionSaved: boolean | Phaser.Loader.LoaderPlugin = false;
    private tilemap!: Phaser.Tilemaps.Tilemap;
    private tileset!: Phaser.Tilemaps.Tileset;
    private layer!: Phaser.Tilemaps.TilemapLayer;
    private grid!: Grid;
    private player!: Player;
    private keys: {
        leftKey:  Phaser.Input.Keyboard.Key,
        rightKey: Phaser.Input.Keyboard.Key,
        upKey: Phaser.Input.Keyboard.Key,
        downKey: Phaser.Input.Keyboard.Key
    }
    private gameOver: boolean = false;
    private endOfDay: boolean = false;
    private plantOneCount: number = 0;
    private plantTwoCount: number = 0;
    private plantThreeCount: number = 0;
    private plantSprites: Phaser.GameObjects.Sprite[] = [];
    private destroyedSprites: Phaser.GameObjects.Sprite[] = [];
    private grownPlants: any[] = [];
    private ungrownPlants: any[] = [];
    private undoStack: any[] = [];
    private redoStack: any[] = [];
    private weatherMap: Phaser.GameObjects.Rectangle[] = [];
    private heatmapEnabled: boolean = false;
    private autosaveEnabled: boolean = false;
    private levelsText!: Phaser.GameObjects.Text;
    private heatmapToggle;
    private autosaveToggle;
    
    constructor() {
        super("playScene");
    }

    init(data) {
        this.load = data.load;
        // this.load_index = data.load_index;
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
        this.width = this.game.width - 100;
        this.height = this.game.height - 100;

        // init game world
        this.tilemap = this.make.tilemap({ key: "tilemap" });
        this.tileset = this.tilemap.addTilesetImage("tileset")!;
        this.layer = this.tilemap.createLayer("Main", this.tileset)!;
        this.layer.setScale(this.GRID_SCALE);
        this.grid = new Grid(this.GRID_WIDTH, this.GRID_HEIGHT, this, this.load);
        this.makeGridLines();

        //player movement keys
        this.keys.leftKey = this.input.keyboard!.addKey(
        Phaser.Input.Keyboard.KeyCodes.LEFT
        );
        this.keys.rightKey = this.input.keyboard!.addKey(
        Phaser.Input.Keyboard.KeyCodes.RIGHT
        );
        this.keys.upKey = this.input.keyboard!.addKey(
        Phaser.Input.Keyboard.KeyCodes.UP
        );
        this.keys.downKey = this.input.keyboard!.addKey(
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
        // undo, redo, endDay, saveFile, quit
        initUIX(this, undo, redo, this.endDay, saveFile, this.quit);
        if(this.autosaveEnabled){
        this.autosaveEnabled = !this.autosaveEnabled;
        this.autosaveToggle.emit("pointerup")
        }
        if(this.heatmapEnabled){
        this.heatmapEnabled = !this.heatmapEnabled;
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
        if (!(ptr.x >= this.width || ptr.y >= this.width)) {
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
        let state = this.grid.copyAttributesToArray(["sun_lvl", "rain_lvl", "growth_lvl", "plant_type"]);
        this.undoStack.push({weather: state, growth: state});
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

    updateWorld(target, arr=[]) {
        switch(target){
        case "weather":
            // destroy old heatmap
            if(this.heatmapEnabled) {
            if(this.weatherMap.length > 0) { 
                for(const rect of this.weatherMap) { 
                    rect.destroy(); 
                }
            }
            this.weatherMap = [];
            }

            // update world weather
            if (arr.length != 0) this.grid.updateWeather(); // new random
            else this.grid.setStateFromArray(arr); // set from array

            // re-render heatmap
            if(this.heatmapEnabled) {
            this.weatherMap = this.grid.render(this.tile_size);
            }
            break;
        case "plant":
            if(arr.length > 0) { 
                this.grid.setStateFromArray(arr); 
            }
            else { 
                updatePlants( //end of day growth 
                    this,
                    this.game.globals.plantTypes,
                    {
                        sun: this.game.globals.sunlightRequirements,
                        water: this.game.globals.waterRequirements
                    }
                ); 
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
            arr[i] = newSprite; // destroy arr[i] before setting to new sprite??
            return arr[i];
        }
        }
        return null;
    }
}