import { Game } from "phaser";
import { Load } from "./Scenes/Load.js";
import { PlayScene } from "./Scenes/Play.js";
import { MenuScene } from "./Scenes/Menu.js";
import { SavesScene } from "./Scenes/Saves.js";

//see: TypeScript module augmentation + https://stackoverflow.com/questions/44557308/adding-properties-to-an-existing-type-with-typescript
declare module "phaser" {
    interface Game {
        saveFiles: any[] | null,
        MAX_SAVES: 10,
        width: number,
        height: number,
        globals
    }
}

// game config
let config = {
  parent: "phaser-game",
  type: Phaser.AUTO,
  render: {
    pixelArt: true, // prevent pixel art from getting blurred when scaled
  },
  width: 900,
  height: 900,
  scene: [Load, MenuScene, SavesScene, PlayScene],
};

const game = new Game(config);

game.width = config.width;
game.height = config.height;
