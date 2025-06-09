const Level1 = (function () {
    const backgroundImg = new Image();
    backgroundImg.src = 'images/backgrounds/Level1.PNG';

    const obstacleImg = new Image();
    obstacleImg.src = 'images/obstacle/branch.png';

    const flagImg = new Image();
    flagImg.src = 'images/obstacle/flag.png';

    const obstacleWidth = 80;
    const obstacleHeight = 200;
    const obstacleScale = 2;
    const obstacleSpeed = 3;
    const spawnInterval = 120;
    const maxObstacles = 10;
    const flagWidth = 350;
    const flagHeight = 250;

    let isGameStarted = false;
    let gameOver = false;
    let levelComplete = false;
    let isLooping = false;
    let showHintBox = true;
    let showLevelTitle = true;
    let flagSpawned = false;

    const obstacles = [];
    let spawnTimer = 0;
    let totalSpawned = 0;
    let bgX = 0;
    let restartButton = null;

    let currentTextIndex = 0;
    const texts = [
        '這片森林，似乎曾有勇士戰鬥過的痕跡.....',
        '按空白鍵飛躍!'
    ];

    function startLevel1() {
        init();
    }

    function init() {
        Player.init(canvas.height / 2);
        GameState.resetHealth();

        isGameStarted = false;
        showLevelTitle = true;
        gameOver = false;
        levelComplete = false;
        isLooping = false;
        flagSpawned = false;
        obstacles.length = 0;
        bgX = 0;
        spawnTimer = 0;
        totalSpawned = 0;
        currentTextIndex = 0;
        showHintBox = true;

        // Clean up any existing buttons
        const existingButtons = document.querySelectorAll('button');
        existingButtons.forEach(button => button.remove());
        restartButton = null;

        window.removeEventListener('keydown', handleInput);
        window.addEventListener('keydown', handleInput);
        window.addEventListener('keyup', handleKeyUp);
        canvas.addEventListener('click', handleMouseClick);

        startLoop();
    }

    function handleInput(e) {
        if (e.code === 'Space') {
            if (!isGameStarted) {
                isGameStarted = true;
                showLevelTitle = false;
            } else if (!gameOver && !levelComplete) {
                Player.liftUp();
            }
        }
    }

    function handleKeyUp(e) {
        if (e.code === 'Space') {
            Player.setFlying(false);
        }
    }

    function handleMouseClick() {
        if (currentTextIndex < texts.length - 1) {
            currentTextIndex++;
        } else {
            showHintBox = false;
        }
    }

    function startLoop() {
        if (!isLooping) {
            isLooping = true;
            requestAnimationFrame(gameLoop);
        }
    }

    let lastObstacleTop = false;

    function update() {
        if (gameOver || levelComplete) return;

        Player.update();
        const p = Player.getPlayerRect();

        if (levelComplete && DialogueManager.isDone()) {
            // Clean up before changing level
            const existingButtons = document.querySelectorAll('button');
            existingButtons.forEach(button => button.remove());
            GameState.changeLevel("Level2");
            return;
        }

        if (p.y + p.height >= canvas.height || p.y <= 0) {
            if (!Player.isInjured()) {
                Player.collideWithObstacle(true);
            }
            gameOver = true;
            isLooping = false;
            showRestartButton();
            return;
        }

        bgX -= obstacleSpeed;
        if (bgX <= -canvas.width) bgX = 0;

        if (totalSpawned < maxObstacles) {
            spawnTimer++;
            if (spawnTimer >= spawnInterval) {
                spawnObstacle();
                spawnTimer = 0;
            }
        } else if (!obstacles.some(o => o.type === 'flag') && !flagSpawned) {
            spawnFlag();
        }

        for (let i = obstacles.length - 1; i >= 0; i--) {
            const o = obstacles[i];
            o.x -= obstacleSpeed;

            const rect = {
                x: o.x,
                y: o.y,
                width: obstacleWidth,
                height: obstacleHeight
            };

            if (isColliding(p, rect)) {
                if (o.type === 'flag') {
                    levelComplete = true;
                    isLooping = false;
                    DialogueManager.setLevelComplete(true);
                    setTimeout(() => {
                        DialogueManager.startDialogue();
                    }, 500);
                    return;
                }
                
                if (!Player.isInjured()) {
                    GameState.takeDamage();
                    Player.collideWithObstacle();

                    if (GameState.getHealth() <= 0) {
                        gameOver = true;
                        isLooping = false;
                        showRestartButton();
                        return;
                    }
                }
            }

            if (o.x + obstacleWidth < 0) {
                obstacles.splice(i, 1);
            }
        }
    }

    function spawnObstacle() {
        const isTop = Math.random() > 0.6;
        const y = isTop ? 0 : canvas.height - obstacleHeight;
        obstacles.push({ 
            x: canvas.width + 50,
            y: y, 
            type: isTop ? 'top' : 'bottom' 
        });
        totalSpawned++;
    }

    function spawnFlag() {
        const lastObstacle = obstacles[obstacles.length - 1];
        if (!lastObstacle || lastObstacle.x < canvas.width - 300) {
            obstacles.push({
                x: canvas.width,
                y: canvas.height - obstacleHeight,
                type: 'flag'
            });
            flagSpawned = true;
        }
    }

    function draw() {
        ctx.drawImage(backgroundImg, bgX, 0, canvas.width, canvas.height);
        ctx.drawImage(backgroundImg, bgX + canvas.width, 0, canvas.width, canvas.height);

        if (showLevelTitle) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'white';
            ctx.font = '48px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('第一關:沉眠森林', canvas.width / 2, canvas.height / 2);
        }

        if (showHintBox) {
            const boxX = 20;
            const boxY = 20;
            const boxWidth = 400;
            const boxHeight = 130;

            ctx.fillStyle = 'black';
            ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

            ctx.fillStyle = 'white';
            ctx.font = '20px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(texts[currentTextIndex], boxX + boxWidth / 2, boxY + boxHeight / 2);

            if (currentTextIndex < texts.length - 1) {
                ctx.font = '14px sans-serif';
                ctx.textAlign = 'right';
                ctx.fillText('點擊任意位置繼續', boxX + boxWidth - 10, boxY + boxHeight - 10);
            }
        }

        Player.draw(ctx);
        for (const o of obstacles) {
            const dw = obstacleWidth * obstacleScale;
            const dh = obstacleHeight * obstacleScale;
            ctx.save();

            if (o.type === 'top') {
                ctx.translate(o.x + dw / 2, o.y + dh / 2);
                ctx.scale(1, -1);
                ctx.drawImage(obstacleImg, -dw / 2, -dh / 2, dw, dh);
            } else if (o.type === 'bottom') {
                ctx.drawImage(obstacleImg, o.x, o.y - (dh - obstacleHeight), dw, dh);
            } else if (o.type === 'flag') {
                const scale = canvas.height / 800;
                const fw = flagWidth * scale;
                const fh = flagHeight * scale;
                const y = canvas.height - fh;
                ctx.drawImage(flagImg, o.x, y, fw, fh);
            }

            ctx.restore();
        }

        if (gameOver) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'red';
            ctx.font = '48px sans-serif';
            ctx.fillText('遊戲結束', canvas.width / 2, canvas.height / 2);
        }

        drawHealth();
    }

    function drawHealth() {
        const health = GameState.getHealth();
        const maxHealth = 5;
        const boxWidth = 60;
        const boxHeight = 40;
        const spacing = 10;
        const margin = 20;

        const totalWidth = maxHealth * boxWidth + (maxHealth - 1) * spacing;
        const startX = canvas.width - margin - totalWidth;
        const startY = margin;

        for (let i = 0; i < maxHealth; i++) {
            const x = startX + i * (boxWidth + spacing);
            ctx.fillStyle = 'gray';
            ctx.fillRect(x, startY, boxWidth, boxHeight);
        }

        let color = 'gray';
        if (health >= 4) color = 'green';
        else if (health >= 2) color = 'orange';
        else if (health >= 1) color = 'red';

        for (let i = 0; i < health; i++) {
            const x = startX + i * (boxWidth + spacing);
            ctx.fillStyle = color;
            ctx.fillRect(x, startY, boxWidth, boxHeight);
        }
    }

    function showRestartButton() {
        restartButton = document.createElement('button');
        restartButton.textContent = '重新開始';
        restartButton.style.position = 'absolute';
        restartButton.style.left = '50%';
        restartButton.style.top = '60%';
        restartButton.style.transform = 'translateX(-50%)';
        restartButton.style.fontSize = '20px';
        restartButton.style.padding = '10px 20px';
        restartButton.onclick = () => {
            startLevel1();
        };
        document.body.appendChild(restartButton);
    }

    function isColliding(r1, r2) {
        return (
            r1.x < r2.x + r2.width &&
            r1.x + r1.width > r2.x &&
            r1.y < r2.y + r2.height &&
            r1.y + r1.height > r2.y
        );
    }

    function gameLoop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (isGameStarted) update();
        draw();
        if (!levelComplete && !gameOver) {
            requestAnimationFrame(gameLoop);
        }
    }

    return {
        startLevel1
    };
})();

// 導出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Level1;
} else {
    window.Level1 = Level1;
} 