import "phaser";
import { languages } from "../Scripts/Text.js";
import * as UIX from "../Scripts/UIX.js";

export class SavesScene extends Phaser.Scene {
    constructor() {
      super("savesScene");
    }

    init(data){
      this.mode = data.mode;  // "save" or "load"
      this.saveData = data.saveData;
      this.previousScene = data.scene;
      this.MAX_SAVES = this.game.MAX_SAVES;
    }
  
    create() {
      // back to previous scene
        this.backButton = UIX.makeMenuButton(this, 80, 30, languages[this.game.globals.language]["back"], {fontSize: "30px", fill: "#c2df48"});
        this.backButton.on('pointerup', () => {
            this.scene.run(this.previousScene);
            this.scene.stop();
        });

        // ten empty slots
        this.buttons = [];
        this.emptyText = `[ ${languages[this.game.globals.language]["empty_save"]} ]`;
        const WIDTH = this.game.config.width;
        const HEIGHT = this.game.config.height - 100;

        for (let i = 0; i < this.MAX_SAVES; i++) {
            const button = UIX.makeMenuButton(
                this,
                WIDTH / 2, 
                HEIGHT / this.MAX_SAVES + i * HEIGHT / this.MAX_SAVES,
                this.emptyText, 
                {fontSize: `${HEIGHT / 2 / this.MAX_SAVES}px`}
            );
            this.buttons.push(button);
        }
        
        // update text for saves
        this.savedData = localStorage.getItem('saveFiles');
        this.saveFiles = null;
        if(this.savedData) {
            this.saveFiles = JSON.parse(this.savedData);

            // replace empty slot text with save indices
            if (this.saveFiles.length > 0) {
            for (let i = 0; i < this.saveFiles.length; i++) {
                if(this.saveFiles[i]) this.buttons[i].text = `${languages[this.game.globals.language]["save_noun"]} ` + String.fromCharCode(65 + i);
            }
            }
        }

        this.buttonHandler();

        if(this.mode === "load"){
            // toggle for deletions
            this.deleting = false;
            const lastMode = this.mode;
            this.deleteToggle = this.add.rectangle(80, 100, 50, 50, 0xFFFFFF).setOrigin(0.5);
            const deleteText = this.add.text(this.deleteToggle.x, this.deleteToggle.y + 50, languages[this.game.globals.language]["delete_saves"], {
                fontSize: 16,
                color: "#c2df48",
            }).setOrigin(0.5);
            this.deleteToggle.setInteractive();
            this.deleteToggle.on("pointerover", () => {
                this.deleteToggle.setFillStyle(0xc2df48);
            });
            this.deleteToggle.on("pointerout", () => {
                if(!this.deleting) this.deleteToggle.setFillStyle(0xFFFFFF);
            });
            this.deleteToggle.on("pointerdown", () => {
                this.deleteToggle.setFillStyle(0xc2df48);
            });
            this.deleteToggle.on("pointerup", () => {
                this.deleting = !this.deleting;
                if(this.deleting){ 
                    this.deleteToggle.setFillStyle(0xFF0000);
                    deleteText.setStyle({color: "red"});
                    this.mode = "delete";
                }
                else {
                    this.deleteToggle.setFillStyle(0xFFFFFF);
                    deleteText.setStyle({color: "#c2df48"});
                    this.mode = lastMode;
                }
            });
        }
    }
    
    buttonHandler(){
      for(let i = 0; i < this.buttons.length; i++){
        this.buttons[i].on('pointerup', () => {
          switch(this.mode){
            case "load":
              if(this.buttons[i].text === this.emptyText){
                console.log("Empty slot, no game to load!");
              } else {
                this.scene.start('playScene', {load: true, load_index: i});
              }
              break;
            case "save":
              if(this.buttons[i].text === this.emptyText){
                this.addSave(i);
              } else {
                const proceed = window.confirm(languages[this.game.globals.language]["overwrite_saves"]);
                if(proceed === true) this.addSave(i);
              }
              break;
            case "delete":
              if(this.buttons[i].text === this.emptyText){
                console.log("Empty slot, nothing to delete!");
              } else {
                console.log("deleting save and index " + i); 
                this.buttons[i].text = this.emptyText;
                this.saveFiles[i] = null; 
                localStorage.setItem('saveFiles', JSON.stringify(this.saveFiles));
              }
              break;
            default:
              throw new Error(`Unknown action: ${this.mode}`);
          }
        });
      }
    }

    addSave(i){
      this.buttons[i].text = `${languages[this.game.globals.language]["save_noun"]} ` + (i + 1);
      this.saveFiles[i] = this.saveData;
      localStorage.setItem('saveFiles', JSON.stringify(this.saveFiles));

      this.scene.start('playScene', {load: true, load_index: i});
      this.scene.stop();
    }
}
  