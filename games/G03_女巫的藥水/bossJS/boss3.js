

const boss3MovePoints = [
    { x: 400, y: 150 },
    { x: 200, y: 200 },
    { x: 600, y: 200 }, { x: 600, y: 200 }
];
function stopAllBoss3Timers() {
    boss3AllTimers.forEach(timer => {
        if (timer && timer.remove) timer.remove();
    });
    boss3AllTimers = [];
}

function clearAllBullets(scene) {
    // 清除 boss1 的子彈
    if (bulletGroup && bulletGroup.clear) bulletGroup.clear(true, true);

    // 清除 boss2 的子彈
    if (spearGroup && spearGroup.clear) spearGroup.clear(true, true);
    if (bulletGroup2 && bulletGroup2.clear) bulletGroup2.clear(true, true);

    // 清除 boss3 的子彈
    if (bulletGroup3 && bulletGroup3.clear) bulletGroup3.clear(true, true);
    if (markGroup && markGroup.clear) markGroup.clear(true, true);
    if (markExplodeGroup && markExplodeGroup.clear) markExplodeGroup.clear(true, true);
    if (chainGroup && chainGroup.clear) chainGroup.clear(true, true);
    if (chainHeadGroup && chainHeadGroup.clear) chainHeadGroup.clear(true, true);
}

function moveBoss3ToNextPoint(scene) {
    if (!boss3MoveActive) return;

    boss3CurrentPointIndex = (boss3CurrentPointIndex + 1) % boss3MovePoints.length;
    const nextPoint = boss3MovePoints[boss3CurrentPointIndex];

    const distance = Phaser.Math.Distance.Between(boss3.x, boss3.y, nextPoint.x, nextPoint.y);
    const speed = 50;
    const duration = (distance / speed) * 1000;

    scene.tweens.add({
        targets: boss3,
        x: nextPoint.x,
        y: nextPoint.y,
        duration: duration,
        ease: 'Linear',
        onComplete: () => {
            // 只有當還在第一階段才繼續移動
            if (boss3MoveActive) {
                moveBoss3ToNextPoint(scene);
            }
        }
    });
}



function switchToBoss3(scene) {
    bossHealthBar.setVisible(true);
    bossHealthBarBg.setVisible(true);
    boss3Health = 4000;
    bossMaxHealth = 4000;
    if (currentBoss) {
        currentBoss.destroy();
    }

    boss3 = scene.physics.add.sprite(400, -100, 'boss3').setScale(0.08);
    boss3Dead = false;
    boss3.setVelocityY(100);
    currentBoss = boss3;
    boss3Phase = 1;
    bulletGroup3 = scene.physics.add.group();

    scene.physics.add.overlap(player, bulletGroup3, onPlayerHit, null, scene);


}
let boss3Dead = false;
function updateBoss3Behavior(scene) {
    if (!boss3 || !boss3.active) return;

    if (boss3Health <= 0 && !boss3Dead) {
        boss3Health = 0;
        currentBoss = null;
        playBossDeathEffect(scene, boss3.x, boss3.y);
        boss3Dead = true;
        console.log("BOSS3 被擊敗！");
        boss3bg.stop();

        clearAllBullets(scene);     // 清除子彈
        stopAllBoss3Timers();       // 停止所有攻擊行為（包含旋轉、爆炸、追蹤等）

        // 分身淡出動畫
        allSprites = [boss3, ...boss3Clones];
        allSprites.forEach(sprite => {
            if (sprite && sprite.active) {
                scene.tweens.add({
                    targets: sprite,
                    alpha: 0,
                    duration: 300,
                    onComplete: () => {
                        sprite.destroy();
                    }
                });
            }
        });

        return;
    }



    let newPhase = 1;
    if (boss3Health <= 3000) { newPhase = 2; }
    if (boss3Health <= 2000) { newPhase = 3; }
    if (boss3Health <= 1000) { newPhase = 4; }

    if (newPhase !== boss3Phase) {
        boss3Phase = newPhase;
        console.log(`Boss3 進入第 ${boss3Phase} 階段`);
        clearAllBullets(scene);
        if (boss3Phase === 1) startBoss3Phase1(scene);
        else if (boss3Phase === 2) startBoss3Phase2(scene);
        else if (boss3Phase === 3) startBoss3Phase3(scene);
        else if (boss3Phase === 4) startBoss3Phase4(scene);
    }
    if (markGroup && markGroup.children) {
        markGroup.children.iterate(b => {
            if (b.active && b.getData('tracking') && scene.time.now >= b.getData('trackTime')) {
                if (boss3) {
                    const angle = Phaser.Math.Angle.Between(b.x, b.y, player.x, player.y);
                    scene.physics.velocityFromRotation(angle, 150, b.body.velocity);
                    b.setData('tracking', false);

                    b.body.onWorldBounds = true;
                    b.body.world.on('worldbounds', function (body) {
                        if (body.gameObject === b) {
                            fireExplodeBullets(scene, b.x, b.y, 8);
                            b.destroy();
                        }
                    });
                }

            }
        });
    }
    chainHeadGroup?.children?.each(b => b.update?.(), this);

    chainGroup?.children?.each(b => {
        if (!b.getData('started') && scene.time.now - b.getData('startTime') > 3000) {
            // 開始移動
            b.setData('started', true);
            const angle = Phaser.Math.DegToRad(Phaser.Math.Between(0, 359));
            const velocity = scene.physics.velocityFromRotation(angle, 50);
            b.setData('vx', velocity.x);
            b.setData('vy', velocity.y);
            b.setVelocity(velocity.x, velocity.y);
        }

        if (b.getData('started')) {
            // 加速
            const vx = b.body.velocity.x;
            const vy = b.body.velocity.y;
            const maxSpeed = 200;
            const acceleration = 5;

            let newVx = Phaser.Math.Clamp(vx * 1.02, -maxSpeed, maxSpeed);
            let newVy = Phaser.Math.Clamp(vy * 1.02, -maxSpeed, maxSpeed);
            b.setVelocity(newVx, newVy);
        }
    }, this);
}
// 血量扣除共用函數中加入對 BOSS3 的支援：

