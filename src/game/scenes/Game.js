import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { GAME_SETTINGS } from '../Config';

export class Game extends Scene {
    constructor() {
        super('Game');
        this.playerHealth = 3; // Initialize player health
    }

    preload() {
        // Load the assets for the game - Replace with your own assets
        this.load.setPath('assets');
        this.load.image('player', 'test_assets/player.png');
        this.load.image('test_tiles', 'test_assets/test_tiles_mod.png');
        this.load.tilemapTiledJSON('test_map', 'levels/test_map.json');
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

        this.player = this.physics.add.sprite(this.playerX, this.playerY, 'player');
        this.player.setCollideWorldBounds(true);
        this.player.setGravityY(GAME_SETTINGS.playerGravity); // Set gravity for the player

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
    }

    update() {
        const speed = GAME_SETTINGS.playerSpeed;
        const jumpSpeed = GAME_SETTINGS.playerJumpSpeed;

        if (this.cursors.left.isDown || this.keys.A.isDown) {
            this.player.setVelocityX(-speed);
        } else if (this.cursors.right.isDown || this.keys.D.isDown) {
            this.player.setVelocityX(speed);
        } else {
            this.player.setVelocityX(0);
        }

        if ((this.cursors.up.isDown || this.keys.W.isDown || this.cursors.space.isDown) && this.player.body.blocked.down) {
            this.player.setVelocityY(jumpSpeed);
        }

        // Handle health reduction when H key is pressed
        if (Phaser.Input.Keyboard.JustDown(this.keys.H)) {
            this.reduceHealth();
        }

        // Handle game restart when R key is pressed
        if (Phaser.Input.Keyboard.JustDown(this.keys.R)) {
            this.resetGame();
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