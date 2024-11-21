export class Player extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, texture, frame, tileSize){
    super(scene, x, y, texture, frame);
    scene.add.existing(this);
    this.ableToMove = true
    this.movementSpeed = tileSize
  }

  update(){
    if(this.ableToMove){
      let moved = false;
      if(this.scene.leftKey.isDown && this.x > 40) {
        this.x -= this.movementSpeed;
        moved = true;
      }
      if(this.scene.rightKey.isDown && this.x < this.scene.width-40) {
        this.x += this.movementSpeed;
        moved = true;
      }
      if(this.scene.upKey.isDown && this.y > 40) {
        this.y -= this.movementSpeed;
        moved = true;
      }
      if(this.scene.downKey.isDown && this.y < this.scene.height-40) {
        this.y += this.movementSpeed;
        moved = true;
      }

      //if(moved){
      //  this.ableToMove = false;
      //  this.time.delayedCall(500, () => {
      //    this.ableToMove = true;
      //  });
      //}
    }
  }
}