// === BOSS3 第1階段 ===
let markGroup;

let markFireTimer;
let boss3CurrentPointIndex = -1;



function startBoss3Phase1(scene) {
    console.log("BOSS3 進入第1階段");
    boss3.anims.play('boss3待機', true);
    markGroup = scene.physics.add.group();
    markExplodeGroup = scene.physics.add.group();
    boss3MoveActive = true;


    // 每 1 秒隨機朝 4 個方向發射 N 顆 markbullet
    markFireTimer = scene.time.addEvent({
        delay: 2000,
        loop: true,
        callback: () => {
            atk2.play();
            if (boss3)
                boss3.anims.play('boss3攻擊', true);
            fireMarkBullets(scene, 1);  // 每方向 1 顆，可調整
            fireMarkExplodeCircle(scene);
            scene.time.delayedCall(300, () => {
                if (boss3)
                    boss3.anims.play('boss3待機', true);
            });
        }
    });

    boss3AllTimers.push(markFireTimer);
    // 撞擊判定
    scene.physics.add.overlap(player, markGroup, onPlayerHit, null, scene);

    scene.physics.add.overlap(player, markExplodeGroup, onPlayerHit, null, scene);

    // --- 移動邏輯：循環三點

    moveBoss3ToNextPoint(scene);

}

