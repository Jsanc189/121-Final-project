import { eng_strings, swe_strings, chi_strings, hebr_strings } from "../Scripts/Text.js"

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
          this.scene.run(this.previousScene);
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
  