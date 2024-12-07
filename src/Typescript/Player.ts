export class Player extends Phaser.GameObjects.Sprite {
    private ableToMove: boolean = true;
    private movementSpeed: number;

  constructor(scene: Phaser.Scene, x: number, y: number, texture, frame, tileSize: number) {
    super(scene, x, y, texture, frame);
    scene.add.existing(this);
    this.ableToMove = true;
    this.movementSpeed = tileSize;
  }

  update(scene) {
    this.setDepth(10);

    if (this.ableToMove) {
      let moved = false;
      if (scene.leftKey.isDown && this.x > 40) {
        this.x -= this.movementSpeed;
        moved = true;
      }
      if (scene.rightKey.isDown && this.x < scene.width - 40) {
        this.x += this.movementSpeed;
        moved = true;
      }
      if (scene.upKey.isDown && this.y > 40) {
        this.y -= this.movementSpeed;
        moved = true;
      }
      if (scene.downKey.isDown && this.y < scene.height - 40) {
        this.y += this.movementSpeed;
        moved = true;
      }

      if (moved) {
        this.ableToMove = false;
        scene.time.delayedCall(200, () => {
          this.ableToMove = true;
        });
      }
    }
  }
}
