function triggerTeaching(scene) {
    scene.teachActive = true;
    scene.dialogBackground.setVisible(true).setScrollFactor(0).setDepth(12);
    scene.dialogText.setVisible(true).setScrollFactor(0).setDepth(12);

    const messages = [
        "這條走廊……明明什麼都沒有，卻讓我起雞皮疙瘩。",
        "牆上的磚……都是一模一樣的排列，像是有人故意這麼做的。",
        "為什麼一直走……卻沒盡頭？我明明……",
        "不對……這裡根本不是正常的建築。",
        "我覺得，有東西在……盯著我。",
        "我聽見了什麼聲音……像是在牆裡移動……",
        "每一步都像踩在別人的記憶裡……我不該來的。",
        "不能慌……如果我現在慌了，就真的出不去了……",
        "這裡不是試煉……是陷阱，為了那些不信邪的人準備的。",
        "我要活著離開……我不會被吞掉的。"
    ];

    scene.dialogText.setText(messages[scene.roomCount] || "學習完成，祝你好運！");

    scene.time.delayedCall(2500, () => {
        scene.dialogBackground.setVisible(false).setScrollFactor(0).setDepth(12);
        scene.dialogText.setVisible(false).setScrollFactor(0).setDepth(12);
        scene.teachActive = false;
    });
}

function spawnTeachItem(scene) {
    // 1. 先建立 teachItem
    scene.teachItem = scene.add.text(2200, 1400, '!', {
        fontSize: '48px',
        color: '#ffff00',
        fontFamily: 'Arial',
        fontStyle: 'bold'
    })
        .setOrigin(0.5)
        .setDepth(6);

    // 2. 存下 tween 返回值，方便以后 cleanUpRoom 里 kill() 
    scene.teachTween = scene.tweens.add({
        targets: scene.teachItem,
        y: scene.teachItem.y - 10,
        duration: 600,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
    });
}


function showRoomText(scene) {
    // 如果之前还有一个淡出还没 kill，先 kill 掉
    if (scene.roomTextTween) {
        scene.roomTextTween.stop();
        scene.roomTextTween = null;
    }

    scene.roomText.setText(`Room ${scene.roomCount + 1}`);
    scene.roomText.setAlpha(1).setScrollFactor(0);

    // 存引用到 scene.roomTextTween
    scene.roomTextTween = scene.tweens.add({
        targets: scene.roomText,
        alpha: 0,
        duration: 1500,
        ease: 'Power1',
        onComplete: () => {
            // Tween 完成后把引用清空，让 cleanUpRoom 不会再误 kill
            scene.roomTextTween = null;
        }
    });
}

function getRandomRoom(scene) {
    const randomIndex = Phaser.Math.Between(0, scene.roomTemplates.length - 1);
    return scene.roomTemplates[randomIndex];
}

function updateTimerDisplay(scene) {
    let totalMs = Math.max(scene.timerValue, 0);
    let minutes = Math.floor(totalMs / 60000);
    let seconds = Math.floor((totalMs % 60000) / 1000);
    let milliseconds = Math.floor((totalMs % 1000) / 10);

    // 格式成兩位數
    let m = minutes.toString();
    let s = seconds.toString().padStart(2, '0');
    let ms = milliseconds.toString().padStart(2, '0');

    scene.timerText.setText(`${m}:${s}:${ms}`);
}

function triggerRush(scene) {
    if (scene.isRestRoom) return;
    scene.isRushInProgress = true;

    // 1. 先播放音效，从 0.1 逐渐淡入到 1.0
    scene.rushSound.play({ volume: 0.1, loop: false });
    scene.rushFadeInTween = scene.tweens.add({
        targets: scene.rushSound,
        volume: { from: 0.1, to: 1 },
        duration: 10000,
        onComplete: () => { scene.rushFadeInTween = null; }
    });

    // 2. 4 秒后可能触发 smile（也存引用，以便清理）
    scene.smileTimer = scene.time.delayedCall(4000, () => {
        if (scene.roomCount >= 50) {
            triggerSmile(scene);
        }
    });

    // 3. 10 秒后 spawnRush，并在淡入后开始淡出
    scene.rushTimeout = scene.time.delayedCall(10000, () => {
        spawnRush(scene);
        scene.rushFadeOutTween = scene.tweens.add({
            targets: scene.rushSound,
            volume: { from: 1, to: 0 },
            duration: 10000,
            onComplete: () => { scene.rushFadeOutTween = null; }
        });
    });

    // 4. 10.5 秒后做击杀判断
    scene.rushout = scene.time.delayedCall(10500, () => {
        if (!scene.inLocker) {
            console.log("Rush 擊殺玩家");
            scene.isRushInProgress = false;
            cleanUpRoom(scene);
            scene.scene.start('MainMenu');
        } else {
            console.log("玩家成功躲避 Rush！");
        }
    });

    // 5. 20 秒后强制停止音效（如果淡出 tween 来不及，也能确保一定关掉）
    scene.rushStopTimer = scene.time.delayedCall(20000, () => {
        scene.rushSound.stop();
    });
}

