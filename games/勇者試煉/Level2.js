const Level2 = (function () {
  const bgImg = new Image();
  bgImg.src = 'images/backgrounds/Level2.PNG';

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

  const treasureImg = new Image();
  treasureImg.src = 'images/obstacle/treasure.png';

  function startLevel2() {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Make sure PropManager is initialized first
    if (typeof PropManager !== 'undefined') {
      PropManager.initPropImages();
    }
    
    initItemImgs(); // Initialize item images
    Gameplay.start(canvas);

    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
  }

  const Gameplay = (function () {
    const bg = new Image();
    bg.src = 'images/backgrounds/Level2.PNG';
    const obsImg = new Image();
    obsImg.src = 'images/obstacle/branch.png';
    const flagImg = new Image();
    flagImg.src = 'images/obstacle/flag.png';

    let canvas, ctx;
    const obs = [];
    const w = 80, h = 200, scale = 2;
    const treasureSize = 100;
    const minTreasureSpacing = 400;
    const speed = 3;
    const interval = 120;
    const max = 10;
    let speedMultiplier = 1.0;

    let started = false, over = false, cleared = false, looping = false, showHints = true, showTitle = true, flagSpawned = false;
    let textIdx = 0, timer = 0, spawned = 0, bgX = 0;
    let gameplayStarted = false;
    let treasures = [];
    let showingItemChoice = false;
    let selectedItemIndex = -1;

    const txts = [
      '裂痕平原，傳說中充滿神秘寶藏的地方...',
      '按空白鍵飛躍，收集寶藏獲得能力！'
    ];

    function setSpeedMultiplier(mult) {
      speedMultiplier = mult;
    }

    function getCurrentSpeed() {
      return speed * speedMultiplier;
    }

    function start(canvasElement) {
      canvas = canvasElement;
      ctx = canvas.getContext('2d');
      
      // Reset all state variables
      Player.init(canvas.height / 2);
      GameState.resetHealth();
      started = over = cleared = looping = flagSpawned = false;
      showTitle = showHints = true;
      gameplayStarted = false;
      showingItemChoice = false;
      selectedItemIndex = -1;
      obs.length = 0;
      treasures.length = 0;
      textIdx = timer = spawned = bgX = 0;
      
      // Clean up any existing buttons
      document.querySelectorAll('button').forEach(btn => btn.remove());

      if (typeof PropManager !== 'undefined') {
        PropManager.resetProps();
        PropManager.initPropImages();
      }

      // Remove all existing event listeners
      window.removeEventListener('keydown', handleInput);
      window.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('click', handleDialogue);
      canvas.removeEventListener('click', handleItemUse);

      // Add event listeners
      window.addEventListener('keydown', handleInput);
      window.addEventListener('keyup', handleKeyUp);
      canvas.addEventListener('click', handleDialogue);
      canvas.addEventListener('click', handleItemUse);
      
      // Initial game setup
      spawnTreasure();
      spawnTreasure();
      loop();
    }

    function loop() {
      if (!looping) {
          looping = true;
          requestAnimationFrame(run);
        }
    }

    function run() {
      update();
      draw();
      if (looping && !cleared) requestAnimationFrame(run);
    }

    function handleInput(e) {
      // If showing item selection, ignore all input
      if (showingItemChoice) return;

      if (e.code !== 'Space') return;
      if (!started) {
        showTitle = false;
        started = true;
        gameplayStarted = true;
      } else if (!over && !cleared && gameplayStarted) {
        Player.liftUp();
      }
    }

    function handleKeyUp(e) {
      if (e.code === 'Space') Player.setFlying(false);
    }

    function handleDialogue() {
      if (textIdx < txts.length - 1) textIdx++;
      else {
        showHints = false;
        canvas.removeEventListener('click', handleDialogue);
      }
    }

    function handleItemUse(e) {
      if (!gameplayStarted || showingItemChoice) return;
      PropManager.useProp(Player, obs);
    }

    function showItemSelection() {
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

    function handleSelectItem(index) {
      if (index >= 0 && index < itemImgs.length) {
        const selected = itemImgs[index];
        PropManager.equipProp(selected.name);
        showingItemChoice = false;
        gameplayStarted = true;
        looping = true;
        requestAnimationFrame(run);
      }
    }

    function update() {
      if (over || !gameplayStarted) return;

      Player.update();
      const p = Player.getPlayerRect();

      // Check if level is complete and dialogue is done
      if (cleared && DialogueManager.isDone()) {
        // Clean up before changing level
        const existingButtons = document.querySelectorAll('button');
        existingButtons.forEach(button => button.remove());
        GameState.changeLevel("Level3");
        return;
      }

      // Add boundary collision check like Level1
      if (p.y + p.height >= canvas.height || p.y <= 0) {
        if (!Player.isInjured()) {
          Player.collideWithObstacle(true);
        }
        over = true;
        looping = false;
        return showRestart();
      }

      // Update props and fireballs
      if (typeof PropManager !== 'undefined') {
        PropManager.update(obs);
      }

      const currentSpeed = speed * speedMultiplier;

      // Handle treasure collection
      for (let i = treasures.length - 1; i >= 0; i--) {
        const t = treasures[i];
        t.x -= currentSpeed;
        
        if (isHit(p, t)) {
          treasures.splice(i, 1);
          showingItemChoice = true;
          gameplayStarted = false;
          looping = false;
          showItemSelection();
          return;
        }

        if (t.x + t.width < 0) {
          treasures.splice(i, 1);
          spawnTreasure();
        }
      }

      // Update obstacles
      for (let i = obs.length - 1; i >= 0; i--) {
        const o = obs[i];
        o.x -= currentSpeed;
        const r = { x: o.x, y: o.y, width: w, height: h };
        
        if (isHit(p, r)) {
          if (o.type === 'flag') {
            cleared = true;
            looping = false;
            DialogueManager.setLevelComplete(true);
            setTimeout(() => DialogueManager.startDialogue(), 500);
            return;
          } else if (!Player.isInjured() && !over && !Player.isInvincible()) {
            if (PropManager.hasActiveShield()) {
              if (PropManager.useShield()) {
                obs.splice(i, 1);
                return;
              }
            }
            GameState.takeDamage();
            Player.collideWithObstacle();
            if (GameState.getHealth() <= 0) {
              over = true;
              looping = false;
              return showRestart();
            }
          }
        }

        if (o.x + w < 0) obs.splice(i, 1);
      }

      bgX = (bgX - currentSpeed) % canvas.width;
      
      // Match Level1's spawn logic
      if (spawned < max) {
        if (++timer >= interval) {
          spawn();
          timer = 0;
        }
      } else if (!flagSpawned) {
        spawnFlag();
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
      
      while (
        (
          // Check collision with obstacles
          obs.some(o => {
            const obstacleRect = {
              x: o.x,
              y: o.y,
              width: w,
              height: h
            };
            const treasureRect = {
              x: x,
              y: y,
              width: treasureSize,
              height: treasureSize
            };
            return isHit(treasureRect, obstacleRect);
          }) ||
          // Check minimum spacing from other treasures
          treasures.some(t => Math.abs(t.x - x) < minTreasureSpacing || Math.abs(t.y - y) < treasureSize * 2)
        ) && attempts < maxAttempts
      ) {
        x = canvas.width + Math.random() * canvas.width;
        // For the second initial treasure, maintain larger x position
        if (treasures.length === 1) {
            x = canvas.width * 1.5 + Math.random() * canvas.width;
        }
        y = Math.random() * (maxY - minY) + minY;
        attempts++;
      }

      // Only spawn if we found a safe position
      if (attempts < maxAttempts) {
        treasures.push({ x, y, width: treasureSize, height: treasureSize });
        console.log('Treasure spawned successfully. Total treasures:', treasures.length);
      } else {
        console.log('Failed to spawn treasure after', maxAttempts, 'attempts');
        // Force spawn if this is one of the initial two treasures
        if (treasures.length < 2) {
            treasures.push({ 
                x: canvas.width * (1 + treasures.length), 
                y: canvas.height / 2, 
                width: treasureSize, 
                height: treasureSize 
            });
            console.log('Forced initial treasure spawn. Total treasures:', treasures.length);
        }
      }
    }

    function spawn() {
      const isTop = Math.random() > 0.6;
      const y = isTop ? 0 : canvas.height - h;
      obs.push({ 
        x: canvas.width + 50,
        y: y, 
        type: isTop ? 'top' : 'bottom' 
      });
      spawned++;
    }

    function spawnFlag() {
      const lastObstacle = obs[obs.length - 1];
      // Match Level1's flag spawning logic
      if (!flagSpawned && (!lastObstacle || lastObstacle.x < canvas.width - 300)) {
        obs.push({
          x: canvas.width,
          y: canvas.height - h,
          type: 'flag'
        });
        flagSpawned = true;
      }
    }

    function isHit(r1, r2) {
      return r1.x < r2.x + r2.width && r1.x + r1.width > r2.x &&
             r1.y < r2.y + r2.height && r1.y + r1.height > r2.y;
    }

    function showRestart() {
      document.querySelectorAll('button').forEach(btn => btn.remove());
      const restartBtn = document.createElement('button');
      restartBtn.textContent = '重新開始';
      Object.assign(restartBtn.style, {
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
      document.body.appendChild(restartBtn);
      restartBtn.onclick = () => {
        restartBtn.remove();
        start(canvas);
      };
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height); 
      
      // Draw background
      ctx.drawImage(bg, bgX, 0, canvas.width, canvas.height);
      ctx.drawImage(bg, bgX + canvas.width, 0, canvas.width, canvas.height);

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

      PropManager.drawPropUI(ctx);
      drawHealth();

      if (showTitle || !gameplayStarted) {
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '48px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('第二關:裂痕平原', canvas.width / 2, canvas.height / 2);
        ctx.font = '24px sans-serif';
        ctx.fillText('按空白鍵開始', canvas.width / 2, canvas.height / 2 + 50);
      }

      if (showHints) {
        const x = 20, y = 20, bw = 500, bh = 160;
        ctx.fillStyle = 'black';
        ctx.fillRect(x, y, bw, bh);
        ctx.fillStyle = 'white';
        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center';

        // Show one line at a time
        ctx.fillText(txts[textIdx], x + bw / 2, y + bh / 2);

        if (textIdx < txts.length - 1) {
          ctx.font = '14px sans-serif';
          ctx.fillText('點擊任意位置繼續', x + bw / 2, y + bh - 20);
        }
      }

      Player.draw(ctx);
      obs.forEach(o => {
        const dw = w * scale, dh = h * scale;
        ctx.save();
        if (o.type === 'top') {
          ctx.translate(o.x + dw / 2, o.y);
          ctx.scale(1, -1);
          ctx.drawImage(obsImg, -dw / 2, -dh, dw, dh);
        } else if (o.type === 'bottom') {
          ctx.drawImage(obsImg, o.x, o.y + (h - dh), dw, dh);
        } else if (o.type === 'flag') {
          const fw = 350, fh = 250;
          ctx.drawImage(flagImg, o.x, canvas.height - fh, fw, fh);
        }
        ctx.restore();
      });
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

    return { start, setSpeedMultiplier };
  })();

  return { startLevel2 };
})();   