function fireMarkBullets(scene, countPerDirection = 3, speed = 200) {
    const directions = [
        { x: 1, y: 0 },  // 右
        { x: -1, y: 0 }, // 左
        { x: 0, y: 1 },  // 下
        { x: 0, y: -1 }  // 上
    ];

    directions.forEach(dir => {
        for (let i = 0; i < countPerDirection; i++) {
            if (boss3) {
                const bullet = markGroup.create(boss3.x, boss3.y, 'markbullet').setScale(0.08).setCircle(300);
                bullet.setCollideWorldBounds(true);
                bullet.setBounce(1);
                bullet.setVelocity(dir.x * speed, dir.y * speed);

                // 衰減速度
                scene.tweens.add({
                    targets: bullet.body.velocity,
                    x: 0,
                    y: 0,
                    ease: 'Linear',
                    duration: 2000
                });

                // 自爆
                scene.time.delayedCall(5000, () => {
                    if (bullet.active) {
                        bullet.destroy();
                        fireExplodeBullets(scene, bullet.x, bullet.y, 8);
                    }
                });
            }

        }
    });
} function fireMarkExplodeCircle(scene, count = 12, speed = 250, x = boss3.x, y = boss3.y) {

    for (let i = 0; i < count; i++) {
        const angle = Phaser.Math.DegToRad((360 / count) * i);
        if (boss3) {
            const bullet = markExplodeGroup.create(x, y, 'markExplodebullet').setScale(0.04).setCircle(200).setOffset(0, 50);

            scene.physics.velocityFromRotation(angle, speed, bullet.body.velocity);
            bullet.setCollideWorldBounds(true);
            bullet.body.onWorldBounds = true;
            bullet.update = function () {
                this.rotation += 0.05;
            };

            // 每顆子彈都獨立綁定銷毀事件
            bullet.body.world.on('worldbounds', function (body) {
                if (body.gameObject === bullet && bullet.active) {
                    bullet.destroy();
                }
            });
        }
    }
}



function fireExplodeBullets(scene, x, y, count = 8, speed = 150) {
    atk3.play();
    for (let i = 0; i < count; i++) {
        const angle = Phaser.Math.DegToRad((360 / count) * i);
        if (boss3) {
            const bullet = markExplodeGroup.create(x, y, 'markExplodebullet').setScale(0.04).setCircle(200).setOffset(0, 50);

            scene.physics.velocityFromRotation(angle, speed, bullet.body.velocity);
            bullet.setCollideWorldBounds(true);
            bullet.body.onWorldBounds = true;
            bullet.update = function () {
                this.rotation += 0.05;
            };
            bullet.body.world.on('worldbounds', function (body) {
                if (body.gameObject === bullet && bullet.active) {
                    bullet.destroy();
                }
            });
        }
    }
}
function startBoss3Phase2(scene) {
    console.log("BOSS3 進入第2階段");
    BossEffect(scene, boss3.x, boss3.y, boss3);
    // 強制清除階段1的 markFireTimer（即使 undefined 也不會報錯）
    if (markFireTimer && markFireTimer.remove) {
        markFireTimer.remove();
        markFireTimer = null;
    }

    // 清除階段1的移動 tween
    boss3MoveActive = false;

    // 清除子彈
    if (markGroup) markGroup.clear(true, true);
    if (markExplodeGroup) markExplodeGroup.clear(true, true);

    // 開始階段2行為
    scene.boss3Phase2Timer = scene.time.addEvent({
        delay: 4000,
        loop: true,
        callback: () => {
            dashAndAttack(scene);
        }
    });
}

function dashAndAttack(scene) {
    if (!boss3 || !boss3.active) return;

    const margin = 100;
    const targetX = Phaser.Math.Between(margin, 800 - margin);

    // 限制 Y 在地圖上半部
    const upperBoundY = scene.scale.height / 2 - margin;
    const targetY = Phaser.Math.Between(margin, upperBoundY);
    if (boss3) {
        const startX = boss3.x;
        const startY = boss3.y;

        const dropThreshold = 50; // 每隔 100px 掉落一顆子彈

        boss3.lastDropX = startX;
        boss3.lastDropY = startY;

        scene.tweens.add({
            targets: boss3,
            x: targetX,
            y: targetY,
            duration: 600,
            onUpdate: () => {
                const x = boss3.x;
                const y = boss3.y;
                const dist = Phaser.Math.Distance.Between(x, y, boss3.lastDropX, boss3.lastDropY);

                if (dist >= dropThreshold) {
                    if (boss3) {
                        const bullet = markGroup.create(x, y, 'markbullet').setScale(0.05).setCircle(260);
                        bullet.setData('trackTime', scene.time.now + 1000);
                        bullet.setCollideWorldBounds(true);
                        bullet.setBounce(1);
                        bullet.setVelocity(0, 0);
                        bullet.setData('tracking', true);

                        boss3.lastDropX = x;
                        boss3.lastDropY = y;
                    }
                }
            },
            onComplete: () => {
                if (boss3)
                    boss3.lastDropX = null;
                if (boss3)
                    boss3.lastDropY = null;
                if (boss3)
                    boss3.anims.play('boss3攻擊', true);
                scene.time.delayedCall(900, () => {
                    if (boss3)
                        boss3.anims.play('boss3待機', true);
                });
                fireRepeatedExplosions(scene);
                fireRotatingJumpBullets(scene);
            }
        });
    }

}


