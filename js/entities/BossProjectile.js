export default class BossProjectile {
    constructor(x, y, vx, vy) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = 7;
    }

    update(deltaTime) {
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
    }

    hitsPaddle(paddle) {
        return (
            this.x + this.radius >= paddle.x &&
            this.x - this.radius <= paddle.x + paddle.width &&
            this.y + this.radius >= paddle.y &&
            this.y - this.radius <= paddle.y + paddle.height
        );
    }

    isOutOfCanvas(canvas) {
        return this.x < 0 || this.x > canvas.width || this.y > canvas.height;
    }

    draw(ctx) {
        ctx.save();
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}