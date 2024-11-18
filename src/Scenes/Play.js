export class PlayScene extends Phaser.Scene {
    constructor() {
       super("playScene");
    }


    create() {
        //set game condition
        this.gameOver = false;
        this.endOfDay = false;
        this.plantOneCount = 0;
        this.plantTwoCount = 0;
        this.plantThreeCount = 0;

        const dayButton = this.add.text(
            100, 
            100, 
            'End Day', 
            { fontSize: '28px', fill: '#0F0' 
            }).setInteractive();

        dayButton.on('pointerover', () => {
            console.log('pointerOver!')
        });
        dayButton.on('pointerup', () => {
            this.endOfDay = true;
       
        });


    }

    update() {
        if (!this.gameOver) {
            //console.log("Game is running...");

            //check if end conditions are met
            this.checkWin();

            if(this.endOfDay) {
                console.log("End of day...");
                this.plantOneCount += 1;
                this.plantTwoCount += 1;
                this.plantThreeCount += 1;
                this.endOfDay = false;
            } else {
                console.log("Day is running...");
                //this.endOfDay = true;
            };

        } else {
            console.log("Game Over");
            this.scene.start("playScene");

        }
    }

    checkWin() {
        if(this.plantOneCount >= 10 && this.plantTwoCount >= 10 && this.plantThreeCount >= 10) {
            console.log("You win!");
            this.gameOver = true;
        }
    }

}
