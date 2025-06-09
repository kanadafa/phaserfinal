const Level4 = (function () {
    console.log("Level4: Module loaded");

    const backgroundImg = new Image();
    backgroundImg.src = 'images/backgrounds/Level4.PNG';

    const obstacleImg = new Image();
    obstacleImg.src = 'images/obstacle/bone.png';

    const flagImg = new Image();
    flagImg.src = 'images/obstacle/flag.png';

    const boss1Img = new Image();
    boss1Img.src = 'images/Boss/Monster1.png';
    
    const boss2Img = new Image();
    boss2Img.src = 'images/Boss/Monster2.png';

    const boss1InjuredImg = new Image();
    boss1InjuredImg.src = 'images/Boss/Monster1_Injured.png';
    
    const boss2InjuredImg = new Image();
    boss2InjuredImg.src = 'images/Boss/Monster2_Injured.png';

    const treasureImg = new Image();
    treasureImg.src = 'images/obstacle/treasure.png';

    const winImg = new Image();
    winImg.src = 'images/obstacle/Level4_win.png';

    let itemImgs = [];

    function initItemImgs() {
        if (typeof PropManager === 'undefined') {
            console.error('PropManager is not loaded!');
            return;
        }
        if (typeof PropManager.getAllPropsForUI !== 'function') {
            console.error('PropManager.getAllPropsForUI is not available!');
            return;
        }
        itemImgs = PropManager.getAllPropsForUI();
        console.log('Items initialized:', itemImgs);
    }

    const obstacleWidth = 80;
    const obstacleHeight = 200;
    const obstacleScale = 2;
    const obstacleSpeed = 4; 
    const spawnInterval = 100;
    const maxObstacles = 12;
    const flagWidth = 350;
    const flagHeight = 250;
    const bossWidth = 200;
    const bossHeight = 200;
    const bossMaxHealth = 3;  // Boss dies after 3 hits
    const treasureSize = 100;
    const minTreasureSpacing = 300;

    let canvas, ctx;
    let isGameStarted = false;
    let gameOver = false;
    let levelComplete = false;
    let isLooping = false;
    let showHintBox = true;
    let showLevelTitle = true;
    let flagSpawned = false;
    
    // 修改為兩個 boss 的狀態
    let boss1Health = bossMaxHealth;
    let boss2Health = bossMaxHealth;
    let boss1HitTime = 0;
    let boss1IsFlashing = false;
    let boss2HitTime = 0;
    let boss2IsFlashing = false;
    
    let showingItemChoice = false;
    let selectedItemIndex = -1;

    const obstacles = [];
    const treasures = [];
    let spawnTimer = 0;
    let totalSpawned = 0;
    let bgX = 0;
    let restartButton = null;
    let currentTextIndex = 0;
    const texts = [
        '這裡是怎樣...我的理智似乎正在被吞噬…'
    ];

    const victoryDialogue = [
        "(有一本筆記本在角落)"
    ];

    // 修改攻擊時間變數
    const minAttackCooldown = 3000; // 最短 3 秒
    const maxAttackCooldown = 5000; // 最長 5 秒
    let nextAttackCooldown1 = 4000;
    let nextAttackCooldown2 = 4000;

    function startLevel4() {
        canvas = document.getElementById('gameCanvas');
        if (!canvas) {
            console.error("Level4: Canvas element not found!");
            return;
        }
        ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Reset all game states
        Player.init(canvas.height / 2);
        GameState.resetHealth();
        PropManager.resetProps();
        PropManager.initPropImages();
        initItemImgs();

        // 重置 boss 狀態
        boss1Health = bossMaxHealth;
        boss2Health = bossMaxHealth;
        boss1HitTime = 0;
        boss2HitTime = 0;
        boss1IsFlashing = false;
        boss2IsFlashing = false;
        
        lastSwordAttackTime1 = Date.now();
        lastSwordAttackTime2 = Date.now() + 1000; // 錯開攻擊時間
        nextAttackCooldown1 = minAttackCooldown + Math.random() * (maxAttackCooldown - minAttackCooldown);
        nextAttackCooldown2 = minAttackCooldown + Math.random() * (maxAttackCooldown - minAttackCooldown);

        isGameStarted = false;
        showLevelTitle = true;
        gameOver = false;
        levelComplete = false;
        isLooping = false;
        flagSpawned = false;
        obstacles.length = 0;
        treasures.length = 0;
        bgX = 0;
        spawnTimer = 0;
        totalSpawned = 0;
        currentTextIndex = 0;
        showHintBox = true;
        showingItemChoice = false;
        selectedItemIndex = -1;

        const existingButtons = document.querySelectorAll('button');
        existingButtons.forEach(button => button.remove());
        restartButton = null;

        window.removeEventListener('keydown', handleInput);
        window.removeEventListener('keyup', handleKeyUp);
        canvas.removeEventListener('click', handleMouseClick);
        window.addEventListener('keydown', handleInput);
        window.addEventListener('keyup', handleKeyUp);
        canvas.addEventListener('click', handleMouseClick);

        // Initial game setup - spawn two treasures
        spawnTreasure();
        spawnTreasure();
        spawnTreasure();
        spawnTreasure();


        startLoop();
    }

    function handleInput(e) {
        // If showing item selection, ignore all input
        if (showingItemChoice) return;

        if (e.code === 'Space') {
            if (!isGameStarted) {
                isGameStarted = true;
                showLevelTitle = false;
            } else if (!gameOver && !levelComplete) {
                Player.liftUp();
            }
        }
        if (e.code === 'KeyF') {
            if (!gameOver && !levelComplete && isGameStarted) {
                PropManager.useProp(Player, obstacles);
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
        if (gameOver || levelComplete || showingItemChoice) return;

        Player.update();
        PropManager.update(obstacles);
        
        // 更新劍的投射物
        if (typeof SwordManager !== 'undefined') {
            SwordManager.update(Player);
        }

        const p = Player.getPlayerRect();

        // Boss 1 的劍攻擊邏輯
        const currentTime = Date.now();
        if (currentTime >= lastSwordAttackTime1 + nextAttackCooldown1 && isGameStarted && boss1Health > 0) {
            const boss1X = canvas.width - bossWidth - 50;
            const boss1Y = canvas.height / 4 - bossHeight / 2;
            
            const randomOffset = Math.random() * bossHeight - bossHeight/2;
            SwordManager.spawn(boss1X, boss1Y + bossHeight/2 + randomOffset);
            
            lastSwordAttackTime1 = currentTime;
            nextAttackCooldown1 = minAttackCooldown + Math.random() * (maxAttackCooldown - minAttackCooldown);
        }

        // Boss 2 的劍攻擊邏輯
        if (currentTime >= lastSwordAttackTime2 + nextAttackCooldown2 && isGameStarted && boss2Health > 0) {
            const boss2X = canvas.width - bossWidth - 50;
            const boss2Y = canvas.height * 3/4 - bossHeight / 2;
            
            const randomOffset = Math.random() * bossHeight - bossHeight/2;
            SwordManager.spawn(boss2X, boss2Y + bossHeight/2 + randomOffset);
            
            lastSwordAttackTime2 = currentTime;
            nextAttackCooldown2 = minAttackCooldown + Math.random() * (maxAttackCooldown - minAttackCooldown);
        }

        // 檢查火球擊中 boss
        if (typeof FireballManager !== 'undefined') {
            const fireballs = FireballManager.getFireballs();
            if (fireballs) {
                const boss1Rect = {
                    x: canvas.width - bossWidth - 50,
                    y: canvas.height / 4 - bossHeight / 2,
                    width: bossWidth,
                    height: bossHeight
                };
                
                const boss2Rect = {
                    x: canvas.width - bossWidth - 50,
                    y: canvas.height * 3/4 - bossHeight / 2,
                    width: bossWidth,
                    height: bossHeight
                };

                fireballs.forEach((fireball, index) => {
                    // 檢查 Boss 1
                    if (boss1Health > 0 && isColliding(fireball, boss1Rect)) {
                        FireballManager.removeFireball(index);
                        boss1Health--;
                        boss1HitTime = Date.now();
                        boss1IsFlashing = true;
                    }
                    // 檢查 Boss 2
                    else if (boss2Health > 0 && isColliding(fireball, boss2Rect)) {
                        FireballManager.removeFireball(index);
                        boss2Health--;
                        boss2HitTime = Date.now();
                        boss2IsFlashing = true;
                    }

                    // 檢查是否兩個 boss 都被擊敗
                    if (boss1Health <= 0 && boss2Health <= 0) {
                        levelComplete = true;
                        isLooping = false;
                        DialogueManager.setLevelComplete(true);
                        DialogueManager.startDialogue();
                        
                        // 添加下一關按鈕的監聽器
                        setTimeout(() => {
                            const nextLevelBtn = document.querySelector('button');
                            if (nextLevelBtn && nextLevelBtn.textContent === "下一關") {
                                nextLevelBtn.onclick = () => {
                                    // 移除所有按鈕
                                    document.querySelectorAll('button').forEach(btn => btn.remove());
                                    // 切換到第五關
                                    GameState.changeLevel("Level5");
                                };
                            }
                        }, 100);
                        
                        return;
                    }
                });
            }
        }

        // 更新 boss 閃爍效果
        if (boss1IsFlashing && Date.now() - boss1HitTime > 200) {
            boss1IsFlashing = false;
        }
        if (boss2IsFlashing && Date.now() - boss2HitTime > 200) {
            boss2IsFlashing = false;
        }

        // 只在對話完成後轉換關卡
        if (levelComplete && DialogueManager.isDone()) {
            GameState.changeLevel("Level5"); 
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

        if (GameState.getHealth() <= 0) {
            gameOver = true;
            isLooping = false;
            showRestartButton();
            return;
        }

        // Add dialogue completion check
        if (gameOver && !isLooping && DialogueManager.isDone()) {
            showRestartButton();
        }

        bgX -= obstacleSpeed;
        if (bgX <= -canvas.width) bgX = 0;

        // Handle treasure collection
        for (let i = treasures.length - 1; i >= 0; i--) {
            const t = treasures[i];
            t.x -= obstacleSpeed;
            
            if (isColliding(p, t)) {
                treasures.splice(i, 1);
                showingItemChoice = true;
                isGameStarted = false;
                isLooping = false;
                showItemSelection();
                return;
            }

            if (t.x + t.width < 0) {
                treasures.splice(i, 1);
                spawnTreasure();
            }
        }

        if (totalSpawned < maxObstacles) {
            spawnTimer++;
            if (spawnTimer >= spawnInterval) {
                spawnObstacle();
                spawnTimer = 0;
            }
        } else if (!obstacles.some(o => o.type === 'flag')) {
            spawnFlag();
            flagSpawned = true;
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
                    DialogueManager.startDialogue();
                    return;
                } else {
                    if (!Player.isInjured() && !gameOver && !Player.isInvincible()) {
                        if (PropManager.hasActiveShield()) {
                            if (PropManager.useShield()) {
                                // Remove the obstacle that was blocked
                                obstacles.splice(i, 1);
                                continue;  // Skip damage and continue with next obstacle
                            }
                        }
                        GameState.takeDamage();
                        Player.collideWithObstacle();

                        if (GameState.getHealth() <= 0) {
                            gameOver = true;
                            isLooping = false;
                            DialogueManager.setLevelComplete(false);
                            DialogueManager.startDialogue();
                            return;
                        }
                    }
                }
            }

            if (o.x + obstacleWidth < 0) {
                obstacles.splice(i, 1);
            }
        }
    }

    function spawnObstacle() {
        const isTop = Math.random() > 0.6 ? !lastObstacleTop : lastObstacleTop;
        lastObstacleTop = isTop;
        const y = isTop ? 0 : canvas.height - obstacleHeight;
        const type = isTop ? 'top' : 'bottom';
        obstacles.push({ x: canvas.width, y, type });
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
        }
    }

    function spawnTreasure() {
        let x = canvas.width + Math.random() * canvas.width;
        
        // Calculate safe vertical boundaries
        const minY = treasureSize + 100; // Keep away from ceiling
        const maxY = canvas.height - treasureSize - 100; // Keep away from ground
        let y = Math.random() * (maxY - minY) + minY;

        // Keep trying new positions until we find a safe spot
        let attempts = 0;
        const maxAttempts = 50;
        
        // Add debug logging
        console.log('Attempting to spawn treasure. Current treasures:', treasures.length);
        
        // For the second initial treasure, increase x position to ensure spacing
        if (treasures.length === 1) {
            x = canvas.width * 1.5 + Math.random() * canvas.width;
        }
        
        while (attempts < maxAttempts) {
            // Check collision with obstacles
            let hasCollision = obstacles.some(o => {
                const obstacleRect = {
                    x: o.x,
                    y: o.y,
                    width: obstacleWidth,
                    height: obstacleHeight
                };
                const treasureRect = {
                    x: x,
                    y: y,
                    width: treasureSize,
                    height: treasureSize
                };
                return isColliding(treasureRect, obstacleRect);
            });

            // Check minimum spacing from other treasures
            let tooCloseToOtherTreasures = treasures.some(t => 
                Math.abs(t.x - x) < minTreasureSpacing || 
                Math.abs(t.y - y) < treasureSize * 2
            );

            if (!hasCollision && !tooCloseToOtherTreasures) {
                // Found a safe position
                treasures.push({ x, y, width: treasureSize, height: treasureSize });
                console.log('Treasure spawned successfully. Total treasures:', treasures.length);
                return;
            }

            // Try a new position
            x = canvas.width + Math.random() * canvas.width;
            if (treasures.length === 1) {
                x = canvas.width * 1.5 + Math.random() * canvas.width;
            }
            y = Math.random() * (maxY - minY) + minY;
            attempts++;
        }

        console.log('Failed to spawn treasure after', maxAttempts, 'attempts');
        
        // Force spawn if this is one of the initial two treasures
        if (treasures.length < 4) {
            // Try to find a safer position for forced spawn
            let safeX = canvas.width * (1.5 + treasures.length);
            let safeY = canvas.height / 2;
            
            // Try different heights if middle is blocked
            const heightOptions = [
                canvas.height / 2,
                canvas.height / 3,
                canvas.height * 2/3,
                canvas.height / 4,
                canvas.height * 3/4
            ];
            
            for (let testY of heightOptions) {
                let hasCollision = obstacles.some(o => {
                    const obstacleRect = {
                        x: safeX,
                        y: o.y,
                        width: obstacleWidth,
                        height: obstacleHeight
                    };
                    const treasureRect = {
                        x: safeX,
                        y: testY,
                        width: treasureSize,
                        height: treasureSize
                    };
                    return isColliding(treasureRect, obstacleRect);
                });
                
                if (!hasCollision) {
                    safeY = testY;
                    break;
                }
            }
            
            treasures.push({ 
                x: safeX, 
                y: safeY, 
                width: treasureSize, 
                height: treasureSize 
            });
            console.log('Forced initial treasure spawn at safe position. Total treasures:', treasures.length);
        }
    }

    function handleSelectItem(index) {
        if (index >= 0 && index < itemImgs.length) {
            const selected = itemImgs[index];
            PropManager.equipProp(selected.name);
            
            // Reset all relevant game states
            showingItemChoice = false;
            isGameStarted = true;
            gameplayStarted = true;
            
            // Reset player position and state
            Player.init(canvas.height / 2);
            Player.setFlying(false);
            
            // Reset game loop state
            isLooping = true;
            requestAnimationFrame(gameLoop);
        }
    }

    function showItemSelection() {
        // Stop the game loop
        isLooping = false;
        showingItemChoice = true;
        isGameStarted = false;
        gameplayStarted = false;

        // Remove any existing buttons first
        document.querySelectorAll('button').forEach(btn => btn.remove());
        
        const pad = 80, w = 120, h = 120;
        const totalW = itemImgs.length * (w + pad) - pad;
        const sx = (canvas.width - totalW) / 2;
        const y = canvas.height / 3;

        itemImgs.forEach((item, i) => {
            const x = sx + i * (w + pad);
            const btn = document.createElement('button');
            btn.innerText = "我要使用它";
            Object.assign(btn.style, {
                position: 'absolute',
                left: `${x + w/2 - 60}px`,
                top: `${y + h + 180}px`,
                padding: '8px 16px',
                fontSize: '16px',
                backgroundColor: 'black',
                color: 'white',
                border: '2px solid white',
                borderRadius: '4px',
                cursor: 'pointer',
                zIndex: 20
            });
            
            btn.onclick = () => {
                document.querySelectorAll('button').forEach(b => b.remove());
                handleSelectItem(i);
            };
            
            document.body.appendChild(btn);
        });
    }

    function isColliding(r1, r2) {
        return (
            r1.x < r2.x + r2.width &&
            r1.x + r1.width > r2.x &&
            r1.y < r2.y + r2.height &&
            r1.y + r1.height > r2.y
        );
    }

    function showRestartButton() {
        restartButton = document.createElement('button');
        restartButton.textContent = '重新開始';
        Object.assign(restartButton.style, {
            position: 'absolute',
            left: '50%',
            top: '60%',
            transform: 'translateX(-50%)',
            fontSize: '20px',
            padding: '10px 20px',
            backgroundColor: 'black',
            color: 'white',
            border: '2px solid white',
            borderRadius: '8px',
            cursor: 'pointer',
            zIndex: 10
        });
        document.body.appendChild(restartButton);
        restartButton.addEventListener('click', () => {
            PropManager.resetProps(); // Reset props before restarting
            startLevel4();  // 直接呼叫 startLevel4 重新開始第四關
        });
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // If showing dialogue (victory or defeat), draw black background and victory image
        if (DialogueManager.isRunning()) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // 如果是勝利對話，顯示勝利圖片
            if (levelComplete) {
                const imgWidth = 400;  // 設定圖片寬度
                const imgHeight = 300;  // 設定圖片高度
                const x = (canvas.width - imgWidth) / 2;  // 置中
                const y = 50;  // 距離頂部的距離
                ctx.drawImage(winImg, x, y, imgWidth, imgHeight);
            }
            return;
        }

        ctx.drawImage(backgroundImg, bgX, 0, canvas.width, canvas.height);
        ctx.drawImage(backgroundImg, bgX + canvas.width, 0, canvas.width, canvas.height);

        // 繪製兩個 boss
        if (!gameOver && !levelComplete) {
            // 繪製 Boss 1
            const boss1X = canvas.width - bossWidth - 50;
            const boss1Y = canvas.height / 4 - bossHeight / 2;
            
            if (boss1Health > 0) {
                if (boss1IsFlashing) {
                    ctx.save();
                    ctx.globalAlpha = 0.5;
                    ctx.drawImage(boss1InjuredImg, boss1X, boss1Y, bossWidth, bossHeight);
                    ctx.restore();
                } else {
                    ctx.drawImage(boss1Img, boss1X, boss1Y, bossWidth, bossHeight);
                }

                // Boss 1 血條
                const healthBarWidth = 100;
                const healthBarHeight = 10;
                const healthX = boss1X + (bossWidth - healthBarWidth) / 2;
                const healthY = boss1Y - 20;

                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.fillRect(healthX - 2, healthY - 2, healthBarWidth + 4, healthBarHeight + 4);
                ctx.fillStyle = 'red';
                const currentHealthWidth1 = (boss1Health / bossMaxHealth) * healthBarWidth;
                ctx.fillRect(healthX, healthY, currentHealthWidth1, healthBarHeight);
            }

            // 繪製 Boss 2
            const boss2X = canvas.width - bossWidth - 50;
            const boss2Y = canvas.height * 3/4 - bossHeight / 2;
            
            if (boss2Health > 0) {
                if (boss2IsFlashing) {
                    ctx.save();
                    ctx.globalAlpha = 0.5;
                    ctx.drawImage(boss2InjuredImg, boss2X, boss2Y, bossWidth, bossHeight);
                    ctx.restore();
                } else {
                    ctx.drawImage(boss2Img, boss2X, boss2Y, bossWidth, bossHeight);
                }

                // Boss 2 血條
                const healthBarWidth = 100;
                const healthBarHeight = 10;
                const healthX = boss2X + (bossWidth - healthBarWidth) / 2;
                const healthY = boss2Y - 20;

                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.fillRect(healthX - 2, healthY - 2, healthBarWidth + 4, healthBarHeight + 4);
                ctx.fillStyle = 'red';
                const currentHealthWidth2 = (boss2Health / bossMaxHealth) * healthBarWidth;
                ctx.fillRect(healthX, healthY, currentHealthWidth2, healthBarHeight);
            }
        }

        // 繪製劍的投射物
        if (typeof SwordManager !== 'undefined') {
            SwordManager.draw(ctx);
        }

        // Draw treasures
        treasures.forEach(t => {
            ctx.drawImage(treasureImg, t.x, t.y, t.width, t.height);
        });

        // Draw item selection screen
        if (showingItemChoice) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = 'white';
            ctx.font = '32px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('選擇一項能力作為你的幫助！', canvas.width / 2, 80);

            const pad = 80;
            const w = 120;
            const h = 120;
            const totalW = itemImgs.length * (w + pad) - pad;
            const sx = (canvas.width - totalW) / 2;
            const y = canvas.height / 3;

            // Add background frames for each item
            itemImgs.forEach((item, i) => {
                const x = sx + i * (w + pad);
                const frameWidth = w + 60;  // Wider frame to accommodate text
                const frameHeight = h + 140; // Taller frame to accommodate wrapped text
                
                // Draw semi-transparent frame
                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                ctx.fillRect(x - 30, y - 20, frameWidth, frameHeight);
                
                // Draw item image
                ctx.drawImage(item.img, x, y, w, h);
                
                // Draw item name
                ctx.font = 'bold 20px sans-serif';
                ctx.fillStyle = 'white';
                ctx.fillText(item.displayName, x + w/2, y + h + 30);

                // Draw description with word wrapping
                ctx.font = '16px sans-serif';
                const maxWidth = frameWidth - 20;
                const words = item.longDesc.split('');
                let line = '';
                let lineY = y + h + 60;
                const lineHeight = 20;

                words.forEach(char => {
                    const testLine = line + char;
                    const metrics = ctx.measureText(testLine);
                    
                    if (metrics.width > maxWidth) {
                        ctx.fillText(line, x + w/2, lineY);
                        line = char;
                        lineY += lineHeight;
                    } else {
                        line = testLine;
                    }
                });
                if (line) {
                    ctx.fillText(line, x + w/2, lineY);
                }
            });
            return;
        }

        if (showLevelTitle) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'white';
            ctx.font = '48px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('第四關：小怪追擊', canvas.width / 2, canvas.height / 2);
        }

        if (showHintBox) {
            const x = 20, y = 20, bw = 500, bh = 160;
            ctx.fillStyle = 'black';
            ctx.fillRect(x, y, bw, bh);
            ctx.fillStyle = 'white';
            ctx.font = '20px sans-serif';
            ctx.textAlign = 'center';

            // Show one line at a time
            ctx.fillText(texts[currentTextIndex], x + bw / 2, y + bh / 2);

            if (currentTextIndex < texts.length - 1) {
                ctx.font = '14px sans-serif';
                ctx.fillText('點擊任意位置繼續', x + bw / 2, y + bh - 20);
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
        PropManager.drawPropUI(ctx); // Draw props
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

    function gameLoop() {
        if (!isLooping) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (isGameStarted && !showingItemChoice) {
            update();
        }
        
        draw();
        
        if (!levelComplete && !gameOver && !showingItemChoice) {
            requestAnimationFrame(gameLoop);
        }
    }

    return {
        startLevel4,
        showRestartButton
    };
})();