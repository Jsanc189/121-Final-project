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
      if(this.scene.leftKey && this.x > 40) {
        this.x -= movementSpeed;
        moved = true;
      }
      if(this.scene.rightKey && this.x < this.scene.GRID_WIDTH-40) {
        this.x += movementSpeed;
        moved = true;
      }
      if(this.scene.upKey && this.y > 40) {
        this.y -= movementSpeed;
        moved = true;
      }
      if(this.scene.downKey && this.y < this.scene.GRID_HEIGHT-40) {
        this.y += movementSpeed;
        moved = true;
      }

      if(moved){
        this.ableToMove = false;
        this.time.delayedCall(500, () => {
          this.ableToMove = true;
        });
      }
    }
  }
}