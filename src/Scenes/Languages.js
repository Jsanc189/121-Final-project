import "phaser";
import { languages } from "../Scripts/Text.js";
import * as UIX from "../Scripts/UIX.js";

export class LanguagesScene extends Phaser.Scene {
  constructor() {
    super("languagesScene");
  }

  create() {
    // back to previous scene
    let fontSizePX = "30px";
    let fontColor1 = "#c2df48";

    this.backButton = UIX.makeMenuButton(
        this,
        80,
        30,
        languages[this.game.globals.language]["back"],
        { fontSize: fontSizePX, fill: fontColor1 },
    );
    this.backButton.on("pointerup", () => {
      this.scene.run("menuScene");
      this.scene.stop();
    });

        // english button
        this.engButton = UIX.makeMenuButton(
            this,
            this.game.config.width / 2,
            (this.game.config.height - 600),
            languages[this.game.globals.language]["eng"],
            { fontSize: fontSizePX, fill: fontColor1 }
        )
        this.engButton.on('pointerup', () => {
            // set language to english
            this.game.globals.language = "eng";
            this.updateLanguage();
        });

        // swedish button
        this.sweButton = UIX.makeMenuButton(
            this,
            this.game.config.width / 2,
            (this.game.config.height - 550),
            languages[this.game.globals.language]["swe"],
            { fontSize: fontSizePX, fill: fontColor1 }
        )
        this.sweButton.on('pointerup', () => {
            // set language to swedish
            this.game.globals.language = "swe";
            this.updateLanguage();
        });

        // hebrew button
        this.hebrButton = UIX.makeMenuButton(
            this,
            this.game.config.width / 2,
            (this.game.config.height - 500),
            languages[this.game.globals.language]["hebr"],
            { fontSize: fontSizePX, fill: fontColor1 }
        )
        this.hebrButton.on('pointerup', () => {
            // set language to hebrew
            this.game.globals.language = "hebr";
            this.updateLanguage();
        });

        // chinese button
        this.chiButton = UIX.makeMenuButton(
            this,
            this.game.config.width / 2,
            (this.game.config.height - 450),
            languages[this.game.globals.language]["chi"],
            { fontSize: fontSizePX, fill: fontColor1 }
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
  }
  