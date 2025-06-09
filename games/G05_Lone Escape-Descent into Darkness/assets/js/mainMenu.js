export default class MainMenu extends Phaser.Scene {
    constructor() {
        super({ key: 'MainMenu' });
    }
    preload() {
        this.load.image('LOGO', 'assets/MAP/LOGO.png') // 確保路徑正確
    }


    create() {
        this.createUI();
        this.scale.on('resize', this.createUI, this); // 監聽視窗變化
    }

    createUI() {
        if (this.uiElements) {
            this.uiElements.forEach(obj => obj.destroy());
        }
        this.uiElements = [];

        // 加入背景封面圖
        const bg = this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, 'LOGO')
            .setOrigin(0.5)
            .setDepth(-1)
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height);
        this.uiElements.push(bg);

        const centerX = this.cameras.main.centerX;
        const screenHeight = this.cameras.main.height;

        const titleFontSize = Math.floor(screenHeight * 0.08);
        const buttonFontSize = Math.floor(screenHeight * 0.05);
        const buttonSpacing = screenHeight * 0.1;
        const startY = screenHeight * 0.4;
/*
        const title = this.add.text(centerX, screenHeight * 0.15, 'Lone Escape:Descent into Darkness', {
            fontSize: `${titleFontSize}px`,
            color: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        this.uiElements.push(title);
        */

        this.startButton = this.createButton(centerX, startY, '開始遊戲', buttonFontSize, () => {
            this.scene.start('DifficultySelect');
        });

        this.settingsButton = this.createButton(centerX, startY + buttonSpacing, '設定', buttonFontSize, () => {
            console.log('設定功能尚未開放');
        });

        this.exitButton = this.createButton(centerX, startY + buttonSpacing * 2, '離開遊戲', buttonFontSize, () => {
            if (window.confirm('確定要離開遊戲嗎？請手動關閉視窗。')) {
                window.close();
            }
        });

        this.uiElements.push(this.startButton, this.settingsButton, this.exitButton);
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


