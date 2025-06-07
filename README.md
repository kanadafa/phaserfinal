# Phaser 游戏集合

这是一个使用 Phaser 3 开发的多游戏集合网站。

## 项目结构

```
├── index.html          # 主页面
├── styles/
│   └── main.css       # 样式文件
├── js/
│   └── main.js        # 主要的 JavaScript 文件
└── games/             # 游戏文件夹
    └── game1/         # 示例游戏
        └── game.js    # 游戏场景
```

## 如何添加新游戏

1. 在 `games` 文件夹中创建新的游戏文件夹
2. 在新文件夹中创建游戏场景文件
3. 在 `js/main.js` 中的 `games` 数组中添加新游戏配置

示例：
```javascript
{
    id: 'newGame',
    name: '新游戏名称',
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

## 运行项目

由于使用了 ES 模块，需要通过 Web 服务器运行项目。可以使用以下方法之一：

1. 使用 Visual Studio Code 的 Live Server 扩展
2. 使用 Python 的简单 HTTP 服务器：
   ```bash
   python -m http.server
   ```
3. 使用 Node.js 的 http-server：
   ```bash
   npx http-server
   ```

## 技术栈

- Phaser 3.60.0
- 原生 JavaScript (ES6+)
- HTML5
- CSS3 