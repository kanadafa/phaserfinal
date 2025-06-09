const Player = (function () {
    const imgAttack = new Image();
    imgAttack.src = 'images/sprites/attack.png';

    const imgFly = new Image();
    imgFly.src = 'images/sprites/fly.png';

    const imgInjured = new Image();
    imgInjured.src = 'images/sprites/injuried.png';

    const imgInjured_red = new Image();
    imgInjured_red.src = 'images/sprites/injured_red.png';

    let x = 150;
    let y = 200;
    const width = 160;
    const height = 160;
    let vy = 0;
    const gravity = 0.5;
    const lift = -10;

    let isFlying = false;
    let hasStartedFlying = false;
    let hasFireball = false;

    let isInjured = false;
    let isInjured_red = false;
    let flickerInterval = null;
    let visible = true;
    let currentImage = imgAttack;
    let _isInvincible = false;

    function init(startY) {
        y = startY;
        vy = 0;
        isFlying = false;
        hasStartedFlying = false;
        isInjured = false;
        visible = true;
        currentImage = imgAttack;
        _isInvincible = false;
        stopFlicker();

        // 檢查是否選了火球術
        if (window.GameState && GameState.selectedItem === 'fireball') {
            hasFireball = true;
        }

        // Setup fireball event listener
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            canvas.removeEventListener("mousedown", handleFireball); // Remove existing listener if any
            canvas.addEventListener("mousedown", handleFireball);
        }
    }

    function handleFireball() {
        if (hasFireball && !isInjured && typeof FireballManager !== 'undefined') {
            FireballManager.spawn(x + width, y + height / 2 - 16);
        }
    }

    function update() {
        vy += gravity;
        y += vy;

        // 不讓角色飛出畫面
        if (y < 0) {
            y = 0;
            vy = 0;
        }
        if (y + height > canvas.height) {
            y = canvas.height - height;
            vy = 0;
        }

        // 如果不是受傷狀態，更新圖片為正常狀態
        if (!isInjured) {
            currentImage = hasStartedFlying ? imgFly : imgAttack;
        }
    }

    function draw(ctx) {
        if (visible) {
            if (_isInvincible) {
                ctx.globalAlpha = 0.5;
            }
            ctx.drawImage(currentImage, x, y, width, height);
            if (_isInvincible) {
                ctx.globalAlpha = 1.0;
            }
        }
    }

    function liftUp() {
        vy = lift;
        isFlying = true;
        hasStartedFlying = true;
    }

    function setFlying(state) {
        isFlying = state;
    }

    function getPlayerRect() {
        return { x, y, width, height };
    }

    function collideWithObstacle(useRedImage = false) {
        if (isInjured || _isInvincible) return;

        isInjured = true;
        currentImage = useRedImage ? imgInjured_red : imgInjured;

        flickerInterval = setInterval(() => {
            visible = !visible;
        }, 100);

        setTimeout(() => {
            stopFlicker();
            isInjured = false;
            visible = true;
            currentImage = hasStartedFlying ? imgFly : imgAttack;
        }, 2000);
    }

    function stopFlicker() {
        if (flickerInterval) {
            clearInterval(flickerInterval);
            flickerInterval = null;
        }
    }

    function setInvincible(state) {
        _isInvincible = state;
    }

    function isInvincible() {
        return _isInvincible;
    }

    return {
        init,
        update,
        draw,
        liftUp,
        setFlying,
        getPlayerRect,
        collideWithObstacle,
        isInjured: () => isInjured,
        setInvincible,
        isInvincible
    };
})();
