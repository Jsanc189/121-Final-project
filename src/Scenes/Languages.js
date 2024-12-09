import "phaser";
import { languages } from "../Scripts/Text.js"

export class LanguagesScene extends Phaser.Scene {
    constructor() {
      super("languagesScene");
    }
  
    create() {
        // back to previous scene
      this.backButton = this.makeButton(80, 50, languages[this.game.globals.language]["back"], {fontSize: "50px", fill: "#c2df48"});
      this.backButton.on('pointerup', () => {
          this.scene.run("menuScene");
          this.scene.stop();
      });

    // english button
    this.engButton = this.makeButton(
      this.game.config.width / 2,
      (this.game.config.height - 600),
      languages[this.game.globals.language]["eng"],
      { fontSize: '50px', fill: '#c2df48' }
    )
    this.engButton.on('pointerup', () => {
      // set language to english
      this.game.globals.language = "eng";
      this.updateLanguage();
    });

    // swedish button
    this.sweButton = this.makeButton(
        this.game.config.width / 2,
        (this.game.config.height - 550),
        languages[this.game.globals.language]["swe"],
        { fontSize: '50px', fill: '#c2df48' }
      )
      this.sweButton.on('pointerup', () => {
        // set language to swedish
        this.game.globals.language = "swe";
        this.updateLanguage();
      });

      // hebrew button
    this.hebrButton = this.makeButton(
        this.game.config.width / 2,
        (this.game.config.height - 500),
        languages[this.game.globals.language]["hebr"],
        { fontSize: '50px', fill: '#c2df48' }
      )
      this.hebrButton.on('pointerup', () => {
        // set language to hebrew
        this.game.globals.language = "hebr";
        this.updateLanguage();
      });

      // chinese button
    this.chiButton = this.makeButton(
        this.game.config.width / 2,
        (this.game.config.height - 450),
        languages[this.game.globals.language]["chi"],
        { fontSize: '50px', fill: '#c2df48' }
      )
      this.chiButton.on('pointerup', () => {
        // set language to chinese
        this.game.globals.language = "chi";
        this.updateLanguage();
      });
    }

    // only made it for this scene b/c it needs to update on click, other scenes update automatically
    updateLanguage() {
        this.backButton.setText(languages[this.game.globals.language]["back"]);
        this.engButton.setText(languages[this.game.globals.language]["eng"]);
        this.sweButton.setText(languages[this.game.globals.language]["swe"]);
        this.hebrButton.setText(languages[this.game.globals.language]["hebr"]);
        this.chiButton.setText(languages[this.game.globals.language]["chi"]);
    }
  
    makeButton(x, y, text, style, colors=[ { fill: "#b18b1c" }, { fill: '#c2df48' } ]) {
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
  