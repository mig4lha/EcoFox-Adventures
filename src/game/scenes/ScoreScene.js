import { Scene } from 'phaser';
import { EventBus } from '../EventBus';

export class ScoreScene extends Scene {
    constructor() {
        super('ScoreScene');
    }

    init(data) {
        this.timeTaken = data.timeTaken;
        this.collectables = data.collectables;
        this.enemiesKilled = data.enemiesKilled;
        this.totalScore = data.totalScore;
    }

    create() {
        // Fade in from black
        this.cameras.main.fadeIn(2000, 0, 0, 0);

        // Display scores
        this.add.text(400, 200, 'Level Complete!', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);
        this.add.text(400, 250, `Time Taken: ${this.timeTaken} seconds`, { fontSize: '24px', fill: '#fff' }).setOrigin(0.5);
        if (this.timeTaken < 60) {
            this.add.text(400, 250, `Time Taken: ${this.timeTaken} seconds`, { fontSize: '24px', fill: '#fff' }).setOrigin(0.5);
        } else {
            const minutes = Math.floor(this.timeTaken / 60);
            const seconds = this.timeTaken % 60;
            this.add.text(400, 250, `Time Taken: ${minutes}m ${seconds}s`, { fontSize: '24px', fill: '#fff' }).setOrigin(0.5);
        }
        this.add.text(400, 300, `Collectables: ${this.collectables}/3`, { fontSize: '24px', fill: '#fff' }).setOrigin(0.5);
        this.add.text(400, 350, `Enemies Killed: ${this.enemiesKilled}`, { fontSize: '24px', fill: '#fff' }).setOrigin(0.5);
        this.add.text(400, 400, `Total Score: ${this.totalScore}`, { fontSize: '24px', fill: '#fff' }).setOrigin(0.5);

        // Next Level Button
        const nextLevelButton = this.add.text(400, 450, 'Next Level', { fontSize: '28px', fill: '#0f0' })
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                this.scene.start('Game'); // Adjust if different scene name
            });
    }
}