export class SavesScene extends Phaser.Scene { //file name match class?
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
      this.backButton = this.makeButton(80, 30, "Back", {fontSize: "50px", fill: "darkgreen"});
      this.backButton.on('pointerup', () => {
          this.scene.run(this.previousScene);
          this.scene.stop();
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

      if(this.mode === "load"){
        // toggle for deletions
        this.deleting = false;
        const lastMode = this.mode;
        this.deleteToggle = this.add.rectangle(
          80, 100, 50, 50, 0xFFFFFF)
          .setOrigin(0.5);
        const deleteText = this.add.text(this.deleteToggle.x, this.deleteToggle.y + 50, "delete saves", {
          fontSize: 16,
          color: "#3CAD24",
        }).setOrigin(0.5);
        this.deleteToggle.setInteractive();
        this.deleteToggle.on("pointerover", () => {
          this.deleteToggle.setFillStyle(0x3CAD24);
        });
        this.deleteToggle.on("pointerout", () => {
          if(!this.deleting) this.deleteToggle.setFillStyle(0xFFFFFF);
        });
        this.deleteToggle.on("pointerdown", () => {
          this.deleteToggle.setFillStyle(0x3CAD24);
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
            deleteText.setStyle({color: "#3CAD24"});
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
                const proceed = window.confirm("This will overwrite your saved data. Proceed?");
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
  