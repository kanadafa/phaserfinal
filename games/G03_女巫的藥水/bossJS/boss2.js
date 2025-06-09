
let boss2Positions = [
    { x: 400, y: 100 },
    { x: 200, y: 200 },
    { x: 600, y: 200 },
    { x: 300, y: 300 },
    { x: 500, y: 300 }
];
let currentBoss2TargetIndex = 0;
let spearGroup, bulletGroup2;
let spearTimer, boss2BulletTimer, spearRingTimer, fanBulletTimer, boss2MoveTimer;
function atkAnimation(scene) {
    if (boss2)
        boss2.anims.play('boss2攻擊', true);
    scene.tweens.add({
        targets: boss2,
        scale: 0.15,
        duration: 150,
        ease: 'Sine.easeOut',
        yoyo: true,
        repeat: 0
    });
    scene.time.delayedCall(550, () => {
        if (boss2)
            boss2.anims.play('boss2待機', true);
    });

}

function switchToBoss2(scene) {
    bossHealthBar.setVisible(true);
    bossHealthBarBg.setVisible(true);

    boss2Health = 3000;
    bossMaxHealth = 3000;
    if (currentBoss) {
        currentBoss.destroy();
    }
    scene.physics.add.overlap(player, bulletGroup2, onPlayerHit, null, scene);
    scene.physics.add.overlap(player, spearGroup, onPlayerHit, null, scene);

    boss2 = scene.physics.add.sprite(400, -100, 'boss2').setScale(0.09);
    boss2.health = 3000;
    boss2.stage = 1;
    boss2.setCollideWorldBounds(true);

    currentBoss = boss2;


    scene.time.addEvent({
        delay: 20,
        callback: () => {
            if (boss2.y < 100) {
                boss2.y += 2;
            }
        },
        repeat: 50
    });



    currentBossHealth = boss2Health;
    updateBossHealthBar(boss2Health); //  立即刷新血條長度

    startBoss2Attack(scene);
}

function startBoss2(scene) {
    createBoss2(scene);

    scene.tweens.add({
        targets: boss2,
        y: 100,
        duration: 2000,
        onComplete: () => {
            startBoss2Attack(scene);
        }
    });

    scene.physics.add.overlap(player, bulletGroup2, onPlayerHit, null, scene);
    scene.physics.add.overlap(player, spearGroup, onPlayerHit, null, scene);
}

function startBoss2Attack(scene) {
    if (boss2Phase > 0) return;
    boss2Phase = 1;
    startBoss2Phase1(scene);
}

function startBoss2Phase1(scene) {
    console.log("Boss2 進入第1階段");
    clearBoss2Timers();
    if (boss2)
        boss2.anims.play('boss2待機', true);
    boss2BulletTimer = setInterval(() => {
        fireBoss2CircleBullets();
        atkAnimation(scene);
    }, 3000);

    spearTimer = setInterval(() => {
        dropSpears();
    }, 150);

    boss2MoveTimer = setInterval(() => {
        moveBoss2ToNextPosition(scene, 3);
    }, 1500);
}

function startBoss2Phase2(scene) {
    console.log("Boss2 進入第2階段");
    BossEffect(scene, boss2.x, boss2.y, boss2);
    clearBoss2Timers();

    spearRingTimer = setInterval(() => {

        atkAnimation(scene)
        fireSpearRing(scene);
    }, 3000);

    fanBulletTimer = setInterval(() => {
        fireSurroundingBulletsAtPlayer(scene, 6);
    }, 4000);

    boss2MoveTimer = setInterval(() => {
        moveBoss2ToNextPosition(scene, 5);
    }, 1500);
}
function startBoss2Phase3(scene) {
    BossEffect(scene, boss2.x, boss2.y, boss2);
    if (boss2)
        boss2.anims.play('boss2衝刺', true);
    boss2.setCollideWorldBounds(true);
    boss2.setBounce(1);
    console.log("Boss2 進入第3階段");
    clearBoss2Timers();

    boss2.setCollideWorldBounds(true);
    boss2.body.onWorldBounds = true;

    boss2.body.world.on('worldbounds', function (body) {
        if (body.gameObject === this) {
            fireCircularBullets(this.scene, this.x, this.y, 18);
        }
    }, boss2);


    boss2.setVelocity(200, 200);
    sideBulletTimer = setInterval(() => {
        if (boss2)
            fireSideBullets(scene);
    }, 500);

    scene.boss2Phase3Active = true;
}



