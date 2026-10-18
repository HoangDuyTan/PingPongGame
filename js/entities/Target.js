export default class Target {
    constructor(x, y, width, height, points = 100, variant = 0, options = {}) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.points = points;
        this.variant = variant;
        this.active = true;

        // lv2
        this.startX = x;
        this.moving = options.moving ?? false;
        this.speed = options.speed ?? 0;
        this.moveRange = options.moveRange ?? 0;
        this.direction = options.direction ?? 1;

        // lv4
        this.blinking = options.blinking ?? false;
        this.visibleTime = options.visibleTime ?? 1.5;
        this.hiddenTime = options.hiddenTime ?? 1;
        this.visible = true;
        this.blinkTimer = 0;

        // lv7
        this.type = options.type ?? "normal";
    }

    hit() {
        this.active = false;
    }

    getPalette() {
        const palettes = [
            {main: "red", dark: "darkred", light: "pink"},
            {main: "orange", dark: "brown", light: "yellow"},
            {main: "green", dark: "darkgreen", light: "lightgreen"}
        ];

        return palettes[this.variant % palettes.length];
    }

    update(deltaTime) {
        if (!this.active) {
            return;
        }

        // Level 2
        if (this.moving) {
            this.x += this.speed * this.direction * deltaTime;

            const minX = this.startX - this.moveRange;
            const maxX = this.startX + this.moveRange;

            if (this.x <= minX) {
                this.x = minX;
                this.direction = 1;
            }

            if (this.x >= maxX) {
                this.x = maxX;
                this.direction = -1;
            }
        }

        // Level 4
        if (this.blinking) {
            this.blinkTimer += deltaTime;
            const duration = this.visible ? this.visibleTime : this.hiddenTime;

            if (this.blinkTimer >= duration) {
                this.blinkTimer = 0;
                this.visible = !this.visible;
            }
        }
    }

    draw(ctx) {
        if (!this.active || !this.visible) {
            return;
        }

        const {main, dark, light} = this.getPalette();

        ctx.save();
        ctx.fillStyle = "black";
        ctx.fillRect(this.x + 2, this.y + 2, this.width, this.height);

        // Viền
        ctx.fillStyle = dark;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Thân
        ctx.fillStyle = main;
        ctx.fillRect(this.x + 2, this.y + 2, this.width - 4, this.height - 4);

        // Phần hightlight trên
        ctx.fillStyle = light;
        ctx.fillRect(this.x + 4, this.y + 4, this.width - 8, 3);

        // Phần tối dưới đít
        ctx.fillStyle = dark;
        ctx.fillRect(this.x + 4, this.y + this.height - 6, this.width - 8, 3);

        // bomb & trap
        if (this.type === "bomb") {
            ctx.fillStyle = "red";
            ctx.fillRect(this.x + 2, this.y + 2, this.width - 4, this.height - 4);
        } else if (this.type === "trap") {
            ctx.fillStyle = "purple";
            ctx.fillRect(this.x + 2, this.y + 2, this.width - 4, this.height - 4);
        }

        ctx.restore();
    }
}