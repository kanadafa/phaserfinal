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
        id: 'hunterapple',
        name: '獵人X蘋果',
        path: 'games/獵人X蘋果/index.html',
        cover: 'games/獵人X蘋果/pic.png',
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
    }
];

let currentGame = null;
let currentIframe = null;

// 初始化遊戲列表
function initializeGameList() {
    const gameList = document.getElementById('gameList');
    games.forEach(game => {
        const card = document.createElement('div');
        card.className = 'game-card';
        
        card.innerHTML = `
            <img src="${game.cover}" alt="${game.name}" loading="lazy">
            <div class="game-info">
                <h2>${game.name}</h2>
            </div>
        `;

        // 整個卡片可點擊
        card.onclick = () => loadGame(game);

        gameList.appendChild(card);
    });

    // 防止點擊標題時返回
    document.querySelector('header').onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };
}

// 載入遊戲
async function loadGame(game) {
    const container = document.getElementById('gameContainer');
    const gameList = document.getElementById('gameList');
    const header = document.querySelector('header');

    // 清除遊戲容器
    container.innerHTML = '';

    // 移除之前的遊戲實例（如果有的話）
    if (currentGame) {
        currentGame.destroy(true);
        currentGame = null;
    }

    if (currentIframe) {
        currentIframe.remove();
        currentIframe = null;
    }

    // 隱藏遊戲列表和標題
    gameList.style.display = 'none';
    header.style.display = 'none';

    // 創建新的 iframe
    const iframe = document.createElement('iframe');
    iframe.src = game.path;
    iframe.style.border = 'none';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.backgroundColor = 'transparent';

    container.appendChild(iframe);
    currentIframe = iframe;

    // 添加返回按鈕
    const backButton = document.createElement('button');
    backButton.textContent = '返回遊戲列表';
    backButton.style.position = 'absolute';
    backButton.style.top = '20px';
    backButton.style.left = '20px';
    backButton.style.padding = '10px 20px';
    backButton.style.background = '#3498db';
    backButton.style.color = 'white';
    backButton.style.border = 'none';
    backButton.style.borderRadius = '5px';
    backButton.style.cursor = 'pointer';
    backButton.style.zIndex = '1000';

    backButton.onclick = () => {
        container.classList.remove('active');
        container.innerHTML = '';
        gameList.style.display = 'grid';
        header.style.display = 'block';
    };

    container.appendChild(backButton);
    container.classList.add('active');
}

// 頁面載入完成後初始化
document.addEventListener('DOMContentLoaded', initializeGameList); 