export class MenuScene extends Phaser.Scene {
    private title: Phaser.GameObjects.Text;
    private newGameButton: Phaser.GameObjects.Text
    private loadButton: Phaser.GameObjects.Text
    
    constructor() {
        super("menuScene");
    }

    create() {
        // I want to make a title and center it on the screen with just built in fonts and dark green
        this.title = this.add.text(
            this.game.width / 2,
            this.game.height / 3,
            "Plant Harvest",
            { fontSize: "80px", color: "darkgreen" },
        ).setOrigin(0.5, 0.5);

        // new game button
        this.newGameButton = this.makeButton(
            this.game.width / 2,
            this.game.height / 2,
            "New Game",
            { fontSize: "40px", color: "darkgreen" }
        )
        this.newGameButton.on("pointerup", () => {
            this.scene.start("playScene", {load: false, load_index: -1});
        });

        //load game button
        this.loadButton = this.makeButton(
            this.game.width / 2,
            (this.game.height / 2) + 35,
            "Load Game",
            { fontSize: '30px', color: 'darkgreen' }
        )
        this.loadButton.on('pointerup', () => {
            this.scene.start("savesScene", {mode: "load", scene: this});
        });
    }

    makeButton(x: number, y: number, text: string, style: object, colors=[ { fill: "green" }, { fill: 'darkgreen' } ]) {
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
