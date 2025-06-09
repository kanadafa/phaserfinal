const SwordManager = (function() {
    const swords = [];
    const swordSpeed = 8;
    const swordSize = 40;
    
    const swordImg = new Image();
    swordImg.src = 'images/obstacle/sword.png';

    function spawn(x, y) {
        swords.push({
            x: x,
            y: y,
            width: swordSize,
            height: swordSize,
            rotation: 0
        });
    }

    function update(player) {
        for (let i = swords.length - 1; i >= 0; i--) {
            const sword = swords[i];
            sword.x -= swordSpeed;
            sword.rotation += 0.1; // 旋轉效果

            // 檢查與火球的碰撞
            if (typeof FireballManager !== 'undefined') {
                const fireballs = FireballManager.getFireballs();
                if (fireballs) {
                    for (let j = fireballs.length - 1; j >= 0; j--) {
                        const fireball = fireballs[j];
                        if (isColliding(sword, fireball)) {
                            swords.splice(i, 1);
                            FireballManager.removeFireball(j);
                            return;
                        }
                    }
                }
            }

            // 檢查與玩家的碰撞
            const playerRect = player.getPlayerRect();
            if (isColliding(sword, playerRect)) {
                if (!player.isInjured() && !player.isInvincible()) {
                    if (PropManager.hasActiveShield()) {
                        if (PropManager.useShield()) {
                            swords.splice(i, 1);
                            continue;
                        }
                    }
                    GameState.takeDamage();
                    player.collideWithObstacle();
                }
                swords.splice(i, 1);
                continue;
            }

            // 移除超出畫面的劍
            if (sword.x + sword.width < 0) {
                swords.splice(i, 1);
            }
        }
    }

    function draw(ctx) {
        swords.forEach(sword => {
            ctx.save();
            ctx.translate(sword.x + sword.width/2, sword.y + sword.height/2);
            ctx.rotate(sword.rotation);
            ctx.drawImage(
                swordImg,
                -sword.width/2,
                -sword.height/2,
                sword.width,
                sword.height
            );
            ctx.restore();
        });
    }

    function isColliding(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    return {
        spawn,
        update,
        draw,
        getSwords: () => swords
    };
})(); 