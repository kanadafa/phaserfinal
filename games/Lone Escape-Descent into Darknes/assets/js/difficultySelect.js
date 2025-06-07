export default class DifficultySelect extends Phaser.Scene {
    constructor() {
        super({ key: 'DifficultySelect' });
    }

    create() {
        this.createUI();
        this.scale.on('resize', this.createUI, this);
    }

    createUI() {
        if (this.uiElements) {
            this.uiElements.forEach(obj => obj.destroy());
        }
        this.uiElements = [];

        const centerX = this.cameras.main.centerX;
        const screenHeight = this.cameras.main.height;

        const titleFontSize = Math.floor(screenHeight * 0.08);
        const buttonFontSize = Math.floor(screenHeight * 0.05);
        const buttonSpacing = screenHeight * 0.1;
        const startY = screenHeight * 0.4;

        const title = this.add.text(centerX, screenHeight * 0.15, '選擇難度', {
            fontSize: `${titleFontSize}px`,
            color: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        this.uiElements.push(title);

        this.easyButton = this.createButton(centerX, startY, '簡單', buttonFontSize, () => {
            this.scene.start('EasyGameScene');
        });

        this.normalButton = this.createButton(centerX, startY + buttonSpacing, '普通', buttonFontSize, () => {
            console.log('普通模式尚未開放');
        });

        this.hardButton = this.createButton(centerX, startY + buttonSpacing * 2, '困難', buttonFontSize, () => {
            console.log('困難模式尚未開放');
        });

        this.backButton = this.createButton(centerX, startY + buttonSpacing * 3, '返回主選單', buttonFontSize, () => {
            this.scene.start('MainMenu');
        });

        this.uiElements.push(this.easyButton, this.normalButton, this.hardButton, this.backButton);
    }

    createButton(x, y, label, fontSize, callback) {
        const button = this.add.text(x, y, label, {
            fontSize: `${fontSize}px`,
            color: '#00ff00',
            fontFamily: 'Arial',
            backgroundColor: '#000000',
            padding: { left: 20, right: 20, top: 10, bottom: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        button.on('pointerover', () => {
            button.setColor('#ffff00');
            button.setScale(1.1);
        });

        button.on('pointerout', () => {
            button.setColor('#00ff00');
            button.setScale(1);
        });

        button.on('pointerdown', () => {
            button.setScale(0.9);
        });

        button.on('pointerup', () => {
            button.setScale(1.1);
            callback();
        });

        return button;
    }
}

