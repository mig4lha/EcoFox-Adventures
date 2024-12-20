import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { GAME_SETTINGS } from '../Config';

export class Game extends Scene {
    constructor() {
        super('Game');
        this.playerHealth = 3; // Initialize player health
        this.canDoubleJump = false; // Track if the player can double jump
        this.isInvulnerable = false; // Player is not invulnerable at the start
        this.hitboxVisible = false; // Hitbox visualization is disabled by default
    }

    preload() {

        // console.clear();

        // Load the assets for the game scene
        this.load.setPath('assets');

        this.load.image('props', 'tiles/props.png');
        this.load.image('tileset', 'tiles/tileset.png');
        this.load.image('background_layer_1', 'backgrounds/background_layer_1_extended_2.png');
        this.load.image('background_layer_2', 'backgrounds/background_layer_2_extended_2.png');
        this.load.image('background_layer_3', 'backgrounds/background_layer_3_extended_2.png');

        this.load.tilemapTiledJSON('level1', 'levels/level1.json');

        this.load.atlas('player', 'characters/fox_spritesheet.png', 'characters/fox_spritesheet.json');

        this.load.image('enemy1', 'enemies/bichinho.png');
        this.load.audio('enemyDeathSound1', 'audio/bichinho_morto.mp3');
        this.load.image('enemyDeath1', 'enemies/bichinho_morto.png');

        this.load.image('collectable', 'collectables/moedinha.png');
    }