function spawnRush(scene) {
    scene.isRushActive = true;

    // 1) 新增一个数组，用来收集 16 个 trailTween
    scene.rushTrailTweens = [];

    for (let i = 0; i < 16; i++) {
        const trail = scene.add.image(-150 - i * 50, scene.scale.height / 2, 'rush')
            .setDisplaySize(700, 700)
            .setAlpha(0.2)
            .setDepth(14)
            .setScrollFactor(0);

        const t = scene.tweens.add({
            targets: trail,
            x: scene.scale.width + 100,
            duration: 1000 + i * 100,
            ease: 'Cubic.easeOut',
            onComplete: () => { trail.destroy(); },
            autoKill: true
        });
        scene.rushTrailTweens.push(t);
    }

    // 2) 主 Rush 本体的 tween
    scene.rushSprite = scene.add.sprite(-150, scene.scale.height / 2, 'rush')
        .setDisplaySize(700, 700)
        .setAlpha(0.8)
        .setDepth(15)
        .setScrollFactor(0);

    scene.rushMainTween = scene.tweens.add({
        targets: scene.rushSprite,
        x: scene.scale.width + 100,
        duration: 1000,
        ease: 'Cubic.easeOut',
        onComplete: () => {
            if (scene.rushSprite) {
                scene.rushSprite.destroy();
                scene.rushSprite = null;
            }
            scene.isRushActive = false;
            scene.rushMainTween = null;
        },
        autoKill: true
    });
}


function triggerSmile(scene) {
    const smile = scene.add
        .sprite(scene.scale.width / 2, scene.scale.height / 2, 'smile_1')
        .setDisplaySize(600, 600)
        .setDepth(20)
        .setScrollFactor(0);

    // 先靜止 2 秒
    scene.time.delayedCall(2000, () => {
        // 直接播放已註冊好的動畫
        smile.anims.play('smile_attack');

        scene.time.delayedCall(1000, () => {
            // 判定玩家行為...
            if (scene.inLocker || scene.keys.W.isDown /* etc. */) {
                console.log("Smile 擊殺玩家！");
                scene.rushSound.stop();
                scene.isRushInProgress = false;
                cleanUpRoom(scene);
                scene.scene.start('MainMenu');
            } else {
                console.log("Smile 攻擊未成功！");
                smile.destroy();
            }
        });
    });
}


function createWall(scene, x, y, width, height) {
    scene.walls.create(x, y, null)
        .setDisplaySize(width, height)
        .setTint(0x888888)
        .refreshBody();
}

function checkObstruction(scene, x1, y1, x2, y2) {
    // 1. 先建立一條從 (x1,y1) 指向 (x2,y2) 的直線
    const line = new Phaser.Geom.Line(x1, y1, x2, y2);

    // 2. 用 TilemapLayer 提供的 getTilesWithinShape 去取出「這條線上」所有的 tile
    //    注意：只要 tile.index != -1，就代表那裡有實際的圖塊
    const hits = scene.currentLayers.Obstacle.getTilesWithinShape(line);
    for (let tile of hits) {
        if (tile.index !== -1) {
            return true;  // 只要找到一個 obstacle tile，就算有被擋住
        }
    }
    return false;
}