// 5 波爆炸子彈圈
function fireRepeatedExplosions(scene) {

    for (let i = 0; i < 3; i++) {
        scene.time.delayedCall(i * 300, () => {
            const baseAngle = i * 5;
            for (let j = 0; j < 10; j++) {
                const angle = Phaser.Math.DegToRad(j * 36 + baseAngle);
                if (boss3) {
                    const bullet = markExplodeGroup.create(boss3.x, boss3.y, 'markExplodebullet').setScale(0.04).setCircle(200).setOffset(0, 50);
                    bullet.update = function () {
                        this.rotation += 0.05;
                    };
                    bullet.setCollideWorldBounds(true);
                    bullet.body.onWorldBounds = true;
                    bullet.body.world.on('worldbounds', function (body) {
                        if (body.gameObject === bullet && bullet.active) {
                            bullet.destroy();
                        }
                    });
                    scene.physics.velocityFromRotation(angle, 250, bullet.body.velocity);
                }
            }
        });
    }
}

// 4方向 jumpbullet，每波旋轉
function fireRotatingJumpBullets(scene) {
    const baseDirs = [
        Phaser.Math.DegToRad(0),
        Phaser.Math.DegToRad(90),
        Phaser.Math.DegToRad(180),
        Phaser.Math.DegToRad(270)
    ];

    for (let wave = 0; wave < 5; wave++) {
        scene.time.delayedCall(wave * 300, () => {
            atk2.play();
            const offset = Phaser.Math.DegToRad(wave * 10);
            baseDirs.forEach(dir => {
                const angle = dir + offset;
                for (let i = 0; i < 5; i++) {
                    if (boss3) {
                        const bullet = markExplodeGroup.create(boss3.x, boss3.y, 'jumpbullet').setScale(0.04).setCircle(200).setOffset(0, 50).setTint(0x0000ff);
                        bullet.setCollideWorldBounds(true);
                        bullet.body.onWorldBounds = true;
                        bullet.body.world.on('worldbounds', function (body) {
                            if (body.gameObject === bullet && bullet.active) {
                                bullet.destroy();
                            }
                        });
                        bullet.update = function () {
                            this.rotation -= 0.05;
                        };
                        scene.physics.velocityFromRotation(angle, 200, bullet.body.velocity);
                    }
                }
            });
        });
    }
}
function startBoss3Phase3(scene) {
    BossEffect(scene, boss3.x, boss3.y, boss3);
    console.log("BOSS3 進入第3階段");
    if (!scene.chainWorldBoundListenerAdded) {
        scene.chainWorldBoundListenerAdded = true;

        scene.physics.world.on('worldbounds', function (body) {
            const obj = body.gameObject;
            if (chainGroup && chainGroup.contains(obj)) {
                obj.destroy();
            }
        });
    }
    // 停止第2階段的計時器
    if (scene.boss3Phase2Timer) {
        scene.boss3Phase2Timer.remove();
        scene.boss3Phase2Timer = null;
    }
    if (markFireTimer) markFireTimer.remove();
    boss3MoveActive = false; // 確保不再跑第1階段移動

    // 第3階段邏輯...
    boss3Phase3Active = true;
    boss3TargetIndex = 0;

    moveBoss3BetweenPoints(scene);

    chainGroup = scene.physics.add.group();
    chainHeadGroup = scene.physics.add.group();

    // 每 5 秒發射 chainHeadbullet
    scene.boss3Phase3Timer = scene.time.addEvent({
        delay: 5000,
        loop: true,
        callback: () => {
            if (boss3)
                boss3.anims.play('boss3攻擊', true);
            scene.time.delayedCall(900, () => {
                if (boss3)
                    boss3.anims.play('boss3待機', true);
            });
            fireChainHeadBullet(scene);
        }
    });

    // 撞擊判定
    scene.physics.add.overlap(player, chainGroup, onPlayerHit, null, scene);


}

