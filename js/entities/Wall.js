export default class Wall {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    draw(ctx) {
        ctx.save();

        // Border
        ctx.fillStyle = "brown";
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Body
        ctx.fillStyle = "orange";
        ctx.fillRect(this.x + 3, this.y + 3, this.width - 6, this.height - 6);

        // Highlight
        ctx.fillStyle = "yellow";
        ctx.fillRect(this.x + 5, this.y + 5, this.width - 10, 3);

        ctx.restore();
    }
}
