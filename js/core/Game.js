import Input from "./Input.js";

import Paddle from "../entities/Paddle.js";
import Ball from "../entities/Ball.js";
import Target from "../entities/Target.js";

import {isBallCollidingWithPaddle, isBallCollidingWithTarget} from "./Collision.js";

export default class Game {
    constructor(canvas, level, ui) {
        this.canvas = canvas;
        this.input = new Input();
        this.paddle = new Paddle(canvas);
        this.ball = new Ball(canvas);
        this.targets = this.createTargets();
        this.score = 0;
        this.ui = ui;
        this.ctx = canvas.getContext("2d");

        this.level = level;
        this.state = "Sẵn sàng";

        this.lastTime = 0;
        this.animationFrameId = null;

        this.gameLoop = this.gameLoop.bind(this);
    }

    start() {
        this.state = "Đang chơi";
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

        if (this.ui?.score) {
            this.ui.score.textContent = this.score;
        }
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
        this.paddle.update(this.input, deltaTime);
        this.ball.update(deltaTime);
        this.handleCollisions();
        this.handleTargetCollisions();
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawLevelText();

        for (const target of this.targets) {
            target.draw(this.ctx);
        }

        this.paddle.draw(this.ctx);
        this.ball.draw(this.ctx);
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