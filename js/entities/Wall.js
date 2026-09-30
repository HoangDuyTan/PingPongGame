export default class Wall {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    draw(ctx) {
        ctx.save();

        // Bóng
        ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
        ctx.fillRect(this.x + 4, this.y + 4, this.width, this.height);

        // Border
        ctx.fillStyle = "#78350f";
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Body
        ctx.fillStyle = "#ff8437";
        ctx.fillRect(this.x + 3, this.y + 3, this.width - 6, this.height - 6);

        // Highlight
        ctx.fillStyle = "#fdba74";
        ctx.fillRect(this.x + 5, this.y + 5, this.width - 10, 4);

        ctx.restore();
    }
}