import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { GAME_SETTINGS } from '../Config';
import { Projectile } from '../entities/Projectile';

export class Game extends Scene {
    constructor() {
        super('Game');
        this.playerHealth = 3; // Initialize player health
        this.canDoubleJump = false; // Track if the player can double jump
        this.isInvulnerable = false; // Player is not invulnerable at the start
        this.hitboxVisible = false; // Hitbox visualization is disabled by default
        this.enemiesKilled = 0 // Track enemies killed
        this.collectablesCollected = 0; // Track collectables collected
        this.score = 0
        this.levelStartTime = 0;
        this.levelTime = 0;
        this.map = null;
        this.tileset = null;
        this.props = null;
        this.cursors = null;
        this.keys = null;
    }

    preload() {

        // console.clear();

        // Load the assets for the game scene
        this.load.setPath('assets');

        // for (let i = 1; i <= GAME_SETTINGS.totalLevels; i++) {

        this.load.image(`props`, `tiles/props.png`);
        this.load.image(`tileset`, `tiles/tileset.png`);

        this.load.tilemapTiledJSON(`level1`, `levels/level1.json`);
        this.load.tilemapTiledJSON(`level2`, `levels/level2.json`);

        this.load.image('background_layer_1', 'backgrounds/background_layer_1_extended_2.png');
        this.load.image('background_layer_2', 'backgrounds/background_layer_2_extended_2.png');
        this.load.image('background_layer_3', 'backgrounds/background_layer_3_extended_2.png');

        this.load.image('collectable', 'collectables/berry.png');

        this.load.spritesheet('projectile', 'enemies/enemy_projectile.png', {
            frameWidth: 16,
            frameHeight: 16
        });

        this.load.atlas('player', 'characters/fox_spritesheet.png', 'characters/fox_spritesheet.json');
        this.load.atlas('enemy', 'enemies/enemy_spritesheet.png', 'enemies/enemy_spritesheet.json');
    }

    create() {

        this.sound.stopAll(); // Stop all sounds before transitioning
        
        this.cameras.main.setBackgroundColor(GAME_SETTINGS.backgroundColor);

        this.enemiesKilled = 0 // Track enemies killed
        this.collectablesCollected = 0; // Track collectables collected
        this.score = 0

        this.isInvulnerable = false; // Player is not invulnerable at the start

        // Create a group for enemies
        this.enemies = this.physics.add.group();

        // Create a group for collectables
        this.collectables = this.physics.add.group();

        // Create a group for death zones
        this.deathZones = this.physics.add.staticGroup();

        // Variable to track collected items
        this.collectedItems = [];

        this.initialCameraX = this.cameras.main.scrollX;
        this.initialCameraY = this.cameras.main.scrollY;
        
        // Load the current level
        this.loadLevel(GAME_SETTINGS.currentLevel);

        this.playerX = this.map.getObjectLayer('Player Spawn').objects[0].x;
        this.playerY = this.map.getObjectLayer('Player Spawn').objects[0].y;

        this.player = this.physics.add.sprite(this.playerX, this.playerY, 'player', 'idle_0');
        this.player.setCollideWorldBounds(true);
        this.player.setGravityY(GAME_SETTINGS.playerGravity); // Set gravity for the player

        this.player.setScale(2.5);

        // Set a circular hitbox for the player sprite
        this.player.body.setCircle(6, 10, 4); // Radius of the circle, x offset, y offset (adjust as needed)

        this.physics.add.collider(this.player, this.terrainLayer);
        this.physics.add.collider(this.player, this.terrainPropsLayer);
        this.physics.add.collider(this.player, this.platformsLayer);

        // Set the camera and world bounds to match the map size
        this.cameras.main.setBounds(5, 0, this.map.widthInPixels - 10, this.map.heightInPixels);
        this.physics.world.setBounds(5, 0, this.map.widthInPixels - 10, this.map.heightInPixels);

        // Ensure player is properly constrained within the world bounds
        this.player.setCollideWorldBounds(true);

        this.player.body.debugShowBody = false;
        this.player.body.debugShowVelocity = false;

        this.anims.create({
            key: 'run_enemy',
            frames: [
                { key: 'enemy', frame: 'run_enemy_0' },
                { key: 'enemy', frame: 'run_enemy_1' },
                { key: 'enemy', frame: 'run_enemy_2' },
                { key: 'enemy', frame: 'run_enemy_3' },
            ],
            frameRate: 10,
            repeat: -1   
        });
        this.anims.create({
            key: 'death_enemy',
            frames: [
                { key: 'enemy', frame: 'death_enemy_0' },
                { key: 'enemy', frame: 'death_enemy_1' },
                { key: 'enemy', frame: 'death_enemy_2' },
                { key: 'enemy', frame: 'death_enemy_3' },
            ],
            frameRate: 60,
            repeat: 0  
        });
        // Define projectile animation
        this.anims.create({
            key: 'projectile_anim',
            frames: this.anims.generateFrameNumbers('projectile', { start: 0, end: 3 }), // Adjust frame range
            frameRate: 10,
            repeat: -1
        });
         // Create a group for projectiles
        this.projectiles = this.physics.add.group({
            classType: Projectile, // Ensure Projectile class is imported
            runChildUpdate: true
        });

        // Add enemies, collectables, death zones, interactables
        this.addEnemies(this.map);
        this.addCollectables(this.map);
        this.addDeathZones(this.map);
        this.addInteractables(this.map);

        // Set the camera to follow the player
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

        // Enable rounding of pixel values to prevent sub-pixel rendering
        this.cameras.main.roundPixels = true;

        // Set the camera zoom level
        this.cameras.main.setZoom(GAME_SETTINGS.cameraZoom); // Adjust the zoom level as needed

        // Fade in the scene
        this.cameras.main.fadeIn(GAME_SETTINGS.cameraFadeInDuration);

        EventBus.emit('current-scene-ready', this);
        EventBus.emit('scene-change', 'Game'); // Emit scene change event

        // Set up input handling
        this.enableKeys();

        this.interactionKey = this.keys.E;

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

        // Start the level timer
        this.levelStartTime = this.time.now;
        
        this.debugGraphics = this.add.graphics();

        if(GAME_SETTINGS.currentLevel === 1) {
            this.sound.play('level1', { volume: 0.1, loop: true });
        } else if(GAME_SETTINGS.currentLevel === 2) {
            this.sound.play('level2', { volume: 0.1, loop: true });
        }
    }

