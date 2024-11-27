import { Game, } from "phaser";
import { Load } from "./Scenes/Load.js";
import { PlayScene } from "./Scenes/Play.js";
import { MenuScene } from "./Scenes/Menu.js";

// game config
let config = {
    parent: 'phaser-game',
    type: Phaser.AUTO,
    render: {
        pixelArt: true  // prevent pixel art from getting blurred when scaled
    },
    width: 800,
    height: 900,
    scene: [Load, MenuScene, PlayScene]
}

const game = new Game(config);

//grid to hold the Play scene's grid of tiles
game.saveFile1 = null;