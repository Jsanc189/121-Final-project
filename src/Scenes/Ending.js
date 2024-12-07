import "phaser";

export class PlayScene extends Phaser.Scene {
    constructor() {
        super('EndingScene');
    }


    create() {
        this.add.text(
            this.game.config.width / 2,
            this.game.config.height / 3,
            "You win!",
            { fontSize: "100px", fill: "#c2df48" },
        ).setOrigin(0.5, 0.5);

        this.restartButton = this.makebutton(
            this.game.config.width / 2,
            this.game.config.height / 3 + 60,
            "Restart",
            { fontSize: '40px', fill: '#c2df48' }
        )
        this.restartButton.on('pointerup', () => {
            this.scene.start('PlayScene')
        });

        this.mainMenuButton = this.makebutton(
            this.game.config.width / 2,
            this.game.config.height / 3 + 120,
            "Main Menu",
            { fontSize: '40px', fill: '#c2df48' }
        )
        this.mainMenuButton.on('pointerup', () => {
            this.scene.start('MenuScene')
        });

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

