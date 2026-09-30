export default class Boss {
    constructor(canvas, config) {
        this.canvas = canvas;
        this.width = config.width;
        this.height = config.height;
        this.x = (canvas.width - this.width) / 2;
        this.y = config.y;

        this.maxHp = config.hp;
        this.hp = this.maxHp;
        this.speed = config.speed;
        this.direction = 1;

        this.damagePerHit = config.damagePerHit;
        this.shotInterval = config.shotInterval;
        this.spreadInterval = config.spreadInterval;
        this.shotTimer = 0;
        this.spreadTimer = 0;
        this.rage = false;
    }

    update(deltaTime, paddle) {
        const attacks = [];
        this.rage = this.hp <= this.maxHp / 2;
        const moveSpeed = this.rage ? this.speed * 1.5 : this.speed;

        this.x += moveSpeed * this.direction * deltaTime;

        if (this.x <= 30) {
            this.x = 30;
            this.direction = 1;
        }

        if (this.x + this.width >= this.canvas.width - 30) {
            this.x = this.canvas.width - this.width - 30;
            this.direction = -1;
        }

        // Skill 1
        this.shotTimer += deltaTime;
        const currentShotInterval = this.rage ? this.shotInterval * 0.6 : this.shotInterval;
        if (this.shotTimer >= currentShotInterval) {
            this.shotTimer = 0;
            attacks.push(this.createAimShot(paddle));
        }

        // Skill 2
        this.spreadTimer += deltaTime;
        if (this.spreadTimer >= this.spreadInterval) {
            this.spreadTimer = 0;
            attacks.push(...this.createSpreadShot());
        }

        return attacks;
    }

    createAimShot(paddle) {
        const startX = this.x + this.width / 2;
        const startY = this.y + this.height;
        const targetX = paddle.x + paddle.width / 2;
        const targetY = paddle.y;
        const dx = targetX - startX;
        const dy = targetY - startY;
        const distance = Math.hypot(dx, dy);
        const speed = this.rage ? 340 : 270;

        return {
            x: startX,
            y: startY,
            vx: dx / distance * speed,
            vy: dy / distance * speed
        };
    }

    createSpreadShot() {
        const x = this.x + this.width / 2;
        const y = this.y + this.height;
        const speed = this.rage ? 330 : 270;

        return [
            {
                x,
                y,
                vx: -130,
                vy: speed
            },
            {
                x,
                y,
                vx: 0,
                vy: speed
            },
            {
                x,
                y,
                vx: 130,
                vy: speed
            }
        ];
    }

    takeDamage(amount) {
        this.hp -= amount;
        if (this.hp < 0) {
            this.hp = 0;
        }
    }

    draw(ctx) {
        if (this.hp <= 0) {
            return;
        }

        ctx.save();

        const coreColor = this.rage ? "#ef4444" : "#22d3ee";

        // Bóng
        ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
        ctx.fillRect(this.x + 6, this.y + 6, this.width,this.height);

        // Hai khẩu pháo
        ctx.fillStyle = "#475569";
        ctx.fillRect(this.x - 18, this.y + 35, 30, 35);
        ctx.fillRect(this.x + this.width - 12, this.y + 35, 30, 35);

        // Thân
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Giáp
        ctx.fillStyle = "#64748b";
        ctx.fillRect(this.x + 12, this.y + 12, this.width - 24, 20);

        // Mắt
        ctx.fillStyle = "#ef4444";
        ctx.fillRect(this.x + 40, this.y + 40, 25, 8);
        ctx.fillRect(this.x + this.width - 65, this.y + 40, 25, 8);

        // lõi
        ctx.fillStyle = coreColor;
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + 58, 17, 0, Math.PI * 2);
        ctx.fill();

        // Miệng / Hạ bộ
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(this.x + 50, this.y + 75, this.width - 100, 8);

        // HP
        const hpPercent = this.hp / this.maxHp;
        ctx.fillStyle = "#111827";
        ctx.fillRect(this.x, this.y - 22, this.width, 10);
        ctx.fillStyle = this.rage ? "#ef4444" : "#22c55e";
        ctx.fillRect(this.x, this.y - 22, this.width * hpPercent, 10);
        ctx.strokeStyle = "#ffffff";
        ctx.strokeRect(this.x, this.y - 22, this.width, 10);

        ctx.restore();
    }
}