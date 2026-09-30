export default class GravityZone {
    constructor(x, y, width, height, forceX, forceY = 0) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.forceX = forceX;
        this.forceY = forceY;
    }

    contains(ball) {
        return (
            ball.x >= this.x &&
            ball.x <= this.x + this.width &&
            ball.y >= this.y &&
            ball.y <= this.y + this.height
        );
    }

    draw(ctx) {
        ctx.save();

        ctx.fillStyle = "rgba(56, 189, 248, 0.12)";
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        ctx.fillStyle = "#38bdf8";
        ctx.font = "bold 16px monospace";
        ctx.textAlign = "center";
        const arrow = this.forceX > 0 ? ">>>>>" : "<<<<<";
        ctx.fillText(arrow, this.x + this.width / 2, this.y + this.height / 2);

        ctx.restore();
    }
}