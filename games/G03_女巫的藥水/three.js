//第三關
function enemy7AtPlayer(enemy) {
    const bulletsToShoot = [];
    const spacing = 40;
    const bulletSpeed = 600;

    for (let i = -1.5; i <= 1.5; i++) {
        const offsetX = i * spacing;
        const n = bullets.create(enemy.x + i * spacing, enemy.y, 'needle')
        n.setTintFill(0xff0000);
        n.setCircle(bulletsize * 0.4, bulletsize * 0.2, bulletsize * 6);
        n.setData('offsetX', offsetX);
        n.setData('followEnemy', enemy);
        n.setData('following', true);
        bulletsToShoot.push(n);
    }
    this.time.delayedCall(2000, () => {
        bulletsToShoot.forEach(b => {
            if (!b.active) return;
            const dx = player.x - b.x;
            const dy = player.y - b.y;
            const len = Math.hypot(dx, dy) || 1;
            b.setVelocity((dx / len) * bulletSpeed, (dy / len) * bulletSpeed);
            b.setData('following', false);
            b.rotation = Math.atan2(dy, dx) + Math.PI / 2;
        });
        this.sound.play('enemyShoot', {
            volume: 0.1
        });
    });

    const moveSpeed = 80;
    let dx = Phaser.Math.Between(-1, 1);
    let dy = Phaser.Math.Between(-1, 1);
    if (dx === 0 && dy === 0) dx = 1;

    let vx = (dx / Math.hypot(dx, dy)) * moveSpeed;
    let vy = (dy / Math.hypot(dx, dy)) * moveSpeed;
    enemy.setVelocity(vx, vy);

    // 每幀檢查是否快碰到牆，反彈且修正位置
    enemy.scene.events.on('update', () => {
        if (!enemy.active) return;

        const margin = 50;

        if (enemy.x < margin) {
            enemy.x = margin;
            enemy.setVelocityX(Math.abs(enemy.body.velocity.x));
        } else if (enemy.x > 550 - margin) {
            enemy.x = 550 - margin;
            enemy.setVelocityX(-Math.abs(enemy.body.velocity.x));
        }

        if (enemy.y < margin) {
            enemy.y = margin;
            enemy.setVelocityY(Math.abs(enemy.body.velocity.y));
        } else if (enemy.y > 500 - margin) {
            enemy.y = 500 - margin;
            enemy.setVelocityY(-Math.abs(enemy.body.velocity.y));
        }
    });

}
function enemy8AtPlayer(enemy) {
    const bulletSpeed = 150;
    const offsets = [-30, 0, 30];

    this.tweens.add({
        targets: enemy,
        alpha: 0,
        duration: 300,
        onComplete: () => {
            enemy.x = Phaser.Math.Between(50, 550);
            enemy.y = Phaser.Math.Between(50, 300);

            this.tweens.add({
                targets: enemy,
                alpha: 1,
                duration: 300,
                onComplete: () => {
                    offsets.forEach(offsetX => {
                        const b = bullets.create(enemy.x + offsetX, enemy.y, 'Bullet');
                        b.setTintFill(0x9933ff);
                        b.setCircle(bulletsize);

                        const dx = player.x - b.x;
                        const dy = player.y - b.y;
                        const len = Math.hypot(dx, dy) || 1;
                        b.setVelocity((dx / len) * bulletSpeed, (dy / len) * bulletSpeed);

                        b.setData('semiTracking', true);
                    });
                }
            });
        }
    });
    this.sound.play('enemyShoot', {
        volume: 0.1
    });
}
function enemy9AtPlayer(enemy) {
    const needleSpeed = 50;
    const explodeDelay = 2500;
    const needleCount = 2;

    for (let i = 0; i < needleCount; i++) {
        const ang = (Math.PI * 2 / needleCount) * i;
        const n = bullets.create(enemy.x, enemy.y, 'BIGBullet')
            .setCircle(bulletsize * 1.5)
            .setTintFill(0xcccccc);
        n.setVelocity(Math.cos(ang) * needleSpeed, Math.sin(ang) * needleSpeed);
        n.setData('isNeedle', true);

        this.time.delayedCall(explodeDelay, () => {
            if (!n.active) return;
            const fragSpeed = 80;
            const base = Math.atan2(player.y - n.y, player.x - n.x);
            for (let j = 0; j < 2; j++) {
                const fAng = base + (Math.PI / 2) * j;
                const f = bullets.create(n.x, n.y, 'Bullet')
                    .setCircle(bulletsize)
                    .setTintFill(0xff6969);
                f.setVelocity(Math.cos(fAng) * fragSpeed, Math.sin(fAng) * fragSpeed);
            }
            n.destroy();
        });
    }
    this.sound.play('enemyShoot', {
        volume: 0.1
    });
}