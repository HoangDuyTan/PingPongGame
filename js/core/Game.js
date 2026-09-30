import Input from "./Input.js";

import Paddle from "../entities/Paddle.js";
import Ball from "../entities/Ball.js";
import Target from "../entities/Target.js";

import {isBallCollidingWithPaddle, isBallCollidingWithTarget} from "./Collision.js";

export default class Game {
    constructor(canvas, level, ui) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.level = level;
        this.state = "ready";
        this.score = 0;
        this.lives = 3;
        this.ui = ui;

        this.input = new Input();
        this.paddle = new Paddle(canvas);
        this.ball = new Ball(canvas);
        this.targets = this.createTargets();

        this.lastTime = 0;
        this.animationFrameId = null;
        this.gameLoop = this.gameLoop.bind(this);
    }

    start() {
        this.state = "playing";
        this.updateUI()
        this.lastTime = performance.now();
        this.animationFrameId = requestAnimationFrame(this.gameLoop);
    }

    handleCollisions() {
        const ballIsMovingDown = this.ball.vy > 0;
        if (ballIsMovingDown && isBallCollidingWithPaddle(this.ball, this.paddle)) {
            this.ball.bounceFromPaddle(this.paddle);
        }
    }

    handleTargetCollisions() {
        for (const target of this.targets) {
            if (!target.active) {
                continue;
            }

            if (isBallCollidingWithTarget(this.ball, target)) {
                target.hit();
                this.ball.vy *= -1;
                this.addScore(target.points);
                break;
            }
        }
    }

    addScore(points) {
        this.score += points;
        this.updateScore();
    }

    createTargets() {
        const targets = [];
        const rows = 3;
        const columns = 6;
        const targetWidth = 110;
        const targetHeight = 28;
        const gapX = 18;
        const gapY = 16;
        const totalWidth = columns * targetWidth + (columns - 1) * gapX;
        const startX = (this.canvas.width - totalWidth) / 2;
        const startY = 70;

        for (let row = 0; row < rows; row++) {
            for (let column = 0; column < columns; column++) {
                const x = startX + column * (targetWidth + gapX);
                const y = startY + row * (targetHeight + gapY);
                const target = new Target(x, y, targetWidth, targetHeight);
                targets.push(target);
            }
        }

        return targets;
    }

    gameLoop(timestamp) {
        const deltaTime = (timestamp - this.lastTime) / 1000;

        this.lastTime = timestamp;

        this.update(deltaTime);
        this.render();

        this.animationFrameId = requestAnimationFrame(this.gameLoop);
    }

    update(deltaTime) {
        if (this.state !== "playing") {
            return;
        }
        this.paddle.update(this.input, deltaTime);
        this.ball.update(deltaTime);
        if(this.ball.isOutOfBottom()) {
            this.loseLife();
            return;
        }
        this.handleCollisions();
        this.handleTargetCollisions();
        this.checkWinCondition();
    }

    loseLife() {
        this.lives--;
        this.updateLives();
        if (this.lives <= 0) {
            this.state = "gameOver";
            this.updateStatus();
            return;
        }
        this.ball.reset();
        this.paddle.reset();
    }

    checkWinCondition() {
        const allTargetDestroyed = this.targets.every(target => !target.active);
        if (allTargetDestroyed) {
            this.state = "won";
            this.updateStatus("Bạn đã chiến thắng!");
        }
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
        this.drawLevelText();

        for (const target of this.targets) {
            target.draw(this.ctx);
        }

        this.paddle.draw(this.ctx);
        this.ball.draw(this.ctx);

        if (this.state === "won" || this.state === "gameOver") {
            this.drawEndScreen();
        }
    }

    restart() {
        this.score = 0;
        this.lives = 3;
        this.state = "playing";
        this.targets = this.createTargets();
        this.ball.reset();
        this.updateUI();
    }

    drawEndScreen() {
        this.ctx.save();
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.textAlign = "center";
        this.ctx.fillStyle = "#ffffff";
        this.ctx.font = "bold 48px Arial";
        const title = this.state === "won" ? "Bạn thắng!" : "Thua rùi!";
        this.ctx.fillText(title, this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.font = "20px Arial";
        this.ctx.fillText("Nhấn 'Chơi lại' để chơi lại", this.canvas.width / 2, this.canvas.height / 2 + 50);
        this.ctx.restore();
    }

    drawLevelText() {
        this.ctx.save();

        this.ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
        this.ctx.font = "16px Arial";
        this.ctx.textAlign = "center";

        this.ctx.fillText(
            `Màn ${this.level}`,
            this.canvas.width / 2,
            30
        );

        this.ctx.restore();
    }
}