function createRestRoom(scene) {
    // cleanUpRoom(scene);
    scene.isRushActive = false;
    scene.rushRecentlyTriggered = 0;

    if (scene.lockers) scene.lockers.clear(true, true);
    scene.lockerList = [];
    const width = scene.physics.world.bounds.width;
    const height = scene.physics.world.bounds.height;

    if (scene.obstacles) scene.obstacles.clear(true, true);
    if (scene.walls) scene.walls.clear(true, true);
    if (scene.door) scene.door.destroy();
    if (scene.floor) scene.floor.destroy();
    if (scene.teachItem) scene.teachItem.destroy();
    if (scene.restText) scene.restText.destroy();


    // 清除 RUSH
    if (scene.rushSprite) {
        scene.rushSprite.destroy();
        scene.rushSprite = null;
    }
    if (scene.rushSound && scene.rushSound.isPlaying) {
        scene.rushSound.stop();
    }
    if (scene.rushTimeout) {
        scene.rushTimeout.remove(false);
        scene.rushTimeout = null;
    }

    if (scene.rushout) {
        scene.rushout.remove(false);
        scene.rushout = null;
    }


    // 標題
    scene.restText = scene.add.text(width / 2, height / 2, '休息室', {
        fontSize: '72px',
        color: '#ffffff',
        fontFamily: 'Arial',
        stroke: '#000000',
        strokeThickness: 6
    }).setOrigin(0.5).setDepth(5);

    // 門
    const doorX = width - 10;
    const doorY = height / 2;
    scene.door = scene.physics.add.staticSprite(doorX, doorY, null)
        .setDisplaySize(100, 100)
        .setTint(0x00ffff)
        .refreshBody();

    scene.doorTween = scene.tweens.add({
        targets: scene.door,
        alpha: { from: 0.5, to: 1 },
        duration: 800,
        yoyo: true,
        repeat: -1
    });

    if (scene.player) {
        scene.physics.add.collider(scene.player, scene.obstacles);
        scene.physics.add.collider(scene.player, scene.walls);
        scene.physics.add.overlap(scene.player, scene.door, enterDoor, null, scene);
    }

    // 不顯示房間編號
    if (scene.roomText) scene.roomText.setAlpha(0);

    // ✅ 新增：休息室進入時顯示對話
    const index = scene.restRoomPoints.indexOf(scene.roomCount);
    const dialog = scene.restRoomDialogs[index] || '🛋️ 你進入了一間陌生的休息室。\n請保持警覺。';
    scene.showTutorial(dialog + '\n\n👉 點擊滑鼠或按任意鍵繼續前進。');
}

function enterDoor(player, door) {
    console.log('enterDoor 触发，this.isRestRoom=', this.isRestRoom, 'roomCount=', this.roomCount);
    // 先把上一个房间所有残留清掉
    if (this.currentMap && this.currentMapKey === 'level2' && this.collectedCandles < 3) {
        // 提示玩家还没集齐 3 根蠟燭
        if (!this.candleWarning) {
            this.candleWarning = this.add.text(
                this.scale.width / 2,
                this.scale.height / 2 - 100,
                '請先收集三根蠟燭！',
                {
                    fontSize: '40px',
                    color: '#ff4444',
                    fontFamily: 'Arial',
                    stroke: '#000000',
                    strokeThickness: 4
                }
            )
                .setOrigin(0.5)
                .setDepth(30)
                .setScrollFactor(0);
        }
        // 让这行文字淡入淡出提醒一下
        this.tweens.killTweensOf(this.candleWarning);
        this.candleWarning.setAlpha(1);
        this.tweens.add({
            targets: this.candleWarning,
            alpha: 0,
            duration: 1500,
            delay: 500,
            ease: 'Power1',
            onComplete: () => {
                this.candleWarning.destroy();
                this.candleWarning = null;
            }
        });
        return; // 不执行后续切换地图的逻辑
    }

    cleanUpRoom(this);

    // 如果当前正处于休息室里，按 F 是要“离开休息室”，进下一间普通房
    if (this.isRestRoom) {
        this.isRestRoom = false;

        // ① 先随机选一张新地图，把 tilemap + layers + collider 全部加载回来
        const nextConfig = Phaser.Math.RND.pick(this.mapConfigs);
        pickAndSetupMap(this, nextConfig.mapKey, this.mapConfigs);

        // ② 再真正生成这张新地图对应的房间内容
        createRoom(this, getRandomRoom(this));

        // 把玩家定位到门口
        this.player.setPosition(300, 1100);

        // 重新开启倒计时
        startCountdown(this);

        return;
    }

    // 如果不在休息室，那就是在普通房之间切换
    this.roomCount++;

    // 先判定：如果新房号在 restRoomPoints 里，就要“进入休息室”
    if (this.restRoomPoints.includes(this.roomCount)) {
        this.isRestRoom = true;

        // 进入休息室前，也先加载一张新地图（可以是任意 mapKey，也可以专门给休息室留一张空白地图）
        // 这里随便 pick 一张，目的只是让 tilemap 正常切过去（即使你在休息室逻辑里可能不会真正用到它）
        pickAndSetupMap(this, 'Gallery', this.mapConfigs);

        // 生成「休息室」的内容
        createRestRoom(this);

        // 把玩家定位到休息室入口
        this.player.setPosition(300, 1100);

        // 进入休息室后停止倒数
        stopCountdown(this);

    } else if (this.roomCount >= 250) {
        // 达成通关
        console.log('闖關完成！恭喜！');
        cleanUpRoom(scene);
        this.scene.start('MainMenu');

    } else {
        // 普通的房间切换（既不在休息室，也没到终点），正常 load tilemap + createRoom
        let nextMapKey = 'Gallery';
        if (this.roomCount >= 10) {
            const next = Phaser.Math.RND.pick(this.mapConfigs);
            nextMapKey = next.mapKey;
        }
        pickAndSetupMap(this, nextMapKey, this.mapConfigs);
        createRoom(this, getRandomRoom(this));
        this.player.setPosition(300, 1100);
    }
}


