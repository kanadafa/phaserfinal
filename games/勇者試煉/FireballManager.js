const FireballManager = (function() {
    const fireballs = [];
    const explosions = [];
    const fireballSpeed = 8;
    const fireballSize = 40;
    const explosionDuration = 500; // 500ms for explosion animation
    
    // Use the same image as the prop
    const fireballImg = new Image();
    fireballImg.src = 'images/obstacle/fireball.png';

    const boomImg = new Image();
    boomImg.src = 'images/obstacle/boom.png';

    function spawn(x, y) {
        fireballs.push({
            x: x,
            y: y,
            width: fireballSize,
            height: fireballSize
        });
    }

    function getFireballs() {
        return fireballs;
    }

    function removeFireball(index) {
        if (index >= 0 && index < fireballs.length) {
            const fireball = fireballs[index];
            createExplosion(fireball.x, fireball.y);
            fireballs.splice(index, 1);
        }
    }
    function shoot(playerRect) {
    const startX = playerRect.x + playerRect.width;
    const startY = playerRect.y + playerRect.height / 2 - fireballSize / 2;
    spawn(startX, startY);
}


    function createExplosion(x, y) {
        explosions.push({
            x: x,
            y: y,
            width: fireballSize * 1.5,
            height: fireballSize * 1.5,
            startTime: Date.now()
        });
    }

    function update(obstacles) {
        const currentTime = Date.now();
        
        // Update explosions
        for (let i = explosions.length - 1; i >= 0; i--) {
            const explosion = explosions[i];
            if (currentTime - explosion.startTime > explosionDuration) {
                explosions.splice(i, 1);
            }
        }

        // Update fireballs
        for (let i = fireballs.length - 1; i >= 0; i--) {
            const fireball = fireballs[i];
            fireball.x += fireballSpeed;

            // Check collision with bones
            if (typeof BoneManager !== 'undefined') {
                const bones = BoneManager.getBones();
                if (bones) {
                    for (let j = bones.length - 1; j >= 0; j--) {
                        const bone = bones[j];
                        if (isColliding(fireball, bone)) {
                            // Create explosion at collision point
                            createExplosion(fireball.x, fireball.y);
                            // Remove fireball (bone will be removed by BoneManager)
                            fireballs.splice(i, 1);
                            return; // Exit since fireball is removed
                        }
                    }
                }
            }

            // Check collision with obstacles
            let hitObstacle = false;
            for (let j = obstacles.length - 1; j >= 0; j--) {
                const obs = obstacles[j];
                if (isColliding(fireball, {
                    x: obs.x,
                    y: obs.y,
                    width: obs.width || 80,  // Default obstacle width
                    height: obs.height || 200 // Default obstacle height
                })) {
                    // Create explosion at collision point
                    createExplosion(fireball.x, fireball.y);
                    
                    // Remove both fireball and obstacle
                    fireballs.splice(i, 1);
                    obstacles.splice(j, 1);
                    hitObstacle = true;
                    break;
                }
            }

            // Remove fireball if it's off screen or hit an obstacle
            if (!hitObstacle && fireball.x > canvas.width) {
                fireballs.splice(i, 1);
            }
        }
    }

    function draw(ctx) {
        // Draw fireballs
        fireballs.forEach(fireball => {
            ctx.drawImage(
                fireballImg,
                fireball.x,
                fireball.y,
                fireball.width,
                fireball.height
            );
        });

        // Draw explosions
        explosions.forEach(explosion => {
            const progress = (Date.now() - explosion.startTime) / explosionDuration;
            const scale = 1 + progress; // Explosion grows as animation progresses
            
            ctx.save();
            ctx.globalAlpha = 1 - progress; // Fade out as animation progresses
            ctx.drawImage(
                boomImg,
                explosion.x - (explosion.width * scale - explosion.width) / 2,
                explosion.y - (explosion.height * scale - explosion.height) / 2,
                explosion.width * scale,
                explosion.height * scale
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
        shoot,
        spawn,
        update,
        draw,
        getFireballs,
        removeFireball
    };
})(); 