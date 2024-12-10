import "phaser";
import { languages } from "../Scripts/Text.js";
import * as UIX from "../Scripts/UIX.js";

export class EndingScene extends Phaser.Scene {
    constructor() {
        super('EndingScene');
    }


    create() {
        this.add.text(
            this.game.config.width / 2,
            this.game.config.height / 3,
            languages[this.game.globals.language]["you_win"],
            { fontSize: "100px", fill: "#c2df48" },
        ).setOrigin(0.5, 0.5);

        this.restartButton = UIX.makeMenuButton(
            this,
            this.game.config.width / 2,
            this.game.config.height / 3 + 60,
            languages[this.game.globals.language]["new_game"],
            { fontSize: '40px', fill: '#c2df48' }
        )
        this.restartButton.on('pointerup', () => {
            this.scene.start('playScene')
        });

        this.mainMenuButton = UIX.makeMenuButton(
            this,
            this.game.config.width / 2,
            this.game.config.height / 3 + 120,
            languages[this.game.globals.language]["main_menu"],
            { fontSize: '40px', fill: '#c2df48' }
        )
        this.mainMenuButton.on('pointerup', () => {
            this.scene.start('menuScene')
        });

    }
}

