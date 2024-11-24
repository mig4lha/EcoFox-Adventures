import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class Game extends Scene {
    constructor() {
        super('Game');
    }

    create() {
        this.cameras.main.setBackgroundColor('#000000');

        this.add.text(512, 384, 'Teste Game Scene', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        // Fade in the scene
        this.cameras.main.fadeIn(1000);

        EventBus.emit('current-scene-ready', this);
    }
}