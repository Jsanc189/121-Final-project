import { Grid } from "./Grid.ts";
import { Player } from "./Player.ts";
import { plantHandler, updatePlants } from "./Plant.ts";
import { undo, redo, saveFile, loadFile } from "./DataHandling.ts";
import { initUIX, cellPreview } from "./UIX.ts";

export class PlayScene extends Phaser.Scene {
    private saveFiles: any[] = [];
    
    private grid_dims
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

    private gameStates;
    private counts;
    private winCounts;

    private toggles;
    private plantSprites: Phaser.GameObjects.Sprite[] = [];
    private destroyedSprites: Phaser.GameObjects.Sprite[] = [];
    private grownPlants: any[] = [];
    private ungrownPlants: any[] = [];
    private undoStack: any[] = [];
    private redoStack: any[] = [];
    private weatherMap: Phaser.GameObjects.Rectangle[] = [];
    private levelsText!: Phaser.GameObjects.Text;
    private heatmapToggle;
    private autosaveToggle;
    private initState;
    
    constructor() {
        super("playScene");
    }

    init(data) {
        this.load = data.load;
        // this.load_index = data.load_index;
        console.log(this.game);
        this.initState = this.game.globals.initConditions;
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
        this.grid_dims = structuredClone(this.initState.grid)
        this.tile_size = this.grid_dims.tile_size * this.grid_dims.scale;

        // play window
        this.width = this.game.width - 100;
        this.height = this.game.height - 100;

        // init game world
        this.tilemap = this.make.tilemap({ key: "tilemap" });
        this.tileset = this.tilemap.addTilesetImage("tileset")!;
        this.layer = this.tilemap.createLayer("Main", this.tileset)!;
        this.layer.setScale(this.grid_dims.scale);
        this.grid = new Grid(this, this.grid_dims, this.load);
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

        this.weatherMap = [] // this.grid.render(this.tile_size);
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
        } 
        else {
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
        for (const id in this.counts) {
            if(this.counts[id] !== this.winCounts[id]) 
                return false;
        }
        return true;
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
        this.gameStates.eod = true;
        console.log("end day");
    }

    quit() {
        console.log("Quitting game...");
        
        this.scene.stop();
        this.scene.start("menuScene");
    }

    updateWorld(target: string, arr=[]) {
        switch (target) {
        case "weather":
            // destroy old heatmap
            if (this.toggles.heatmap) {
                if(this.weatherMap.length > 0) { 
                    for(const rect of this.weatherMap) { 
                        rect.destroy(); 
                    }
                }
                this.weatherMap = [];
            }

            // update world weather
            if (arr.length != 0) {  // new random
                this.grid.updateWeather();
            }
            else {  // set from array
                this.grid.setStateFromArray(arr);
            }

            // re-render heatmap
            if (this.toggles.heatmap) {
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

    findSprite(x: number, y: number, arr){
        if (!arr) { 
            arr = this.children.getAll().filter(child => child.name === "plant"); 
        }
        for(const sprite of arr) {
            if (sprite.x === x && sprite.y === y) {
                return sprite;
            }
        }
        return null;
    }

    updateSprite(x, y, arr, newSprite) {
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].x == x && arr[i].y == y) {
                arr[i] = newSprite; // destroy arr[i] before setting to new sprite??
                return arr[i];
            }
        }
        return null;
    }
}
