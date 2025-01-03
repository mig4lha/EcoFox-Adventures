import { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { GAME_SETTINGS } from '../Config';

export class EndGame extends Scene {
    constructor() {
        super('EndGame');
    }

    init(data) {
        this.cursors = data.cursors;
        this.keys = data.keys;
    }

    create() {
        // Fade in from black
        this.cameras.main.fadeIn(2000, 0, 0, 0);

        const { width, height } = this.scale;

        this.add.text(width / 2, height / 2 - 200, 'Thank you for playing!', {
            fontFamily: '"monogram", sans-serif',
            fontSize: '80px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(width / 2, height / 2 - 50, `Total Time Taken: ${GAME_SETTINGS.totalTimeTaken}`, {
            fontFamily: '"monogram", sans-serif',
            fontSize: '64px',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(1000);
        this.add.text(width / 2, height / 2 + 50, `Total Score: ${GAME_SETTINGS.totalScore}`, {
            fontFamily: '"monogram", sans-serif',
            fontSize: '64px',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(1000);

        this.time.delayedCall(2000, () => {
            // Add running player sprite below the text
            const player = this.add.sprite(-50, height / 2 + 200, 'player', 'run_0')
            .setScale(7)
            .play('run');

            // Tween to move player across the screen
            this.tweens.add({
                targets: player,
                x: width + 50,
                duration: 4000,
                ease: 'Linear',
                onComplete: () => {
                    player.destroy();
                    
                    this.cameras.main.fadeOut(2000, 0, 0, 0);

                    GAME_SETTINGS.currentLevel = 1;

                    this.cameras.main.once('camerafadeoutcomplete', () => {
                        EventBus.emit('gameDone');

                        EventBus.on('navigateToMainMenu', this.navigateToMainMenu, this);
                    });
                }
            });
        }, [], this);
        
        
    }

    navigateToMainMenu() {
        this.scene.start('MainMenu');

        GAME_SETTINGS.totalScore = 0;
        GAME_SETTINGS.totalTimeTaken = 0;
        
        // window.location.reload();
    }
}