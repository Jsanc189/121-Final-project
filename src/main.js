import { Game } from "phaser";
import { Load } from "./Scenes/Load.js";
import { PlayScene } from "./Scenes/Play.js";
import { MenuScene } from "./Scenes/Menu.js";
import { SavesScene } from "./Scenes/Saves.js";
import { LanguagesScene } from "./Scenes/Languages.js";

// game config
let config = {
  parent: "phaser-game",
  type: Phaser.AUTO,
  render: {
    pixelArt: true, // prevent pixel art from getting blurred when scaled
  },
  width: window.innerWidth,
  height: window.innerHeight,
  scene: [Load, MenuScene, LanguagesScene, SavesScene, PlayScene],
};

const game = new Game(config);

//grid to hold the Play scene's grid of tiles
game.saveFiles = null;
game.MAX_SAVES = 10;
