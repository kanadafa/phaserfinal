let showHint = false;
let hintAlpha = 0;

const DialogueManager = (function () {
  let dialogueLines = [];
  let currentLine = 0;
  let alpha = 0;
  let isRunning = false;
  let waitingForClick = false;
  let levelComplete = false;

  let startButton = null;
  let backToMenuButton = null;

  // Add image for Level 3 victory
  const level3WinImg = new Image();
  level3WinImg.src = 'images/obstacle/Level3_win.png';

  function startDialogue() {
    console.log("DialogueManager: Starting dialogue, levelComplete =", levelComplete);
    setDialogueLines();

    isRunning = true;
    currentLine = 0;
    alpha = 0;
    waitingForClick = false;
    showHint = false;
    hintAlpha = 0;

    removeButtons();
    canvas.addEventListener('click', onCanvasClick);
    requestAnimationFrame(drawDialogue);
  }

  function setDialogueLines() {
    const current = GameState.getCurrentLevel();
    if (levelComplete) {
      if (current === "Level1") {
        dialogueLines = [
          "呼...終於邁進一大步了",
          "時間不等人，我必須趕快往前"
        ];
      } else if (current === "Level2") {
        dialogueLines = [
          "這甚麼力量，好強大...",
          "有了這個我一定可以拯救公主!"
        ];
      } else if (current === "Level3") {
        dialogueLines = [
          "這樣的怪物，竟是魔王的走狗…",
          "（地上散落著一張破碎畫像，畫中女孩身穿王族服飾）",
          "（低聲）不……不可能……也許只是巧合……"
        ];
      } else if (current === "Level4") {
        dialogueLines = [
          "這些怪物...似乎在保護著什麼...",
          "（前方的門緩緩開啟）",
          "終於...要見到公主了..."
        ];
      }
    } else {
      // 第三關失敗的對話
      if (current === "Level3") {
        dialogueLines = [
          "骷髏守衛:哈哈哈哈，也不過如此嘛",
          "可惡!我才不會放棄的"
        ];
      } else {
        // 遊戲開始的對話
        dialogueLines = [
          "多年以前，公主被魔王綁走，王國陷入混亂...",
          "國王發誓要解救她，派出無數勇士，卻無一人生還。",
          "如今，只剩你，你是最後的希望..."
        ];
      }
    }
    console.log("DialogueManager: Set dialogue lines:", dialogueLines);
  }

  function drawDialogue() {
    if (!isRunning) return;

    const current = GameState.getCurrentLevel();


    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the broken portrait image for Level 3 victory dialogue
    if (current === "Level3" && levelComplete && currentLine === 1) {
      // Calculate image dimensions (assuming the image should take up about 1/3 of the screen height)
      const imgHeight = canvas.height / 3;
      const imgWidth = imgHeight * (level3WinImg.width / level3WinImg.height);
      const imgX = (canvas.width - imgWidth) / 2;
      const imgY = canvas.height / 4;  // Position above the text

      // Draw image with fade-in effect
      ctx.globalAlpha = alpha;
      ctx.drawImage(level3WinImg, imgX, imgY, imgWidth, imgHeight);
      ctx.globalAlpha = 1.0;
    }

    ctx.font = '28px Arial';
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.textAlign = 'center';
    
    // Adjust text position when showing image
    const textY = (current === "Level3" && levelComplete && currentLine === 1) 
        ? canvas.height * 0.75  // Lower position when showing image
        : canvas.height / 2;    // Normal position
    ctx.fillText(dialogueLines[currentLine], canvas.width / 2, textY);

    if (alpha < 1) {
      alpha += 0.02;
      requestAnimationFrame(drawDialogue);
    } else {
      if (!showHint) {
        showHint = true;
        hintAlpha = 0;
        setTimeout(() => {
          requestAnimationFrame(drawDialogue);
        }, 100);
        return;
      }

      if (currentLine < dialogueLines.length - 1) {
        if (hintAlpha < 1) {
          hintAlpha += 0.03;
          requestAnimationFrame(drawDialogue);
        }

        ctx.font = '16px Arial';
        ctx.fillStyle = `rgba(255, 255, 255, ${hintAlpha})`;
        ctx.textAlign = 'right';
        ctx.fillText('點擊任意位置繼續', canvas.width - 20, canvas.height - 20);

        waitingForClick = true;
      } else {
        showButtons();
      }
    }
  }

  function onCanvasClick() {
    console.log("DialogueManager: Canvas clicked, waitingForClick =", waitingForClick);
    if (!isRunning || !waitingForClick) return;

    if (currentLine === dialogueLines.length - 1) {
      console.log("DialogueManager: Last line reached");
      waitingForClick = false;
      showButtons();
      return;
    }

    console.log("DialogueManager: Moving to next line");
    waitingForClick = false;
    currentLine++;
    alpha = 0;
    showHint = false;
    hintAlpha = 0;
    requestAnimationFrame(drawDialogue);
  }

  function showButtons() {
    console.log("DialogueManager: Showing buttons");
    const currentLevel = GameState.getCurrentLevel();
  
    if (currentLevel === "Level3") {
      if (levelComplete) {
        showBackToMenuButton(); // 勝利 → 下一關
      } else {
        // 失敗 → 重新開始
        startButton = document.createElement('button');
        startButton.textContent = "重新開始";
  
        Object.assign(startButton.style, {
          position: 'absolute',
          left: '50%',
          top: '70%',
          transform: 'translateX(-50%)',
          padding: '12px 24px',
          fontSize: '20px',
          backgroundColor: 'black',
          color: 'white',
          border: '2px solid white',
          borderRadius: '8px',
          cursor: 'pointer',
          zIndex: '1000'
        });
  
        document.body.appendChild(startButton);
  
        startButton.addEventListener('click', () => {
          console.log("DialogueManager: Restart button clicked");
          isRunning = false;
          canvas.removeEventListener('click', onCanvasClick);
          document.body.removeChild(startButton);
          startButton = null;
          Level3.startLevel3(); // 重新進入第三關
        });
      }
    } else {
      // 其他關卡的按鈕行為
      if (levelComplete) {
        showBackToMenuButton(); // 勝利 → 下一關
      } else {
        startButton = document.createElement('button');
        startButton.textContent = "START";
  
        Object.assign(startButton.style, {
          position: 'absolute',
          left: '50%',
          top: '70%',
          transform: 'translateX(-50%)',
          padding: '12px 24px',
          fontSize: '20px',
          backgroundColor: 'black',
          color: 'white',
          border: '2px solid white',
          borderRadius: '8px',
          cursor: 'pointer',
          zIndex: '1000'
        });
  
        document.body.appendChild(startButton);
  
        startButton.addEventListener('click', () => {
          isRunning = false;
          canvas.removeEventListener('click', onCanvasClick);
          document.body.removeChild(startButton);
          startButton = null;
          GameState.changeLevel("Level1");
        });
      }
    }
  }
  

  function showBackToMenuButton() {
    console.log("DialogueManager: Showing next level button");
    backToMenuButton = document.createElement('button');
    backToMenuButton.textContent = "下一關";

    Object.assign(backToMenuButton.style, {
      position: 'absolute',
      left: '50%',
      top: '70%',
      transform: 'translateX(-50%)',
      padding: '12px 24px',
      fontSize: '20px',
      backgroundColor: 'black',
      color: 'white',
      border: '2px solid white',
      borderRadius: '8px',
      cursor: 'pointer',
      zIndex: '1000'
    });

    document.body.appendChild(backToMenuButton);

    backToMenuButton.addEventListener('click', () => {
      console.log("DialogueManager: Next level button clicked");
      isRunning = false;
      canvas.removeEventListener('click', onCanvasClick);

      if (backToMenuButton && backToMenuButton.parentNode) {
        document.body.removeChild(backToMenuButton);
      }
      backToMenuButton = null;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      setTimeout(() => {
        const current = GameState.getCurrentLevel();
        let next;

        if (current === "Level1") next = "Level2";
        else if (current === "Level2") next = "Level3";
        else if (current === "Level3") next = "Level4";
        else if (current === "Level4") next = "Level5";
        else next = "Level1";

        GameState.changeLevel(next);
      }, 50);
    });
  }

  function removeButtons() {
    console.log("DialogueManager: Removing buttons");
    if (startButton && startButton.parentNode) {
      document.body.removeChild(startButton);
      startButton = null;
    }
    if (backToMenuButton && backToMenuButton.parentNode) {
      document.body.removeChild(backToMenuButton);
      backToMenuButton = null;
    }
  }

  function setLevelComplete(isComplete) {
    console.log("DialogueManager: Setting level complete:", isComplete);
    levelComplete = isComplete;
  }

  function isDone() {
    console.log("DialogueManager: Checking if done, isRunning =", !isRunning);
    return !isRunning;
  }

  return {
    startDialogue,
    setLevelComplete,
    isDone,
    isRunning: () => isRunning
  };
})();
