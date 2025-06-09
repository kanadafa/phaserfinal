// 遊戲配置列表
const games = [
    { name: '少女歸途', path: './games/少女歸途/index.html', pic: './games/少女歸途/pic.jpg' },
    { name: 'Maze King', path: './games/Maze King/index.html', pic: './games/Maze King/pic.png' },
    { name: 'Lone Escape', path: './games/Lone Escape-Descent into Darknes/MainGame.html', pic: './games/Lone Escape-Descent into Darknes/pic.png' },
    { name: '畫廊迷蹤', path: './games/畫廊迷蹤/index.html', pic: './games/畫廊迷蹤/pic.png' },
    { name: '女巫的藥水', path: './games/女巫的藥水/index.html', pic: './games/女巫的藥水/pic.png' },
    { name: '獵人X蘋果', path: './games/獵人X蘋果/index.html', pic: './games/獵人X蘋果/pic.png' },
    { name: '勇者試煉', path: './games/勇者試煉/index.html', pic: './games/勇者試煉/pic.png' }
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
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('allowfullscreen', 'true');
        gameContainer.appendChild(iframe);
    }
    
    const gameFrame = document.getElementById('gameFrame');
    gameFrame.src = game.path;

    mainElement.classList.add('hidden');
    gameContainer.classList.add('active');
    header.classList.add('hidden');
}

function showMainMenu() {
    const mainElement = document.querySelector('main');
    const gameContainer = document.getElementById('gameContainer');
    const header = document.querySelector('header');
    const gameFrame = document.getElementById('gameFrame');

    if (gameFrame) {
        gameFrame.src = 'about:blank';
    }
    mainElement.classList.remove('hidden');
    gameContainer.classList.remove('active');
    header.classList.remove('hidden');
}

// 初始化
createGameCards();

const backButton = document.getElementById('backButton');
if (backButton) {
    backButton.addEventListener('click', showMainMenu);
} 