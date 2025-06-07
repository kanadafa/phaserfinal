


function startBossAttack() {
    currentBoss = boss1;

    currentBossHealth = boss1health;
    if (attackTimer) return;
    attackTimer = setInterval(() => { fireCircleBullets(); }, 800);
    if(boss1)
    boss1.anims.play('boss1攻擊', true);
}

function fireCircleBullets() {
    const bulletSpeed = 140;
    const bulletCount = 24;
    const angleStep = 360 / bulletCount;
    bulletRotationOffset += 10;
    atk3.play();
    for (let i = 0; i < bulletCount; i++) {
        const angle = Phaser.Math.DegToRad(i * angleStep + bulletRotationOffset);
        const vx = Math.cos(angle) * bulletSpeed;
        const vy = Math.sin(angle) * bulletSpeed;

        const bullet = bulletGroup.create(boss1.x, boss1.y, 'bullet1').setScale(0.05).setCircle(240);
        bullet.vx = vx;
        bullet.vy = vy;
        bullet.setVelocity(vx, vy); // <<<<<< 加這行！
        bullet.body.onWorldBounds = true;
        bullet.setCollideWorldBounds(true);
        bullet.body.world.on('worldbounds', function (body) {
            if (body.gameObject === bullet && bullet.active) {
                bullet.destroy();
            }
        });

    }
}


function updateBossBehavior(scene) {
    if (!boss1) return;

    if (boss1health <= 0) {
        playBossDeathEffect(scene, boss1.x, boss1.y);
        boss1.destroy();
        clearAllTimers();
        boss1 = null; clearAllBullets(scene);
        console.log('BOSS已被擊敗！');

        boss1bg.stop();
        return;
    }

    if (boss1health > 666) {
        if (bossPhase !== 1) {
            BossEffect(scene, boss1.x, boss1.y,boss1);
            bossPhase = 1; clearAllBullets(scene);
            switchBossAttack(1, scene);


        }
    } else if (boss1health > 333) {
        if (bossPhase !== 2) {
            BossEffect(scene, boss1.x, boss1.y,boss1);
            bossPhase = 2; clearAllBullets(scene);
            switchBossAttack(2, scene);
        }
    } else {
        if (bossPhase !== 3) {
            BossEffect(scene, boss1.x, boss1.y,boss1);
            bossPhase = 3; clearAllBullets(scene);
            switchBossAttack(3, scene);
        }
    }
}

function switchBossAttack(phase, scene) {
    clearAllTimers();
    if (boss1) {
        if (phase === 2) {
            if(boss1)
            boss1.anims.play('boss1鑽入地', true);
            boss1.setVelocity(0);

            scene.time.delayedCall(1000, () => {
                if(boss1)
                boss1.anims.play('boss1鑽出地', true);

                if (boss1)
                    boss1.setPosition(400, 300);
                scene.time.delayedCall(1000, () => {
                    startPhase2AttackCycle(scene);
                    if(boss1)
                    boss1.anims.play('boss1攻擊', true);
                });

            });


        } else if (phase === 3) {
            if(boss1)
            boss1.setVelocity(0);
            if(boss1)
            boss1.anims.play('boss1鑽入地', true);
            scene.time.delayedCall(1000, () => {
                if (boss1)
                    
                    boss1.setPosition(400, 200);
                startCrazyAttack(scene);
            });
        }
    }

}

function clearAllTimers() {
    clearInterval(attackTimer);
    clearInterval(attackPhaseTimer);
    clearInterval(borderBulletTimer);
    if (crazyAttackTimer) crazyAttackTimer.remove();
    attackTimer = null;
    attackPhaseTimer = null;
    borderBulletTimer = null;
    crazyAttackTimer = null;
}

// Phase 2: 邊界子彈 ↔ 扇形子彈循環
function startPhase2AttackCycle(scene) {
    console.log("Phase 2 attack cycle started!");
    let currentPhaseAttack = 'border';
    startBorderBullets(scene);

    attackPhaseTimer = setInterval(() => {
        if (currentPhaseAttack === 'border') {
            stopBorderBullets();
            scene.time.delayedCall(2000, () => {
                startFanBullets(scene);
                boss1.anims.play('boss1待機', true);
                currentPhaseAttack = 'fan';
            });
        } else {
            stopFanBullets();
            scene.time.delayedCall(50, () => {
                boss1.anims.play('boss1攻擊', true);
                startBorderBullets(scene);
                currentPhaseAttack = 'border';
            });
        }
    }, 5000);
}

function startBorderBullets(scene) {
    console.log("Starting border bullets!");
    borderBulletTimer = setInterval(() => {
        const positions = getRandomBorderPosition();
        const bullet = bulletGroup.create(positions.x, positions.y, 'bullet1').setScale(0.05).setCircle(240);

        const angle = Phaser.Math.Angle.Between(bullet.x, bullet.y, boss1.x, boss1.y);
        const speed = 150;
        bullet.vx = Math.cos(angle) * speed;
        bullet.vy = Math.sin(angle) * speed;

        bullet.setVelocity(bullet.vx, bullet.vy);
        atk1.play();
        bullet.isBorderBullet = true; // <<<< 加這行！表明是邊界子彈
    }, 50);
}


function stopBorderBullets() {
    clearInterval(borderBulletTimer);
    borderBulletTimer = null;
}

