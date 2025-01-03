import { Boot } from './scenes/Boot';
import { Game } from './scenes/Game';
import { DebugGame } from './scenes/DebugGame';
import { EndGame } from './scenes/EndGame';
import { MainMenu } from './scenes/MainMenu';
import Phaser from 'phaser';
import { Preloader } from './scenes/Preloader';
import { ScoreScene } from './scenes/ScoreScene';

// Find out more information about the Game Config at:
// https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: window.innerWidth,
        height: window.innerHeight,
    },
    scene: [
        Boot,
        Preloader,
        MainMenu,
        DebugGame,
        Game,
        ScoreScene,
        EndGame,
    ],
    physics: {
        default: 'arcade',
        arcade: {
            debug: true,
            fps: 120
        }
    },
    pixelArt: true, // Enable pixel art rendering
    render: {
        pixelArt: true, // Ensure pixel art rendering
        antialias: false, // Disable antialiasing
        roundPixels: true // Enable rounding of pixel values
    },
};

const StartGame = (parent) => {

    return new Phaser.Game({ ...config, parent });

}

export default StartGame;
