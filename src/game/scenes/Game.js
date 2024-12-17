import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { GAME_SETTINGS } from '../Config';

export class Game extends Scene {
    constructor() {
        super('Game');
        this.playerHealth = 3; // Initialize player health
        this.canDoubleJump = false; // Track if the player can double jump
    }

    preload() {
        // Load the assets for the game - Replace with your own assets
        this.load.setPath('assets');
        // this.load.image('player', 'test_assets/player.png');
        this.load.image('test_tiles', 'test_assets/test_tiles_mod.png');
        this.load.tilemapTiledJSON('test_map', 'levels/test_map.json');

        this.load.atlas('player', 'characters/fox_spritesheet.png', 'characters/fox_spritesheet.json');
    }

    create() {
        this.cameras.main.setBackgroundColor(GAME_SETTINGS.backgroundColor);
        
        const map = this.make.tilemap({ key: 'test_map' });
        const tileset = map.addTilesetImage('test_tiles', 'test_tiles', GAME_SETTINGS.tileWidth, GAME_SETTINGS.tileHeight, GAME_SETTINGS.tileMargin, GAME_SETTINGS.tileSpacing);
        
        this.backgroundLayer = map.createLayer('Background', tileset, 0, 0);
        this.terrainLayer = map.createLayer('Terrain', tileset, 0, 0);
        this.platformsLayer = map.createLayer('Platforms', tileset, 0, 0);

        this.playerX = map.getObjectLayer('Player Spawn').objects[0].x;
        this.playerY = map.getObjectLayer('Player Spawn').objects[0].y;
        console.log(this.playerX, this.playerY);

        this.player = this.physics.add.sprite(this.playerX, this.playerY, 'player', 'idle_0');
        this.player.setCollideWorldBounds(true);
        this.player.setGravityY(GAME_SETTINGS.playerGravity); // Set gravity for the player

        this.player.setScale(3);

        // Set a circular hitbox for the player sprite
        this.player.body.setCircle(8, 9, 0); // Radius of the circle, x offset, y offset (adjust as needed)

        this.terrainLayer.setCollisionByProperty({ collides: true });
        this.platformsLayer.setCollisionByProperty({ collides: true });

        this.physics.add.collider(this.player, this.terrainLayer);
        this.physics.add.collider(this.player, this.platformsLayer);

        // Set the camera bounds to the size of the map
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        // Set the camera to follow the player
        this.cameras.main.startFollow(this.player);

        // Enable rounding of pixel values to prevent sub-pixel rendering
        this.cameras.main.roundPixels = true;

        // Set the camera zoom level
        this.cameras.main.setZoom(GAME_SETTINGS.cameraZoom); // Adjust the zoom level as needed

        // Fade in the scene
        this.cameras.main.fadeIn(GAME_SETTINGS.cameraFadeInDuration);

        EventBus.emit('current-scene-ready', this);
        EventBus.emit('scene-change', 'Game'); // Emit scene change event

        // Set up input handling
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys('W,A,S,D,H,R');

        this.anims.create({
            key: 'idle',
            frames: [
                { key: 'player', frame: 'idle_0' },
                { key: 'player', frame: 'idle_1' },
                { key: 'player', frame: 'idle_2' },
                { key: 'player', frame: 'idle_3' },
                { key: 'player', frame: 'idle_4' },
            ],
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'run',
            frames: [
                { key: 'player', frame: 'run_0' },
                { key: 'player', frame: 'run_1' },
                { key: 'player', frame: 'run_2' },
                { key: 'player', frame: 'run_3' },
                { key: 'player', frame: 'run_4' },
                { key: 'player', frame: 'run_5' },
                { key: 'player', frame: 'run_6' },
                { key: 'player', frame: 'run_7' },
            ],
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'jump',
            frames: [
                { key: 'player', frame: 'jump_0' },
                { key: 'player', frame: 'jump_1' },
                { key: 'player', frame: 'jump_2' },
                { key: 'player', frame: 'jump_3' },
                { key: 'player', frame: 'jump_4' },
                { key: 'player', frame: 'jump_5' },
                { key: 'player', frame: 'jump_6' },
                { key: 'player', frame: 'jump_7' },
                { key: 'player', frame: 'jump_8' },
                { key: 'player', frame: 'jump_9' },
                { key: 'player', frame: 'jump_10' },
            ],
            frameRate: 10,
            repeat: 0   
        });
    
        // Play the idle animation by default
        this.player.play('idle');
    }

    update() {
        const speed = GAME_SETTINGS.playerSpeed;
        const jumpSpeed = GAME_SETTINGS.playerJumpSpeed;
        const doubleJumpSpeed = GAME_SETTINGS.playerDoubleJumpSpeed;

        // Horizontal movement (always enabled)
        if (this.cursors.left.isDown || this.keys.A.isDown) {
            this.player.setVelocityX(-speed);
        } else if (this.cursors.right.isDown || this.keys.D.isDown) {
            this.player.setVelocityX(speed);
        } else if (this.player.body.blocked.down) {
            this.player.setVelocityX(0);
        }

        // Jump and double jump
        if (Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.keys.W) || Phaser.Input.Keyboard.JustDown(this.cursors.space)) {
            if (this.player.body.blocked.down) {
                console.log('Jumping');
                this.player.setVelocityY(jumpSpeed);
                this.player.play('jump', true);
                this.canDoubleJump = true; // Enable double jump after initial jump
            } else if (this.canDoubleJump) {
                console.log('Double Jumping');
                this.player.setVelocityY(doubleJumpSpeed);
                this.player.play('jump', true);
                this.canDoubleJump = false; // Disable double jump after it's used
            }
        }

        // Animation handling
        if (this.player.body.velocity.y !== 0) {
            // Player is in the air, play the jump animation
            this.player.play('jump', true);
        } else if (this.player.body.velocity.x !== 0) {
            // Player is on the ground and moving, play the run animation
            this.player.play('run', true);
        } else {
            // Player is on the ground and not moving, play the idle animation
            this.player.play('idle', true);
        }

        if (this.player.body.blocked.down && this.player.anims.currentAnim.key === 'jump') {
            this.player.play('idle', true);
        }

        // Handle health reduction when H key is pressed
        if (Phaser.Input.Keyboard.JustDown(this.keys.H)) {
            this.reduceHealth();
        }

        // Handle game restart when R key is pressed
        if (Phaser.Input.Keyboard.JustDown(this.keys.R)) {
            this.resetGame();
        }

         // Safety check
        if (this.player.y > this.physics.world.bounds.height || this.player.y < 0 || this.player.x < 0 || this.player.x > this.physics.world.bounds.width) {
            this.resetGame();
        }   
    }

    onPlayerLanded() {
        if (this.player.body.blocked.down) {
            this.canDoubleJump = false; // Reset double jump when player lands
        }
    }

    reduceHealth() {
        if (this.playerHealth > 0) {
            this.playerHealth -= 1;
            EventBus.emit('health-update', this.playerHealth);
        }
    }

    resetGame() {
        this.playerHealth = 3; // Reset player health
        EventBus.emit('health-update', this.playerHealth); // Emit health update event
        this.scene.restart(); // Restart the scene
    }
}