function clearBoss2Timers() {
   

    clearInterval(spearTimer);
    clearInterval(boss2BulletTimer);
    clearInterval(spearRingTimer);
    clearInterval(fanBulletTimer);
    clearInterval(boss2MoveTimer);
    spearTimer = boss2BulletTimer = spearRingTimer = fanBulletTimer = boss2MoveTimer = null;
}

function updateBoss2Behavior(scene) {
    if (boss2Phase === 1 && boss2Health < 2000) {
        boss2Phase = 2; clearAllBullets(scene);
        startBoss2Phase2(scene);
    } else if (boss2Phase === 2 && boss2Health < 1000) {
        boss2Phase = 3; clearAllBullets(scene);
        startBoss2Phase3(scene);
    } else if (boss2Health <= 0) {
        playBossDeathEffect(scene, boss2.x, boss2.y);
        boss2.destroy(); clearAllBullets(scene);
        clearAllTimers();
        boss2 = null;
        console.log('BOSS已被擊敗！');
        boss2bg.stop();
        bossHealthBar.setVisible(false);
        bossHealthBarBg.setVisible(false);
        currentBossHealth = 0;
        updateBossHealthBar(0);
        return;
    }
}

function moveBoss2ToNextPosition(scene, count) {
    currentBoss2TargetIndex = (currentBoss2TargetIndex + 1) % count;
    let target = boss2Positions[currentBoss2TargetIndex];
    scene.tweens.add({
        targets: boss2,
        x: target.x,
        y: target.y,
        duration: 5000,
        ease: 'Power2'
    });
}

function dropSpears() {
    let x = Phaser.Math.Between(50, 750);
    let spear = spearGroup.create(x, 30, 'spear').setScale(0.05).setRotation(Phaser.Math.DegToRad(180));;
    spear.setCollideWorldBounds(true);
    spear.body.onWorldBounds = true;
    spear.body.world.on('worldbounds', function (body) {
        if (body.gameObject === spear && spear.active) {
            spear.destroy();
        }
    });
    spear.setVelocityY(150);
    atk3.play();
}

function fireBoss2CircleBullets() {
    atk1.play();
    for (let i = 0; i < 12; i++) {
        let angle = Phaser.Math.DegToRad(i * 30);
        if (boss2) {
            let bullet = spearGroup.create(boss2.x, boss2.y, 'boss2bullet').setScale(0.05);
            bullet.setCollideWorldBounds(true);
            bullet.body.onWorldBounds = true;
            bullet.body.world.on('worldbounds', function (body) {
                if (body.gameObject === bullet && bullet.active) {
                    bullet.destroy();
                }
            });
            bullet.setVelocity(Math.cos(angle) * 260, Math.sin(angle) * 200);
        }

    }
}

function fireSpearRing(scene) {

    atk1.play();
    let count = 12;
    for (let i = 0; i < count; i++) {
        let angle = Phaser.Math.DegToRad((360 / count) * i);
        let spear = spearGroup.create(boss2.x, boss2.y, 'boss2bullet').setScale(0.05);
        spear.setCollideWorldBounds(true);
        spear.body.onWorldBounds = true;
        spear.body.world.on('worldbounds', function (body) {
            if (body.gameObject === spear && spear.active) {
                spear.destroy();
            }
        });
        scene.physics.velocityFromRotation(angle, 250, spear.body.velocity);
    }
}


