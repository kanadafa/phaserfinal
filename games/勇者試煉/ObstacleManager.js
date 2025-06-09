class ObstacleManager {
    constructor(config) {
        this.config = {
            canvas: config.canvas,
            ctx: config.ctx,
            obstacleWidth: config.obstacleWidth || 80,
            obstacleHeight: config.obstacleHeight || 200,
            obstacleScale: config.obstacleScale || 2,
            obstacleSpeed: config.obstacleSpeed || 4,
            spawnInterval: config.spawnInterval || 100,
            maxObstacles: config.maxObstacles || 12,
            obstacleImage: config.obstacleImage,
            ...config
        };

        this.obstacles = [];
        this.spawnTimer = 0;
        this.totalSpawned = 0;
    }

    reset() {
        this.obstacles = [];
        this.spawnTimer = 0;
        this.totalSpawned = 0;
    }

    update() {
        // 生成新障礙物
        if (this.totalSpawned < this.config.maxObstacles) {
            this.spawnTimer++;
            if (this.spawnTimer >= this.config.spawnInterval) {
                this.spawnObstacle();
                this.spawnTimer = 0;
            }
        }

        // 更新現有障礙物
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obstacle = this.obstacles[i];
            obstacle.x -= this.config.obstacleSpeed;

            // 移除超出畫面的障礙物
            if (obstacle.x + this.config.obstacleWidth < 0) {
                this.obstacles.splice(i, 1);
            }
        }
    }

    draw() {
        const { ctx, obstacleImage, obstacleWidth, obstacleHeight, obstacleScale } = this.config;
        
        for (const obstacle of this.obstacles) {
            const dw = obstacleWidth * obstacleScale;
            const dh = obstacleHeight * obstacleScale;
            
            ctx.save();
            if (obstacle.type === 'top') {
                ctx.translate(obstacle.x + dw / 2, obstacle.y + dh / 2);
                ctx.scale(1, -1);
                ctx.drawImage(obstacleImage, -dw / 2, -dh / 2, dw, dh);
            } else if (obstacle.type === 'bottom') {
                ctx.drawImage(obstacleImage, obstacle.x, obstacle.y - (dh - obstacleHeight), dw, dh);
            }
            ctx.restore();
        }
    }

    spawnObstacle() {
        const isTop = Math.random() > 0.5;
        const y = isTop ? 0 : this.config.canvas.height - this.config.obstacleHeight;
        
        this.obstacles.push({
            x: this.config.canvas.width,
            y,
            type: isTop ? 'top' : 'bottom'
        });
        
        this.totalSpawned++;
    }

    getObstacles() {
        return this.obstacles;
    }

    getObstacleRects() {
        return this.obstacles.map(o => ({
            x: o.x,
            y: o.y,
            width: this.config.obstacleWidth,
            height: this.config.obstacleHeight
        }));
    }

    // 自定義障礙物生成模式
    setSpawnPattern(pattern) {
        this.spawnPattern = pattern;
    }

    // 設置障礙物速度
    setSpeed(speed) {
        this.config.obstacleSpeed = speed;
    }

    // 設置生成間隔
    setSpawnInterval(interval) {
        this.config.spawnInterval = interval;
    }
}

// 導出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ObstacleManager;
} else {
    window.ObstacleManager = ObstacleManager;
} 