import Phaser from 'phaser';

export class Projectile extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, direction) {
        super(scene, x, y, texture);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setScale(2);

        this.speed = 250; // Pixels per second
        this.distance = 500; // Total distance to travel
        this.direction = direction; // 1 for right, -1 for left
        this.startX = x;

        // Set velocity based on direction
        this.setVelocityX(this.speed * this.direction);

        // Disable gravity
        this.body.allowGravity = false;

        // Set size and origin if needed
        this.setCircle(6, 3, 2); // Adjust offsetX as needed
        this.setOrigin(0.5, 0.5);

        // Play projectile animation
        this.play('projectile_anim');
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        console.log(`Projectile at (${this.x}, ${this.y}) moving with velocityX: ${this.body.velocity.x}`);

        // Calculate distance traveled
        if (Math.abs(this.x - this.startX) >= this.distance) {
            console.log(`Projectile destroyed after traveling ${this.distance}px`);
            this.destroy();
        }
    }
}