export default class Target {
    constructor(x, y, width, height, points = 100, variant = 0) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.points = points;
        this.variant = variant;
        this.active = true;
    }

    hit() {
        this.active = false;
    }

    getPalette() {
        const palettes = [
            {
                main: "#ef4444",
                dark: "#991b1b",
                light: "#fca5a5"
            },
            {
                main: "#f59e0b",
                dark: "#92400e",
                light: "#fde68a"
            },
            {
                main: "#22c55e",
                dark: "#166534",
                light: "#bbf7d0"
            }
        ];

        return palettes[this.variant % palettes.length];
    }

    draw(ctx) {
        if (!this.active) {
            return;
        }

        const { main, dark, light } = this.getPalette();

        ctx.save();
        ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
        ctx.fillRect(this.x + 3, this.y + 3, this.width, this.height);

        // Viền
        ctx.fillStyle = dark;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Thân
        ctx.fillStyle = main;
        ctx.fillRect(this.x + 2, this.y + 2, this.width - 4, this.height - 4);

        // Phần bóng
        ctx.fillStyle = light;
        ctx.fillRect(this.x + 4, this.y + 4, this.width - 8, 5);

        // Phần tối dưới đít
        ctx.fillStyle = dark;
        ctx.fillRect(this.x + 4, this.y + this.height - 8, this.width - 8, 4);

        ctx.restore();
    }
}