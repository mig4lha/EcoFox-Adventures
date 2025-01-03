import { Scene } from 'phaser';

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(512-230, 384, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress) => {

            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + (460 * progress);

        });
    }

    preload ()
    {
        // Load the assets for the game scene
        this.load.setPath('assets');

        // Audio
        this.load.audio('main_menu', 'audio/main_menu.ogg');

        this.load.audio('enemy_death', 'audio/enemy_death.mp3');
        this.load.audio('jump_on_enemy', 'audio/jump_on_enemy.mp3');
        this.load.audio('enemy_laser', 'audio/enemy_laser.mp3');
        this.load.audio('player_damage', 'audio/player_damage.mp3');
        this.load.audio('jump', 'audio/jump.mp3');
        this.load.audio('double_jump', 'audio/double_jump.mp3');
        this.load.audio('collectable', 'audio/collectable.mp3');
        this.load.audio('interactable', 'audio/interactable.ogg');

        this.load.audio('level1', 'audio/level1.ogg');
        this.load.audio('level2', 'audio/level2.ogg');
        this.load.audio('menus', 'audio/menus.ogg');
    }

    create ()
    {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start('MainMenu');
    }
}
