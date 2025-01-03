import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class MainMenu extends Scene {
    constructor() {
        super('MainMenu');
        this.parallaxLayers = []; // Array to hold parallax layers with two images each
    }

    preload() { 
        // Set the loading path
        this.load.setPath('assets');

        // Backgrounds
        this.load.image('bg_mm_1', 'backgrounds/main_menu/sky.png');
        this.load.image('bg_mm_2', 'backgrounds/main_menu/far-mountains.png');
        this.load.image('bg_mm_3', 'backgrounds/main_menu/middle-mountains.png');
        this.load.image('bg_mm_4', 'backgrounds/main_menu/far-trees.png');
        this.load.image('bg_mm_5', 'backgrounds/main_menu/myst.png');
        this.load.image('bg_mm_6', 'backgrounds/main_menu/near-trees.png');

        // Logos
        this.load.image('logo', 'logos/logo.png');
        
        // Buttons
        this.load.spritesheet('playButton', 'buttons/playButton.png', { frameWidth: 144, frameHeight: 72 });
        this.load.spritesheet('leaderboardButton', 'buttons/leaderboardButton.png', { frameWidth: 144, frameHeight: 72 });
        
        // Additional Assets (if needed)
        this.load.image('test_tiles', 'test_assets/test_tiles.png');
        this.load.tilemapTiledJSON('test_map', 'levels/test_map.json');
    }

    // Helper function to calculate integer scale
    calculateScale(imageWidth, imageHeight, gameWidth, gameHeight) {
        const scaleX = gameWidth / imageWidth;
        const scaleY = gameHeight / imageHeight;
        return Math.max(scaleX, scaleY); // Ensures the image covers the screen
    }

    create() {
        // Fade in from black over 2 seconds
        this.cameras.main.fadeIn(2000, 0, 0, 0);
        
        this.sound.play('main_menu', { volume: 0.1 });

        // Clear existing parallax layers if any (to prevent duplicates)
        this.clearParallaxLayers();

        // Define the background layers in order with their respective speeds
        const bgLayers = [
            { key: 'bg_mm_1', scale: 6, speed: 0 },      // Static background (e.g., sky)
            { key: 'bg_mm_2', scale: 5, speed: 0.025 }, // Parallax layers
            { key: 'bg_mm_3', scale: 5, speed: 0.05 },
            { key: 'bg_mm_4', scale: 5, speed: 0.1 },
            { key: 'bg_mm_5', scale: 5, speed: 0.2 },
            { key: 'bg_mm_6', scale: 5, speed: 0.3 }
        ];

        // Inside create()
        const gameWidth = this.scale.width;
        const gameHeight = this.scale.height;

        // Iterate and add each background layer with two copies for seamless looping
        bgLayers.forEach((layer, index) => {
            if (layer.speed === 0) {
                // Static background
                const bgImage = this.add.image(gameWidth / 2, gameHeight / 2, layer.key)
                    .setOrigin(0.5, 0.5)
                    .setDepth(index)
                    .setScale(layer.scale);
            } else {
                // Moving backgrounds
                // Calculate scale to ensure image width >= game width
                const originalImageWidth = this.textures.get(layer.key).getSourceImage().width;
                const originalImageHeight = this.textures.get(layer.key).getSourceImage().height;
                layer.scale = this.calculateScale(originalImageWidth, originalImageHeight, gameWidth, gameHeight);

                const bgImage1 = this.add.image(0, gameHeight / 2, layer.key)
                    .setOrigin(0, 0.5)
                    .setDepth(index)
                    .setScale(layer.scale);

                const bgImage2 = this.add.image(bgImage1.displayWidth - 2, gameHeight / 2, layer.key) // Slight overlap of 2 pixels
                    .setOrigin(0, 0.5)
                    .setDepth(index)
                    .setScale(layer.scale);

                // Add both images to parallaxLayers
                this.parallaxLayers.push({
                    images: [bgImage1, bgImage2],
                    speed: layer.speed
                });
            }
        });

        // Setup additional scene elements (e.g., logo, buttons)
        this.setupLogo();
        this.setupButtons();

        // Emit event indicating the scene is ready
        EventBus.emit('current-scene-ready', this);
    }

    setupLogo() {
        // Add logo at the top center
        this.logo = this.add.image(this.scale.width / 2, this.scale.height * 0.3, 'logo')
            .setOrigin(0.5, 0.5)
            .setScale(1) 
            .setDepth(1000);
    }

    setupButtons() {

        // Add Play Button
        this.playButton = this.add.sprite(this.scale.width / 2, this.scale.height / 2 + 100, 'playButton', 0)
            .setInteractive()
            .setScale(2) // Adjust scale as needed
            .setDepth(1000)
            .on('pointerdown', () => {
                this.startGame();
            })

        // Add Leaderboard Button
        this.leaderboardButton = this.add.sprite(this.scale.width / 2, this.scale.height / 2 + 225, 'leaderboardButton', 0)
            .setInteractive()
            .setScale(2) // Adjust scale as needed
            .setDepth(1000)
            .on('pointerdown', () => {
                this.showLeaderboard();
            })
    }

    startGame() {
        this.sound.stopAll(); // Stop all sounds before transitioning
        this.scene.start('Game'); // Transition to the Game scene
    }

    showLeaderboard() {
        // Implement leaderboard display logic here
    }

    update() {
        // Iterate through each parallax layer and adjust their positions
        this.parallaxLayers.forEach(layer => {
            layer.images.forEach((image, index) => {
                // Move the layer horizontally based on its speed
                image.x -= layer.speed;
    
                // If the image moves off the left side of the screen, reposition it to the right
                if (image.x <= -image.displayWidth) {
                    const otherImage = layer.images[1 - index];
                    image.x = otherImage.x + otherImage.displayWidth - 2; // Maintain the slight overlap
                }
            });
        });
    }
    
    clearParallaxLayers() {
        // Remove existing parallax images from the scene
        this.parallaxLayers.forEach(layer => {
            layer.images.forEach(image => {
                image.destroy();
            });
        });
        // Clear the parallaxLayers array
        this.parallaxLayers = [];
    }
}