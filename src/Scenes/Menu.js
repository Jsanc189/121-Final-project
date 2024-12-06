import { eng_strings, swe_strings, chi_strings, hebr_strings } from "../Scripts/Text.js"

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("menuScene");
  }

  create() {
    // I want to make a title and center it on the screen with just built in fonts and dark green
    this.title = this.add.text(
      this.game.config.width / 2,
      this.game.config.height / 3,
      "Plant Harvest",
      { fontSize: "80px", fill: "darkgreen" },
    ).setOrigin(0.5, 0.5);

    console.log("in the menu scene");

    // I want to add a button to select new game
    this.newGameButton = this.makeButton(
      this.game.config.width / 2,
      this.game.config.height / 2,
      "New Game",
      { fontSize: "40px", fill: "darkgreen" }
    )
    this.newGameButton.on("pointerup", () => {
      this.scene.start("playScene", {load: false, load_index: -1});
    });

    //load game button
    this.loadButton = this.makeButton(
      this.game.config.width / 2,
      (this.game.config.height / 2) + 35,
      "Load Game",
      { fontSize: '30px', fill: 'darkgreen' }
    )
    this.loadButton.on('pointerup', () => {
      this.scene.start("savesScene", {mode: "load", scene: this});
    });

    // select language button
    this.languagesButton = this.makeButton(
      this.game.config.width / 2,
      (this.game.config.height / 2) + 150,
      "Select Language",
      { fontSize: '30px', fill: 'darkgreen' }
    )
    this.languagesButton.on('pointerup', () => {
      this.scene.start("languagesScene", {mode: "load", scene: this});
    });
  }

  makeButton(x, y, text, style, colors=[ { fill: "green" }, { fill: 'darkgreen' } ]) {
    const button = this.add.text(x, y, text, style).setOrigin(0.5, 0.5);
    button.setInteractive();
    button.on("pointerover", () => {
      button.setStyle(colors[0]);
    });
    button.on("pointerout", () => {
      button.setStyle(colors[1]);
    });
    return button;
  }
}
