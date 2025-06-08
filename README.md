# Phaser 遊戲集合

這是一個使用 Phaser 3 開發的多遊戲集合網站。

## 專案結構

```
├── index.html          # 主頁面
├── styles/
│   └── main.css       # 樣式文件
├── js/
│   └── main.js        # 主要的 JavaScript 文件
└── games/             # 遊戲資料夾
    └── game1/         # 示例遊戲
        └── game.js    # 遊戲場景
```

## 如何添加新遊戲

1. 在 `games` 資料夾中建立新的遊戲資料夾
2. 在新資料夾中建立遊戲場景文件
3. 在 `js/main.js` 中的 `games` 陣列中添加新遊戲配置

示例：
```javascript
{
    id: 'newGame',
    name: '新遊戲名稱',
    path: 'games/newGame/game.js',
    config: {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        parent: 'gameContainer',
        scene: null
    }
}
```

## 運行專案

由於使用了 ES 模組，需要通過 Web 伺服器運行專案。可以使用以下方法之一：

1. 使用 Visual Studio Code 的 Live Server 擴充功能
2. 使用 Python 的簡單 HTTP 伺服器：
   ```bash
   python -m http.server
   ```
3. 使用 Node.js 的 http-server：
   ```bash
   npx http-server
   ```

## 技術架構

- Phaser 3.60.0
- 原生 JavaScript (ES6+)
- HTML5
- CSS3 