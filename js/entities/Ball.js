export default class Ball {
    constructor(canvas) {
        this.canvas = canvas;
        this.radius = 10;
        this.speed = 300;
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.reset();
    }

    reset() {
        this.x = this.canvas.width / 2;
        this.y = this.canvas.height / 2;
        this.vx = this.speed;
        this.vy = -this.speed;
    }

    update(deltaTime) {
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        this.checkWallCollision();

        if (this.isOutOfBottom()) {
            this.reset();
        }
    }

    checkWallCollision() {
        // Tường trái
        if (this.x - this.radius <= 0) {
            this.x = this.radius;
            this.vx *= -1;
        }

        // Phải
        if (this.x + this.radius >= this.canvas.width) {
            this.x = this.canvas.width - this.radius;
            this.vx *= -1;
        }

        if (this.y - this.radius <= 0) {
            this.y = this.radius;
            this.vy *= -1;
        }
    }

    isOutOfBottom() {
        return this.y - this.radius > this.canvas.height;
    }

    draw(ctx) {
        ctx.save();
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}