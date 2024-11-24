import { Game, } from "phaser";
import { Load } from "./Scenes/Load.js";
import { blankScene } from "./Scenes/Scene.js";
import { PlayScene } from "./Scenes/Play.js";
import { MenuScene } from "./Scenes/Menu.js";

// game config
let config = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    render: {
        pixelArt: true  // prevent pixel art from getting blurred when scaled
    },
    width: 800,
    height: 900,
    scene: [Load, MenuScene, PlayScene]
}



const game = new Game(config);
