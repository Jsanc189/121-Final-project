import "phaser";
import { languages } from "../Scripts/Text.js"
import * as UIX from "../Scripts/UIX.js";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("menuScene");
  }

  create() {
    let fontSize = this.game.config.width / 10;
    let fontColor1 = "#c2df48";

    // I want to make a title and center it on the screen with just built in fonts and dark green
    this.title = this.add.text(
      this.game.config.width / 2,
      this.game.config.height / 3,
      languages[this.game.globals.language]["game_name"],
      { fontSize: `${fontSize}px`, fill: fontColor1 },
    ).setOrigin(0.5, 0.5);

    // I want to add a button to select new game
    this.newGameButton = UIX.makeMenuButton(
        this,
        this.game.config.width / 2,
        this.game.config.height / 2,
        languages[this.game.globals.language]["new_game"],
        { fontSize: `${fontSize / 3}px`, fill: fontColor1 }
    )
    this.newGameButton.on("pointerup", () => {
      this.scene.start("playScene", { load: false, load_index: -1 });
    });

    //load game button
    this.loadButton = UIX.makeMenuButton(
        this,
        this.game.config.width / 2,
        (this.game.config.height / 2) + (this.game.config.height / 10),
        languages[this.game.globals.language]["load_game"],
        { fontSize: `${fontSize / 3}px`, fill: fontColor1 }
    )
    this.loadButton.on('pointerup', () => {
        this.scene.start("savesScene", {mode: "load", scene: this});
    });

    // select language button
    this.languagesButton = UIX.makeMenuButton(
        this,
        this.game.config.width / 2,
        (this.game.config.height / 2) + (this.game.config.height / 10) * 2,
        languages[this.game.globals.language]["select_lang"],
        { fontSize: `${fontSize / 3}px`, fill: fontColor1 }
    )
    this.languagesButton.on('pointerup', () => {
        this.scene.start("languagesScene", {mode: "load", scene: this});
    });
  }
}