    create() {
        this.cameras.main.setBackgroundColor(GAME_SETTINGS.backgroundColor);

        this.isInvulnerable = false; // Player is not invulnerable at the start

        this.enemies = this.physics.add.group();

        this.initialCameraX = this.cameras.main.scrollX;
        this.initialCameraY = this.cameras.main.scrollY;
        
        const map = this.make.tilemap({ key: 'level1' });
        const tileset = map.addTilesetImage('tileset', 'tileset', GAME_SETTINGS.tileWidth, GAME_SETTINGS.tileHeight);
        const props = map.addTilesetImage('props', 'props', GAME_SETTINGS.tileWidth, GAME_SETTINGS.tileHeight);
        
        // Add background images
        this.backgroundLayer1 = this.add.image(0, 0, 'background_layer_1')
            .setOrigin(0, 0); 
        this.backgroundLayer2 = this.add.image(0, 0, 'background_layer_2')
            .setOrigin(0, 0);
        this.backgroundLayer3 = this.add.image(0, 0, 'background_layer_3')
            .setOrigin(0, 0);

        this.backgroundCaveLayer = map.createLayer('Background', tileset, 0, 0);
        this.terrainLayer = map.createLayer('Terrain', tileset, 0, 0);
        this.terrainPropsLayer = map.createLayer('Terrain_props', props, 0, 0);
        this.platformsLayer = map.createLayer('Platforms', tileset, 0, 0);

        this.propsLayer = map.createLayer('Props_4', props, 0, 0);
        this.props2Layer = map.createLayer('Props_3', props, 0, 0);
        this.props3Layer = map.createLayer('Props_2', props, 0, 0);
        this.props4Layer = map.createLayer('Props', props, 0, 0);
        
        this.interactables = map.createLayer('Interactables', props, 0, 0);

        this.playerX = map.getObjectLayer('Player Spawn').objects[0].x;
        this.playerY = map.getObjectLayer('Player Spawn').objects[0].y;

        this.player = this.physics.add.sprite(this.playerX, this.playerY, 'player', 'idle_0');
        this.player.setCollideWorldBounds(true);
        this.player.setGravityY(GAME_SETTINGS.playerGravity); // Set gravity for the player

        this.player.setScale(2.5);

        // Set a circular hitbox for the player sprite
        this.player.body.setCircle(6, 10, 4); // Radius of the circle, x offset, y offset (adjust as needed)

        this.terrainLayer.setCollisionByProperty({ collides: true });
        this.terrainPropsLayer.setCollisionByProperty({ collides: true });
        this.platformsLayer.setCollisionByProperty({ collides: true });

        this.physics.add.collider(this.player, this.terrainLayer);
        this.physics.add.collider(this.player, this.terrainPropsLayer);
        this.physics.add.collider(this.player, this.platformsLayer);

        // Set the camera and world bounds to match the map size
        this.cameras.main.setBounds(5, 0, map.widthInPixels - 10, map.heightInPixels);
        this.physics.world.setBounds(5, 0, map.widthInPixels - 10, map.heightInPixels);

        // Ensure player is properly constrained within the world bounds
        this.player.setCollideWorldBounds(true);

        this.player.body.debugShowBody = false;
        this.player.body.debugShowVelocity = false;

        // Debugging visualization
        // this.terrainLayer.renderDebug(this.add.graphics(), {
        //     tileColor: null,
        //     collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255),
        //     faceColor: new Phaser.Display.Color(40, 39, 37, 255)
        // });

        // Set the camera to follow the player
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        // Enable rounding of pixel values to prevent sub-pixel rendering
        this.cameras.main.roundPixels = true;

        // Set the camera zoom level
        this.cameras.main.setZoom(GAME_SETTINGS.cameraZoom); // Adjust the zoom level as needed

        // Fade in the scene
        this.cameras.main.fadeIn(GAME_SETTINGS.cameraFadeInDuration);
        
        const enemyObjects = map.getObjectLayer('Enemy Spawn').objects;
        enemyObjects.forEach((enemyObject) => {
            // if (enemyObject.name === 'enemy_spawn_1' || enemyObject.name === 'enemy_spawn_2') {
                // Get the enemy's original width from the texture
                const enemyTexture = this.textures.get('enemy1');
                const enemyFrame = enemyTexture.get();
        
                const originalEnemyWidth = enemyFrame.width;
                const enemyScale = 0.10;
        
                // Calculate the enemy's display width after scaling
                const enemyDisplayWidth = originalEnemyWidth * enemyScale;
        
                // Number of enemies to spawn
                var numEnemies = 1;

                if(enemyObject.name === 'enemy_spawn_1' || enemyObject.name === 'enemy_spawn_2') {
                    numEnemies = 2;
                }

                const patrolAreaWidth = enemyObject.width / numEnemies;
        
                // Loop to create multiple enemies
                for (let i = 0; i < numEnemies; i++) {

                    // Calculate the patrol area's start X coordinate
                    const patrolStartX = enemyObject.x + i * patrolAreaWidth;
        
                    // Center the enemy within its patrol area
                    const enemyX = patrolStartX + (patrolAreaWidth - enemyDisplayWidth) / 2;
        
                    // Create the enemy at the calculated position
                    const enemy = this.enemies.create(enemyX, enemyObject.y, 'enemy1');
                    enemy.setScale(enemyScale);
                    enemy.setCollideWorldBounds(true);
            
                    enemy.body.debugShowBody = false;
                    enemy.body.debugShowVelocity = false;

                    // Assign hit points to the enemy
                    enemy.hitPoints = 1; // Set the number of hits required to defeat the enemy
        
                    // Set initial movement properties
                    enemy.setVelocityX(50); // Adjust speed as needed
                    enemy.patrolDirection = 1; // 1 for right, -1 for left
        
                    // Set movement boundaries for the enemy
                    enemy.minX = patrolStartX + 32;
                    enemy.maxX = patrolStartX + patrolAreaWidth - enemyDisplayWidth + 32;
                }
            // }
        });

        // Collide enemies with terrain
        this.physics.add.collider(this.enemies, this.terrainLayer);

        // Detect collision between player and enemies
        this.physics.add.collider(this.player, this.enemies, this.handlePlayerEnemyCollision, null, this);

        // Variable to track collected items
        this.collectedItems = [];

        // Create a group for collectables
        this.collectables = this.physics.add.group();

        // Retrieve collectable objects from the 'Collectables' object layer
        const collectableObjects = map.getObjectLayer('Collectables').objects;

        collectableObjects.forEach((collectableObject) => {
            // Create a collectable at the specified position
            const collectable = this.collectables.create(collectableObject.x, collectableObject.y, 'collectable');
            collectable.setOrigin(0.5, 0.5); // Use default origin
            collectable.name = collectableObject.name; // e.g., 'collectable_1'
            collectable.body.setAllowGravity(false); // Collectables don't need gravity
            collectable.setImmovable(true);
        
            collectable.body.debugShowBody = false;
            collectable.body.debugShowVelocity = false;
        
            collectable.setScale(0.015);
            collectable.y += 5; 
        });

        // Add overlap between the player and collectables
        this.physics.add.overlap(this.player, this.collectables, this.collectItem, null, this);

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
    
        const cameraX = this.cameras.main.scrollX;

        // Calculate parallax effect based on the camera's position
        this.backgroundLayer1.x = cameraX * -0.02 - 30; // Slowest, furthest background
        this.backgroundLayer2.x = cameraX * -0.05 - 30; // Mid-speed background
        this.backgroundLayer3.x = cameraX * -0.08 - 30; // Fastest, closest background

        // Update enemies' movement
        this.enemies.children.iterate((enemy) => {
            // Move enemy based on patrol direction
            enemy.setVelocityX(50 * enemy.patrolDirection);

            // Reverse direction upon reaching boundaries
            if (enemy.x >= enemy.maxX) {
                enemy.x = enemy.maxX; // Correct position
                enemy.patrolDirection = -1; // Change direction to left
                enemy.flipX = false; // Flip sprite horizontally if needed
            } else if (enemy.x <= enemy.minX) {
                enemy.x = enemy.minX; // Correct position
                enemy.patrolDirection = 1; // Change direction to right
                enemy.flipX = true; // Reset sprite flip if needed
            }
        });

        // Horizontal movement (always enabled)
        if (this.cursors.left.isDown || this.keys.A.isDown) {
            this.player.setVelocityX(-speed);
            this.player.flipX = true; // Face left
        } else if (this.cursors.right.isDown || this.keys.D.isDown) {
            this.player.setVelocityX(speed);
            this.player.flipX = false; // Face right
        } else if (this.player.body.blocked.down) {
            this.player.setVelocityX(0);
        }
    
        // Jump and double jump
        if (Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.keys.W) || Phaser.Input.Keyboard.JustDown(this.cursors.space)) {
            if (this.player.body.blocked.down) {
                this.player.setVelocityY(jumpSpeed);
                this.player.play('jump', true);
                this.canDoubleJump = true; // Enable double jump after initial jump
            } else if (this.canDoubleJump) {
                this.player.setVelocityY(doubleJumpSpeed);
                this.player.play('jump', true);
                this.canDoubleJump = false; // Disable double jump after it's used
            }
        }
    
