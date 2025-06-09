const BoneManager = (function() {
    const bones = [];
    const boneSpeed = 8;
    const boneSize = 40;
    
    // Load bone image
    const boneImg = new Image();
    boneImg.src = 'images/obstacle/bone.png';

    function spawn(x, y) {
        bones.push({
            x: x,
            y: y,
            width: boneSize,
            height: boneSize,
            rotation: 0
        });
    }

    function update(player) {
        // Update each bone's position and rotation
        for (let i = bones.length - 1; i >= 0; i--) {
            const bone = bones[i];
            bone.x -= boneSpeed;
            bone.rotation += 0.1; // Rotate the bone as it moves

            // Check collision with fireballs
            if (typeof FireballManager !== 'undefined') {
                const fireballs = FireballManager.getFireballs();
                if (fireballs) {
                    for (let j = fireballs.length - 1; j >= 0; j--) {
                        const fireball = fireballs[j];
                        if (isColliding(bone, fireball)) {
                            // Remove both bone and fireball
                            bones.splice(i, 1);
                            FireballManager.removeFireball(j);
                            return; // Exit since bone is removed
                        }
                    }
                }
            }

            // Check collision with player
            const playerRect = player.getPlayerRect();
            if (isColliding(bone, playerRect)) {
                if (!player.isInjured() && !player.isInvincible()) {
                    if (PropManager.hasActiveShield()) {
                        if (PropManager.useShield()) {
                            bones.splice(i, 1);
                            continue;
                        }
                    }
                    GameState.takeDamage();
                    player.collideWithObstacle();
                }
                bones.splice(i, 1);
                continue;
            }

            // Remove bones that are off screen
            if (bone.x + bone.width < 0) {
                bones.splice(i, 1);
            }
        }
    }

    function draw(ctx) {
        bones.forEach(bone => {
            ctx.save();
            // Set rotation center to middle of bone
            ctx.translate(bone.x + bone.width/2, bone.y + bone.height/2);
            ctx.rotate(bone.rotation);
            // Draw bone centered on rotation point
            ctx.drawImage(
                boneImg,
                -bone.width/2,
                -bone.height/2,
                bone.width,
                bone.height
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
        getBones: () => bones
    };
})(); 