function startFanBullets(scene) {
    console.log("Starting fan bullets!");
    const centerAngle = Phaser.Math.Angle.Between(boss1.x, boss1.y, player.x, player.y);
    const bulletSpeed = 200;
    const spread = Phaser.Math.DegToRad(60);
    atk3.play();
    for (let i = -6; i <= 6; i++) {
        const angle = centerAngle + (spread / 5) * i + Phaser.Math.FloatBetween(-0.05, 0.05);
        const vx = Math.cos(angle) * bulletSpeed;
        const vy = Math.sin(angle) * bulletSpeed;

        const bullet = bulletGroup.create(boss1.x, boss1.y, 'bullet1').setScale(0.05).setCircle(240);
        bullet.vx = vx;
        bullet.vy = vy;
        bullet.setVelocity(bullet.vx, bullet.vy);
        bullet.body.onWorldBounds = true;
        bullet.setCollideWorldBounds(true);
        bullet.body.world.on('worldbounds', function (body) {
            if (body.gameObject === bullet && bullet.active) {
                bullet.destroy();
            }
        });
    }
}

function stopFanBullets() {
    // 扇形攻擊是單發，不需要特別停止
}

function startCrazyAttack(scene) {
    console.log("Phase 3 teleport attack!");
    startPhase3TeleportAttack(scene); // <<< 換成這個新的
}


function getRandomBorderPosition() {
    const edge = Phaser.Math.Between(0, 3);
    switch (edge) {
        case 0: return { x: Phaser.Math.Between(0, 800), y: -10 };
        case 1: return { x: Phaser.Math.Between(0, 800), y: 810 };
        case 2: return { x: -10, y: Phaser.Math.Between(0, 800) };
        case 3: return { x: 810, y: Phaser.Math.Between(0, 800) };
    }
}
function startPhase3TeleportAttack(scene) {
    teleportAndAttack(scene);
}

function teleportAndAttack(scene) {
    if (!boss1 || boss1health <= 0) return;

    // 隨機瞬移地點
    const teleportPosition = getRandomSafeTeleportPosition();
    boss1.setPosition(teleportPosition.x, teleportPosition.y);
    if (boss1)
        boss1.anims.play('boss1鑽出地', true);
    atk2.play();
    // 1. 發360度子彈
    fireRandomCircleBullets(scene);

    // 2. 延遲一點再發3次扇形子彈
    scene.time.delayedCall(1000, () => {
        if (boss1)
            boss1.anims.play('boss1攻擊', true);
        fire3FanBullets(scene);
    });
}

function getRandomSafeTeleportPosition() {
    let x, y;
    do {
        x = Phaser.Math.Between(100, 700); // 地圖左右邊界留白
        y = Phaser.Math.Between(50, 400);  // 不要底部（<400）
    } while (Phaser.Math.Distance.Between(x, y, player.x, player.y) < 200);
    return { x, y };
}

function fireRandomCircleBullets(scene) {

    const bulletCount = 36;
    const angleStep = 360 / bulletCount;

    for (let i = 0; i < bulletCount; i++) {
        const angle = Phaser.Math.DegToRad(i * angleStep);
        const speed = Phaser.Math.FloatBetween(150, 250); // 隨機速度

        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;

        const bullet = bulletGroup.create(boss1.x, boss1.y, 'bullet1').setScale(0.05).setCircle(240);
        bullet.vx = vx;
        bullet.vy = vy;
        bullet.bounceCount = 0; // <<< 初始反彈次數
        bullet.isReboundBullet = true; // <<< 標記這種特別的子彈

        bullet.setVelocity(bullet.vx, bullet.vy);
        bullet.setCollideWorldBounds(true);
        bullet.setBounce(1); // 讓物理引擎幫忙彈
    }


}


function fire3FanBullets(scene) {
    let count = 0;

    const shootFan = () => {
        if (!boss1 || boss1health <= 0) return;
        atk3.play();
        const centerAngle = Phaser.Math.Angle.Between(boss1.x, boss1.y, player.x, player.y);
        const bulletSpeed = 150;
        const spread = Phaser.Math.DegToRad(60);

        for (let i = -3; i <= 3; i++) {
            const angle = centerAngle + (spread / 5) * i + Phaser.Math.FloatBetween(-0.05, 0.05);
            const vx = Math.cos(angle) * bulletSpeed;
            const vy = Math.sin(angle) * bulletSpeed;

            const bullet = bulletGroup.create(boss1.x, boss1.y, 'bullet1').setScale(0.05).setCircle(240);
            bullet.vx = vx;
            bullet.vy = vy;
            bullet.setVelocity(bullet.vx, bullet.vy);
            bullet.body.onWorldBounds = true;
            bullet.setCollideWorldBounds(true);
            bullet.body.world.on('worldbounds', function (body) {
                if (body.gameObject === bullet && bullet.active) {
                    bullet.destroy();
                }
            });
        }

        count++;
        if (count < 5) {
            scene.time.delayedCall(500, shootFan);
        } else {
            // 扇形打完了，再等一下重新瞬移
            if (boss1)
                boss1.anims.play('boss1待機', true);

            scene.time.delayedCall(2500, () => {
                if (boss1)
                    boss1.anims.play('boss1鑽入地', true);
                scene.time.delayedCall(800, () => {
                    teleportAndAttack(scene);
                });

            });
        }
    };

    shootFan();
}

function bulletHitPlayer(player, bullet) {
    bullet.destroy();

console.log("1111111111111");

}




function bulletHitBoss(boss, bullet) {
    if (bullet.isBorderBullet) {
        bullet.destroy();
    }
}

// function updatePlayer() {
//     if (!player) return;

//     player.setVelocity(0);
//     if (cursors.left.isDown) player.setVelocityX(-300);
//     if (cursors.right.isDown) player.setVelocityX(300);
//     if (cursors.up.isDown) player.setVelocityY(-300);
//     if (cursors.down.isDown) player.setVelocityY(300);
// }

// function bulletHitPlayer(player, bullet) {
//     bullet.destroy();
// }
// function bulletHitBoss(boss, bullet) {
//     if (bullet.isBorderBullet) {
//         bullet.destroy();
//     }
// }
