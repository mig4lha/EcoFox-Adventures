import { Scene } from 'phaser';
import { EventBus } from '../EventBus';

export class EndGame extends Scene {
    constructor() {
        super('EndGame');
    }

    create() {
        const { width, height } = this.scale;

        this.add.text(width / 2, height / 2, 'Thank you for playing!', {
            fontFamily: '"monogram", sans-serif',
            fontSize: '64px',
            color: '#ffffff'
        }).setOrigin(0.5);
    }
}