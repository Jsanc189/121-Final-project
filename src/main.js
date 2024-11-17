import { Game, } from "phaser";
import { Load } from "./Scenes/Load.js";
import { blankScene } from "./Scenes/Scene.js";

// game config
let config = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    render: {
        pixelArt: true  // prevent pixel art from getting blurred when scaled
    },
    width: 1280,
    height: 800,
    scene: [Load, blankScene]
}

const game = new Game(config);
