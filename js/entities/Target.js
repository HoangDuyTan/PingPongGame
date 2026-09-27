export default class Target {
    constructor(x, y, width, height, points = 100) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.points = points;
        this.active = true;
    }

    hit() {
        this.active = false;
    }

    draw(ctx) {
        if (!this.active) {
            return;
        }
        ctx.save();
        ctx.fillStyle = "#22d3ee";
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.restore();
    }
}