function fireSurroundingBulletsAtPlayer(scene, bulletsPerSide = 1, margin = 30, speed = 120) {
    atk3.play();
    const width = 800;
    const height = scene.scale.height;

    if (!spearGroup || !player) return;

    // 上邊界
    for (let i = 0; i < bulletsPerSide; i++) {
        const x = Phaser.Math.Linear(margin, width - margin, i / (bulletsPerSide - 1));
        const y = margin;
        spawnBulletTowardPlayer(scene, x, y, speed);
    }

    // 下邊界
    for (let i = 0; i < bulletsPerSide; i++) {
        const x = Phaser.Math.Linear(margin, width - margin, i / (bulletsPerSide - 1));
        const y = height - margin;
        spawnBulletTowardPlayer(scene, x, y, speed);
    }

    // 左邊界
    for (let i = 0; i < bulletsPerSide; i++) {
        const x = margin;
        const y = Phaser.Math.Linear(margin, height - margin, i / (bulletsPerSide - 1));
        spawnBulletTowardPlayer(scene, x, y, speed);
    }

    // 右邊界
    for (let i = 0; i < bulletsPerSide; i++) {
        const x = width - margin;
        const y = Phaser.Math.Linear(margin, height - margin, i / (bulletsPerSide - 1));
        spawnBulletTowardPlayer(scene, x, y, speed);
    }
}

// 子彈生成並朝向玩家移動
function spawnBulletTowardPlayer(scene, x, y, speed) {
    const angle = Phaser.Math.Angle.Between(x, y, player.x, player.y);
    const bullet = spearGroup.create(x, y, 'boss2bullet').setScale(0.03);
    bullet.setCollideWorldBounds(true);
    bullet.body.onWorldBounds = true;
    bullet.body.world.on('worldbounds', function (body) {
        if (body.gameObject === bullet && bullet.active) {
            bullet.destroy();
        }
    });
    scene.physics.velocityFromRotation(angle, speed, bullet.body.velocity);
}
function bulletHitPlayer(player, bullet) {
    bullet.destroy();
    // 撞到後可加入扣血等效果
}


// 變數
let boss2Velocity = new Phaser.Math.Vector2(200, 100); // 初始衝刺方向與速度
let lastWallHitTime = 0;


function fireSideBullets(scene) {
    if (boss2)
        atk2.play();
    if (boss2) {
        const velocity = boss2.body.velocity;
        const baseAngle = Math.atan2(velocity.y, velocity.x); // Boss2 的移動方向角度

        const leftAngle = baseAngle - Math.PI / 2;
        const rightAngle = baseAngle + Math.PI / 2;

        // 發射兩顆子彈
        [leftAngle, rightAngle].forEach(angle => {
            const bullet = spearGroup.create(boss2.x, boss2.y, 'boss2bullet').setScale(0.05);
            bullet.setCollideWorldBounds(true);
            bullet.body.onWorldBounds = true;
            bullet.body.world.on('worldbounds', function (body) {
                if (body.gameObject === bullet && bullet.active) {
                    bullet.destroy();
                }
            });
            scene.physics.velocityFromRotation(angle, 250, bullet.body.velocity);
        });
    }

}

function fireCircularBullets(scene, x, y, count = 20, speed = 200) {
    atk1.play();
    for (let i = 0; i < count; i++) {
        const angle = (2 * Math.PI / count) * i;
        const bullet = spearGroup.create(x, y, 'boss2bullet').setScale(0.05);
        bullet.setCollideWorldBounds(true);
        bullet.body.onWorldBounds = true;
        bullet.body.world.on('worldbounds', function (body) {
            if (body.gameObject === bullet && bullet.active) {
                bullet.destroy();
            }
        });
        scene.physics.velocityFromRotation(angle, speed, bullet.body.velocity);
    }
}
