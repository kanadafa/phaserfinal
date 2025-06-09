const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 設定 canvas 滿版
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// 背景圖
const background = new Image();
background.src = 'images/backgrounds/main.PNG';

// 遊戲狀態
const Gamestate = {
  MENU: 'menu',
  DIALOGUE: 'dialogue',
  PLAYING: 'playing'
};
let currentState = Gamestate.MENU;

// 開始按鈕
const startButton = {
  width: 200,
  height: 60,
  get x() {
    return canvas.width / 2 - this.width / 2;
  },
  get y() {
    return canvas.height * 0.8;
  },
  text: 'Start Game',
  hover: false
};

// 背景載入後畫主選單
background.onload = () => {
  drawMenu();
};

// 視窗尺寸變動時重繪
window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  drawMenu();
});

// 滑鼠移動判斷 hover
canvas.addEventListener('mousemove', function (e) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  startButton.hover = (
    mouseX > startButton.x &&
    mouseX < startButton.x + startButton.width &&
    mouseY > startButton.y &&
    mouseY < startButton.y + startButton.height
  );

  if (currentState === Gamestate.MENU) {
    drawMenu();
  }
});

canvas.addEventListener('click', function (e) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  const clickedOnButton =
    mouseX > startButton.x &&
    mouseX < startButton.x + startButton.width &&
    mouseY > startButton.y &&
    mouseY < startButton.y + startButton.height;

  if (currentState === Gamestate.MENU && clickedOnButton) {
    currentState = Gamestate.DIALOGUE;
    ctx.clearRect(0, 0, canvas.width, canvas.height); //清空畫面
    DialogueManager.startDialogue(); //啟動畫面流程
  }

});

window.onload = function() {
    // 初始化音樂
    AudioManager.initBGM();
    AudioManager.playBGM();

    // 設置音量控制按鈕
    const muteButton = document.getElementById('muteButton');
    if (muteButton) {
        muteButton.addEventListener('click', () => {
            const isMuted = AudioManager.toggleMute();
            muteButton.textContent = isMuted ? '🔈' : '🔊';
        });
    }

    Main.showMainMenu();
};

// 畫主選單
function drawMenu() {
  if (currentState !== Gamestate.MENU) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height); // 滿版背景

  // 畫按鈕
  ctx.fillStyle = startButton.hover ? '#444444' : '#000000';
  ctx.fillRect(startButton.x, startButton.y, startButton.width, startButton.height);

  ctx.fillStyle = 'white';
  ctx.font = '24px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(startButton.text, startButton.x + startButton.width / 2, startButton.y + startButton.height / 2);
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  Player.update();
  Player.draw(ctx);

  FireballManager.update();
  FireballManager.draw(ctx);

  requestAnimationFrame(gameLoop);
}

// Main 模組：提供回主選單的能力
const Main = (function () {
  function showMainMenu() {
    currentState = Gamestate.MENU;
    drawMenu();
  }

  return {
    showMainMenu
  };
})();