import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class Game extends Scene {
    constructor() {
        super('Game');
    }

    preload() {
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath('assets');
        this.load.image('player', 'test_assets/player.png');
        this.load.image('test_tiles', 'test_assets/test_tiles.png');
        this.load.tilemapTiledJSON('test_map', 'levels/test_map.json');
    }

    create() {
        this.cameras.main.setBackgroundColor('#000000');
        
        const map = this.make.tilemap({ key: 'test_map' });
        const tileset = map.addTilesetImage('test_tiles', 'test_tiles');

        this.backgroundLayer = map.createLayer('Background', tileset, 0, 0);
        this.terrainLayer = map.createLayer('Terrain', tileset, 0, 0);
        this.platformsLayer = map.createLayer('Platforms', tileset, 0, 0);

        this.playerX = map.getObjectLayer('Player Spawn').objects[0].x;
        this.playerY = map.getObjectLayer('Player Spawn').objects[0].y;
        console.log(this.playerX, this.playerY);

        this.player = this.physics.add.image(this.playerX, this.playerY, 'player');

        this.terrainLayer.setCollisionByProperty({ collides: true });
        this.platformsLayer.setCollisionByProperty({ collides: true });

        // this.add.image(100, 100, 'test_tiles')
        // const map = this.make.tilemap({ key: 'test_map' });
        // const tileset = map.addTilesetImage({ name: 'test_tiles', key: 'test_tiles' });

        // map.createStaticLayer('Background', tileset);


        // Fade in the scene
        this.cameras.main.fadeIn(1000);

        EventBus.emit('current-scene-ready', this);
    }
}