function stopCountdown(scene) {///update enterdoor
    scene.timerActive = false;
    scene.timerText.setVisible(false);
}


function startCountdown(scene) {//enterdoor
    scene.timerActive = true;
    scene.timerValue = 180000; // 3分鐘＝180000毫秒
    scene.timerText.setVisible(true);
}

function spawnDarkEntity(scene) {///inside createRoom & update
    const width = scene.scale.width;
    const height = scene.scale.height;

    let valid = false;
    let x, y;

    for (let i = 0; i < 10; i++) {
        x = Phaser.Math.Between(width / 2 + 50, width - 100); // 右半區域
        y = Phaser.Math.Between(100, height - 100);
        const dist = Phaser.Math.Distance.Between(scene.player.x, scene.player.y, x, y);
        if (dist > 300) {
            valid = true;
            break;
        }
    }

    if (!valid) return;

    scene.darkEntity = scene.add.sprite(x, y, 'dark_entity')
        .setDisplaySize(200, 200)
        .setAlpha(1)
        .setDepth(8);

    scene.darkEntityTimer = 0;
    scene.darkEntityAlpha = 1;
    scene.darkEntityVisible = true;
}

function spawnEye(scene) {
    const width = scene.scale.width;
    const height = scene.scale.height;

    // 1. 先隨機決定放置位置（範例：畫面中央）
    scene.eyeEntity = scene.add
        .sprite(width / 2, height / 2, 'eye_1')
        .setDisplaySize(150, 150)
        .setDepth(8);

    // 2. 啟用攻擊邏輯
    scene.eyeActive = true;
    scene.eyeTimer = 0;

    // 3. 顯示並清空舊的 eyeLine，之後在 update() 裡會重畫
    if (scene.eyeLine) {
        scene.eyeLine.clear();
        scene.eyeLine.setVisible(true);
    }

    // 4. 播放在 create 階段已經註冊好的動畫 key：'eye_attack'
    scene.eyeEntity.anims.play('eye_attack');
}


