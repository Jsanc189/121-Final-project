import { languages } from "../Scripts/Text.js"

export class LanguagesScene extends Phaser.Scene {
    constructor() {
      super("languagesScene");
    }
  
    init() {

    }
  
    create() {
        // back to previous scene
      this.backButton = this.makeButton(80, 30, "Back", {fontSize: "50px", fill: "darkgreen"});
      this.backButton.on('pointerup', () => {
          this.scene.run("menuScene");
          this.scene.stop();
      });

    // english button
    this.engButton = this.makeButton(
      this.game.config.width / 2,
      (this.game.config.height - 600),
      "English",
      { fontSize: '30px', fill: 'darkgreen' }
    )
    this.engButton.on('pointerup', () => {
      // set language to english
      this.game.globals.language = "eng";
    });

    // swedish button
    this.sweButton = this.makeButton(
        this.game.config.width / 2,
        (this.game.config.height - 550),
        "Swedish",
        { fontSize: '30px', fill: 'darkgreen' }
      )
      this.sweButton.on('pointerup', () => {
        // set language to swedish
        this.game.globals.language = "swe";
      });

      // hebrew button
    this.hebrButton = this.makeButton(
        this.game.config.width / 2,
        (this.game.config.height - 500),
        "Hebrew",
        { fontSize: '30px', fill: 'darkgreen' }
      )
      this.hebrButton.on('pointerup', () => {
        // set language to hebrew
        this.game.globals.language = "hebr";
      });

      // chinese button
    this.chiButton = this.makeButton(
        this.game.config.width / 2,
        (this.game.config.height - 450),
        "Chinese",
        { fontSize: '30px', fill: 'darkgreen' }
      )
      this.chiButton.on('pointerup', () => {
        // set language to chinese
        this.game.globals.language = "eng";
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
  