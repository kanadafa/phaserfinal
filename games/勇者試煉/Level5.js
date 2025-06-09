const Level5 = (function () {
    console.log("Level5: Module loaded");

    const backgroundImg = new Image();
    backgroundImg.src = 'images/backgrounds/Level5.PNG';
    backgroundImg.onload = () => console.log('Background image loaded');

    const obstacleImg = new Image();
    obstacleImg.src = 'images/obstacle/bone.png';
    obstacleImg.onload = () => console.log('Obstacle image loaded');

    const flagImg = new Image();
    flagImg.src = 'images/obstacle/flag.png';
    flagImg.onload = () => console.log('Flag image loaded');

    const princessImg = new Image();
    princessImg.src = 'images/Boss/Princess.png';
    princessImg.onload = () => console.log('Princess image loaded');

    const princessInjuredImg = new Image();
    princessInjuredImg.src = 'images/Boss/Princess_Injured.png';
    princessInjuredImg.onload = () => console.log('Princess injured image loaded');

    const treasureImg = new Image();
    treasureImg.src = 'images/obstacle/treasure.png';

    const projectileImg = new Image();
    projectileImg.src = 'images/obstacle/magic_projectile.png';

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
    const bossMaxHealth = 5;  // 公主需要被攻擊5次
    const treasureSize = 100;
    const minTreasureSpacing = 400;

    // 投擲物相關設定
    const minAttackCooldown = 3000; // 最短 3 秒
    const maxAttackCooldown = 5000; // 最長 5 秒
    let nextAttackCooldown = 4000;
    let lastAttackTime = 0;
    const projectiles = [];
    const projectileSpeed = 5;
    const projectileSize = 40;

    let canvas, ctx;
    let isGameStarted = false;
    let gameOver = false;
    let levelComplete = false;
    let isLooping = false;
    let showHintBox = true;
    let showLevelTitle = true;
    let showChoices = false;
    let showEnding = false;
    let currentEnding = '';
    let princessHealth = bossMaxHealth;
    let princessHitTime = 0;
    let princessIsFlashing = false;
    let showingItemChoice = false;
    let selectedItemIndex = -1;
    let itemButtonsCreated = false;

    const obstacles = [];
    const treasures = [];
    let spawnTimer = 0;
    let totalSpawned = 0;
    let bgX = 0;
    let restartButton = null;
    let currentTextIndex = 0;
    const texts = [
        '公主...你怎麼變這樣?',
        '魔王:嗯?公主?喔...好像曾經有這麼一段時間被叫公主',
        '魔王:我現在可是魔王，世上最強的存在哈哈哈哈哈',
        '勇者看到魔王般的公主後，腦中出現兩個選項'
    ];

    const endings = {
        saveWorld: [
            "你拯救了世界，世界恢復光明",
            "世人將歌頌你百年，為你建立雕像，作為和平的象徵",
            "只可惜...我還是沒能拯救公主,或許那就是她最好的歸宿吧"
        ],
        newKing: [
            "魔王:你跟其他人不一樣，真有趣",
            "魔王:留你一命，加入我的靡下吧",
            "你的想法不重要，這是告知，不是請求",
            "(多年後)世界陷入無盡夜幕，而你成為新王"
        ],
        escape: [
            "你選擇了活命，但也選擇了背叛整個世界。",
            "(多年後) 人間猶如地獄般，民不聊生。",
            "結局：逃離戰場"
        ]
    };

    function startLevel5() {
        canvas = document.getElementById('gameCanvas');
        if (!canvas) {
            console.error("Level5: Canvas element not found!");
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

        // 重置所有遊戲狀態
        isGameStarted = false;
        showLevelTitle = true;
        gameOver = false;
        levelComplete = false;
        isLooping = true;  // 改為 true，確保遊戲循環開始
        showHintBox = true;
        showChoices = false;
        showEnding = false;
        currentEnding = '';
        princessHealth = bossMaxHealth;
        princessHitTime = 0;
        princessIsFlashing = false;
        obstacles.length = 0;
        treasures.length = 0;
        projectiles.length = 0;
        bgX = 0;
        spawnTimer = 0;
        totalSpawned = 0;
        currentTextIndex = 0;
        showingItemChoice = false;
        selectedItemIndex = -1;
        
        // 移除所有現有按鈕
        const existingButtons = document.querySelectorAll('button');
        existingButtons.forEach(button => button.remove());
        restartButton = null;

        // 重新綁定事件監聽器
        window.removeEventListener('keydown', handleInput);
        window.removeEventListener('keyup', handleKeyUp);
        canvas.removeEventListener('click', handleMouseClick);
        window.addEventListener('keydown', handleInput);
        window.addEventListener('keyup', handleKeyUp);
        canvas.addEventListener('click', handleMouseClick);

        // 開始遊戲循環
        requestAnimationFrame(gameLoop);
    }

    function showInitialChoices() {
        if (showingItemChoice) return;
        showChoices = true;
        isLooping = false;

        const fightBtn = document.createElement('button');
        fightBtn.textContent = '與公主戰鬥';
        Object.assign(fightBtn.style, {
            position: 'absolute',
            left: '40%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            padding: '10px 20px',
            fontSize: '20px',
            backgroundColor: 'black',
            color: 'white',
            border: '2px solid white',
            borderRadius: '8px',
            cursor: 'pointer'
        });
        fightBtn.onclick = startBattle;

        const escapeBtn = document.createElement('button');
        escapeBtn.textContent = '逃跑';
        Object.assign(escapeBtn.style, {
            position: 'absolute',
            left: '60%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            padding: '10px 20px',
            fontSize: '20px',
            backgroundColor: 'black',
            color: 'white',
            border: '2px solid white',
            borderRadius: '8px',
            cursor: 'pointer'
        });
        escapeBtn.onclick = () => showEndingScene('escape');

        document.body.appendChild(fightBtn);
        document.body.appendChild(escapeBtn);
    }

    function startBattle() {
        console.log('Starting battle...');
        
        // 移除現有按鈕
        const existingButtons = document.querySelectorAll('button');
        existingButtons.forEach(button => button.remove());
        
        // 顯示戰鬥開始對話
        showHintBox = true;
        currentTextIndex = 0;
        texts.length = 0;  // 清空原有對話
        texts.push(
            '魔王：你來了…真是有趣。你知道你是第幾位勇士嗎？',
            '不管怎樣我將會是最後一個勇者，也會是第一個打敗你的',
            '魔王:口氣真大，哼每一個都這樣說呢，下場還不都一樣'
        );
        
        // 初始化玩家位置和狀態
        Player.init(canvas.height / 2);
        Player.setFlying(false);
        
        // 重置遊戲狀態
        GameState.resetHealth();
        princessHealth = bossMaxHealth;
        princessHitTime = 0;
        princessIsFlashing = false;
        lastAttackTime = Date.now();
        nextAttackCooldown = minAttackCooldown + Math.random() * (maxAttackCooldown - minAttackCooldown);
        
        // 清空並重置所有遊戲物件
        projectiles.length = 0;
        obstacles.length = 0;
        treasures.length = 0;
        totalSpawned = 0;
        spawnTimer = 0;
        bgX = 0;
        
        // 初始化寶箱
        spawnTreasure();
        spawnTreasure();
        
        // 設置遊戲狀態
        showChoices = false;
        isGameStarted = true;
        isLooping = true;
        showLevelTitle = false;
        showHintBox = false;
        gameOver = false;
        levelComplete = false;
        showEnding = false;
        
        // 開始遊戲循環
        requestAnimationFrame(gameLoop);
    }

    function showEndingScene(ending) {
        console.log('Showing ending scene:', ending);
        
        // 清除所有現有按鈕
        document.querySelectorAll('button').forEach(button => button.remove());
        
        showEnding = true;
        currentEnding = ending;
        isLooping = false;
        showingItemChoice = false;
        showChoices = false;
        isGameStarted = false;

        // 只有在真正結束時才顯示結局按鈕
        if (ending === 'saveWorld' || ending === 'newKing' || ending === 'escape') {
            const retryBtn = document.createElement('button');
            retryBtn.textContent = '時間回溯';
            Object.assign(retryBtn.style, {
                position: 'absolute',
                left: '40%',
                top: '70%',
                transform: 'translate(-50%, -50%)',
                padding: '10px 20px',
                fontSize: '20px',
                backgroundColor: 'black',
                color: 'white',
                border: '2px solid white',
                borderRadius: '8px',
                cursor: 'pointer'
            });
            retryBtn.onclick = startLevel5;

            const endBtn = document.createElement('button');
            endBtn.textContent = '結束遊戲';
            Object.assign(endBtn.style, {
                position: 'absolute',
                left: '60%',
                top: '70%',
                transform: 'translate(-50%, -50%)',
                padding: '10px 20px',
                fontSize: '20px',
                backgroundColor: 'black',
                color: 'white',
                border: '2px solid white',
                borderRadius: '8px',
                cursor: 'pointer'
            });
            endBtn.onclick = () => {
                const existingButtons = document.querySelectorAll('button');
                existingButtons.forEach(button => button.remove());
                Main.showMainMenu();
            };

            document.body.appendChild(retryBtn);
            document.body.appendChild(endBtn);
        }
    }

    function handleInput(e) {
        if (showChoices || showEnding) return;

        if (e.code === 'Space') {
            if (!isGameStarted) {
                isGameStarted = true;
                showLevelTitle = false;
                showInitialChoices();
            } else if (!gameOver && !levelComplete) {
                Player.liftUp();
            }
        }
        if (e.code === 'KeyF') {
            if (!gameOver && !levelComplete && isGameStarted) {
                PropManager.useProp(Player);
            }
        }
    }

    function handleKeyUp(e) {
        if (e.code === 'Space') {
            Player.setFlying(false);
        }
    }

function handleMouseClick() {
    // 若在提示對話中
    if (showHintBox) {
        if (currentTextIndex < texts.length - 1) {
            currentTextIndex++;
        } else {
            showHintBox = false;
        }
        return;
    }

    // 若在遊戲進行中，且允許發射火球
    if (isGameStarted && !showingItemChoice && !showEnding && !showChoices) {
        if (typeof FireballManager !== 'undefined') {
            FireballManager.spawn(Player.getPlayerRect());
        }
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
        // ✅ 玩家掉出畫面上下邊界就死亡
        if (Player.y > canvas.height || Player.y + Player.height < 0) {
            gameOver = true;
        }
        if (gameOver || levelComplete || !isGameStarted || showChoices) {
            return;
        }

        Player.update();
        PropManager.update();

        // 更新背景位置
        bgX -= obstacleSpeed;
        if (bgX <= -canvas.width) bgX = 0;

        // 生成障礙物
        if (totalSpawned < maxObstacles) {
            spawnTimer++;
            if (spawnTimer >= spawnInterval) {
                spawnObstacle();
                spawnTimer = 0;
            }
        }

        // 更新障礙物
        for (let i = obstacles.length - 1; i >= 0; i--) {
            const obstacle = obstacles[i];
            obstacle.x -= obstacleSpeed;

            // 檢查碰撞
            if (isColliding(Player.getPlayerRect(), obstacle)) {
                if (!Player.isInjured() && !Player.isInvincible()) {
                    if (PropManager.hasActiveShield()) {
                        if (PropManager.useShield()) {
                            obstacles.splice(i, 1);
                            continue;
                        }
                    }
                    GameState.takeDamage();
                    Player.collideWithObstacle();

                    if (GameState.getHealth() <= 0) {
                        showEndingScene('newKing');
                        return;
                    }
                }
            }

            // 移除超出畫面的障礙物
            if (obstacle.x + obstacle.width < 0) {
                obstacles.splice(i, 1);
            }
        }

        // 更新寶箱
        for (let i = treasures.length - 1; i >= 0; i--) {
            const treasure = treasures[i];
            treasure.x -= obstacleSpeed;

            // 檢查是否被收集
            if (isColliding(Player.getPlayerRect(), treasure)) {
                treasures.splice(i, 1);
                showingItemChoice = true;
                isGameStarted = false;
                isLooping = false;
                showItemSelection();
                return;
            }

            // 移除超出畫面的寶箱並生成新的
            if (treasure.x + treasure.width < 0) {
                treasures.splice(i, 1);
                spawnTreasure();
            }
        }

        // 確保始終有兩個寶箱
        while (treasures.length < 2) {
            spawnTreasure();
        }

        // 更新投擲物
        const currentTime = Date.now();
        if (currentTime >= lastAttackTime + nextAttackCooldown) {
            // 從畫面右側隨機高度發射投擲物
            const projectileY = Math.random() * (canvas.height - projectileSize);
            projectiles.push({
                x: canvas.width,
                y: projectileY,
                width: projectileSize,
                height: projectileSize
            });
            
            lastAttackTime = currentTime;
            nextAttackCooldown = minAttackCooldown + Math.random() * (maxAttackCooldown - minAttackCooldown);
        }

        // 更新所有投擲物位置
        for (let i = projectiles.length - 1; i >= 0; i--) {
            const projectile = projectiles[i];
            projectile.x -= projectileSpeed;

            // 檢查與玩家的碰撞
            if (isColliding(Player.getPlayerRect(), projectile)) {
                if (!Player.isInjured() && !Player.isInvincible()) {
                    if (PropManager.hasActiveShield()) {
                        if (PropManager.useShield()) {
                            projectiles.splice(i, 1);
                            continue;
                        }
                    }
                    GameState.takeDamage();
                    Player.collideWithObstacle();

                    if (GameState.getHealth() <= 0) {
                        showEndingScene('newKing');
                        return;
                    }
                }
            }

            // 移除超出畫面的投擲物
            if (projectile.x + projectileSize < 0) {
                projectiles.splice(i, 1);
            }
        }

        // 檢查火球擊中公主
        if (typeof FireballManager !== 'undefined') {
            const fireballs = FireballManager.getFireballs();
            if (fireballs) {
                const princessRect = {
                    x: canvas.width - bossWidth - 50,
                    y: (canvas.height - bossHeight) / 2,
                    width: bossWidth,
                    height: bossHeight
                };

                fireballs.forEach((fireball, index) => {
                    if (isColliding(fireball, princessRect)) {
                        FireballManager.removeFireball(index);
                        princessHealth--;
                        princessHitTime = Date.now();
                        princessIsFlashing = true;

                        if (princessHealth <= 0) {
                            showEndingScene('saveWorld');
                            return;
                        }
                    }
                });
            }
        }

        // 更新公主閃爍效果
        if (princessIsFlashing && Date.now() - princessHitTime > 200) {
            princessIsFlashing = false;
        }
    }

    function spawnObstacle() {
        console.log('Spawning obstacle. Total spawned:', totalSpawned);
        const isTop = Math.random() > 0.6 ? !lastObstacleTop : lastObstacleTop;
        lastObstacleTop = isTop;
        const y = isTop ? 0 : canvas.height - obstacleHeight;
        
        obstacles.push({
            x: canvas.width,
            y: y,
            width: obstacleWidth,
            height: obstacleHeight,
            type: 'obstacle'
        });
        
        totalSpawned++;
        console.log('Obstacle spawned. New total:', totalSpawned);
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
        console.log('Attempting to spawn treasure');
        
        // 計算安全的垂直邊界
        const minY = treasureSize + 50;
        const maxY = canvas.height - treasureSize - 50;
        
        // 設定初始位置
        let x = canvas.width + 100;  // 確保在畫面右側生成
        let y = minY + Math.random() * (maxY - minY);
        
        // 如果已經有寶箱，確保新寶箱與現有寶箱保持距離
        if (treasures.length > 0) {
            x = Math.max(x, treasures[treasures.length - 1].x + minTreasureSpacing);
        }
        
        if (treasures.length < 4) treasures.push({
            x: x,
            y: y,
            width: treasureSize,
            height: treasureSize
        });
        
        console.log('Treasure spawned at:', { x, y });
    }

    function showItemSelection() {
           console.log('Setting up item selection screen');
    
    isLooping = false;
    showingItemChoice = true;
    isGameStarted = false;
    gameplayStarted = false;
    itemButtonsCreated = false; // 每次顯示選單時都先重設
        
        // 清除所有現有按鈕
        document.querySelectorAll('button').forEach(btn => btn.remove());
        
        // 重新開始遊戲循環以顯示道具選擇畫面
        requestAnimationFrame(gameLoop);

    }

    function handleSelectItem(index) {
    console.log('Handling item selection:', index);

    // ✅ 檢查索引合法
    if (index >= 0 && index < itemImgs.length) {
        const selected = itemImgs[index];
        PropManager.equipProp(selected.name);

        // ✅ 清除所有按鈕，避免殘留
        document.querySelectorAll('button').forEach(btn => btn.remove());

        // ✅ 重置狀態
        showingItemChoice = false;
        isGameStarted = true;
        isLooping = true;
        showEnding = false;
        showChoices = false;
        gameOver = false;
        levelComplete = false;

        // ✅ 初始化玩家
        Player.init(canvas.height / 2);
        Player.setFlying(false);

        // ✅ 確保寶箱數維持至少兩個
        while (treasures.length < 2) {
            spawnTreasure();
        }

        // ✅ 重新啟動遊戲循環
        requestAnimationFrame(gameLoop);
    }
}


    function handleSelectItem(index) {
        console.log('Handling item selection:', index);
        
        if (index >= 0 && index < itemImgs.length) {
            const selected = itemImgs[index];
            PropManager.equipProp(selected.name);
            
            // 清除所有按鈕
            document.querySelectorAll('button').forEach(btn => btn.remove());
            
            // 重置所有遊戲狀態
            showingItemChoice = false;
            isGameStarted = true;
            isLooping = true;
            showEnding = false;
            showChoices = false;
            gameOver = false;
            levelComplete = false;
            
            // 重置玩家位置和狀態
            Player.init(canvas.height / 2);
            Player.setFlying(false);
            
            // 重新開始遊戲循環
            requestAnimationFrame(gameLoop);
        }
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
            startLevel5();
        });
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    
        // 繪製背景
        ctx.drawImage(backgroundImg, bgX, 0, canvas.width, canvas.height);
        ctx.drawImage(backgroundImg, bgX + canvas.width, 0, canvas.width, canvas.height);
    
        // ✅ 修正：先處理道具選擇畫面
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

    itemImgs.forEach((item, i) => {
        const x = sx + i * (w + pad);
        const frameWidth = w + 60;
        const frameHeight = h + 140;

        // 背景框
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(x - 30, y - 20, frameWidth, frameHeight);

        // 圖片
        ctx.drawImage(item.img, x, y, w, h);

        // 名稱
        ctx.font = 'bold 20px sans-serif';
        ctx.fillStyle = 'white';
        ctx.fillText(item.displayName, x + w / 2, y + h + 30);

        // 描述文字換行
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
                ctx.fillText(line, x + w / 2, lineY);
                line = char;
                lineY += lineHeight;
            } else {
                line = testLine;
            }
        });
        if (line) {
            ctx.fillText(line, x + w / 2, lineY);
        }
    });

    // ✅ 只建立一次按鈕
    if (!itemButtonsCreated) {
        itemImgs.forEach((item, i) => {
            const x = sx + i * (w + pad);
            const btn = document.createElement('button');
            btn.innerText = "我要使用它";
            Object.assign(btn.style, {
                position: 'absolute',
                left: `${x + w / 2 - 60}px`,
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
                handleSelectItem(i);  // 正確觸發對應索引的道具選擇
            };
            document.body.appendChild(btn);
        });
        itemButtonsCreated = true;
    }
    return; // 中止 draw 的後續渲染
}

    
        // ✅ 修正：只有在「不是選道具時」才畫結局畫面
        if (showEnding && !showingItemChoice) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
    
            ctx.fillStyle = 'white';
            ctx.font = '32px sans-serif';
            ctx.textAlign = 'center';
    
            const endingTexts = endings[currentEnding];
            endingTexts.forEach((text, index) => {
                ctx.fillText(text, canvas.width / 2, canvas.height / 3 + index * 50);
            });
            return;
        }
    
        // 標題畫面
        if (showLevelTitle) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'white';
            ctx.font = '48px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('第五關：真相', canvas.width / 2, canvas.height / 2);
            return;
        }
    
        // 遊戲進行中
        if (!gameOver && !levelComplete && isGameStarted && !showChoices) {
            obstacles.forEach(obstacle => {
                if (obstacle.type === 'flag') {
                    ctx.drawImage(flagImg, obstacle.x, obstacle.y, 80, 120);
                } else {
                    ctx.drawImage(obstacleImg, obstacle.x, obstacle.y, obstacleWidth, obstacleHeight);
                }
            });

            obstacles.forEach(obstacle => {
    if (obstacle.type === 'flag') {
        ctx.drawImage(flagImg, obstacle.x, obstacle.y, flagWidth, flagHeight);
    }
});
    
            treasures.forEach(treasure => {
                ctx.drawImage(treasureImg, treasure.x, treasure.y, treasureSize, treasureSize);
            });
    
            const princessX = canvas.width - bossWidth - 50;
            const princessY = (canvas.height - bossHeight) / 2;
    
            if (princessIsFlashing) {
                ctx.save();
                ctx.globalAlpha = 0.5;
                ctx.drawImage(princessInjuredImg, princessX, princessY, bossWidth, bossHeight);
                ctx.restore();
            } else {
                ctx.drawImage(princessImg, princessX, princessY, bossWidth, bossHeight);
            }
    
            const healthBarWidth = 200;
            const healthBarHeight = 20;
            const healthX = princessX + (bossWidth - healthBarWidth) / 2;
            const healthY = princessY - 40;
    
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(healthX - 2, healthY - 2, healthBarWidth + 4, healthBarHeight + 4);
            ctx.fillStyle = 'red';
            const currentHealthWidth = (princessHealth / bossMaxHealth) * healthBarWidth;
            ctx.fillRect(healthX, healthY, currentHealthWidth, healthBarHeight);
    
            Player.draw(ctx);
            PropManager.drawPropUI(ctx);
    
            if (typeof FireballManager !== 'undefined') {
                FireballManager.draw(ctx);
            }
    
            projectiles.forEach(projectile => {
                ctx.drawImage(projectileImg, projectile.x, projectile.y, projectileSize, projectileSize);
            });
            drawHealth();
        }
    
        // 選擇戰鬥或逃跑
        if (showChoices) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'white';
            ctx.font = '32px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('做出你的選擇', canvas.width / 2, canvas.height / 3);
        }
    
        // 提示框
        if (showHintBox) {
            const x = 20, y = 20, bw = 500, bh = 160;
            ctx.fillStyle = 'black';
            ctx.fillRect(x, y, bw, bh);
            ctx.fillStyle = 'white';
            ctx.font = '20px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(texts[currentTextIndex], x + bw / 2, y + bh / 2);
    
            if (currentTextIndex < texts.length - 1) {
                ctx.font = '14px sans-serif';
                ctx.fillText('點擊任意位置繼續', x + bw / 2, y + bh - 20);
            }
        }
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
        // 添加除錯訊息
        console.log('GameLoop running, isLooping:', isLooping);

        if (!isLooping) {
            console.log('GameLoop stopped due to isLooping false');
            return;
        }
        
        try {
            // 更新遊戲狀態
            if (isGameStarted && !showingItemChoice && !showChoices && !gameOver && !levelComplete) {
                update();
            }
            
            // 繪製遊戲畫面
            draw();
            
            // 確保遊戲循環繼續
            if (!gameOver && !levelComplete) {
                requestAnimationFrame(gameLoop);
            } else {
                console.log('GameLoop stopped due to game state:', { gameOver, levelComplete });
            }
        } catch (error) {
            console.error('Error in gameLoop:', error);
            // 發生錯誤時嘗試重新啟動遊戲循環
            isLooping = true;
            requestAnimationFrame(gameLoop);
        }
    }

    return {
        startLevel5
    };
})();