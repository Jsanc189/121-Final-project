import { TileWeather, Weather } from "./Weather.js";

//slight module augmentation
declare module "phaser" {
    interface Scene {
        width: number,
        height: number
    }
}

export class Grid {
    private width: number;
    private height: number;
    private scene: Phaser.Scene;
    private bytesPerCell: number;
    private byteArray: ArrayBuffer;
    private view: DataView;
    private weather: Weather;


    constructor(width: number, height: number, scene: Phaser.Scene, load) {
        this.width = width;
        this.height = height;
        this.scene = scene;

        // 20 bytes per cell: x, y, sun_lvl, rain_lvl, plant_type, growth_lvl, water_diffusion_rate
        this.bytesPerCell = 20;
        this.byteArray = new ArrayBuffer(width * height * this.bytesPerCell);
        this.view = new DataView(this.byteArray);

        // Initialize weather system
        this.weather = new Weather(); // Global weather instance

        // Initialize the byte array with cell and weather data (only if not a loaded file)
        if(!load){
            for (let x = 0; x < height; x++) {
                for (let y = 0; y < width; y++) {
                // Generate weather using TileWeather
                const tileWeather = new TileWeather(x, y, this.weather).generate();

                // Store cell and weather data in the byte array
                let cellData = {
                    x: x,
                    y: y,
                    sun_lvl: tileWeather.sun,
                    rain_lvl: tileWeather.rain,
                    plant_type: 0,
                    growth_lvl: 0,
                    water_diffusion_rate: 0
                };

                this.setCell(x, y, cellData);
                }
            }
        }
    }

    byteOffset(x: number, y: number) {
        return (x * this.width + y) * this.bytesPerCell;
    }

    offsetByAttribute(x: number, y: number, attribute: string) {
        let offset = this.byteOffset(x, y);
        switch (attribute) {
        case "x":
            return offset;
        case "y":
            return offset + 4;
        case "sun_lvl":
            return offset + 8;
        case "rain_lvl":
            return offset + 12;
        case "plant_type":
            return offset + 16;
        case "growth_lvl":
            return offset + 17;
        case "water_diffusion_rate":
            return offset + 18;
        default:
            throw new Error(`Unknown attribute: "${attribute}"`);
        }
    }

    getCell(x: number, y: number) {
        return {
        x: this.view.getInt32(this.offsetByAttribute(x, y, "x"), true),
        y: this.view.getInt32(this.offsetByAttribute(x, y, "y"), true),
        sun_lvl: this.view.getInt32(
            this.offsetByAttribute(x, y, "sun_lvl"),
            true,
        ),
        rain_lvl: this.view.getInt32(
            this.offsetByAttribute(x, y, "rain_lvl"),
            true,
        ),
        plant_type: this.view.getUint8(
            this.offsetByAttribute(x, y, "plant_type"),
        ),
        growth_lvl: this.view.getUint8(
            this.offsetByAttribute(x, y, "growth_lvl"),
        ),
        water_diffusion_rate: this.view.getUint8(
            this.offsetByAttribute(x, y, "water_diffusion_rate"),
        ),
        };
    }

    setCell(x: number, y: number, data) {
        if(!x) x = 0;
        if(!y) y = 0;
        if(data.x !== null) this.view.setInt32(this.offsetByAttribute(x,y,"x"), data.x, true);
        if(data.y !== null) this.view.setInt32(this.offsetByAttribute(x,y,"y"), data.y, true);
        if(data.sun_lvl !== null) this.view.setInt32(this.offsetByAttribute(x,y,"sun_lvl"), data.sun_lvl, true);
        if(data.rain_lvl !== null) this.view.setInt32(this.offsetByAttribute(x,y,"rain_lvl"), data.rain_lvl, true);
        if(data.plant_type !== null) this.view.setUint8(this.offsetByAttribute(x,y,"plant_type"), data.plant_type);
        if(data.growth_lvl !== null) this.view.setUint8(this.offsetByAttribute(x,y,"growth_lvl"), data.growth_lvl);
        if(data.water_diffusion_rate !== null) this.view.setUint8(this.offsetByAttribute(x,y,"water_diffusion_rate"), data.water_diffusion_rate);
    }

    updateWeather(seed = Math.random()) {
        // Update the global weather instance
        this.weather = new Weather({ seed: seed });

        for (let x = 0; x < this.height; x++) {
            for (let y = 0; y < this.width; y++) {
                // Generate new weather values for each cell
                const tileWeather = new TileWeather(x, y, this.weather).generate();

                // Update weather values in the byte array
                const cell = this.getCell(x, y);
                cell.sun_lvl = tileWeather.sun;
                cell.rain_lvl += tileWeather.rain;
                this.setCell(x, y, cell);
            }
        }
    }

    render(tile_size: number) {
        let rendered: Phaser.GameObjects.Rectangle[] = [];
        for (let x = 0; x < this.height; x++) {
            for (let y = 0; y < this.width; y++) {
                const cell = this.getCell(x, y);
                const color = Phaser.Display.Color.GetColor(
                    cell.sun_lvl * 2.55,
                    cell.rain_lvl * 2.55,
                    0,
                );
                let rect = this.scene.add.rectangle(
                    cell.x * tile_size,
                    cell.y * tile_size,
                    tile_size,
                    tile_size,
                    color,
                    0.5,
                ).setOrigin(0);

                rendered.push(rect);
            }
        }

        return rendered;
    }

    getCellOffset(x, y) {
        return (x * this.bytesPerCell * this.height) + (y * this.bytesPerCell);
    }

    getCellAt(phaserX, phaserY, tile_size) {
        if (!(phaserX >= this.scene.width || phaserY >= this.scene.height)) {
            const bufferX = Math.floor(phaserX / tile_size);
            const bufferY = Math.floor(phaserY / tile_size);
            return this.getCellOffset(bufferX, bufferY);
        }
        console.log("couldn't get cell: out of bounds");
        return false;
    }

    isAdjacentCell(cell1Offset, cell2Offset) {
        const cell1X = this.view.getInt32(cell1Offset, true);
        const cell1Y = this.view.getInt32(cell1Offset + 4, true);
        const cell2X = this.view.getInt32(cell2Offset, true);
        const cell2Y = this.view.getInt32(cell2Offset + 4, true);

        // Check if cells are within one unit in both x and y coordinates
        const deltaX = Math.abs(cell1X - cell2X);
        const deltaY = Math.abs(cell1Y - cell2Y);

        return deltaX <= 1 && deltaY <= 1; // Includes horizontal, vertical, and diagonal neighbors
    }


    copyAttributesToArray(data) {
        let array: object[] = [];

        for (let x = 0; x < this.height; x++) {
            for (let y = 0; y < this.width; y++) {
                let cell = this.getCell(x, y);
                let attributesToArray = { x: x, y: y };
                for (let attribute of data) {
                    attributesToArray[attribute] = cell[attribute];
                }
                array.push(attributesToArray);
            }
        }
        return array;
    }

    setStateFromArray(array) {
        for (let cellData of array) {
            this.setCell(cellData.x, cellData.y, cellData);
        }
    }
}