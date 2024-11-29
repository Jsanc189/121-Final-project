export class SavesScene extends Phaser.Scene {
    constructor() {
      super("savesScene");
    }
  
    create() {
    //   this.title = this.add.text(
    //     this.game.config.width / 2,
    //     this.game.config.height / 3,
    //     "Plant Harvest",
    //     { fontSize: "80px", fill: "darkgreen" },
    //   ).setOrigin(0.5, 0.5);
  
    //   console.log("in the saves scene");
  
      // create buttons for saves
      this.savedData = localStorage.getItem('saveFiles');
      this.parsedData = null;

      if(this.savedData) {
        this.parsedData = JSON.parse(this.savedData);
        console.log(this.parsedData);

        if (this.parsedData.length > 0) {
      for (let i = 0; i < this.parsedData.length; i++) {
        const button = this.makeButton(
            400 + (this.parsedData.length), 
            50 + (this.parsedData.length),
            "Save " + (i + 1), 
            {fontSize: "50px"}
        );

        button.on('pointerup', () => {
            console.log(i);
            this.scene.start('playScene', {load: true, data_index: i});  
            }  
        );

      }
    } else {
        this.add.text(400, 100, "No saved games!", {fontSize: "40px"}).setOrigin(0.5, 0.5);
    }
    }

    this.backButton = this.makeButton(80, 30, "Menu", {fontSize: "50px", fill: "darkgreen"});
    this.backButton.on('pointerup', () => {
        this.scene.start("menuScene");
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
  