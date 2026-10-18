export default class Portal {
    constructor(x, y, radius, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }

    draw(ctx) {
        ctx.save();

        // Viền ngoài
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.lineWidth = 6;
        ctx.strokeStyle = this.color;
        ctx.stroke();

        // Viền trong
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius - 10, 0, Math.PI * 2);
        ctx.lineWidth = 2;
        ctx.strokeStyle = "white";
        ctx.stroke();

        ctx.restore();
    }
}
