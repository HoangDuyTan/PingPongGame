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
        const moveSpeed = this.rage ? this.speed + 50 : this.speed;

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
        const currentShotInterval = this.rage ? 1 : this.shotInterval;
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
        let vx = (targetX - startX) * 0.8;
        const vy = this.rage ? 340 : 270;

        if (vx < -200) {
            vx = -200;
        }
        if (vx > 200) {
            vx = 200;
        }

        return {x: startX, y: startY, vx, vy};
    }

    createSpreadShot() {
        const x = this.x + this.width / 2;
        const y = this.y + this.height;
        const speed = this.rage ? 330 : 270;

        return [
            {x, y, vx: -130, vy: speed},
            {x, y, vx: 0, vy: speed},
            {x, y, vx: 130, vy: speed}
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

        const noseColor = this.rage ? "red" : "cyan";

        // Tai
        ctx.fillStyle = "gray";
        ctx.fillRect(this.x - 15, this.y + 35, 25, 30);
        ctx.fillRect(this.x + this.width - 10, this.y + 35, 25, 30);

        // Đầu
        ctx.fillStyle = "darkslategray";
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Mắt
        ctx.fillStyle = "red";
        ctx.fillRect(this.x + 40, this.y + 40, 25, 7);
        ctx.fillRect(this.x + this.width - 65, this.y + 40, 25, 7);

        // Mũi
        ctx.fillStyle = noseColor;
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + 58, 15, 0, Math.PI * 2);
        ctx.fill();

        // Miệng
        ctx.fillStyle = "black";
        ctx.fillRect(this.x + 50, this.y + 75, this.width - 100, 7);

        // HP
        const hpPercent = this.hp / this.maxHp;
        ctx.fillStyle = "black";
        ctx.fillRect(this.x, this.y - 20, this.width, 10);
        ctx.fillStyle = this.rage ? "red" : "limegreen";
        ctx.fillRect(this.x, this.y - 20, this.width * hpPercent, 10);
        ctx.strokeStyle = "white";
        ctx.strokeRect(this.x, this.y - 20, this.width, 10);

        ctx.restore();
    }
}
