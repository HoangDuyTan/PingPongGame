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
        const angle = Math.PI /4;
        this.vx = this.speed * Math.cos(angle);
        this.vy = -this.speed * Math.sin(angle);
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
                this.blinkTimer -= duration;
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
        let relativeHit = (this.x - paddleCenter) / (paddle.width / 2);
        relativeHit = Math.max(-1, Math.min(1, relativeHit));
        const paddleMovement = paddle.vx / paddle.speed;
        const paddleInfluence = 0.25;

        let direction = relativeHit + paddleMovement * paddleInfluence;
        direction = Math.max(-1, Math.min(1, direction));

        const maxBounceAngle = 65 * Math.PI / 180;
        const bounceAngle = relativeHit * maxBounceAngle;

        this.vx = this.speed * Math.sin(bounceAngle);
        this.vy = -this.speed * Math.cos(bounceAngle);
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

        // Bóng
        ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
        ctx.beginPath();
        ctx.arc(this.x + 3, this.y + 3, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Viền
        ctx.fillStyle = "#e2e8f0";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Màu bên trong
        ctx.fillStyle = "#67e8f9";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius - 3, 0, Math.PI * 2);
        ctx.fill();

        // highlight
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(this.x - 3, this.y - 5, 3, 3);
        ctx.fillRect(this.x, this.y - 2, 2, 2);

        ctx.restore();
    }
}