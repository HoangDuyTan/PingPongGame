export default class Ball {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.radius = 10;
        this.speed = 300;
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.preX = 0;
        this.preY = 0;

        // lv6
        this.blinking = options.blinking ?? false;
        this.visibleTime = options.visibleTime ?? 2.5;
        this.hiddenTime = options.hiddenTime ?? 1;
        this.visible = true;
        this.blinkTimer = 0;

        this.reset();
    }

    reset() {
        this.x = this.canvas.width / 2;
        this.y = this.canvas.height / 2;
        this.preX = this.x;
        this.preY = this.y;
        this.vx = this.speed * 0.7;
        this.vy = -this.speed * 0.7;
    }

    update(deltaTime) {
        this.preX = this.x;
        this.preY = this.y;
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        this.checkWallCollision();

        // lv6
        if (this.blinking) {
            this.blinkTimer += deltaTime;
            const duration = this.visible ? this.visibleTime : this.hiddenTime;

            if (this.blinkTimer >= duration) {
                this.blinkTimer = 0;
                this.visible = !this.visible;
            }
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

    bounceFromPaddle(paddle) {
        const paddleCenter = paddle.x + paddle.width / 2;
        let direction = (this.x - paddleCenter) / (paddle.width / 2);

        if (paddle.vx < 0) {
            direction -= 0.2;
        } else if (paddle.vx > 0) {
            direction += 0.2;
        }

        if (direction < -1) {
            direction = -1;
        }
        if (direction > 1) {
            direction = 1;
        }

        this.vx = this.speed * direction;
        this.vy = -this.speed;
        this.y = paddle.y - this.radius;
    }

    isOutOfBottom() {
        return this.y - this.radius > this.canvas.height;
    }

    draw(ctx) {
        if (!this.visible) {
            return;
        }

        ctx.save();

        // Viền
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Màu bên trong
        ctx.fillStyle = "cyan";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius - 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}
