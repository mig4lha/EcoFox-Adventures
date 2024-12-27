import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { createButtonAnimation } from '../AnimationUtils';

export class MainMenu extends Scene {
    constructor() {
        super('MainMenu');

        this.bg = null; // Store reference to background
        this.logo = null; // Store reference to logo
        this.playButton = null; // Store reference to play button
        this.leaderboardButton = null; // Store reference to leaderboard button

        this.width = 0; // Screen width
        this.height = 0; // Screen height
    }

    create() {
        this.width = this.scale.width;
        this.height = this.scale.height;
        
        // Initial setup
        this.setupBackground();
        this.setupLogo();
        this.setupButtons();

        // Fade in the scene
        this.cameras.main.fadeIn(1000);

        EventBus.emit('current-scene-ready', this);
    }

    setupBackground() {
        // Add or update background
        if (!this.bg) {
            this.bg = this.add.image(this.width / 2, this.height / 2, 'main_menu_background');
        }

        // Scale background to cover screen
        const scaleX = this.width / this.bg.width;
        const scaleY = this.height / this.bg.height;
        const scale = Math.max(scaleX, scaleY);

        this.bg.setScale(scale).setPosition(this.width / 2, this.height / 2);
    }

    setupLogo() {
        // Add or update logo
        if (!this.logo) {
            this.logo = this.add.image(this.width / 2, this.height / 2, 'logo');
        }

        const scaleFactor = 0.8; // Adjust this value to make the logo smaller or larger
        this.logo.setScale(scaleFactor).setPosition(this.width / 2, this.height * 0.3);
    }

    setupButtons() {
        // Create animation for play button if it doesn't already exist
        let playButtonAnim;
        let leaderboardButtonAnim;
        if (!this.anims.exists('playButtonAnim')) {
            createButtonAnimation(this, 'playButton', 'playButtonAnim');
            playButtonAnim = this.anims.get('playButtonAnim');
        } else {
            playButtonAnim = this.anims.get('playButtonAnim');
        }
        if (!this.anims.exists('leaderboardButtonAnim')) {
            createButtonAnimation(this, 'leaderboardButton', 'leaderboardButtonAnim');
            leaderboardButtonAnim = this.anims.get('leaderboardButtonAnim');
        } else {
            leaderboardButtonAnim = this.anims.get('leaderboardButtonAnim');
        }

        // Add or update play button
        if (!this.playButton) {
            this.playButton = this.add.sprite(this.width / 2, this.height / 2, 'playButton', 0); // Initialize with the first frame
            this.playButton.setInteractive();
            this.playButton.on('pointerdown', (pointer) => {
                if (pointer.event.shiftKey) {
                    // Shift + Left Click action
                    this.playButton.play(playButtonAnim);
                    this.cameras.main.fadeOut(1000, 0, 0, 0, () => {
                        // Game debug map
                        this.scene.start('DebugGame');
                    });
                } else {
                    // Regular Left Click action
                    this.playButton.play(playButtonAnim);
                    this.cameras.main.fadeOut(1000, 0, 0, 0, () => {
                        this.scene.start('Game');
                    });
                }
            });
            this.playButton.on('animationcomplete', () => {
                this.playButton.setFrame(0); // Reset to the first frame
            });
        }


        if (!this.leaderboardButton) {
            this.leaderboardButton = this.add.sprite(this.width / 2, this.height / 2, 'leaderboardButton', 0); // Initialize with the first frame
            this.leaderboardButton.setInteractive();
            this.leaderboardButton.on('pointerdown', () => {
                this.leaderboardButton.play(leaderboardButtonAnim);
            });
            this.leaderboardButton.on('animationcomplete', () => {
                this.leaderboardButton.setFrame(0); // Reset to the first frame
            });
        }

        const scaleFactor = 2; // Adjust this value to make the buttons smaller or larger
        this.playButton.setScale(scaleFactor);
        this.leaderboardButton.setScale(scaleFactor);

        // Calculate positions
        const logoBottom = this.logo.y + (this.logo.displayHeight / 2);
        const playButtonY = logoBottom + (this.height * 0.15);
        const leaderboardButtonY = playButtonY + (this.height * 0.125);

        // Set positions
        this.playButton.setPosition(this.width / 2, playButtonY);
        this.leaderboardButton.setPosition(this.width / 2, leaderboardButtonY);
    }
}
