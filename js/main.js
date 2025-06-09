// 遊戲配置列表
const games = [
    { name: '少女歸途', path: './games/G02_少女歸途/index.html', pic: './games/G02_少女歸途/pic.jpg' },
    { name: '女巫的藥水', path: './games/G03_女巫的藥水/index.html', pic: './games/G03_女巫的藥水/pic.png' },
    { name: '勇者試煉', path: './games/G04_勇者試煉/index.html', pic: './games/G04_勇者試煉/pic.png' },
    { name: 'Lone Escape', path: './games/G05_Lone Escape-Descent into Darkness/MainGame.html', pic: './games/G05_Lone Escape-Descent into Darkness/pic.png' },
    { name: 'Maze King', path: './games/G06_Maze King/index.html', pic: './games/G06_Maze King/pic.png' },
    { name: '獵人X蘋果', path: './games/G07_獵人X蘋果/index.html', pic: './games/G07_獵人X蘋果/pic.png' },
    { name: '畫廊迷蹤', path: './games/G08_畫廊迷蹤/start.html', pic: './games/G08_畫廊迷蹤/pic.png' }
];

let currentGame = null;
let currentIframe = null;

function createGameCards() {
    const gameList = document.getElementById('gameList');
    if (!gameList) return;

    gameList.innerHTML = ''; // 清空現有內容

    const topRow = document.createElement('div');
    topRow.className = 'game-row game-row-top';

    const bottomRow = document.createElement('div');
    bottomRow.className = 'game-row game-row-bottom';

    games.forEach((game, index) => {
        const card = document.createElement('li');
        card.className = 'game-card';
        card.addEventListener('click', () => loadGame(game));

        // 從路徑中提取資料夾名稱作為 hover 提示文字
        const folderName = game.path.split('/')[2];
        card.title = folderName.replace(/-/g, ' '); // 將-替換為空格，使其更易讀

        const img = document.createElement('img');
        img.src = game.pic;
        img.alt = game.name;

        const info = document.createElement('div');
        info.className = 'game-info';
        const title = document.createElement('h2');
        title.textContent = game.name;
        info.appendChild(title);

        card.appendChild(img);
        card.appendChild(info);

        if (index < 3) {
            topRow.appendChild(card);
        } else {
            bottomRow.appendChild(card);
        }
    });

    gameList.appendChild(topRow);
    gameList.appendChild(bottomRow);
}

function loadGame(game) {
    const mainElement = document.querySelector('main');
    const gameContainer = document.getElementById('gameContainer');
    const header = document.querySelector('header');
    
    // 確保 gameContainer 裡有 iframe
    if (!document.getElementById('gameFrame')) {
        const iframe = document.createElement('iframe');
        iframe.id = 'gameFrame';
        gameContainer.appendChild(iframe);
    }
    
    const gameFrame = document.getElementById('gameFrame');
    gameFrame.src = game.path;

    mainElement.style.display = 'none';
    header.style.display = 'none';
    gameContainer.style.display = 'flex'; // 或者 'block'，取決於 #gameContainer 的內部佈局需求
}

function showMainMenu() {
    const mainElement = document.querySelector('main');
    const gameContainer = document.getElementById('gameContainer');
    const header = document.querySelector('header');
    const gameFrame = document.getElementById('gameFrame');

    if (gameFrame) {
        gameFrame.src = 'about:blank';
    }
    mainElement.style.display = 'flex';
    header.style.display = 'block'; // 或者 'flex'，取決於 header 的佈局
    gameContainer.style.display = 'none';
}

// 初始化
createGameCards();

const backButton = document.getElementById('backButton');
if (backButton) {
    backButton.addEventListener('click', showMainMenu);
} 