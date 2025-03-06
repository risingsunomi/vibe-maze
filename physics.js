// physics.js

export class Physics {
    constructor() {
        this.gravity = 20; // Acceleration due to gravity (units per second squared)
        this.jumpSpeed = 8; // Initial upward velocity when jumping
        this.groundHeight = 0; // Ground level
    }

    // Update player's vertical position and velocity
    update(player, delta) {
        // Apply gravity if not on ground
        if (!player.onGround) {
            player.velocity.y -= this.gravity * delta;
        }

        // Update vertical position
        player.position.y += player.velocity.y * delta;

        // Check collision with ground
        if (player.position.y <= this.groundHeight) {
            player.position.y = this.groundHeight;
            player.onGround = true;
            player.velocity.y = 0;
        } else {
            player.onGround = false;
        }

        // Handle jumping
        if (player.keys.space && player.onGround) {
            player.velocity.y = this.jumpSpeed;
            player.onGround = false;
        }
    }
}

// Export an instance of Physics
export const physics = new Physics();