const boss3MovePointsPhase3 = [
    { x: 200, y: 150 },
    { x: 600, y: 150 }
];
let boss3TargetIndex = 0;

function moveBoss3BetweenPoints(scene) {
    if (!boss3 || !boss3.active || boss3Phase !== 3) return;

    boss3TargetIndex = (boss3TargetIndex + 1) % boss3MovePointsPhase3.length;
    const next = boss3MovePointsPhase3[boss3TargetIndex];

    scene.tweens.add({
        targets: boss3,
        x: next.x,
        y: next.y,
        duration: 3000,
        onComplete: () => {
            moveBoss3BetweenPoints(scene);
        }
    });
}
function fireChainHeadBullet(scene) {
    atk3.play();
    const angle = Phaser.Math.Angle.Between(boss3.x, boss3.y, player.x, player.y);
    const velocity = scene.physics.velocityFromRotation(angle, 300);
    if (boss3) {
        const bullet = chainHeadGroup.create(boss3.x, boss3.y, 'chainHeadbullet').setScale(0.08).setCircle(300);

        bullet.setBounce(1);
        bullet.setCollideWorldBounds(true);
        bullet.body.onWorldBounds = true;
        bullet.setVelocity(velocity.x, velocity.y);

        bullet.lastDropX = bullet.x;
        bullet.lastDropY = bullet.y;

        bullet.startTime = scene.time.now;

        // 5 秒後自爆
        scene.time.delayedCall(4500, () => {
            if (bullet.active) {
                atk1.play();
                fireExplodeBullets(scene, bullet.x, bullet.y, 16);
                bullet.destroy();
            }
        });

        bullet.update = function () {
            if (!this.active) return;

            // 移動距離計算
            const dx = this.x - this.lastDropX;
            const dy = this.y - this.lastDropY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance >= 20) {
                const chain = chainGroup.create(this.x, this.y, 'chainbullet').setScale(0.15).setTint(0xff0000);
                chain.setData('startTime', scene.time.now);
                chain.setVelocity(0, 0);
                chain.body.onWorldBounds = true;
                chain.setCollideWorldBounds(true);
                chain.setBounce(0);
                this.lastDropX = this.x;
                this.lastDropY = this.y;
            }
        };
    }
}
let boss3Clones = [];
function startBoss3Phase4(scene) {
    BossEffect(scene, boss3.x, boss3.y, boss3);
    console.log("BOSS3 進入第4階段");

    if (!scene.markExplodeWorldBoundListenerAdded) {
        scene.markExplodeWorldBoundListenerAdded = true;

        scene.physics.world.on('worldbounds', function (body) {
            const obj = body.gameObject;
            if (obj && obj.texture && obj.texture.key === 'markExplodebullet') {
                obj.destroy();
            }
        });
    }

    if (scene.boss3Phase3Timer) {
        scene.boss3Phase3Timer.remove();
        scene.boss3Phase3Timer = null;
    }

    boss3MoveActive = false;

    // 先移動本體到中心，再建立分身動畫
    scene.tweens.add({
        targets: boss3,
        x: 400,
        y: 230,
        duration: 1000,
        onComplete: () => {
            createBoss3CloneFormation(scene);
        }
    });
}

function createBoss3CloneFormation(scene) {
    const center = { x: 400, y: 230 };
    const distance = 150;
    const totalEntities = 4;
    const directions = [
        { x: 0, y: -1 }, // 上 → 真身
        { x: 0, y: 1 },  // 下
        { x: -1, y: 0 }, // 左
        { x: 1, y: 0 }   // 右
    ];

    boss3Clones = [];

    allSprites = [];

    for (let i = 0; i < totalEntities; i++) {
        const dir = directions[i];
        const targetX = center.x + dir.x * distance;
        const targetY = center.y + dir.y * distance;

        let sprite;
        if (i === 0) {
            sprite = boss3;
        } else {
            sprite = scene.add.sprite(center.x, center.y, 'boss3').setScale(0.08);
            scene.anims.play('boss3轉身0', sprite); // 預設先播待機（重要：這會自動建立 anims 屬性）

            boss3Clones.push(sprite);
        }

        sprite.setData('angle', Math.atan2(targetY - center.y, targetX - center.x)); // 初始角度
        sprite.setData('radius', distance);
        allSprites.push({ sprite, targetX, targetY });
    }

    // 所有 clone 動畫移動完成後才開始繞圈
    let completed = 0;
    allSprites.forEach(({ sprite, targetX, targetY }) => {
        scene.tweens.add({
            targets: sprite,
            x: targetX,
            y: targetY,
            duration: 1000,
            onComplete: () => {
                completed++;
                if (completed === allSprites.length) {
                    startStepRotation(scene, center); // 分段式旋轉
                }

            }
        });
    });
}
function startBoss3CloneRotation(scene, center) {
    scene.time.addEvent({
        delay: 16,
        loop: true,
        callback: () => {
            rotateBoss3Group(scene, center);
        }
    });
}

