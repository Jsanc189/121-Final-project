export class MenuScene extends Phaser.Scene {
    constructor() {
       super("menuScene");
    }

    create() {
        // I want to make a title and center it on the screen with just built in fonts and dark green
        this.title = this.add.text(this.game.config.width / 2, this.game.config.height / 3, "Plant Harvest", { fontSize: '80px', fill: 'darkgreen' }).setOrigin(0.5, 0.5);

        console.log("in the menu scene");

        // I want to add a button to select new game
         this.newGameButton = this.add.text(
            this.game.config.width / 2, 
            this.game.config.height / 2, 
            "New Game", 
            { fontSize: '40px', fill: 'darkgreen' }).setOrigin(0.5, 0.5);
        this.newGameButton.setInteractive();
        this.newGameButton.on('pointerover', () => { this.newGameButton.setStyle({ fill: 'green' }) });
        this.newGameButton.on('pointerout', () => { this.newGameButton.setStyle({ fill: 'darkgreen' }) });
        this.newGameButton.on('pointerup', () => { this.scene.start('playScene') });




        

    }

    update() {

    }



}