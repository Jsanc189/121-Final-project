import "phaser";
export class Player extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, texture, frame, tileSize) {
    super(scene, x, y, texture, frame);
    scene.add.existing(this);
    this.ableToMove = true;
    this.movementSpeed = tileSize;
  }

  create() {
    this.setDepth(10);
  }

  moveLeft() {
    if (this.x > 40) {
        this.x -= this.movementSpeed;
      }
  }

  moveRight(scene) {
    if (this.x < scene.width - 40) {
        this.x += this.movementSpeed;
      }
  }

  moveUp() {
    if (this.y > 40) {
        this.y -= this.movementSpeed;
      }
  }

  moveDown(scene) {
    if (this.y < scene.height - 40) {
        this.y += this.movementSpeed;
      }
  }
}