function rotateBoss3Group(scene, center) {
    const speed = 0.02; // 角速度

    [boss3, ...boss3Clones].forEach(sprite => {
        if (!sprite.active) return;

        let angle = sprite.getData('angle') + speed;
        sprite.setData('angle', angle);

        const r = sprite.getData('radius');
        const newX = center.x + Math.cos(angle) * r;
        const newY = center.y + Math.sin(angle) * r;

        sprite.setPosition(newX, newY);
    });
}
function startStepRotation(scene, center) {
    const sprites = [boss3, ...boss3Clones];
    const radius = 150;
    const duration = 1000; // 轉動動畫持續時間
    const delayBetween = 500; // 停留時間
    //  boss3.anims.play('boss3待機', false);
    //boss3.anims.play('boss3攻擊', false);
    if (boss3)
        boss3.anims.play('boss3轉身0', true);
    function rotateOneStep() {
        sprites.forEach(sprite => {
            if (!sprite.active) return;

            // 播放「轉身」動畫（每次轉動都播放一次）
            if (sprite.anims) {
                sprite.anims.play('boss3轉身', true);
            }

            const currentAngle = sprite.getData('angle') || 0;
            const targetAngle = currentAngle + Phaser.Math.DegToRad(90);
            sprite.setData('angle', targetAngle); // 更新為目標角度

            const x = center.x + Math.cos(targetAngle) * radius;
            const y = center.y + Math.sin(targetAngle) * radius;

            scene.tweens.add({
                targets: sprite,
                x: x,
                y: y,
                duration: duration,
                ease: 'Sine.easeInOut',
                onComplete: () => {
                    atk3.play();
                    fireMarkExplodeCircle(scene, 12, 200, sprite.x, sprite.y);
                }
            });
        });

        // 下一次執行
        scene.time.delayedCall(duration + delayBetween, rotateOneStep);
    }


    // 啟動首次
    rotateOneStep();

    // 每 5 秒執行一次定向射擊（追蹤1秒，後2發沿原方向）
    const trackingFireTimer = scene.time.addEvent({
        delay: 5000,
        loop: true,
        callback: () => {
            sprites.forEach(sprite => {
                const angle = Phaser.Math.Angle.Between(sprite.x, sprite.y, player.x, player.y);
                for (let i = 0; i < 10; i++) {
                    scene.time.delayedCall(i * 150, () => {
                        atk2.play();
                        if (boss3) {
                            const bullet = markExplodeGroup.create(sprite.x, sprite.y, 'jumpbullet').setScale(0.04).setCircle(200).setOffset(0, 50).setTint(0x0000ff);
                            bullet.update = function () {
                                this.rotation -= 0.05;
                            };
                            bullet.setVelocity(
                                Math.cos(angle) * 300,
                                Math.sin(angle) * 300
                            );
                            bullet.setCollideWorldBounds(true);
                            bullet.setBounce(0);
                            bullet.body.onWorldBounds = true;

                            bullet._explodeListener = scene.physics.world.on('worldbounds', function (body) {
                                if (body.gameObject === bullet && bullet.active) {
                                    bullet.destroy();
                                    // 可選：產生爆炸子彈
                                }
                            });
                        }
                    });
                }
            });
        }
    });

    boss3AllTimers.push(trackingFireTimer); // ✅ 現在 trackingFireTimer 是有定義的變數

}

