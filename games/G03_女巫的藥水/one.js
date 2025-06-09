/*第一關*/
function enemy1AtPlayer(enemy) {
    const speed = 220, count = 3, delay = 120;
    const dx = player.x - enemy.x, dy = player.y - enemy.y, len = Math.hypot(dx, dy);
    for (let i = 0; i < count; i++) {
        this.time.delayedCall(i * delay, () => {
            const b = bullets.create(enemy.x, enemy.y, 'Bullet').setCircle(bulletsize);
            b.setVelocity((dx / len) * speed, (dy / len) * speed);
            b.setTintFill(0x4db349);
            this.sound.play('enemyShoot', {
                volume: 0.1
            });
        });
    }
}
function enemy2AtPlayer(enemy) {
    const speed = 200, count = 5, spread = 60;
    const dx = player.x - enemy.x, dy = player.y - enemy.y, base = Phaser.Math.RadToDeg(Math.atan2(dy, dx));
    for (let i = 0; i < count; i++) {
        const offset = (i - (count - 1) / 2) * (spread / (count - 1));
        const ang = Phaser.Math.DegToRad(base + offset);
        const b = bullets.create(enemy.x, enemy.y, 'Bullet').setCircle(bulletsize);
        b.setVelocity(Math.cos(ang) * speed, Math.sin(ang) * speed);
        b.setTintFill(0xbd5f3c)
    }
    this.sound.play('enemyShoot', {
        volume: 0.1
    });
}
function enemy3AtPlayer(enemy) {
    enemy.enemyCooldown = 2000; // 冷卻時間 2 秒

    const bulletCount = 8;
    const bulletSpeed = 180;
    const radius = 50;

    const angleToPlayer = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);

    for (let i = 0; i < bulletCount; i++) {
        // 子彈圍繞敵人排成一圈
        const angle = (2 * Math.PI / bulletCount) * i;
        const offsetX = Math.cos(angle) * radius;
        const offsetY = Math.sin(angle) * radius;
        const startX = enemy.x + offsetX;
        const startY = enemy.y + offsetY;

        const b = bullets.create(startX, startY, 'Bullet').setCircle(bulletsize);
        const vx = Math.cos(angleToPlayer) * bulletSpeed;
        const vy = Math.sin(angleToPlayer) * bulletSpeed;
        b.setVelocity(vx, vy);
        b.setTintFill(0x4db349);
    }
    this.sound.play('enemyShoot', {
        volume: 0.1
    });
}
