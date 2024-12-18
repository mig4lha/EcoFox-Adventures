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
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath('assets');

        // Backgrounds
        this.load.image('main_menu_background', 'backgrounds/main_menu_background.png');

        // Logos
        this.load.image('logo', 'logos/logo.png');

        // Buttons
        this.load.spritesheet('playButton', 'buttons/playButton.png', { frameWidth: 144, frameHeight: 72 });
        this.load.spritesheet('leaderboardButton', 'buttons/leaderboardButton.png', { frameWidth: 144, frameHeight: 72 });

        this.load.image('test_tiles', 'test_assets/test_tiles.png');
        this.load.tilemapTiledJSON('test_map', 'test_assets/test_map.json');

        console.clear();

        // Log any errors during the loading process
        this.load.on('loaderror', (file) => {
            console.error(`Failed to load file: ${file.key}`);
        });

    }

    create ()
    {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
        this.scene.start('MainMenu');
    }
}