        // Animation handling
        if (this.player.body.velocity.y !== 0) {
            this.player.play('jump', true);
        } else if (this.player.body.velocity.x !== 0) {
            this.player.play('run', true);
        } else {
            this.player.play('idle', true);
        }
    
        if (this.player.body.blocked.down && this.player.anims.currentAnim.key === 'jump') {
            this.player.play('idle', true);
        }

        // Toggle hitbox visualization when H key is pressed
        if (Phaser.Input.Keyboard.JustDown(this.keys.H)) {
            this.toggleHitboxVisualization();
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
    
    handlePlayerEnemyCollision(player, enemy) {
        if (player.body.velocity.y > 0 && player.y < enemy.y) {
            // Player jumps on enemy
            this.damageEnemy(enemy);
            player.setVelocityY(-500); // Bounce player upwards
        } else if (!this.isInvulnerable) {
            // Player takes damage
            this.reduceHealth();
            this.triggerInvulnerability();
        }
    }
    
    damageEnemy(enemy) {
        enemy.hitPoints -= 1;
    
        if (enemy.hitPoints <= 0) {
            // Play the death sound
            this.sound.play('enemyDeathSound1', { volume: 0.05 });
    
            // Change the sprite to the enemy death sprite
            enemy.setTexture('enemyDeath1');
    
            // Offset the death sprite on the Y axis
            enemy.y += 28; // Adjust the value as needed
    
            // Disable the physics body to make the sprite static and remove hitbox
            enemy.body.setVelocity(0);
            enemy.body.setImmovable(true);
            enemy.body.moves = false;
            enemy.body.enable = false; // Disable the physics body
    
            // Set a timer to destroy the enemy after 3 seconds
            this.time.delayedCall(3000, () => {
                enemy.destroy();
            }, [], this);
        } else {
            // Optional: Visual feedback for enemy hurt
        }
    }

    toggleHitboxVisualization() {
        this.hitboxVisible = !this.hitboxVisible;
    
        if (this.hitboxVisible) {
            // Enable hitbox visualization for player
            this.player.body.debugShowBody = true;
            this.player.body.debugShowVelocity = true;
    
            // Enable hitbox visualization for enemies
            this.enemies.children.iterate((enemy) => {
                enemy.body.debugShowBody = true;
                enemy.body.debugShowVelocity = true;
            });
    
            // Enable hitbox visualization for collectables
            this.collectables.children.iterate((collectable) => {
                collectable.body.debugShowBody = true;
                collectable.body.debugShowVelocity = true;
            });
        } else {
            // Disable hitbox visualization for player
            this.player.body.debugShowBody = false;
            this.player.body.debugShowVelocity = false;
    
            // Disable hitbox visualization for enemies
            this.enemies.children.iterate((enemy) => {
                enemy.body.debugShowBody = false;
                enemy.body.debugShowVelocity = false;
            });
    
            // Disable hitbox visualization for collectables
            this.collectables.children.iterate((collectable) => {
                collectable.body.debugShowBody = false;
                collectable.body.debugShowVelocity = false;
            });
        }
    }

    triggerInvulnerability() {
        this.isInvulnerable = true;
    
        // Start blinking effect
        this.invulnerabilityEffect = this.tweens.add({
            targets: this.player,
            alpha: { from: 0.5, to: 0 },
            ease: 'Linear',
            duration: 200,
            repeat: -1,
            yoyo: true
        });
    
        this.time.delayedCall(GAME_SETTINGS.playerInvulnerabilityTime, () => {
            this.isInvulnerable = false;
            this.invulnerabilityEffect.stop();
            this.player.setAlpha(1); // Ensure player is fully opaque
        }, [], this);
    }

    collectItem(player, collectable) {
        // Add to collected items array
        this.collectedItems.push(collectable.name);
    
        console.log(`Collected items: ${this.collectedItems}`);
    
        // Disable the collectable
        collectable.destroy();
    
        // Emit collectable update event
        EventBus.emit('collectable-update', this.collectedItems);
    
        // Optionally, play a sound or animation
        // this.sound.play('collectSound');
    
        // Update score or UI if needed
        // this.score += 10;
        // this.scoreText.setText('Score: ' + this.score);
    }

    onPlayerLanded() {
        if (this.player.body.blocked.down) {
            this.canDoubleJump = false; // Reset double jump when player lands
        }
    }

    reduceHealth() {
        this.playerHealth -= 1;
        console.log(`Player health: ${this.playerHealth}`);
        EventBus.emit('health-update', this.playerHealth);
        if (this.playerHealth <= 0) {
            this.resetGame();
        }
    }

    resetGame() {
        this.playerHealth = 3; // Reset player health
        this.collectedItems = []; // Clear collected items array
        EventBus.emit('collectable-update', this.collectedItems); // Emit collectable update event
        EventBus.emit('health-update', this.playerHealth); // Emit health update event
        this.scene.restart(); // Restart the scene
    }
}