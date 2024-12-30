import { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { GAME_SETTINGS } from '../Config';

export class ScoreScene extends Scene {
    constructor() {
        super('ScoreScene');
        this.parallaxLayers = []; // Array to hold parallax layers
    }

    init(data) {
        this.level = data.level;
        this.timeTaken = data.timeTaken;
        this.collectables = data.collectables;
        this.enemiesKilled = data.enemiesKilled;
        this.totalScore = data.totalScore;

        // Update the current level and start the game scene
        GAME_SETTINGS.currentLevel++;
    }

    preload() {
        // Load the assets for the game scene
        this.load.setPath('assets');

        this.load.image('bg_score_1', 'backgrounds/level1_score_scene/parallax-mountain-bg.png');~
        this.load.image('bg_score_2', 'backgrounds/level1_score_scene/parallax-mountain-mountains.png');
        this.load.image('bg_score_3', 'backgrounds/level1_score_scene/parallax-mountain-montain-far.png');
        this.load.image('bg_score_4', 'backgrounds/level1_score_scene/parallax-mountain-trees.png');
        this.load.image('bg_score_5', 'backgrounds/level1_score_scene/parallax-mountain-foreground-trees.png');

        // this.load.image('score_board', 'ui/score_board.png');
    }

    // Helper function to calculate integer scale
    calculateScale(imageWidth, imageHeight, gameWidth, gameHeight) {
        const scaleX = Math.floor(gameWidth / imageWidth);
        const scaleY = Math.floor(gameHeight / imageHeight);
        return Math.min(scaleX, scaleY);
    }

    create() {
        // Fade in from black
        this.cameras.main.fadeIn(2000, 0, 0, 0);

        // Define the background layers in order
        const bgLayers = [
            { key: 'bg_score_1', scale: 6.5, speed: 0 },    // Static background
            { key: 'bg_score_2', scale: 7, speed: 0.05 },  // Parallax layers
            { key: 'bg_score_3', scale: 7, speed: 0.15 },
            { key: 'bg_score_4', scale: 7, speed: 0.3 },
            { key: 'bg_score_5', scale: 7, speed: 0.5 }
        ];

        // Get game dimensions
        const gameWidth = this.scale.width;
        const gameHeight = this.scale.height;

        // Iterate and add each background layer with specified scaling
        bgLayers.forEach((layer, index) => {
            const bgImage = this.add.image(gameWidth / 2, gameHeight / 2, layer.key)
                .setOrigin(0.5, 0.5) // Center the image
                .setDepth(index)      // Ensure correct rendering order
                .setScale(layer.scale); // Apply scale factor

            // If the layer has a speed factor, add it to parallaxLayers
            if (layer.speed > 0) {
                this.parallaxLayers.push({
                    image: bgImage,
                    speed: layer.speed
                });
            }
        });

        // Display scores and other text elements on top of backgrounds
        this.add.text(gameWidth / 2, 200, 'Level Complete!', {
            fontSize: '64px',
            fontFamily: '"monogram", sans-serif',
            fill: '#ffffff',
            fontStyle: 'bold',
            backgroundColor: '#000000a0',
            padding: { x: 20, y: 10 },
        }).setOrigin(0.5).setDepth(1000);

        this.add.text(gameWidth / 2, 350, `Time Taken: ${this.timeTaken}s`, {
            fontSize: '48px',
            fontFamily: '"monogram", sans-serif',
            fill: '#ffffff',
            backgroundColor: '#000000a0',
            padding: { x: 20, y: 10 },
        }).setOrigin(0.5).setDepth(1000);

        this.add.text(gameWidth / 2, 420, `Collectables: ${this.collectables}`, {
            fontSize: '48px',
            fontFamily: '"monogram", sans-serif',
            fill: '#ffffff',
            backgroundColor: '#000000a0',
            padding: { x: 20, y: 10 },
        }).setOrigin(0.5).setDepth(1000);

        this.add.text(gameWidth / 2, 490, `Enemies Killed: ${this.enemiesKilled}`, {
            fontSize: '48px',
            fontFamily: '"monogram", sans-serif',
            fill: '#ffffff',
            backgroundColor: '#000000a0',
            padding: { x: 20, y: 10 },
        }).setOrigin(0.5).setDepth(1000);

        this.add.text(gameWidth / 2, 560, `Total Score: ${this.totalScore}`, {
            fontSize: '48px',
            fontFamily: '"monogram", sans-serif',
            fill: '#ffff00',
            fontStyle: 'bold',
            backgroundColor: '#000000a0',
            padding: { x: 20, y: 10 },
        }).setOrigin(0.5).setDepth(1000);

        var text = GAME_SETTINGS.currentLevel <= GAME_SETTINGS.totalLevels ? 'Next Level' : 'End Game';

        this.add.text(gameWidth / 2, 630, text, { 
            fontSize: '48px', 
            fontFamily: '"monogram", sans-serif',
            fill: '#0f0',
            fontStyle: 'bold',
            backgroundColor: '#000000a0',
            padding: { x: 20, y: 10 },
        }).setOrigin(0.5)
          .setInteractive()
          .setDepth(1000)
          .on('pointerdown', () => {

            if(GAME_SETTINGS.currentLevel <= GAME_SETTINGS.totalLevels) {
                console.log(`Starting level ${GAME_SETTINGS.currentLevel}`);
                this.scene.start('Game');
            } else {
                console.log('Game finished!');

                EventBus.emit('scene-change', 'EndGame');

                this.cameras.main.fadeOut(1500, 0, 0, 0);

                this.scene.start('EndGame');
            }

          });
    }

    update(time, delta) {
        // Iterate through each parallax layer and adjust its position
        this.parallaxLayers.forEach(layer => {
            // Move the layer horizontally based on its speed
            layer.image.x -= layer.speed;

            // If the image moves off the left side of the screen, reset its position to the right
            if (layer.image.x < -layer.image.width / 2) {
                layer.image.x = this.scale.width + layer.image.width / 2;
            }
        });
    }
}