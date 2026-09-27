export default class Game {
    constructor(canvas, level) {
        this.canvas = canvas;
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

    gameLoop(timeStamp) {
        const deltaTime = (timeStamp - this.lastTime) / 1000;
        this.lastTime = timeStamp;
        this.update(deltaTime);
        this.render();
        this.animationFrameId = requestAnimationFrame(this.gameLoop);
    }

    update(deltaTime) {

    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawCenterLine();
        this.drawLevelText();
    }

    drawCenterLine() {
        const centerX = this.canvas.width / 2;
        this.ctx.save();
        this.ctx.strokeText = "rgba(255, 255, 255, 0.15)";
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([12, 12]);
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, 0);
        this.ctx.lineTo(centerX, this.canvas.height);
        this.ctx.stroke();
        this.ctx.restore();
    }

    drawLevelText() {
        this.ctx.save();
        this.ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
        this.ctx.font = "16px Arial";
        this.ctx.textAlign = "center";
        this.ctx.fillText('Màn $(this.level)', this.canvas.width / 2, 30);
        this.ctx.restore();
    }
}