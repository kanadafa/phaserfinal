const PropManager = (function () {
    const props = {
        fireball: {
            name: "fireball",
            displayName: "火球術",
            description: "你獲得火球術！按滑鼠左鍵發射",
            longDescription: "來自古老的魔法，具有強大攻擊力，可以攻擊前方障礙物或怪物，但只能使用5次，否則體力會耗盡無法飛躍。",
            maxUses: 5,
            isPassive: false,
            imageSrc: 'images/obstacle/fireball.png',
            effect(player, obstacles) {
                if (this.currentUses <= 0) return false;
                this.currentUses--;

                const pRect = player.getPlayerRect();
                if (typeof FireballManager !== 'undefined') {
                    FireballManager.spawn(
                        pRect.x + pRect.width,
                        pRect.y + pRect.height / 2 - 20
                    );
                }

                return true;
            }
        },
        shield: {
            name: "shield",
            displayName: "矮人工匠盾牌",
            description: "你獲得盾牌，可抵免三次傷害",
            longDescription: "由矮人一族製作，堅硬無比，可以保護3次，不管是攻擊還是障礙物都可以擋下。",
            maxUses: 3,
            isPassive: true,
            imageSrc: 'images/obstacle/shield.png',
            effect() {
                if (this.currentUses <= 0) return false;
                this.currentUses--;
                console.log(`護盾抵擋傷害，剩餘：${this.currentUses}`);
                return true;
            }
        },
        feather: {
            name: "feather",
            displayName: "風之羽",
            description: "你獲得風之羽，5 秒穿透障礙技能",
            longDescription: "來自精靈一族的神奇道具，使用後可以有五秒的技能，途中不管是攻擊和障礙都可以直接穿越。",
            maxUses: 1,
            duration: 5000,
            isPassive: false,
            imageSrc: 'images/obstacle/feather.png',
            effect(player) {
                if (this.currentUses <= 0) return false;
                this.currentUses--;

                if (typeof player.setInvincible === 'function') {
                    player.setInvincible(true);

                    if (typeof Gameplay !== 'undefined' && Gameplay.setSpeedMultiplier) {
                        Gameplay.setSpeedMultiplier(2.0);
                    }

                    console.log("風之羽啟動：無敵！");

                    // Clear any existing timers first
                    if (featherTimer) {
                        clearInterval(featherTimer);
                        featherTimer = null;
                    }

                    let dashTimer = setInterval(() => {
                        if (typeof player.x === 'number') {
                            player.x += 10;
                        }
                    }, 50);

                    // Reset and start countdown
                    featherCountdown = 5;
                    featherTimer = setInterval(() => {
                        if (featherCountdown > 0) {
                            featherCountdown--;
                            console.log("風之羽倒數：", featherCountdown);
                        }
                        if (featherCountdown <= 0) {
                            clearInterval(featherTimer);
                            featherTimer = null;
                        }
                    }, 1000);

                    // Set up cleanup function
                    const cleanup = () => {
                        player.setInvincible(false);
                        if (typeof Gameplay !== 'undefined' && Gameplay.setSpeedMultiplier) {
                            Gameplay.setSpeedMultiplier(1.0);
                        }
                        clearInterval(dashTimer);
                        if (featherTimer) {
                            clearInterval(featherTimer);
                            featherTimer = null;
                        }
                        featherCountdown = 0;
                        console.log("風之羽結束：恢復正常狀態");
                    };

                    // Set timeout for effect duration
                    setTimeout(cleanup, this.duration);

                    return true;
                }

                return false;
            }
        }
    };

    let equippedProps = [];
    let currentPropIndex = 0;
    const propImages = {};
    let featherCountdown = 0;
    let featherTimer = null;

    function initPropImages() {
        Object.values(props).forEach(prop => {
            const img = new Image();
            img.src = prop.imageSrc;
            propImages[prop.name] = img;
        });
    }

    function resetProps() {
        // Clean up any existing timers
        if (featherTimer) {
            clearInterval(featherTimer);
            featherTimer = null;
        }
        
        equippedProps = [];
        currentPropIndex = 0;
        featherCountdown = 0;
    }

    function createPropInstance(base) {
        const instance = {
            ...base,
            id: Date.now() + Math.random(),
            currentUses: base.maxUses
        };
        instance.effect = function (player, obstacles) {
            return base.effect.call(instance, player, obstacles);
        };
        return instance;
    }

    function equipProp(name) {
        const base = props[name];
        if (!base) return false;

        const instance = createPropInstance(base);
        equippedProps.push(instance);
        console.log(`裝備道具：${instance.displayName}（${instance.currentUses}次）`);
        return true;
    }

    function switchToNextProp() {
        if (equippedProps.length === 0) return false;

        let start = currentPropIndex;
        do {
            currentPropIndex = (currentPropIndex + 1) % equippedProps.length;
            const prop = equippedProps[currentPropIndex];
            if (!prop.isPassive && prop.currentUses > 0) {
                return true;
            }
        } while (currentPropIndex !== start);

        return false;
    }

    function useProp(player, obstacles) {
        if (equippedProps.length === 0) return false;

        let prop = equippedProps[currentPropIndex];

        if (prop.isPassive || prop.currentUses <= 0) {
            if (!switchToNextProp()) return false;
            prop = equippedProps[currentPropIndex];
        }

        const result = prop.effect(player, obstacles);
        
        // Remove prop if it's used up
        if (prop.currentUses <= 0) {
            equippedProps.splice(currentPropIndex, 1);
            // Adjust currentPropIndex if needed
            if (currentPropIndex >= equippedProps.length) {
                currentPropIndex = Math.max(0, equippedProps.length - 1);
            }
        }

        return result;
    }

    function hasActiveShield() {
        return equippedProps.some(p => p.name === 'shield' && p.currentUses > 0);
    }

    function useShield() {
        const shieldIndex = equippedProps.findIndex(p => p.name === 'shield' && p.currentUses > 0);
        if (shieldIndex === -1) return false;
        
        const shield = equippedProps[shieldIndex];
        const result = shield.effect();
        
        // Force a redraw after shield use
        if (result) {
            console.log(`Shield used, remaining uses: ${shield.currentUses}`);
        }
        
        // Remove shield if it's used up
        if (shield.currentUses <= 0) {
            equippedProps.splice(shieldIndex, 1);
            // Adjust currentPropIndex if needed
            if (currentPropIndex >= equippedProps.length) {
                currentPropIndex = Math.max(0, equippedProps.length - 1);
            }
        }
        
        return result;
    }

    function getEquippedProp() {
        return equippedProps[currentPropIndex];
    }

    function drawPropUI(ctx) {
        if (!equippedProps.length) return;

        const margin = 20, size = 60, spacing = 10;
        const startX = margin;
        const startY = ctx.canvas.height - size - margin;

        equippedProps.forEach((prop, index) => {
            const img = propImages[prop.name];
            const x = startX + index * (size + spacing);
            const y = startY;

            if (img) {
                // Draw prop image
                ctx.globalAlpha = prop.isPassive ? 0.4 : 1.0;
                ctx.drawImage(img, x, y, size, size);
                ctx.globalAlpha = 1.0;

                // Draw uses count with improved visibility
                ctx.font = 'bold 24px Arial';  // Make the font bigger and bold
                ctx.strokeStyle = 'black';     // Add black outline
                ctx.lineWidth = 3;             // Thicker outline
                ctx.textAlign = 'center';
                
                // Draw the outline
                ctx.strokeText(`${prop.currentUses}`, x + size / 2, y + size + 25);
                
                // Draw the white text
                ctx.fillStyle = 'white';
                ctx.fillText(`${prop.currentUses}`, x + size / 2, y + size + 25);

                // Draw selection box for active prop
                if (index === currentPropIndex && !prop.isPassive) {
                    ctx.strokeStyle = 'yellow';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(x - 2, y - 2, size + 4, size + 4);
                }
            }
        });

        if (featherCountdown > 0) {
            const countdownX = ctx.canvas.width / 2;
            const countdownY = 80;

            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.beginPath();
            ctx.arc(countdownX, countdownY, 30, 0, Math.PI * 2);
            ctx.fill();

            ctx.font = 'bold 36px Arial';
            ctx.fillStyle = '#FFD700';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(featherCountdown.toString(), countdownX, countdownY);

            ctx.font = '16px Arial';
            ctx.fillStyle = 'white';
            ctx.fillText('無敵時間', countdownX, countdownY + 40);
        }

        if (typeof FireballManager !== 'undefined') {
            FireballManager.draw(ctx);
        }
    }

    function update(obstacles) {
        if (typeof FireballManager !== 'undefined' && obstacles) {
            FireballManager.update(obstacles);
        }
    }

    function getAllProps() {
        return Object.values(props);
    }

    function getAllPropsForUI() {
        return Object.values(props).map(p => ({
            img: new Image(),
            name: p.name,
            displayName: p.displayName,
            desc: p.description,
            longDesc: p.longDescription,
            src: p.imageSrc
        })).map(item => {
            item.img.src = item.src;
            return item;
        });
    }

    return {
        initPropImages,
        resetProps,
        equipProp,
        useProp,
        hasActiveShield,
        useShield,
        getEquippedProp,
        drawPropUI,
        getAllProps,
        getAllPropsForUI,
        update
    };
})();