function createRoom(scene, template) {
    // cleanUpRoom(scene);
    const width = scene.physics.world.bounds.width;
    const height = scene.physics.world.bounds.height;

    // 清除場景物件
    if (scene.eyeEntity) {
        scene.eyeEntity.destroy();
        scene.eyeEntity = null;
    }
    if (scene.eyeLine) {
        scene.eyeLine.destroy();
        scene.eyeLine = null;
    }
    scene.eyeActive = false;
    scene.eyeTimer = 0;


    if (scene.darkEntity) scene.darkEntity.destroy();
    if (scene.obstacles) scene.obstacles.clear(true, true);
    if (scene.walls) scene.walls.clear(true, true);
    if (scene.door) scene.door.destroy();
    if (scene.floor) scene.floor.destroy();
    if (scene.teachItem) scene.teachItem.destroy();
    if (scene.restText) scene.restText.destroy();
    if (scene.lockers) scene.lockers.clear(true, true);
    scene.lockerList = [];





    // 障礙物
    scene.obstacles = scene.physics.add.staticGroup();
    for (let obs of template.obstacles) {
        scene.obstacles.create(obs.x, obs.y, null)
            .setDisplaySize(obs.w, obs.h)
            .setTint(0xff0000)
            .refreshBody();
    }

    // 門
    const doorX = width - 100;
    const doorY = height - 1300;
    scene.door = scene.physics.add.staticSprite(doorX, doorY, null)
        .setDisplaySize(80, 100)
        .setTint(0x0000ff)
        .refreshBody();

    // 把 tween 返回值存到 scene.doorTween
    scene.doorTween = scene.tweens.add({
        targets: scene.door,
        alpha: { from: 0.5, to: 1 },
        duration: 800,
        yoyo: true,
        repeat: -1
    });

    // 碰撞設定
    if (scene.player) {
        scene.physics.add.collider(scene.player, scene.obstacles);
        scene.physics.add.collider(scene.player, scene.walls);
        scene.physics.add.collider(scene.player, scene.lockers);
        scene.physics.add.overlap(scene.player, scene.door, enterDoor, null, scene);
    }

    // 房號顯示 / 顯示休息室對話
    if (!scene.isRestRoom) {
        showRoomText(scene);
    } else {
        const index = scene.restRoomPoints.indexOf(scene.roomCount);
        const dialog = scene.restRoomDialogs[index] || '🛋️ 你進入了一間陌生的休息室。\n請保持警覺。';
        scene.showTutorial(dialog + '\n\n👉 點擊滑鼠或按任意鍵繼續前進。');
    }

    console.log('createRoom: currentMap.key =', scene.currentMap ? scene.currentMap : 'null');

    if (scene.currentMapKey === 'level2') {
        // 顯示 0/3 的文字
        scene.candleText.setVisible(true);
        scene.collectedCandles = 0;
        scene.candleText.setText(`蠟燭：0/3`);

        // 準備放 3 根蠟燭
        if (!scene.candles) {
            scene.candles = scene.physics.add.group({ allowGravity: false });
        } else {
            scene.candles.clear(true, true);
        }

        const W = scene.physics.world.bounds.width;
        const H = scene.physics.world.bounds.height;
        // 拿到障礙 Layer
        const obstacleLayer = scene.currentLayers.Obstacle;
        const wallLayer = scene.currentLayers.Wall;

        for (let i = 0; i < 3; i++) {
            let x, y;
            // 用 do…while 確保不落在 Obstacle/Wall 上
            do {
                x = Phaser.Math.Between(W * 0.2, W * 0.8);
                y = Phaser.Math.Between(H * 0.2, H * 0.8);
            } while (
                (obstacleLayer && obstacleLayer.hasTileAtWorldXY(x, y)) ||
                (wallLayer && wallLayer.hasTileAtWorldXY(x, y))
            );

            const candle = scene.candles.create(x, y, 'candle')
                .setDisplaySize(40, 60)
                .setDepth(10);

            // 上下漂浮的 Tween
            scene.tweens.add({
                targets: candle,
                y: candle.y - 10,
                duration: 800,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }

        // 拾取判定
        scene.physics.add.overlap(scene.player, scene.candles, (player, candle) => {
            candle.destroy();
            scene.collectedCandles++;
            scene.candleText.setText(`蠟燭：${scene.collectedCandles}/3`);
        });
    } else {
        // 非 level2 時就清掉、隱藏
        if (scene.candles) {
            scene.candles.clear(true, true);
        }
        scene.candleText.setVisible(false);
    }


    // 教學道具
    if (scene.roomCount < 10) spawnTeachItem(scene);

    // 黑暗機率與遮罩
    scene.darkRoomActive = false;
    if (!scene.isRestRoom && scene.roomCount >= 10) {
        const rng = Math.random();
        let chance = 0;
        if (scene.roomCount > 11 && scene.roomCount < 49) chance = 0.20;
        else if (scene.roomCount > 51 && scene.roomCount < 99) chance = 0.3;
        else if (scene.roomCount > 101 && scene.roomCount < 149) chance = 0.5;
        else if (scene.roomCount > 151 && scene.roomCount < 200) chance = 0.7;
        else chance = 0;
        if (rng < chance) scene.darkRoomActive = true;
    }

    if (scene.darkOverlay) scene.darkOverlay.destroy();
    scene.darkOverlay = scene.add.graphics();
    if (scene.darkRoomActive) {
        scene.darkOverlay.fillStyle(0x000000, 0.75);
        scene.darkOverlay.fillRect(0, 0, scene.physics.world.bounds.width, scene.physics.world.bounds.height);
        scene.darkOverlay.setDepth(12);
    }


    // ==== RUSH 觸發邏輯 ====
    scene.isRushRoom = false;
    scene.rushRecentlyTriggered = scene.rushRecentlyTriggered || 0;

    if (scene.roomCount >= 10 && scene.rushRecentlyTriggered === 0 && !scene.isRestRoom) {
        let rushChance = 0;
        if (scene.roomCount <= 50) rushChance = 0.1; // 8%
        else if (scene.roomCount <= 100) rushChance = 0.25; // 15%
        else rushChance = 0.40; // 20%

        if (Math.random() < rushChance) {
            scene.isRushRoom = true;
            triggerRush(scene);
            scene.rushRecentlyTriggered = 8; // 冷卻8間房
        }
    }

    // 櫃子生成（只有當前房非 Rush 襲擊房才可）

    if (!scene.isRushRoom && !scene.isRestRoom) {
        const obstacleLayer = scene.currentLayers.Obstacle;
        const wallLayer = scene.currentLayers.Wall;
        // 取整張地圖的世界邊界（已考慮 scale）
        const worldBounds = scene.physics.world.bounds;
        const W = worldBounds.width;
        const H = worldBounds.height;

        const lockerCount = Phaser.Math.Between(1, 2);
        let placed = 0;
        let attempts = 0;

        // 最多試 50 次，避免死迴圈
        while (placed < lockerCount && attempts < 50) {
            attempts++;
            const x = Phaser.Math.Between(0, W);
            const y = Phaser.Math.Between(0, H);

            // 檢查 Obstacle 或 Wall layer 是否有 tile
            const inObstacle = obstacleLayer && obstacleLayer.hasTileAtWorldXY(x, y);
            const inWall = wallLayer && wallLayer.hasTileAtWorldXY(x, y);
            if (inObstacle || inWall) {
                continue;
            }

            // 這個點安全，可以生成櫃子
            const locker = scene.add.sprite(x, y, 'cabinet_1')
                .setDisplaySize(100, 100)
                .setDepth(11);
            scene.physics.add.existing(locker, true);
            locker.state = 'closed';
            scene.lockers.add(locker);
            scene.lockerList.push(locker);
            placed++;
        }
    }
    // 每次都遞減 RUSH 觸發冷卻
    if (scene.rushRecentlyTriggered > 0) scene.rushRecentlyTriggered--;

    // ===== DarkEntity 生成邏輯 =====
    if (scene.darkRoomActive && !scene.isRestRoom) {
        spawnDarkEntity(scene);
    } else {
        if (scene.darkEntity) {
            scene.darkEntity.destroy();
            scene.darkEntity = null;
            scene.darkEntityVisible = false;
        }
    }

    // ==== Eye 觸發邏輯 ====
    scene.eyeEntity = null;
    scene.eyeActive = false;
    if (scene.roomCount >= 25 && !scene.isRestRoom) {
        if (Math.random() < 0.1) {
            spawnEye(scene);
        }
    }



}


function animsset(scene) {
    if (!scene.anims.exists('smile_attack')) {
        const smileFrames = [];
        for (let i = 2; i <= 9; i++) {
            smileFrames.push({ key: `smile_${i}` });
        }
        scene.anims.create({
            key: 'smile_attack',
            frames: smileFrames,
            frameRate: 8,
            repeat: 0
        });
    }

    // Eye 動畫 (只做一次)
    if (!scene.anims.exists('eye_attack')) {
        const eyeFrames = [];
        for (let i = 1; i <= 10; i++) {
            eyeFrames.push({ key: `eye_${i}` });
        }
        scene.anims.create({
            key: 'eye_attack',
            frames: eyeFrames,
            frameRate: 2,
            repeat: 0
        });
    }

    scene.anims.create({
        key: 'player_idle',
        frames: [{ key: 'player_afk1' }, { key: 'player_afk2' }],
        frameRate: 2,
        repeat: -1
    });

    scene.anims.create({
        key: 'player_walk',
        frames: [{ key: 'player_walk1' }, { key: 'player_walk2' }, { key: 'player_walk3' }],
        frameRate: 6,
        repeat: -1
    });

    scene.anims.create({
        key: 'player_run',
        frames: [{ key: 'player_run1' }, { key: 'player_run2' }],
        frameRate: 8,
        repeat: -1
    });

    scene.anims.create({
        key: 'cabinet_open',
        frames: [
            { key: 'cabinet_1' },
            { key: 'cabinet_2' },
            { key: 'cabinet_3' },
            { key: 'cabinet_4' },
            { key: 'cabinet_5' }
        ],
        frameRate: 5,
        repeat: 0
    });

}

function createTilemapLayers(scene, mapKey, tilesetsConfig, layerConfig, scale = 1.5) {
    console.log('→ createTilemapLayers(', mapKey, ', scale=', scale, ')');
    // 1. 建立 tilemap
    const map = scene.make.tilemap({ key: mapKey });

    // 2. 加入 tilesetImage
    const sets = {};
    for (const { name, key } of tilesetsConfig) {
        sets[name] = map.addTilesetImage(key);
    }

    // 3. 建立各個 layer，並且 setScale
    const layers = {};
    for (const { alias, sources, x = 0, y = 0 } of layerConfig) {
        const src = Array.isArray(sources)
            ? sources.map(n => sets[n])
            : sets[sources];
        layers[alias] = map.createLayer(alias, src, x, y)
            .setScale(scale);
        // **碰撞要在 setScale 之後再設定才會跟著縮放**
        if (alias === 'Obstacle' || alias === 'Wall') {
            layers[alias].setCollisionByExclusion([-1]);
        }
    }

    // 4. 重設世界邊界（已經按 scale 縮過）
    const width = map.widthInPixels * scale;
    const height = map.heightInPixels * scale;
    scene.physics.world.setBounds(0, 0, width, height);
    scene.cameras.main.setBounds(0, 0, width, height);

    return { map, layers };
}


// FunctionLibrary.js
function pickAndSetupMap(scene, mapKey, mapConfigs, scale = 1.5) {
    console.log('→ 正在加载 tilemap:', mapKey);
    // 清除舊 collider
    if (scene._obstacleCollider) scene._obstacleCollider.destroy();
    if (scene._wallCollider) scene._wallCollider.destroy();
    scene._obstacleCollider = null;
    scene._wallCollider = null;

    // 切換地圖
    if (scene.currentMap) {
        scene.currentMap.destroy();
        scene.currentLayers = {};
    }
    const cfg = mapConfigs.find(m => m.mapKey === mapKey);
    const map = scene.make.tilemap({ key: mapKey });
    scene.currentMap = map;
    scene.currentMapKey = mapKey;

    // 加 tileset
    cfg.tilesetsConfig.forEach(ts => {
        map.addTilesetImage(ts.name, ts.key);
    });

    // 用我們剛改的 createTilemapLayers
    const { layers } = createTilemapLayers(
        scene,
        mapKey,
        cfg.tilesetsConfig,
        cfg.layerConfig,
        scale
    );
    scene.currentLayers = layers;

    // 重新註冊物理 collider
    if (layers.Obstacle) {
        scene._obstacleCollider =
            scene.physics.add.collider(scene.player, layers.Obstacle);
    }
    if (layers.Wall) {
        scene._wallCollider =
            scene.physics.add.collider(scene.player, layers.Wall);
    }
}




function createMultipleTilemaps(scene, mapConfigs, scale = 2.5) {
    const result = {};
    for (const { mapKey, tilesetsConfig, layerConfig } of mapConfigs) {
        result[mapKey] = createTilemapLayers(
            scene,
            mapKey,
            tilesetsConfig,
            layerConfig,
            2.5
        );
    }
    return result;
}


function cleanUpRoom(scene) {
    // --- 1. teachItem 相關 ---
    if (scene.teachItem) {
        scene.teachItem.destroy();
        scene.teachItem = null;
    }
    if (scene.teachTween) {
        scene.teachTween.stop();
        scene.teachTween = null;
    }

    // --- 2. 房號提示文本淡出 Tween ---
    if (scene.roomTextTween) {
        scene.roomTextTween.stop();
        scene.roomTextTween = null;
    }
    // 我們不 destroy roomText，因為它會被下一間房繼續重複使用，只要把 alpha 拉回 0 即可
    if (scene.roomText) {
        scene.roomText.setAlpha(0);
    }

    // --- 3. 休息室「門」的 Tween ---
    if (scene.doorTween) {
        scene.doorTween.stop();
        scene.doorTween = null;
    }
    if (scene.door) {
        scene.door.destroy();
        scene.door = null;
    }
    if (scene.restText) {
        scene.restText.destroy();
        scene.restText = null;
    }

    // --- 4. Rush 相關 Tween 和 延遲呼叫 ---
    if (!scene.isRushInProgress) {
        // —— 以下全是 Rush 相关资源 —— //

        // 4.1 音效的淡入／淡出 Tween
        if (scene.rushFadeInTween) {
            scene.rushFadeInTween.stop();
            scene.rushFadeInTween = null;
        }
        if (scene.rushFadeOutTween) {
            scene.rushFadeOutTween.stop();
            scene.rushFadeOutTween = null;
        }

        // 4.2 所有的 trailTweens（拖尾）和主 Rush Tween
        if (scene.rushTrailTweens) {
            scene.rushTrailTweens.forEach(tw => tw.stop());
            scene.rushTrailTweens = null;
        }
        if (scene.rushMainTween) {
            scene.rushMainTween.stop();
            scene.rushMainTween = null;
        }

        // 4.3 如果 RushSprite 还在，直接销毁掉
        if (scene.rushSprite) {
            scene.rushSprite.destroy();
            scene.rushSprite = null;
        }

        // 4.4 停掉音效
        if (scene.rushSound && scene.rushSound.isPlaying) {
            scene.rushSound.stop();
        }

        // 4.5 清除所有与 Rush 相关的延迟调用
        if (scene.rushTimeout) {
            scene.rushTimeout.remove(false);
            scene.rushTimeout = null;
        }
        if (scene.rushout) {
            scene.rushout.remove(false);
            scene.rushout = null;
        }
        if (scene.rushStopTimer) {
            scene.rushStopTimer.remove(false);
            scene.rushStopTimer = null;
        }
    }

    // --- 5. Eye 相關 (若有 spawnEye 時顯示的 eyeLine) ---
    if (scene.eyeLine) {
        scene.eyeLine.destroy();
        scene.eyeLine = null;
    }
    if (scene.eyeEntity) {
        scene.eyeEntity.destroy();
        scene.eyeEntity = null;
    }
    scene.eyeActive = false;
    scene.eyeTimer = 0;

    // --- 6. DarkEntity 相關 ---
    if (scene.darkEntity) {
        scene.darkEntity.destroy();
        scene.darkEntity = null;
        scene.darkEntityVisible = false;
    }
    scene.darkEntityTimer = 0;
    scene.darkEntityAlpha = 1;

    // --- 7. 其他殘留物件 (如 teachItem 已處理，其它可依需求自行加) ---

    // --- 8. 如果你有 Tilemap / Collider 
    //     切房間前也一併清掉舊的 map 與 collider
    if (scene.currentMap) {
        scene.currentMap.destroy();
        scene.currentMap = null;
    }
    if (scene._obstacleCollider) {
        scene._obstacleCollider.destroy();
        scene._obstacleCollider = null;
    }
    if (scene._wallCollider) {
        scene._wallCollider.destroy();
        scene._wallCollider = null;
    }
    if (scene.currentLayers) {
        for (let key in scene.currentLayers) {
            if (scene.currentLayers[key]) {
                scene.currentLayers[key].destroy();
                scene.currentLayers[key] = null;
            }
        }
    }

    // --- 9. 重置一些旗標（依實際需求）---
    scene.isRushActive = false;
    scene.isRushRoom = false;
    scene.darkRoomActive = false;
    // 如果需要，還可以把 restText = null、一併重置
}


export default {
    triggerTeaching,
    spawnTeachItem,
    showRoomText,
    getRandomRoom,
    updateTimerDisplay,
    triggerRush,
    triggerSmile,
    createWall,
    checkObstruction,
    createRestRoom,
    enterDoor,
    stopCountdown,
    startCountdown,
    spawnDarkEntity,
    spawnEye,
    createRoom,
    animsset,
    createTilemapLayers,
    createMultipleTilemaps,
    pickAndSetupMap,
    cleanUpRoom
}