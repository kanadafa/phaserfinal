// 遊戲配置列表
const games = [
    {
        id: 'girlsjourney',
        name: '少女歸途',
        path: 'games/少女歸途/index.html',
        cover: 'games/少女歸途/pic.jpg',
        isStandalone: true
    },
    {
        id: 'mazeking',
        name: 'Maze King',
        path: 'games/Maze King/index.html',
        cover: 'games/Maze King/pic.png',
        isStandalone: true
    },
    {
        id: 'loneescape',
        name: 'Lone Escape',
        path: 'games/Lone Escape-Descent into Darknes/MainGame.html',
        cover: 'games/Lone Escape-Descent into Darknes/pic.png',
        isStandalone: true
    },
    {
        id: 'gallerymaze',
        name: '畫廊迷蹤',
        path: 'games/畫廊迷蹤/index.html',
        cover: 'games/畫廊迷蹤/pic.png',
        isStandalone: true
    },
    {
        id: 'witchpotion',
        name: '女巫的藥水',
        path: 'games/女巫的藥水/index.html',
        cover: 'games/女巫的藥水/pic.png',
        isStandalone: true
    },
    {
        id: 'hunterapple',
        name: '獵人X蘋果',
        path: 'games/獵人X蘋果/index.html',
        cover: 'games/獵人X蘋果/pic.png',
        isStandalone: true
    },
    {
        id: 'bravehero',
        name: '勇者試煉',
        path: 'games/勇者試煉/index.html',
        cover: 'games/勇者試煉/images/backgrounds/main.PNG',
        isStandalone: true
    }
];

let currentGame = null;
let currentIframe = null;

// 初始化遊戲列表
function initializeGameList() {
    const gameList = document.getElementById('gameList');
    gameList.innerHTML = ''; // 清空

    const topRow = document.createElement('div');
    topRow.className = 'game-row game-row-top';

    const bottomRow = document.createElement('div');
    bottomRow.className = 'game-row game-row-bottom';

    games.forEach((game, index) => {
        const card = document.createElement('div');
        card.className = 'game-card';
        
        card.innerHTML = `
            <img src="${game.cover}" alt="${game.name}" loading="lazy">
            <div class="game-info">
                <h2>${game.name}</h2>
            </div>
        `;

        card.onclick = () => loadGame(game);

        if (index < 3) {
            topRow.appendChild(card);
        } else {
            bottomRow.appendChild(card);
        }
    });

    gameList.appendChild(topRow);
    gameList.appendChild(bottomRow);

    document.querySelector('header').onclick = (e) => {
        if (e.target.tagName !== 'BUTTON') {
            e.preventDefault();
            e.stopPropagation();
        }
    };
}

// 載入遊戲
async function loadGame(game) {
    const container = document.getElementById('gameContainer');
    const gameList = document.getElementById('gameList');
    const header = document.querySelector('header');

    if (currentIframe) {
        currentIframe.remove();
        currentIframe = null;
    }

    header.classList.add('hidden');
    gameList.classList.add('hidden');
    container.classList.add('active');
    document.body.style.overflow = 'hidden';

    const iframe = document.createElement('iframe');
    iframe.src = game.path;
    iframe.style.border = 'none';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.backgroundColor = 'transparent';

    container.appendChild(iframe);
    currentIframe = iframe;

    const backButton = document.createElement('button');
    backButton.textContent = '返回遊戲列表';
    backButton.style.position = 'fixed';
    backButton.style.top = '20px';
    backButton.style.left = '20px';
    backButton.style.padding = '10px 20px';
    backButton.style.background = '#3498db';
    backButton.style.color = 'white';
    backButton.style.border = 'none';
    backButton.style.borderRadius = '5px';
    backButton.style.cursor = 'pointer';
    backButton.style.zIndex = '1001';

    backButton.onclick = () => {
        container.innerHTML = '';
        container.classList.remove('active');
        header.classList.remove('hidden');
        gameList.classList.remove('hidden');
        document.body.style.overflow = 'auto';
    };

    container.appendChild(backButton);
}

// 頁面載入完成後初始化
document.addEventListener('DOMContentLoaded', initializeGameList); 