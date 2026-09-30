import Input from "./Input.js";

import Paddle from "../entities/Paddle.js";
import Ball from "../entities/Ball.js";
import Target from "../entities/Target.js";
import Wall from "../entities/Wall.js";
import Portal from "../entities/Portal.js";
import GravityZone from "../entities/GravityZone.js";
import Boss from "../entities/Boss.js";
import BossProjectile from "../entities/BossProjectile.js";

import {getBallRectangleCollisionSide, isBallCollidingWithPaddle, isBallCollidingWithTarget} from "./Collision.js";
import {getLevelObjective} from "../levels/Objectives.js";
import LevelManager from "./LevelManager.js";

export default class Game {
    constructor(canvas, level, ui) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.level = level;
        this.levelManager = new LevelManager(this.level);
        this.objective = getLevelObjective(this.level);
        this.state = "ready";
        this.score = 0;
        this.lives = 3;

        this.ctx.imageSmoothingEnabled = false;
        this.backgroundImage = new Image();
        this.backgroundLoaded = false;
        this.loadBackground();
        this.ui = ui;

        this.input = new Input();
        this.paddle = new Paddle(canvas);
        this.normalPaddleSpeed = this.paddle.speed;
        this.trapTimer = 0;
        this.trapDuration = 5;

        this.balls = this.createBalls();
        this.ballRespawnTimer = null;
        this.ballRespawnDelay = 2;

        this.targets = this.createTargets();
        this.walls = this.createWalls();
        this.portals = this.createPortals();
        this.gravityZones = this.createGravityZones();

        this.boss = this.createBoss();
        this.bossProjectiles = [];
        this.playerHitCooldown = 0;

