/*第二關*/
function enemy4AtPlayer(enemy) {
    const speed = 180, count = 12;
    for (let i = 0; i < count; i++) {
        const ang = 2 * Math.PI / count * i;
        const b = bullets.create(enemy.x, enemy.y, 'Bullet').setCircle(bulletsize);
        b.setTintFill(0xff8000);
        b.setVelocity(Math.cos(ang) * speed, Math.sin(ang) * speed);
    }
    this.sound.play('enemyShoot', {
        volume: 0.1
    });
}
function enemy5AtPlayer(enemy) {
    const speed = 240;
    const spread = 30;

    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const len = Math.hypot(dx, dy);
    const ux = dx / len;
    const uy = dy / len;

    const px = -uy;
    const py = ux;

    for (let i = -1; i <= 1; i++) {
        const sx = enemy.x + px * spread * i;
        const sy = enemy.y + py * spread * i;

        const b = bullets.create(sx, sy, 'Bullet').setCircle(bulletsize);
        b.setTintFill(0xff8000);
        b.setVelocity(ux * speed, uy * speed);
    }
    this.sound.play('enemyShoot', {
        volume: 0.1
    });
}
function enemy6AtPlayer(enemy) {
    const scene = this;
    const shootDelay = 300; // 每顆子彈之間間隔(ms)
    const bulletSpeed = 200;
    const bulletAmplitude = 40; // S型振幅
    const bulletFrequency = 0.005; // 頻率，越大波越密

    for (let i = 0; i < 5; i++) {
        scene.time.delayedCall(i * shootDelay, () => {
            const b = bullets.create(enemy.x, enemy.y, 'Bullet');
            b.setData('startX', enemy.x);
            b.setData('timeOffset', scene.time.now);
            b.setData('amplitude', bulletAmplitude);
            b.setData('frequency', bulletFrequency);
            b.setTintFill(0x16148f);
            const dx = player.x - enemy.x;
            const angle = Math.atan2(200, dx);
            const vx = Math.cos(angle) * bulletSpeed;
            b.setVelocity(vx, 200);
            this.sound.play('enemyShoot', {
                volume: 0.1
            });
        });
    }
}
