import FL from './FunctionLibrary.js';

export default class EasyGameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'EasyGameScene' });
    }

    preload() {
        this.textures.generate('blank', {
            data: ['.'],
            pixelWidth: 1,
            pixelHeight: 1
        });
        this.load.image('player_afk1', 'assets/player/player_AFK1.png');
        this.load.image('player_afk2', 'assets/player/player_AFK2.png');
        this.load.image('player_walk1', 'assets/player/player_walk1.png');
        this.load.image('player_walk2', 'assets/player/player_walk2.png');
        this.load.image('player_walk3', 'assets/player/player_walk3.png');
        this.load.image('player_run1', 'assets/player/player_run1.png');
        this.load.image('player_run2', 'assets/player/player_run2.png');
        this.load.image('rush', 'assets/monster/RUSH.png');
        this.load.image('dark_entity', 'assets/monster/Dark/dark.png');

        this.load.tilemapTiledJSON('level1', 'assets/MAP/First.tmj');
        this.load.tilemapTiledJSON('level2', 'assets/MAP/Second.tmj');
        this.load.tilemapTiledJSON('level3', 'assets/MAP/Third.tmj');
        this.load.tilemapTiledJSON('Gallery', 'assets/MAP/Gallery.tmj');

        this.load.image('Inside_C', 'assets/MAP/Inside_C.png');
        this.load.image('A4', 'assets/MAP/A4.png');
        this.load.image('Inside_E', 'assets/MAP/Inside_E.png');

        this.load.image('ObstacleTilesetName', 'assets/MAP/Inside_C.png');
        this.load.image('DecorateTilesetName', 'assets/MAP/Inside_E.png');
        this.load.image('GroundWallTilesetName', 'assets/MAP/A4.png');
        this.load.image('candle', 'assets/item/candle.png');
        this.load.audio('rushSound', 'assets/Sounds/monster_SFX/RUSH/RUSH_atk.mp3');
        this.load.audio('mainBGM', 'assets/Sounds/BGM/Hollow Parade   Royalty Free Background Music   (Drum ’n’ Bass).mp3');


        for (let i = 1; i <= 5; i++) {
            this.load.image(`cabinet_${i}`, `assets/item/cabinet_${i}.png`);
        };
        for (let i = 1; i <= 9; i++) {
            this.load.image(`smile_${i}`, `assets/monster/smile/smile_${i}.png`);
        }

        for (let i = 1; i <= 10; i++) {
            this.load.image(`eye_${i}`, `assets/monster/eye/eye_${i}.png`);
        }


    }

    create() {
        const mapConfigs = [
            {
                mapKey: 'level1',
                tilesetsConfig: [
                    { name: 'A4', key: 'A4' },
                    { name: 'Inside_E', key: 'Inside_E' },
                    { name: 'Inside_C', key: 'Inside_C' }
                ],
                layerConfig: [
                    { alias: 'Ground', sources: 'Inside_C' },
                    { alias: 'Decorate', sources: ['Inside_C', 'Inside_E'] },
                    { alias: 'Wall', sources: 'A4' },
                    { alias: 'Obstacle', sources: 'Inside_C' }
                ]
            },
            {
                mapKey: 'level2',
                tilesetsConfig: [
                    { name: 'A4', key: 'A4' },
                    { name: 'Inside_E', key: 'Inside_E' },
                    { name: 'Inside_C', key: 'Inside_C' }
                ],
                layerConfig: [
                    { alias: 'Ground', sources: 'Inside_C' },
                    { alias: 'Wall', sources: 'A4' },
                    { alias: 'Obstacle', sources: 'Inside_C' },
                    { alias: 'Decorate', sources: ['Inside_C', 'A4'] }
                ]
            },
            {
                mapKey: 'level3',
                tilesetsConfig: [
                    { name: 'A4', key: 'A4' },
                    { name: 'Inside_E', key: 'Inside_E' },
                    { name: 'Inside_C', key: 'Inside_C' }
                ],
                layerConfig: [
                    { alias: 'Ground', sources: 'Inside_C' },
                    { alias: 'Decorate', sources: 'Inside_C' },
                    { alias: 'Wall', sources: 'A4' },
                    { alias: 'Obstacle', sources: 'Inside_C' }
                ]
            },
            {
                mapKey: 'Gallery',
                tilesetsConfig: [
                    { name: 'A4', key: 'A4' },
                    { name: 'Inside_C', key: 'Inside_C' }
                ],
                layerConfig: [
                    { alias: 'Ground', sources: 'Inside_C' },
                    { alias: 'Decorate', sources: 'Inside_C' },
                    { alias: 'Wall', sources: 'A4' },
                    { alias: 'Obstacle', sources: 'Inside_C' }
                ]
            }
        ];
        // 房間資料 (請補上更多模板)
        this.roomTemplates = [
            { obstacles: [] }
        ];


        this.currentLayers = {};
        this.tileScale = 1;
        this.roomCount = 0;
        this.isRestRoom = false;
        this.restRoomPoints = [10, 50, 100, 150, 200];

        this.restRoomDialogs = [
            '🛋️ 你進入了一間安靜的休息室。\n這裡暫時沒有危險，放鬆一下吧。\n\n小心RUSH!!\n可以用"E"鍵打開手電筒來驅逐DARK。',
            '🛋️ 空氣中瀰漫著壓抑的靜謐。\n雖然安全，卻讓人不寒而慄。\n\n小心smile，別被它發現你在動!!!',
            '🛋️ 有點像是回到安全區了。\n牆上的筆記寫著「保持警覺」。',
            '🛋️ 你聽到遠方傳來微弱的聲音。\n休息雖短暫，但或許是最後的喘息。',
            '🛋️ 房間裡點著一盞燈，燈下是張椅子。\n有人剛離開過這裡嗎？'
        ];

        this.mapColliders = [];
        this.lockers = this.physics.add.staticGroup();
        this.inLocker = false;
        this.canEnterLocker = false;
        this.targetLocker = null;
        this.lockerList = [];
        this.interactCooldown = 0;
        this.rushSound = this.sound.add('rushSound');
        this.darkEntity = null;
        this.darkEntityAlpha = 1;
        this.darkEntityTimer = 0;
        this.darkEntityVisible = false;

        this.isRushRoom = false;
        this.isRushActive = false;
        this.rushRecentlyTriggered = 0;
        this.rushSprite = null;

        this.eyeEntity = null;
        this.eyeTimer = 0;
        this.eyeActive = false;
        this.eyeLine = null;


        // 動畫設定
        FL.animsset(this)
        // 計時器
        this.timerActive = false;
        this.timerValue = 0;
        this.timerText = this.add.text(this.scale.width - 150, 30, '', {
            fontSize: '48px',
            color: '#ffffff',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(10).setVisible(false).setScrollFactor(0);

        this.dialogBackground = this.add.rectangle(this.scale.width / 2, this.scale.height - 50, this.scale.width - 100, 80, 0x000000, 0.7)
            .setStrokeStyle(3, 0xffffff)
            .setOrigin(0.5)
            .setDepth(10)
            .setVisible(false);

        this.dialogText = this.add.text(this.scale.width / 2, this.scale.height - 50, '', {
            fontSize: '24px',
            color: '#ffffff',
            fontFamily: 'Arial'
        }).setOrigin(0.5).setDepth(11).setVisible(false);

        this.teachActive = false;

        this.roomText = this.add.text(this.scale.width / 2, this.scale.height / 2, '', {
            fontSize: '64px',
            color: '#ffffff',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5).setDepth(5).setAlpha(0);

        // 玩家目前收集到的蠟燭數量（初始為 0）
        this.collectedCandles = 0;

        // 用來顯示收集進度的文字，先不顯示
        this.candleText = this.add.text(20, 20, '蠟燭：0/3', {
            fontSize: '32px',
            color: '#ffff00',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 3
        })
            .setDepth(20)
            .setScrollFactor(0)
            .setVisible(false); // 一開始隱藏，等到 level2 才打開

        this.player = this.physics.add.sprite(400, 1100, 'player_afk1')
            .setDisplaySize(100, 100);

        this.keys = this.input.keyboard.addKeys('W,S,A,D,F,SHIFT');

        this.walls = this.physics.add.staticGroup();
        this.obstacles = this.physics.add.staticGroup();
        // 1) 把 mapConfigs 掛到 this
        this.mapConfigs = mapConfigs;


        // 2) 隨機取一張
        const first = this.mapConfigs[3];
        FL.pickAndSetupMap(this, first.mapKey, this.mapConfigs);

        // 3) 生成房間
        FL.createRoom(this, FL.getRandomRoom(this));

        this.flashlightConeVisible = false;
        this.flashlightDuration = 5000;
        this.flashlightCooldown = 3000;
        this.flashlightTimer = 0;
        this.flashlightCooling = false;
        this.keyE = this.input.keyboard.addKey('E');

        this.flashlightMaskShape = this.make.graphics({ x: 0, y: 0, add: false });
        this.flashlightMask = this.flashlightMaskShape.createGeometryMask();
        this.flashlightMask.invertAlpha = true;

        this.physics.add.collider(this.player, this.obstacles);
        this.physics.add.collider(this.player, this.walls);
        this.physics.add.overlap(this.player, this.door, FL.enterDoor, null, this);



        // 👉 教學畫面邏輯
        this.showTutorial = (text) => {
            if (this.tutorialOverlay) this.tutorialOverlay.destroy();
            if (this.tutorialText) this.tutorialText.destroy();

            this.tutorialOverlay = this.add.rectangle(this.scale.width / 2, this.scale.height / 2, this.scale.width, this.scale.height, 0x000000, 0.8)
                .setOrigin(0.5)
                .setDepth(50)
                .setScrollFactor(0);

            this.tutorialText = this.add.text(this.scale.width / 2, this.scale.height / 2, text, {
                fontSize: '28px',
                color: '#ffffff',
                fontFamily: 'Arial',
                align: 'center',
                lineSpacing: 10,
                wordWrap: { width: this.scale.width - 100 }
            }).setOrigin(0.5).setDepth(51).setScrollFactor(0);

            this.tutorialActive = true;

            this.input.once('pointerdown', () => this.closeTutorial());
            this.input.keyboard.once('keydown', () => this.closeTutorial());
        };

        this.closeTutorial = () => {
            if (this.tutorialActive) {
                if (this.tutorialOverlay) this.tutorialOverlay.destroy();
                if (this.tutorialText) this.tutorialText.destroy();
                this.tutorialActive = false;

                this.input.keyboard.resetKeys();
            }
        };

        // ➤ 初始說明畫面
        this.showTutorial(
            '🎮 操作說明 🎮\n\n使用 W A S D 移動角色\n按住 Shift 可加速奔跑！\n按 F 可互動啟動特殊機關\n\n👉 點擊滑鼠或按任意鍵開始遊戲'
        );

        this.bgMusic = this.sound.add('mainBGM', { loop: true, volume: 0.07 });
        this.bgMusic.play();



        this.player.setDepth(10);
        this.cameras.main.startFollow(this.player);
        this.cameras.main.zoom = 1;
        this.spotted = false;

    }


    update(time, delta) {
        //避免教學時操作
        if (this.tutorialActive) {
            this.player.setVelocity(0);  // 教學中強制靜止
            return;
        }

        // 手電筒控制邏輯
        if (Phaser.Input.Keyboard.JustDown(this.keyE) && !this.flashlightCooling && !this.flashlightConeVisible) {
            this.flashlightConeVisible = true;
            this.flashlightTimer = 0;
        }

        if (this.flashlightConeVisible) {
            this.flashlightTimer += delta;
            if (this.flashlightTimer >= this.flashlightDuration) {
                this.flashlightConeVisible = false;
                this.flashlightCooling = true;
                this.flashlightTimer = 0;
            }
        } else if (this.flashlightCooling) {
            this.flashlightTimer += delta;
            if (this.flashlightTimer >= this.flashlightCooldown) {
                this.flashlightCooling = false;
                this.flashlightTimer = 0;
            }
        }

        // 畫出手電筒光錐遮罩
        this.flashlightMaskShape.clear();
        if (this.darkRoomActive && this.flashlightConeVisible) {
            const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, this.input.activePointer.worldX, this.input.activePointer.worldY);
            const radius = 350;
            const spread = Phaser.Math.DegToRad(45);
            const steps = 30;

            this.flashlightMaskShape.fillStyle(0xffffff);
            this.flashlightMaskShape.beginPath();
            this.flashlightMaskShape.moveTo(this.player.x, this.player.y);
            for (let i = 0; i <= steps; i++) {
                const stepAngle = angle - spread / 2 + (spread / steps) * i;
                const x = this.player.x + Math.cos(stepAngle) * radius;
                const y = this.player.y + Math.sin(stepAngle) * radius;
                this.flashlightMaskShape.lineTo(x, y);
            }
            this.flashlightMaskShape.closePath();
            this.flashlightMaskShape.fillPath();

            this.darkOverlay.setMask(this.flashlightMask);
        } else {
            this.darkOverlay.clearMask();
        }

        // --- 櫃子冷卻更新 ---
        if (this.interactCooldown > 0) {
            this.interactCooldown -= delta;
        }

        this.canEnterLocker = false;
        this.targetLocker = null;

        // 擴大範圍：距離任一櫃子 < 80px 即可觸發互動
        if (!this.inLocker && this.lockerList) {
            for (let locker of this.lockerList) {
                const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, locker.x, locker.y);
                if (dist < 120) {
                    this.canEnterLocker = true;
                    this.targetLocker = locker;
                    break;
                }
            }
        }

        // --- 櫃子進出控制  ---
        if (Phaser.Input.Keyboard.JustDown(this.keys.F) && this.interactCooldown <= 0) {
            if (this.canEnterLocker && !this.inLocker && this.targetLocker) {
                this.inLocker = true;
                this.player.setTint(0x999999);
                this.player.setVelocity(0);
                this.player.x = this.targetLocker.x;
                this.player.y = this.targetLocker.y;
                this.player.body.enable = false;
                this.interactCooldown = 1000;

                if (this.targetLocker.anims) {
                    this.targetLocker.anims.play('cabinet_open', true);
                }

            }

            else if (this.inLocker) {
                this.inLocker = false;
                this.player.clearTint();
                this.player.body.enable = true;
                this.interactCooldown = 1000;

            }
        }


        // 先決定「被 Eye 看到時」的走路速度（範例：150）
        const spottedSpeed = 150;
        // 平常走路速度 300，衝刺速度 800（如果 canRun 為 true）
        const normalWalk = 300;
        const sprintSpeed = 800;

        // 如果被 Eye 看到，就用較慢的 baseSpeed，否則照常
        const baseSpeed = this.spotted ? spottedSpeed : normalWalk;
        // 只有 sprint 且 canRun=true 才能跑 800
        const speed = (this.keys.SHIFT.isDown && this.canRun && !this.spotted)
            ? sprintSpeed
            : baseSpeed;

        if (!this.inLocker) {
            this.player.setVelocity(0);

            if (this.keys.A.isDown) {
                this.player.setVelocityX(-speed);
                this.player.flipX = true;
            } else if (this.keys.D.isDown) {
                this.player.setVelocityX(speed);
                this.player.flipX = false;
            }

            if (this.keys.W.isDown) {
                this.player.setVelocityY(-speed);
            } else if (this.keys.S.isDown) {
                this.player.setVelocityY(speed);
            }
        }


        // 3. 控制動畫播放 + 角色左右翻轉
        let isMoving = false;
        if (this.keys.A.isDown) {
            isMoving = true;
            this.player.flipX = true; // 左翻
        } else if (this.keys.D.isDown) {
            isMoving = true;
            this.player.flipX = false; // 右正常
        }

        if (isMoving) {
            if (this.keys.SHIFT.isDown) {
                this.player.anims.play('player_run', true);
            } else {
                this.player.anims.play('player_walk', true);
            }
        } else {
            this.player.anims.play('player_idle', true);
        }

        // ===== DarkEntity 追蹤 + 照射影響邏輯 =====
        if (this.darkEntity && this.darkEntityVisible) {
            const dist = Phaser.Math.Distance.Between(
                this.player.x, this.player.y,
                this.darkEntity.x, this.darkEntity.y
            );

            let speed = 150;

            if (this.inLocker) {
                // 玩家在櫃子裡，DarkEntity 停止移動
                this.darkEntity.setAlpha(0.3); // 稍微半透明表示「搜尋中」
            } else {
                // 追蹤邏輯
                this.darkEntity.setAlpha(1); // 正常顯示
                const angle = Phaser.Math.Angle.Between(
                    this.darkEntity.x, this.darkEntity.y,
                    this.player.x, this.player.y
                );

                // 判斷是否被手電筒照到
                let beingLit = false;
                if (this.flashlightConeVisible) {
                    const coneAngle = Phaser.Math.Angle.Between(
                        this.player.x, this.player.y,
                        this.input.activePointer.worldX, this.input.activePointer.worldY
                    );
                    const toEntity = Phaser.Math.Angle.Between(
                        this.player.x, this.player.y,
                        this.darkEntity.x, this.darkEntity.y
                    );
                    const angleDiff = Phaser.Math.Angle.Wrap(toEntity - coneAngle);
                    if (Math.abs(angleDiff) < Phaser.Math.DegToRad(22.5) && dist < 350) {
                        beingLit = true;
                    }
                }

                if (beingLit) {
                    speed = 20;
                    this.darkEntityTimer += delta;
                    this.darkEntityAlpha = Phaser.Math.Clamp(1 - this.darkEntityTimer / 2500, 0, 1);
                    this.darkEntity.setAlpha(this.darkEntityAlpha);
                    if (this.darkEntityAlpha <= 0) {
                        this.darkEntity.destroy();
                        this.darkEntity = null;
                        this.darkEntityVisible = false;
                        if (this.darkRoomActive) FL.spawnDarkEntity(this);
                    }
                } else {
                    this.darkEntityTimer = 0;
                    this.darkEntityAlpha = 1;
                    this.darkEntity.setAlpha(1);
                }

                this.darkEntity.x += Math.cos(angle) * speed * delta / 1000;
                this.darkEntity.y += Math.sin(angle) * speed * delta / 1000;

                // 死亡判定
                if (dist < 40 && !this.inLocker) {
                    console.log("DarkEntity 擊殺玩家！");
                    this.isRushInProgress = false;
                    FL.cleanUpRoom(scene);
                    this.scene.start('MainMenu');
                }
            }
        }

        // 把這塊放在 update(time, delta) 中，取代原本那段 Eye 追逐的程式碼：
        if (this.eyeActive && this.eyeEntity) {
            // 1. 算出從眼睛到玩家的「直接角度」，並讓眼睛朝向
            const rawAngle = Phaser.Math.Angle.Between(
                this.eyeEntity.x, this.eyeEntity.y,
                this.player.x, this.player.y
            );
            this.eyeEntity.setRotation(rawAngle);

            // 2. 檢查「直線連線」是否被擋住
            const blockedStraight = FL.checkObstruction(
                this,
                this.eyeEntity.x, this.eyeEntity.y,
                this.player.x, this.player.y
            );

            if (!blockedStraight) {
                this.spotted = true;
                // 【情境 A：可以直接看到玩家】→ 停下來畫連線，累積攻擊時間
                if (this.eyeLine) {
                    this.eyeLine.clear();
                }
                this.eyeLine = this.add.graphics().setDepth(7);

                // 漸層顏色
                const progress = Phaser.Math.Clamp(this.eyeTimer / 5000, 0, 1);
                const red = Math.floor(255 * progress);
                const blue = Math.floor(255 * (1 - progress));
                const color = (red << 16) + blue;

                this.eyeLine.lineStyle(4, color);
                this.eyeLine.beginPath();
                this.eyeLine.moveTo(this.eyeEntity.x, this.eyeEntity.y);
                this.eyeLine.lineTo(this.player.x, this.player.y);
                this.eyeLine.strokePath();

                // 累積攻擊計時
                this.eyeTimer += delta;
                this.canRun = false;  // 玩家被定住

                if (this.eyeTimer >= 5000) {
                    console.log("Eye 擊殺玩家！");
                    this.rushSound.stop();
                    this.isRushInProgress = false;
                    FL.cleanUpRoom(this);
                    this.scene.start('MainMenu');
                }
            }
            else {
                this.spotted = false;
                // 【情境 B：直線被擋】→ 先重置攻擊計時＆動畫，然後用偏移角度嘗試繞過障礙
                this.eyeTimer = 0;
                this.eyeEntity.anims.restart();
                this.canRun = true; // 追不到玩家時，玩家可自由移動

                if (this.eyeLine) {
                    this.eyeLine.clear();
                    this.eyeLine = null;
                }

                // 定義「嘗試偏移的角度列表」（以 radians 為單位）
                //   0 表示原本 rawAngle；+PI/4、−PI/4、+PI/2、−PI/2……你可以自己再加更多組
                const tryOffsets = [0, Math.PI / 4, -Math.PI / 4, Math.PI / 2, -Math.PI / 2];
                let chosenAngle = rawAngle; // 如果所有都找不到，就還是用原始角度往前走

                for (let offset of tryOffsets) {
                    const testAngle = rawAngle + offset;
                    // 先把「沿 testAngle 方向畫一條線到玩家位置」轉成一個假想點
                    // （其實我們只要檢查「這條線跟玩家之間」是否被擋就好，所以直接呼叫 checkObstruction）
                    const testX = this.eyeEntity.x + Math.cos(testAngle) * 10; // 只移 10px 做檢查即可
                    const testY = this.eyeEntity.y + Math.sin(testAngle) * 10;

                    // 檢查從 (testX,testY) 再直線到玩家的路徑是否被擋
                    const blockedTest = FL.checkObstruction(
                        this,
                        testX, testY,
                        this.player.x, this.player.y
                    );

                    if (!blockedTest) {
                        // 一旦找到一個偏移角度能「從那裡」直線看到玩家，就選用這個角度
                        chosenAngle = testAngle;
                        break;
                    }
                }

                // 用 chosenAngle 來讓 eyeEntity 往前移一小步，持續繞障礙
                const moveSpeed = 500;
                this.eyeEntity.x += Math.cos(chosenAngle) * moveSpeed * (delta / 1000);
                this.eyeEntity.y += Math.sin(chosenAngle) * moveSpeed * (delta / 1000);
            }
        }
        else {
            // 如果 eyeActive 或 eyeEntity 不存在，恢復玩家可跑
            this.canRun = true;
            this.spotted = false;
            if (this.eyeLine) {
                this.eyeLine.clear();
                this.eyeLine = null;
            }
        }




        // 倒數計時處理
        if (this.timerActive) {
            this.timerValue -= delta;
            if (this.timerValue <= 0) {
                this.timerValue = 0;
                FL.stopCountdown(this);
                console.log('時間到！');
            }
            FL.updateTimerDisplay(this);
        }

        this.events.on('shutdown', () => {
            if (this.bgMusic) {
                this.bgMusic.stop();
                this.bgMusic.destroy();
                this.bgMusic = null;
            }
        });

        // 教學物品偵測
        if (this.teachItem && Phaser.Math.Distance.Between(
            this.player.x, this.player.y,
            this.teachItem.x, this.teachItem.y
        ) < 60) {
            if (this.keys.F.isDown && !this.teachActive) {
                FL.triggerTeaching(this);
            }
        }
    }
}






