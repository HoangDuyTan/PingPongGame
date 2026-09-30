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
        ctx.fillStyle = "#4f8cff";
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.restore();
    }

    reset() {
        this.x = (this.canvas.width - this.width) / 2;
        this.vx = 0;
    }
}