    disableKeys() {
        Object.values(this.keys).forEach(key => key.enabled = false);
        this.cursors.left.enabled = false;
        this.cursors.right.enabled = false;
        this.cursors.up.enabled = false;
        this.cursors.down.enabled = false;

        this.input.keyboard.enabled = false;

        this.input.keyboard.removeAllKeys();
        this.input.keyboard.removeAllListeners();
    }
    
    enableKeys() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keys = this.input.keyboard.addKeys('W,A,S,D,H,R,E,O,I');

        Object.values(this.keys).forEach(key => key.enabled = true);
        this.cursors.left.enabled = true;
        this.cursors.right.enabled = true;
        this.cursors.up.enabled = true;
        this.cursors.down.enabled = true;

        this.input.keyboard.enabled = true;
    }

    loadLevel(levelNumber) {        
        this.playerHealth = 3;
        console.log(`Player health: ${this.playerHealth}`);
        EventBus.emit('health-update', this.playerHealth);

        // Clear existing groups (enemies, collectables, etc.) if necessary
        this.enemies.clear(true, true);
        this.collectables.clear(true, true);
        this.deathZones.clear(true, true);
        this.interactablePoints = [];

        this.map = this.make.tilemap({ key: `level${levelNumber}` });
        this.tileset = this.map.addTilesetImage(`tileset`, `tileset`, GAME_SETTINGS.tileWidth, GAME_SETTINGS.tileHeight);
        this.props = this.map.addTilesetImage(`props`, `props`, GAME_SETTINGS.tileWidth, GAME_SETTINGS.tileHeight);
        // this.tileset = this.map.addTilesetImage(`tileset${levelNumber}`, `tileset${levelNumber}`, GAME_SETTINGS.tileWidth, GAME_SETTINGS.tileHeight);
        // this.props = this.map.addTilesetImage(`props${levelNumber}`, `props${levelNumber}`, GAME_SETTINGS.tileWidth, GAME_SETTINGS.tileHeight);
        
        // Add background images
        this.backgroundLayer1 = this.add.image(0, 0, 'background_layer_1')
        .setOrigin(0, 0); 
        this.backgroundLayer2 = this.add.image(0, 0, 'background_layer_2')
        .setOrigin(0, 0);
        this.backgroundLayer3 = this.add.image(0, 0, 'background_layer_3')
        .setOrigin(0, 0);

        this.backgroundCaveLayer = this.map.createLayer('Background', this.tileset, 0, 0);
        this.terrainLayer = this.map.createLayer('Terrain', this.tileset, 0, 0);
        this.terrainPropsLayer = this.map.createLayer('Terrain_props', this.props, 0, 0);
        this.platformsLayer = this.map.createLayer('Platforms', this.tileset, 0, 0);

        this.propsLayer = this.map.createLayer('Props_4', this.props, 0, 0);
        this.props2Layer = this.map.createLayer('Props_3', this.props, 0, 0);
        this.props3Layer = this.map.createLayer('Props_2', this.props, 0, 0);
        this.props4Layer = this.map.createLayer('Props', this.props, 0, 0);

        this.interactables = this.map.createLayer('Interactables_Initial', this.props, 0, 0);
        this.interactables_final = this.map.createLayer('Interactables_Final', this.props, 0, 0);

        this.interactables_final.setVisible(false);

        this.terrainLayer.setCollisionByProperty({ collides: true });
        this.terrainPropsLayer.setCollisionByProperty({ collides: true });
        this.platformsLayer.setCollisionByProperty({ collides: true });

    }

    addEnemies(map) {
        const enemySpawnLayer = map.getObjectLayer('Enemy Spawn');
        const enemyObjects = enemySpawnLayer ? enemySpawnLayer.objects : [];
        enemyObjects.forEach((enemyObject) => {
                // Calculate patrol boundaries based on enemyObject.width
                const patrolMinX = enemyObject.x;
                const patrolMaxX = enemyObject.x + enemyObject.width;

                // // Get the enemy's original width from the texture
                const enemyTexture = this.textures.get('enemy');
                const enemyFrame = enemyTexture.get();
        
                const originalEnemyWidth = enemyFrame.width;
                const enemyScale = 2;
                const enemyWidth = enemyFrame.width * enemyScale;
                const halfEnemyWidth = enemyWidth / 2;
        
                // // Calculate the enemy's display width after scaling
                const enemyDisplayWidth = originalEnemyWidth * enemyScale;
        
                // Number of enemies to spawn
                var numEnemies = 1;

                if(GAME_SETTINGS.currentLevel === 1) {
                    if(enemyObject.name === 'enemy_spawn_1' || enemyObject.name === 'enemy_spawn_2') {
                        numEnemies = 2;
                    }
                } else if(GAME_SETTINGS.currentLevel === 2) {
                    if(enemyObject.name === 'enemy_spawn_3' || enemyObject.name === 'enemy_spawn_4' || enemyObject.name === 'enemy_spawn_7' || enemyObject.name === 'enemy_spawn_8') { 
                        numEnemies = 2;
                    }
                }

                const patrolAreaWidth = enemyObject.width / numEnemies;
        
                // Loop to create multiple enemies
                for (let i = 0; i < numEnemies; i++) {

                    // Calculate the patrol area's start X coordinate
                    const patrolStartX = patrolMinX + i * patrolAreaWidth;
        
                    // Center the enemy within its patrol area
                    const enemyFrame = this.textures.getFrame('enemy', 'run_enemy_0');
                    if (!enemyFrame) {
                        console.error('Frame "run_enemy_0" not found in "enemy" atlas.');
                        return;
                    }
                    
                    const enemyX = patrolStartX + (patrolAreaWidth - (enemyFrame.width * 2)) / 2; // Assuming enemyScale = 2

                    // Adjust patrol boundaries to account for enemy width
                    const patrolMinXAdjusted = patrolMinX + halfEnemyWidth;
                    const patrolMaxXAdjusted = patrolMaxX - halfEnemyWidth;
        
                    // Create the enemy at the calculated position
                    const enemy = this.enemies.create(enemyX, enemyObject.y - 16, 'enemy');
                    enemy.setScale(enemyScale);
                    enemy.setCollideWorldBounds(true);

                    // Adjust the enemy's hitbox size
                    enemy.body.setSize(enemy.width, enemy.height * 0.75, true); // Reduce Y size to 60%
                    enemy.body.setOffset(0, enemy.height * 0.27); // Adjust Y offset if needed
            
                    enemy.body.debugShowBody = false;
                    enemy.body.debugShowVelocity = false;

                    // Assign hit points to the enemy
                    enemy.hitPoints = 1; // Set the number of hits required to defeat the enemy
        
                    // Set initial movement properties
                    enemy.setVelocityX(50); // Adjust speed as needed
                    enemy.patrolDirection = 1; // 1 for right, -1 for left
                    
                    // Assign patrol boundaries
                    enemy.patrolMinX = patrolMinXAdjusted;
                    enemy.patrolMaxX = patrolMaxXAdjusted;

                    // Set initial orientation
                    enemy.flipX = false; // Facing right

                    enemy.play('run_enemy'); // Start the run animation
                }
        });

        // Collide enemies with terrain
        this.physics.add.collider(this.enemies, this.terrainLayer);

        // Set up collision between enemies
        this.physics.add.collider(this.enemies, this.enemies, this.handleEnemyCollision, null, this);

        // Detect collision between player and enemies
        this.playerEnemyCollision = this.physics.add.collider(this.player, this.enemies, this.handlePlayerEnemyCollision, null, this);
    }

    addCollectables(map) {
        // Retrieve collectable objects from the 'Collectables' object layer
        const collectableLayer = map.getObjectLayer('Collectables');
        const collectableObjects = collectableLayer ? collectableLayer.objects : [];
        
        collectableObjects.forEach((collectableObject) => {
            // Create a collectable at the specified position
            const collectable = this.collectables.create(collectableObject.x, collectableObject.y, 'collectable');
            collectable.setOrigin(0.5, 0.5); // Use default origin
            collectable.name = collectableObject.name; // e.g., 'collectable_1'
            collectable.body.setAllowGravity(false); // Collectables don't need gravity
            collectable.setImmovable(true);
        
            collectable.body.debugShowBody = false;
            collectable.body.debugShowVelocity = false;
        
            collectable.setScale(2);
            collectable.y += 5; 
        });
        
        // Add overlap between the player and collectables
        this.physics.add.overlap(this.player, this.collectables, this.collectItem, null, this);
    }

    addDeathZones(map) {
        // Retrieve death zone objects from the 'Death Zones' object layer
        const deathZoneLayer = map.getObjectLayer('Death Zones');
        const deathZoneObjects = deathZoneLayer ? deathZoneLayer.objects : [];

        deathZoneObjects.forEach((zone) => {
            const deathZone = this.deathZones.create(zone.x + 16, zone.y + 45, null).setOrigin(0, 0);
            deathZone.displayWidth = zone.width;
            deathZone.displayHeight = zone.height;
            deathZone.body.setSize(zone.width, zone.height); // Set the physics body size to match the display size
            deathZone.body.debugShowBody = false;
            deathZone.body.debugShowVelocity = false;
        });

        // Add overlap detection between the player and death zones
        this.physics.add.overlap(this.player, this.deathZones, this.handlePlayerDeath, null, this);
    }

    addInteractables(map) {
        // Get interactable center points from object layer
        const interactableCentersLayer = map.getObjectLayer('Interactables Center');
        const interactableCenters = interactableCentersLayer ? interactableCentersLayer.objects : [];

        this.interactablePoints = interactableCenters.map(point => ({
            x: point.x,
            y: point.y,
            name: point.name
        }));

        // console.log('Interactable Points:', this.interactablePoints);
    }

    fadeOutUI() {
        // Emit 'fade-out' event
        EventBus.emit('fade-out');
    }

    fadeInUI() {
        // Emit 'fade-in' event
        EventBus.emit('fade-in');
    }

    update() {
        const speed = GAME_SETTINGS.playerSpeed;
        const jumpSpeed = GAME_SETTINGS.playerJumpSpeed;
        const doubleJumpSpeed = GAME_SETTINGS.playerDoubleJumpSpeed;
    
        const cameraX = this.cameras.main.scrollX;

        // Calculate parallax effect based on the camera's position
        if(this.backgroundLayer1 && this.backgroundLayer2 && this.backgroundLayer3) {
            this.backgroundLayer1.x = cameraX * -0.02 - 30; // Slowest, furthest background
            this.backgroundLayer2.x = cameraX * -0.05 - 30; // Mid-speed background
            this.backgroundLayer3.x = cameraX * -0.08 - 30; // Fastest, closest background
        }
        
        // Iterate through each enemy to manage movement and orientation
        this.enemies.getChildren().forEach((enemy) => {
            // Boundary Check: Ensure enemy stays within patrolMinX and patrolMaxX
            if (enemy.x <= enemy.patrolMinX && enemy.patrolDirection === -1) {
                enemy.patrolDirection = 1;
                enemy.setVelocityX(50 * enemy.patrolDirection);
                enemy.flipX = false; // Face right
            } else if (enemy.x >= enemy.patrolMaxX && enemy.patrolDirection === 1) {
                enemy.patrolDirection = -1;
                enemy.setVelocityX(50 * enemy.patrolDirection);
                enemy.flipX = true; // Face left
            }

            // Detect if player is within patrol area
            const playerX = this.player.x;
            const playerY = this.player.y;

            const isPlayerInPatrolArea = playerX >= enemy.patrolMinX && playerX <= enemy.patrolMaxX;
            const isPlayerInFront = (enemy.patrolDirection === 1 && playerX > enemy.x) ||
                                    (enemy.patrolDirection === -1 && playerX < enemy.x);

            if (!enemy.isDead && isPlayerInPatrolArea && isPlayerInFront) {
                this.handleEnemyAttack(enemy);
            }
        });

        if (this.isPlayerDead) {
            console.log('Player is dead, input disabled');
            return;
        } else {
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
                    this.sound.play('jump', { volume: 0.1 });
                    this.canDoubleJump = true; // Enable double jump after initial jump
                } else if (this.canDoubleJump) {
                    this.player.setVelocityY(doubleJumpSpeed);
                    this.player.play('jump', true);
                    this.sound.play('double_jump', { volume: 0.1 });
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

            let nearObject = false;
            let interactable = null;

            this.interactablePoints.forEach(point => {
                const distance = Phaser.Math.Distance.Between(
                    this.player.x,
                    this.player.y,
                    point.x,
                    point.y
                );
        
                const proximityThreshold = 64; // One tile distance
                if (distance < proximityThreshold) {
                    nearObject = true;

                    interactable = point;
        
                    const camera = this.cameras.main;

                    var screenX = point.x - camera.scrollX + 80;
                    var screenY = point.y - camera.scrollY + 50;

                    if(GAME_SETTINGS.currentLevel === 2) {
                        screenX = point.x - camera.scrollX + 300;
                    }
        
                    EventBus.emit('show-interaction', { x: screenX, y: screenY });
                }
        
                 // Handle E key press for interaction
                if (Phaser.Input.Keyboard.JustDown(this.interactionKey) && interactable) {
                    this.handleInteraction(interactable);
                }
            });
        
            if (!nearObject) {
                EventBus.emit('hide-interaction');
            }

            this.levelTime = Math.floor((this.time.now - this.levelStartTime) / 1000);
            EventBus.emit('time-update', this.levelTime);
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

    handleEnemyAttack(enemy) {
        if (!enemy.isAttacking && !enemy.isDead) {
            enemy.isAttacking = true;
            enemy.setVelocityX(0); // Stop patrolling
            console.log('Enemy is attacking!');

            // Define spawn offsets
            const projectile_offset_x = 30; // Horizontal offset
            const projectile_offset_y = 15;  // Vertical offset

            // Calculate spawn position based on direction
            const spawnX = enemy.x + (projectile_offset_x * enemy.patrolDirection);
            const spawnY = enemy.y + projectile_offset_y;

            // Create a projectile via the group to ensure it's managed correctly
            const projectile = this.projectiles.get(spawnX, spawnY, 'projectile');

            this.sound.play('enemy_laser', { volume: 0.1 });

            if (projectile) {
                projectile.setActive(true);
                projectile.setVisible(true);
                projectile.direction = enemy.patrolDirection; // 1 for right, -1 for left
                projectile.startX = projectile.x;
                projectile.body.debugShowBody = false;
                projectile.body.debugShowVelocity = false;

                // Set velocity based on direction
                projectile.setVelocityX(projectile.speed * projectile.direction);

                // Play the projectile animation
                projectile.play('projectile_anim');

                // Set up collision between projectile and player
                this.physics.add.overlap(projectile, this.player, () => {
                    if (!this.isInvulnerable) {
                        // Player takes damage
                        this.handlePlayerDamage(1);
                        this.triggerInvulnerability();
                    }
                    projectile.destroy(); // Destroy the projectile upon collision
                }, null, this);
            } else {
                console.warn('Projectile could not be created.');
            }

            // Reset attacking state after attack duration
            this.time.delayedCall(1000, () => { // 3 seconds attack duration
                if (enemy.active && !enemy.isDead) {
                    enemy.isAttacking = false;
                    // Resume patrolling in the same direction
                    enemy.setVelocityX(50 * enemy.patrolDirection);
                    enemy.play('run_enemy');
                }
            }, [], this);
        }
    }

    handleEnemyCollision(enemy1, enemy2) {
        // Reverse direction for enemy1
        enemy1.patrolDirection *= -1;
        enemy1.setVelocityX(50 * enemy1.patrolDirection);
        enemy1.flipX = enemy1.patrolDirection === -1;
    
        // Reverse direction for enemy2
        enemy2.patrolDirection *= -1;
        enemy2.setVelocityX(50 * enemy2.patrolDirection);
        enemy2.flipX = enemy2.patrolDirection === -1;
    }

    handleInteraction(interactable) {
        if (interactable.name === 'interactable_end') {
            this.finishLevel();
        }
        // Add more interaction cases if needed
        else {
            // Handle other interactions
        }
    }

    finishLevel() {        
        const finalTime = this.levelTime;

        this.disableKeys();

        this.cameras.main.fadeOut(2000, 0, 0, 0);

        this.sound.stopAll();

        // Emit event to trigger React components to fade out
        this.fadeOutUI();
    
        // Listen for the fade-out completion once
        this.cameras.main.once('camerafadeoutcomplete', () => {
            // Swap layer visibilities
            this.interactables.setVisible(false);
            this.interactables_final.setVisible(true);
    
            // Start fade-in effect over 1000ms (1 second)
            this.cameras.main.fadeIn(2000, 0, 0, 0);

            this.time.delayedCall(1000, () => {
                this.sound.play('interactable', { volume: 0.1 });
            }, [], this);

            // Make the player jump twice with a 1-second interval
            this.time.delayedCall(2000, () => {
                this.player.setVelocityY(-500);
                this.sound.play('jump', { volume: 0.1 });
                this.time.delayedCall(1000, () => {
                    this.player.setVelocityY(-500);
                    this.sound.play('jump', { volume: 0.1 });
                }, [], this);
            }, [], this);
    
            // Delay the event emission and scene transition by 1000ms (1 second)
            this.time.delayedCall(4500, () => {
                // Emit scene change event to trigger React fade (if applicable)
                EventBus.emit('scene-change', 'ScoreScene');
    
                // Optional: Start another fade effect before transitioning to ScoreScene
                this.cameras.main.fadeOut(1500, 0, 0, 0);
    
                // Listen once for the new fade-out completion to proceed to ScoreScene
                this.cameras.main.once('camerafadeoutcomplete', () => {
                    this.scene.start('ScoreScene', {
                        timeTaken: finalTime,
                        collectables: this.collectablesCollected,
                        enemiesKilled: this.enemiesKilled,
                        totalScore: this.calculateScore(this.score, finalTime),
                        keys: this.keys,
                        cursors: this.cursors,
                    });
                }, this);
            }, [], this);
        }, this);
    }

    calculateScore(score, time) {
        // Calculate score based on time and score achieved during level
        const maxTime = 120; // Maximum time in seconds for full bonus
        const bonusMultiplier = 20; // Points per second saved

        const timeBonus = Math.max(0, maxTime - time) * bonusMultiplier;
        return score + timeBonus;
    }

    handlePlayerDeath(player, deathZone) {
        this.handlePlayerDamage(1); // Instantly kill the player
        this.resetPlayer();
    }
    
    resetPlayer() {
        this.player.setX(this.playerX);
        this.player.setY(this.playerY);
        this.player.setVelocity(0, 0);
        this.player.setAlpha(1);
        this.isPlayerDead = false;
    }

    handlePlayerEnemyCollision(player, enemy) {
        if (player.body.velocity.y > 0 && player.y < enemy.y) {
            // Player jumps on enemy
            this.damageEnemy(enemy);
            player.setVelocityY(-500); // Bounce player upwards
        } else if (!this.isInvulnerable) {
            // Player takes damage
            this.handlePlayerDamage(1);
            this.triggerInvulnerability();
        }
    }
    
    damageEnemy(enemy) {
        enemy.hitPoints -= 1;

        this.sound.play('jump_on_enemy', { volume: 0.1 });
    
        if (enemy.hitPoints <= 0) {
            // Play the death sound
            this.sound.play('enemy_death', { volume: 0.1 });
    
            // Change the sprite to the enemy death sprite
            // enemy.setTexture('enemyDeath1');

            enemy.play('death_enemy', true);
    
            // Offset the death sprite on the Y axis
            // enemy.y += 28; // Adjust the value as needed
    
            // Disable the physics body to make the sprite static and remove hitbox
            enemy.body.setVelocity(0);
            enemy.body.setImmovable(true);
            enemy.body.moves = false;
            enemy.body.enable = false; // Disable the physics body
            enemy.isDead = true;

            this.enemiesKilled += 1
            this.incrementScore(100)
    
            // Set a timer to destroy the enemy after 3 seconds
            this.time.delayedCall(3000, () => {
                enemy.destroy();
            }, [], this);
        } else {
            // Optional: Visual feedback for enemy hurt
        }
    }

    incrementScore(amount) {
        this.score += amount;
        console.log(`Score: ${this.score}`);
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
    
        // Disable collision between player and enemies
        if (this.playerEnemyCollision) {
            this.playerEnemyCollision.active = false;
        }
    
        // Start blinking effect
        this.invulnerabilityEffect = this.tweens.add({
            targets: this.player,
            alpha: { from: 0.5, to: 0 },
            ease: 'Linear',
            duration: 200,
            repeat: -1,
            yoyo: true
        });
    
        // Re-enable collision after invulnerability time
        this.time.delayedCall(GAME_SETTINGS.playerInvulnerabilityTime, () => {
            this.isInvulnerable = false;
    
            // Re-enable collision between player and enemies
            if (this.playerEnemyCollision) {
                this.playerEnemyCollision.active = true;
            }
    
            // Stop blinking effect and ensure player is fully opaque
            if (this.invulnerabilityEffect) {
                this.invulnerabilityEffect.stop();
                this.player.setAlpha(1);
            }
        }, [], this);
    }

    collectItem(player, collectable) {
        // Add to collected items array
        this.collectedItems.push(collectable.name);

        this.sound.play('collectable', { volume: 0.1 });

        this.incrementScore(500);
    
        // Disable the collectable
        collectable.destroy();
    
        // Emit collectable update event
        EventBus.emit('collectable-update', this.collectedItems);

        this.collectablesCollected += 1;
    
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

    handlePlayerDamage(amount) {
        if (this.isPlayerDead) return; // Prevent multiple triggers
    
        this.playerHealth -= amount;

        this.sound.play('player_damage', { volume: 0.1 });

        if (this.playerHealth <= 0) {

            console.log('Player died!');

            this.playerHealth = 0;
            this.isPlayerDead = true; // Flag to indicate the player is dead
    
            // // Set the player sprite to the death frame
            // this.player.setFrame('death');
    
            // // Disable player's physics body to prevent further interactions
            // this.player.body.enable = false;

            // // Disable player input
            // this.cursors.enabled = false;
            // this.keys.enabled = false;
    
            // this.time.delayedCall(3000, () => {
                this.resetGame();
            // }, [], this);
        }

        console.log(`Player health: ${this.playerHealth}`);
        EventBus.emit('health-update', this.playerHealth);
    }

    resetGame() {
        this.sound.stopAll();

        // Reset player health
        this.playerHealth = 3;
        EventBus.emit('health-update', this.playerHealth); // Emit health update event
    
        // Clear collected items array
        this.collectedItems = [];
        EventBus.emit('collectable-update', this.collectedItems); // Update UI

        this.collectablesCollected = 0;
        this.score = 0;
        this.enemiesKilled = 0;
    
        // Reset player position to the starting point
        this.player.setPosition(this.playerX, this.playerY);
    
        // Re-enable player's physics body
        this.player.body.enable = true;
    
        // Re-enable player input
        this.cursors.enabled = true;
        this.keys.enabled = true;
    
        // Reset death flag
        this.isPlayerDead = false;
    
        // Reset invulnerability flag if used elsewhere
        this.isInvulnerable = false;
    
        // Restart the scene
        this.scene.restart();
    }
}