        this.lastTime = 0;
        this.animationFrameId = null;
        this.screenButtons = {};
        this.gameLoop = this.gameLoop.bind(this);
    }

    start() {
        this.state = "objective";
        this.updateStatus("Xem mục tiêu");
        this.lastTime = performance.now();
        this.animationFrameId = requestAnimationFrame(this.gameLoop);
    }

    beginLevel() {
        if (this.state !== "objective") {
            return;
        }

        this.state = "playing";
        this.updateStatus("Đang chơi");
    }

    addScore(points) {
        this.score += points;
        this.updateScore();
    }

    gameLoop(timestamp) {
        const deltaTime = (timestamp - this.lastTime) / 1000;

        this.lastTime = timestamp;

        this.update(deltaTime);
        this.render();

        this.animationFrameId = requestAnimationFrame(this.gameLoop);
    }

    loseLife() {
        this.lives--;
        this.updateLives();
        if (this.lives <= 0) {
            this.state = "gameOver";
            this.updateStatus("Thua");
            return;
        }

        this.ballRespawnTimer = null;
        this.balls = this.createBalls();

        this.trapTimer = 0;
        this.paddle.speed = this.normalPaddleSpeed;
    }

    checkWinCondition() {
        if (this.boss) {
            if (this.boss.hp <= 0) {
                this.state = "won";
                this.updateStatus("Bạn đã đánh bại Boss!");
            }
            return;
        }

        const allTargetDestroyed = this.targets.every(target => !target.active);
        if (allTargetDestroyed) {
            this.state = "won";
            this.updateStatus("Bạn đã chiến thắng!");
        }
    }

    // CREATE
    createTargets() {
        const targets = [];
        const config = this.levelManager.getTargetConfig();
        const specialConfig = this.levelManager.getSpecialTargetConfig();

        const rows = config.rows;
        const columns = config.columns;
        const targetWidth = config.width;
        const targetHeight = config.height;
        const gapX = config.gapX;
        const gapY = config.gapY;
        const totalWidth = columns * targetWidth + (columns - 1) * gapX;
        const startX = (this.canvas.width - totalWidth) / 2;

        for (let row = 0; row < rows; row++) {
            const direction = row % 2 === 0 ? 1 : -1;

            for (let column = 0; column < columns; column++) {
                const x = startX + column * (targetWidth + gapX);
                const y = config.startY + row * (targetHeight + gapY);
                const index = row * columns + column;

                let type = "normal";

                if (specialConfig.bombs.includes(index)) {
                    type = "bomb";
                }

                if (specialConfig.traps.includes(index)) {
                    type = "trap";
                }

                const target = new Target(x, y, targetWidth, targetHeight, 100, row, {
                    // lv2
                    moving: config.moving,
                    speed: config.speed,
                    moveRange: config.moveRange,
                    direction,

                    // lv4
                    blinking: config.blinking,
                    visibleTime: config.visibleTime,
                    hiddenTime: config.hiddenTime,
                    blinkOffset: (row * columns + column) * 0.08,

                    // lv7
                    type,
                });

                targets.push(target);
            }
        }

        return targets;
    }

    explodeBomb(bomb) {
        const config = this.levelManager.getSpecialTargetConfig();

        for (const target of this.targets) {
            if (!target.active) {
                continue;
            }

            const bombX = bomb.x + bomb.width / 2;
            const bombY = bomb.y + bomb.height / 2;
            const targetX = target.x + target.width / 2;
            const targetY = target.y + target.height / 2;
            const distance = Math.hypot(targetX - bombX, targetY - bombY);

            if (distance <= config.bombRadius) {
                target.hit();
                this.addScore(target.points);
            }
        }
    }

    createWalls() {
        const wallConfigs = this.levelManager.getWallConfig();

        return wallConfigs.map(config => {
            return new Wall(config.x, config.y, config.width, config.height);
        });
    }

    createPortals() {
        const portalConfigs = this.levelManager.getPortalConfig();

        return portalConfigs.map(config => {
            return new Portal(config.x, config.y, config.radius, config.color);
        });
    }

    createGravityZones() {
        const configs = this.levelManager.getGravityZoneConfig();

        return configs.map(config => {
            return new GravityZone(config.x, config.y, config.width, config.height, config.forceX, config.forceY);
        });
    }

    createBoss() {
        const config = this.levelManager.getBossConfig();

        if (!config) {
            return null;
        }

        return new Boss(this.canvas, config);
    }


    createBalls() {
        const config = this.levelManager.getBallConfig();
        const balls = [];

        for (let i = 0; i < config.count; i++) {
            const ball = new Ball(this.canvas, {
                blinking: config.blinking, visibleTime: config.visibleTime, hiddenTime: config.hiddenTime
            });

            if (config.count > 1) {
                const angle = 70 * Math.PI / 180;
                const direction = i % 2 === 0 ? -1 : 1;

                ball.vx = direction * ball.speed * Math.cos(angle);
                ball.vy = -ball.speed * Math.sin(angle);
            }

            balls.push(ball);
        }

        return balls;
    }

    // UPDATE
    update(deltaTime) {
        if (this.state !== "playing") {
            return;
        }

        this.paddle.update(this.input, deltaTime);
        if (this.trapTimer > 0) {
            this.trapTimer -= deltaTime;

            if (this.trapTimer <= 0) {
                this.trapTimer = 0;
                this.paddle.speed = this.normalPaddleSpeed;
            }
        }

        for (const target of this.targets) {
            target.update(deltaTime);
        }

        if (this.boss) {
            const attacks = this.boss.update(deltaTime, this.paddle);
            for (const attack of attacks) {
                this.bossProjectiles.push(new BossProjectile(attack.x, attack.y, attack.vx, attack.vy));
            }
        }

        for (const projectile of this.bossProjectiles) {
            projectile.update(deltaTime);
        }

        if (this.playerHitCooldown > 0) {
            this.playerHitCooldown -= deltaTime;
        }

        for (const ball of this.balls) {
            ball.update(deltaTime);

            if ((ball.portalCooldown ?? 0) > 0) {
                ball.portalCooldown -= deltaTime;
            }

            this.handleCollisions(ball);
            this.handleWallCollisions(ball);
            this.handlePortalCollisions(ball);
            this.handleGravityZones(ball, deltaTime);
            this.handleBossCollision(ball)
            this.handleTargetCollisions(ball);
        }

        this.handleBossProjectiles();
        this.bossProjectiles = this.bossProjectiles.filter(projectile => !projectile.isOutOfCanvas(this.canvas));

        const hasLostBall = this.balls.some(ball => ball.isOutOfBottom());
        if (hasLostBall) {
            this.handleLostBalls();
        }

        if (this.ballRespawnTimer !== null && this.state === "playing") {
            this.ballRespawnTimer -= deltaTime;

            if (this.ballRespawnTimer <= 0) {
                const ballConfig = this.levelManager.getBallConfig();

                while (this.balls.length < ballConfig.count) {
                    const newBall = new Ball(this.canvas);
                    newBall.x = this.paddle.x + this.paddle.width / 2;
                    newBall.y = this.paddle.y - newBall.radius - 5;
                    newBall.preX = newBall.x;
                    newBall.preY = newBall.y;

                    const otherBall = this.balls[0];
                    newBall.vx = -Math.sign(otherBall.vx) * Math.abs(newBall.vx);
                    newBall.vy = -Math.abs(newBall.vy);

                    this.balls.push(newBall);
                }

                this.ballRespawnTimer = null;
            }
        }

        if (this.state !== "playing") {
            return;
        }

        this.checkWinCondition();
    }

    updateScore() {
        if (this.ui?.score) {
            this.ui.score.textContent = this.score;
        }
    }

    updateLives() {
        if (this.ui?.lives) {
            this.ui.lives.textContent = this.lives;
        }
    }

    updateStatus(text) {
        if (this.ui?.status) {
            this.ui.status.textContent = text;
        }
    }

    updateUI() {
        this.updateScore();
        this.updateLives();
        this.updateStatus("Đang chơi");
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawBackground();
        this.drawLevelText();

        for (const zone of this.gravityZones) {
            zone.draw(this.ctx);
        }

        for (const wall of this.walls) {
            wall.draw(this.ctx);
        }

        for (const portal of this.portals) {
            portal.draw(this.ctx);
        }

        for (const target of this.targets) {
            target.draw(this.ctx);
        }

        if (this.boss) {
            this.boss.draw(this.ctx);
        }
        for (const projectile of this.bossProjectiles) {
            projectile.draw(this.ctx);
        }

        this.paddle.draw(this.ctx);
        for (const ball of this.balls) {
            ball.draw(this.ctx);
        }

        const screenStates = ["objective", "paused", "won", "gameOver",];
        if (screenStates.includes(this.state)) {
            this.drawScreen(this.state);
        }
    }

    restart() {
        this.score = 0;
        this.lives = 3;
        this.state = "playing";
        this.screenButtons = {};
        this.targets = this.createTargets();

        this.boss = this.createBoss();
        this.bossProjectiles = [];
        this.playerHitCooldown = 0;

        this.balls = this.createBalls();
        this.ballRespawnTimer = null;

        this.trapTimer = 0;
        this.paddle.speed = this.normalPaddleSpeed;
        this.paddle.reset();
        if (this.ui?.pauseButton) {
            this.ui.pauseButton.textContent = "Tạm dừng";
        }
        this.updateUI();
    }

    togglePause() {
        if (this.state === "won" || this.state === "gameOver") {
            return;
        }

        if (this.state === "playing") {
            this.state = "paused";
            this.updateStatus("Tạm dừng");

            if (this.ui?.pauseButton) {
                this.ui.pauseButton.textContent = "Tiếp tục";
            }

            return;
        }

        if (this.state === "paused") {
            this.state = "playing";
            this.updateStatus("Đang chơi");

            if (this.ui?.pauseButton) {
                this.ui.pauseButton.textContent = "Tạm dừng";
            }
        }
    }

    // HANDLE
    handleCollisions(ball) {
        const ballIsMovingDown = ball.vy > 0;
        const ballWasAbovePaddle = ball.preY + ball.radius <= this.paddle.y;

        if (ballIsMovingDown && ballWasAbovePaddle && isBallCollidingWithPaddle(ball, this.paddle)) {
            ball.bounceFromPaddle(this.paddle);
        }
    }

    handleTargetCollisions(ball) {
        for (const target of this.targets) {
            if (!target.active) {
                continue;
            }

            if (isBallCollidingWithTarget(ball, target)) {
                target.hit();
                this.addScore(target.points);

                // lv7 - bomb
                if (target.type === "bomb") {
                    this.explodeBomb(target);
                }

                // lv7 - trap
                if (target.type === "trap") {
                    this.paddle.speed = 150;
                    this.trapTimer = this.trapDuration;
                }

                ball.vy *= -1;
                break;
            }
        }
    }

    handleWallCollisions(ball) {
        for (const wall of this.walls) {
            const side = getBallRectangleCollisionSide(ball, wall);

            if (!side) {
                continue;
            }

            if (side === "top") {
                ball.y = wall.y - ball.radius;
                ball.vy = -Math.abs(ball.vy);
            }

            if (side === "bottom") {
                ball.y = wall.y + wall.height + ball.radius;
                ball.vy = Math.abs(ball.vy);
            }

            if (side === "left") {
                ball.x = wall.x - ball.radius;
                ball.vx = -Math.abs(ball.vx);
            }

            if (side === "right") {
                ball.x = wall.x + wall.width + ball.radius;
                ball.vx = Math.abs(ball.vx);
            }

            break;
        }
    }

    handleBossCollision(ball) {
        if (!this.boss || this.boss.hp <= 0) {
            return;
        }

        const side = getBallRectangleCollisionSide(ball, this.boss);

        if (!side) {
            return;
        }

        this.boss.takeDamage(this.boss.damagePerHit);

        if (side === "bottom") {
            ball.y = this.boss.y + this.boss.height + ball.radius;
            ball.vy = Math.abs(ball.vy);
        }

        if (side === "top") {
            ball.y = this.boss.y - ball.radius;
            ball.vy = -Math.abs(ball.vy);
        }

        if (side === "left") {
            ball.x = this.boss.x - ball.radius;
            ball.vx = -Math.abs(ball.vx);
        }

        if (side === "right") {
            ball.x = this.boss.x + this.boss.width + ball.radius;
            ball.vx = Math.abs(ball.vx);
        }
    }

    handleBossProjectiles() {
        if (this.playerHitCooldown > 0) {
            return;
        }

        for (let i = this.bossProjectiles.length - 1; i >= 0; i--) {
            const projectile = this.bossProjectiles[i];

            if (!projectile.hitsPaddle(this.paddle)) {
                continue;
            }

            this.bossProjectiles.splice(i, 1);
            this.lives--;
            this.updateLives();
            this.playerHitCooldown = 1;

            if (this.lives <= 0) {
                this.state = "gameOver";
                this.updateStatus("Boss đã đánh bại bạn!");
            }

            return;
        }
    }

    handleCanvasClick(x, y) {
        if (this.state === "objective") {
            this.beginLevel();
            return;
        }

        if (this.state !== "won") {
            return;
        }

        const menuButton = this.screenButtons.menu;
        const nextButton = this.screenButtons.next;

        if (menuButton && x >= menuButton.x && x <= menuButton.x + menuButton.width && y >= menuButton.y && y <= menuButton.y + menuButton.height) {
            window.location.href = "index.html";
            return;
        }

        if (nextButton && x >= nextButton.x && x <= nextButton.x + nextButton.width && y >= nextButton.y && y <= nextButton.y + nextButton.height) {
            window.location.href = `game.html?level=${this.level + 1}`;
        }
    }

    handleLostBalls() {
        this.balls = this.balls.filter(ball => !ball.isOutOfBottom());
        if (this.balls.length === 0) {
            this.ballRespawnTimer = null;
            this.loseLife();
            return;
        }

        if (this.ballRespawnTimer === null) {
            this.ballRespawnTimer = this.ballRespawnDelay;
        }
    }

    handlePortalCollisions(ball) {
        if ((ball.portalCooldown ?? 0) > 0) {
            return;
        }

        for (let i = 0; i < this.portals.length; i += 2) {
            const portalA = this.portals[i];
            const portalB = this.portals[i + 1];

            if (!portalB) {
                continue;
            }

            const distanceA = Math.hypot(ball.x - portalA.x, ball.y - portalA.y);
            const distanceB = Math.hypot(ball.x - portalB.x, ball.y - portalB.y);

            let exitPortal = null;
            if (distanceA <= ball.radius + portalA.radius) {
                exitPortal = portalB;
            } else if (distanceB <= ball.radius + portalB.radius) {
                exitPortal = portalA;
            }

            if (!exitPortal) {
                continue;
            }

            ball.x = exitPortal.x;
            ball.y = exitPortal.y;
            ball.preX = ball.x;
            ball.preY = ball.y;
            ball.portalCooldown = 0.3;

            break;
        }
    }

    handleGravityZones(ball, deltaTime) {
        for (const zone of this.gravityZones) {
            if (!zone.contains(ball)) {
                continue;
            }

            ball.vx += zone.forceX * deltaTime;
            ball.vy += zone.forceY * deltaTime;

            const maxSpeed = 420;
            const currentSpeed = Math.hypot(ball.vx, ball.vy);

            if (currentSpeed > maxSpeed) {
                ball.vx = ball.vx / currentSpeed * maxSpeed;
                ball.vy = ball.vy / currentSpeed * maxSpeed;
            }
        }
    }

    // DRAW
    drawScreen(state) {
        const screens = {
            objective: {
                title: `LEVEL ${this.level}`,
                subtitle: this.objective.name.toUpperCase(),
                color: "#38bdf8",
                height: 500,

                sections: [{
                    label: "MỤC TIÊU", text: this.objective.objective, color: "#fbbf24"
                }, {
                    label: "CƠ CHẾ", text: this.objective.mechanic, color: "#a78bfa"
                }, {
                    label: "GỢI Ý", text: this.objective.tip, color: "#22d3ee"
                }],

                hint: "ENTER / CLICK ĐỂ BẮT ĐẦU"
            },

            paused: {
                title: "TẠM DỪNG", subtitle: "", color: "#fbbf24", height: 230,

                sections: [{
                    label: "", text: "Nhấn Tiếp tục hoặc Space để chơi tiếp", color: "#ffffff"
                }],

                hint: ""
            },

            won: {
                title: "BẠN THẮNG!", subtitle: "", color: "#22c55e", height: 230,

                sections: [{
                    label: "", text: "Bạn đã hoàn thành toàn bộ mục tiêu.", color: "#ffffff"
                }],

                hint: ""
            },

            gameOver: {
                title: "GAME OVER", subtitle: "", color: "#ef4444", height: 230,

                sections: [{
                    label: "", text: "Bạn đã hết mạng.", color: "#ffffff"
                }],

                hint: "Nhấn 'Chơi lại' hoặc 'F5' để thử lại"
            }
        };

        const screen = screens[state];

        if (!screen) {
            return;
        }

        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const panelWidth = 660;
        const panelHeight = screen.height;
        const panelX = centerX - panelWidth / 2;
        const panelY = centerY - panelHeight / 2;
        this.ctx.save();

        // Overlay
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.72)";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Panel
        this.ctx.fillStyle = "rgba(8, 17, 31, 0.95)";
        this.ctx.fillRect(panelX, panelY, panelWidth, panelHeight);

        // Border
        this.ctx.strokeStyle = screen.color;
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";

        // Tiêu đề
        this.ctx.fillStyle = screen.color;
        this.ctx.font = "bold 38px monospace";
        this.ctx.fillText(screen.title, centerX, panelY + 50);
        let currentY = panelY + 95;

        // Phụ đề
        if (screen.subtitle) {
            this.ctx.fillStyle = "#ffffff";
            this.ctx.font = "bold 22px monospace";
            this.ctx.fillText(screen.subtitle, centerX, currentY);
            currentY += 45;
        }

        // Sections
        for (const section of screen.sections) {
            if (section.label) {
                this.ctx.fillStyle = section.color;
                this.ctx.font = "bold 15px monospace";
                this.ctx.fillText(section.label, centerX, currentY);
                currentY += 28;
            }

            this.ctx.fillStyle = section.label ? "#e2e8f0" : section.color;
            this.ctx.font = "16px Arial";
            const lineCount = this.drawWrappedText(section.text, centerX, currentY, 540, 22);
            currentY += lineCount * 22 + 28;
        }

        // Mẹo
        if (screen.hint) {
            this.ctx.fillStyle = "#22c55e";
            this.ctx.font = "bold 14px monospace";
            this.ctx.fillText(screen.hint, centerX, panelY + panelHeight - 28);
        }

        if (state === "won") {
            const buttonWidth = 180;
            const buttonHeight = 42;
            const gap = 20;
            const buttonY = panelY + panelHeight - 65;
            const hasNextLevel = this.level < 10;
            const menuX = hasNextLevel ? centerX - buttonWidth - gap / 2 : centerX - buttonWidth / 2;

            // Menu button
            this.ctx.fillStyle = "#334155";
            this.ctx.fillRect(menuX, buttonY, buttonWidth, buttonHeight);
            this.ctx.strokeStyle = "#ffffff";
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(menuX, buttonY, buttonWidth, buttonHeight);
            this.ctx.fillStyle = "#ffffff";
            this.ctx.font = "bold 13px monospace";
            this.ctx.fillText("QUAY LẠI MENU", menuX + buttonWidth / 2, buttonY + buttonHeight / 2);
            this.screenButtons.menu = {x: menuX, y: buttonY, width: buttonWidth, height: buttonHeight};

            // Next level
            if (hasNextLevel) {
                const nextX = centerX + gap / 2;
                this.ctx.fillStyle = "#2563eb";
                this.ctx.fillRect(nextX, buttonY, buttonWidth, buttonHeight);
                this.ctx.strokeStyle = "#ffffff";
                this.ctx.strokeRect(nextX, buttonY, buttonWidth, buttonHeight);
                this.ctx.fillStyle = "#ffffff";
                this.ctx.fillText("MÀN TIẾP THEO", nextX + buttonWidth / 2, buttonY + buttonHeight / 2);
                this.screenButtons.next = {x: nextX, y: buttonY, width: buttonWidth, height: buttonHeight};
            } else {
                delete this.screenButtons.next;
            }
        }

        this.ctx.restore();
    }

    drawWrappedText(text, x, y, maxWidth, lineHeight) {
        const words = text.split(" ");
        let line = "";
        const lines = [];

        for (const word of words) {
            const testLine = line ? `${line} ${word}` : word;
            const testWidth = this.ctx.measureText(testLine).width;

            if (testWidth > maxWidth && line !== "") {
                lines.push(line);
                line = word;
            } else {
                line = testLine;
            }
        }

        if (line) {
            lines.push(line);
        }

        lines.forEach((currentLine, index) => {
            this.ctx.fillText(currentLine, x, y + index * lineHeight);
        });

        return lines.length;
    }

    drawLevelText() {
        this.ctx.save();

        this.ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
        this.ctx.font = "16px Arial";
        this.ctx.textAlign = "center";

        this.ctx.fillText(`Màn ${this.level}`, this.canvas.width / 2, 30);

        this.ctx.restore();
    }

    getBackgroundPath() {
        return `assets/images/lv${this.level}.png`;
    }

    loadBackground() {
        const imagePath = this.getBackgroundPath();
        this.backgroundLoaded = false;
        this.backgroundImage.onload = () => {
            this.backgroundLoaded = true;
        };

        this.backgroundImage.onerror = () => {
            console.error(`Không thể load background: ${imagePath}`);
            this.backgroundLoaded = false;
        };

        this.backgroundImage.src = imagePath;
    }

    drawBackground() {
        if (this.backgroundLoaded) {
            this.ctx.drawImage(this.backgroundImage, 0, 0, this.canvas.width, this.canvas.height);
            return;
        }

        this.ctx.save();
        this.ctx.fillStyle = "#0b1020";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();
    }
}