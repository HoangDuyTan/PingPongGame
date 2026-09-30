export default class Ball {
    constructor(canvas) {
        this.canvas = canvas;
        this.radius = 10;
        this.speed = 300;
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.preX = 0;
        this.preY = 0;
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
        ctx.save();
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}