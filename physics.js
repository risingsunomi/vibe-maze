export class Physics {
    constructor() {
      this.gravity = 20;
      this.jumpSpeed = 8;
      this.groundHeight = 0;
    }
    update(player, delta) {
      if (!player.onGround) player.velocity.y -= this.gravity * delta;
      player.position.y += player.velocity.y * delta;
      if (player.position.y <= this.groundHeight) {
        player.position.y = this.groundHeight;
        player.onGround = true;
        player.velocity.y = 0;
      } else {
        player.onGround = false;
      }
      if (player.keys.space && player.onGround) {
        player.velocity.y = this.jumpSpeed;
        player.onGround = false;
      }
    }
  }
  export const physics = new Physics();
  