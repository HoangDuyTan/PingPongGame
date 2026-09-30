export default class Paddle {
    constructor(canvas) {
        this.canvas = canvas;
        this.width = 130;
        this.height = 15;
        this.x = (canvas.width - this.width) / 2;
        this.y = canvas.height - 50;
        this.vx = 0;
        this.speed = 500;
    }

    update(input, deltaTime) {
        let direction = 0;

        if (input.isKeyPressed("ArrowLeft") || input.isKeyPressed("KeyA")) {
            direction -= 1;
        }
        if (input.isKeyPressed("ArrowRight") || input.isKeyPressed("KeyD")) {
            direction += 1;
        }

        this.vx = direction * this.speed;
        this.x += this.vx * deltaTime;
        this.keepInsideCanvas();
    }

    keepInsideCanvas() {
        if (this.x < 0) {
            this.x = 0;
            if (this.vx < 0) {
                this.vx = 0;
            }
        }

        if (this.x + this.width > this.canvas.width) {
            this.x = this.canvas.width - this.width;
            if (this.vx > 0) {
                this.vx = 0;
            }
        }
    }

    draw(ctx) {
        ctx.save();

        // Bóng
        ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
        ctx.fillRect(this.x + 4, this.y + 4, this.width, this.height);

        // Viền
        ctx.fillStyle = "#1e3a8a";
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Thân
        ctx.fillStyle = "#3b82f6";
        ctx.fillRect(this.x + 2, this.y + 2, this.width - 4, this.height - 4);

        // Highlight
        ctx.fillStyle = "#93c5fd";
        ctx.fillRect(this.x + 6, this.y + 4, this.width - 12, 4);

        // Bóng dưới đít
        ctx.fillStyle = "#1d4ed8";
        ctx.fillRect(this.x + 6, this.y + this.height - 6, this.width - 12, 3);

        ctx.restore();
    }

    reset() {
        this.x = (this.canvas.width - this.width) / 2;
        this.vx = 0;
    }
}