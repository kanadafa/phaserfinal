import MainMenu from './mainMenu.js';
import DifficultySelect from './difficultySelect.js';
import EasyGameScene from './EasyGameScene.js';

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#222222',
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            tilePadding: { x: 0, y: 0 }
        }
    },
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [MainMenu, DifficultySelect, EasyGameScene]
};

const game = new Phaser.Game(config);

window.addEventListener('resize', () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
});