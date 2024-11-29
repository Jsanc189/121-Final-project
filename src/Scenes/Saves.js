export class SavesScene extends Phaser.Scene {
    constructor() {
      super("savesScene");
    }

    init(data){
      this.mode = data.mode;  // "save" or "load"
      this.saveData = data.saveData;
      this.previousScene = data.scene;
      this.MAX_SAVES = 10;
    }
  
    create() {
      // back to previous scene
      this.backButton = this.makeButton(80, 30, "Back", {fontSize: "50px", fill: "darkgreen"});
      this.backButton.on('pointerup', () => {
          this.scene.run(this.previousScene);
      });

      // ten empty slots
      this.buttons = [];
      this.emptyText = "[ empty slot ]";
      const WIDTH = this.game.config.width;
      const HEIGHT = this.game.config.height - 100;

      for (let i = 0; i < this.MAX_SAVES; i++) {
        const button = this.makeButton(
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
            if(this.saveFiles[i]) this.buttons[i].text = "Save " + String.fromCharCode(65 + i);
          }
        }
      }

      this.buttonHandler();
    }
    
    buttonHandler(){
      for(let i = 0; i < this.buttons.length; i++){
        this.buttons[i].on('pointerup', () => {
          if(this.buttons[i].text === this.emptyText){
            if(this.mode === "load") console.log("Empty slot, no game to load!")  
            if(this.mode === "save"){
              this.addSave(i);
            }  
          } else {
            if(this.mode === "load") this.scene.start('playScene', {load: true, load_index: i});  
            if(this.mode === "save"){
              const proceed = window.confirm("This will overwrite your saved data. Proceed?");
              if(proceed === true) this.addSave(i);
            }
          }
          
        });
      }
    }

    addSave(i){
      this.buttons[i].text = "Save " + (i + 1);
      this.saveFiles[i] = this.saveData;
      localStorage.setItem('saveFiles', JSON.stringify(this.saveFiles));

      this.scene.start('playScene', {load: true, load_index: i});
      this.scene.stop();
    }

    makeButton(x, y, text, style, colors=[ { fill: "green" }, { fill: 'darkgreen' } ]) {
      const button = this.add.text(x, y, text, style)
        .setOrigin(0.5, 0.5)
        .setStyle(colors[1]);

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
  