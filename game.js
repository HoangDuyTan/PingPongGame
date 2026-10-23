function isBallCollidingWithRectangle(ball, rectangle) {
    return (
        ball.x + ball.radius >= rectangle.x &&
        ball.x - ball.radius <= rectangle.x + rectangle.width &&
        ball.y + ball.radius >= rectangle.y &&
        ball.y - ball.radius <= rectangle.y + rectangle.height
    );
}

function isBallCollidingWithPaddle(ball, paddle) {
    return isBallCollidingWithRectangle(ball, paddle);
}

function isBallCollidingWithTarget(ball, target) {
    if (!target.active) {
        return false;
    }

    return isBallCollidingWithRectangle(ball, target);
}

function getBallRectangleCollisionSide(ball, rectangle) {
    if (!isBallCollidingWithRectangle(ball, rectangle)) {
        return null;
    }

    const previousLeft = ball.preX - ball.radius;
    const previousRight = ball.preX + ball.radius;
    const previousTop = ball.preY - ball.radius;
    const previousBottom = ball.preY + ball.radius;

    if (previousBottom <= rectangle.y) {
        return "top";
    }

    if (previousTop >= rectangle.y + rectangle.height) {
        return "bottom";
    }

    if (previousRight <= rectangle.x) {
        return "left";
    }

    if (previousLeft >= rectangle.x + rectangle.width) {
        return "right";
    }

    return null;
}


class Input {
    constructor() {
        this.keys = {};
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        window.addEventListener("keydown", this.handleKeyDown);
        window.addEventListener("keyup", this.handleKeyUp);
    }

    handleKeyDown(event) {
        this.keys[event.code] = true;
    }

    handleKeyUp(event) {
        this.keys[event.code] = false;
    }

    isKeyPressed(code) {
        return this.keys[code] === true;
    }
}


class Paddle {
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
            this.vx = 0;
        }

        if (this.x + this.width > this.canvas.width) {
            this.x = this.canvas.width - this.width;
            this.vx = 0;
        }
    }

    draw(ctx) {
        ctx.save();

        // Viền
        ctx.fillStyle = "darkblue";
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Thân
        ctx.fillStyle = "dodgerblue";
        ctx.fillRect(this.x + 2, this.y + 2, this.width - 4, this.height - 4);

        // Highlight
        ctx.fillStyle = "white";
        ctx.fillRect(this.x + 5, this.y + 3, this.width - 10, 2);

        // Bóng dưới đít
        ctx.fillStyle = "blue";
        ctx.fillRect(this.x + 5, this.y + this.height - 4, this.width - 10, 2);

        ctx.restore();
    }

    reset() {
        this.x = (this.canvas.width - this.width) / 2;
        this.vx = 0;
    }
}


class Ball {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.radius = 10;
        this.speed = 300;
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.preX = 0;
        this.preY = 0;

        // lv6
        this.blinking = options.blinking ?? false;
        this.visibleTime = options.visibleTime ?? 2.5;
        this.hiddenTime = options.hiddenTime ?? 1;
        this.visible = true;
        this.blinkTimer = 0;

        this.reset();
    }

    reset() {
        this.x = this.canvas.width / 2;
        this.y = this.canvas.height / 2;
        this.preX = this.x;
        this.preY = this.y;
        this.vx = this.speed * 0.7;
        this.vy = -this.speed * 0.7;
    }

    update(deltaTime) {
        this.preX = this.x;
        this.preY = this.y;
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        this.checkWallCollision();

        // lv6
        if (this.blinking) {
            this.blinkTimer += deltaTime;
            const duration = this.visible ? this.visibleTime : this.hiddenTime;

            if (this.blinkTimer >= duration) {
                this.blinkTimer = 0;
                this.visible = !this.visible;
            }
        }
    }

    checkWallCollision() {
        // Tường trái
        if (this.x - this.radius <= 0) {
            this.x = this.radius;
            this.vx *= -1;
        }

        // Phải
        if (this.x + this.radius >= this.canvas.width) {
            this.x = this.canvas.width - this.radius;
            this.vx *= -1;
        }

        if (this.y - this.radius <= 0) {
            this.y = this.radius;
            this.vy *= -1;
        }
    }

    bounceFromPaddle(paddle) {
        const paddleCenter = paddle.x + paddle.width / 2;
        let direction = (this.x - paddleCenter) / (paddle.width / 2);

        if (paddle.vx < 0) {
            direction -= 0.2;
        } else if (paddle.vx > 0) {
            direction += 0.2;
        }

        if (direction < -1) {
            direction = -1;
        }
        if (direction > 1) {
            direction = 1;
        }

        this.vx = this.speed * direction;
        this.vy = -this.speed;
        this.y = paddle.y - this.radius;
    }

    isOutOfBottom() {
        return this.y - this.radius > this.canvas.height;
    }

    draw(ctx) {
        if (!this.visible) {
            return;
        }

        ctx.save();

        // Viền
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();

        // Màu bên trong
        ctx.fillStyle = "cyan";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius - 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}


class Target {
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


class Wall {
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


class Portal {
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


class GravityZone {
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

        ctx.strokeStyle = "cyan";
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);

        ctx.fillStyle = "cyan";
        ctx.font = "bold 16px monospace";
        ctx.textAlign = "center";
        const arrow = this.forceX > 0 ? ">>>>>" : "<<<<<";
        ctx.fillText(arrow, this.x + this.width / 2, this.y + this.height / 2);

        ctx.restore();
    }
}


class BossProjectile {
    constructor(x, y, vx, vy) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.radius = 7;
    }

    update(deltaTime) {
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
    }

    hitsPaddle(paddle) {
        return (
            this.x + this.radius >= paddle.x &&
            this.x - this.radius <= paddle.x + paddle.width &&
            this.y + this.radius >= paddle.y &&
            this.y - this.radius <= paddle.y + paddle.height
        );
    }

    isOutOfCanvas(canvas) {
        return this.x < 0 || this.x > canvas.width || this.y > canvas.height;
    }

    draw(ctx) {
        ctx.save();
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}


class Boss {
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


const LEVEL_OBJECTIVES = {
    1: {
        name: "Classic",
        objective: "Phá hủy toàn bộ mục tiêu để hoàn thành màn chơi.",
        mechanic: "Điều khiển paddle và thay đổi hướng bóng bằng vị trí va chạm.",
        tip: "Đánh bóng vào mép paddle để điều chỉnh hướng bóng chính xác hơn."
    },

    2: {
        name: "Moving Targets",
        objective: "Phá hủy toàn bộ mục tiêu đang di chuyển.",
        mechanic: "Các mục tiêu sẽ liên tục di chuyển sang trái và phải.",
        tip: "Quan sát hướng di chuyển của mục tiêu và đưa bóng tới vị trí mà mục tiêu sắp đi qua."
    },

    3: {
        name: "Wall Obstacles",
        objective: "Phá hủy toàn bộ mục tiêu phía sau các chướng ngại vật.",
        mechanic: "Các bức tường sẽ làm thay đổi hướng di chuyển của bóng.",
        tip: "Tận dụng góc phản xạ từ tường để đưa bóng tới những mục tiêu khó tiếp cận."
    },

    4: {
        name: "Invisible Targets",
        objective: "Phá hủy toàn bộ mục tiêu kể cả khi chúng tạm thời biến mất.",
        mechanic: "Các mục tiêu sẽ ẩn và hiện theo chu kỳ.",
        tip: "Ghi nhớ vị trí của mục tiêu trước khi chúng biến mất."
    },

    5: {
        name: "Multi Ball",
        objective: "Kiểm soát nhiều bóng cùng lúc và phá hủy toàn bộ mục tiêu.",
        mechanic: "Hai quả bóng sẽ cùng xuất hiện trên sân.",
        tip: "Ưu tiên giữ cả hai bóng trên sân để phá mục tiêu nhanh hơn, chỉ cần 1 bóng trên sân thì sau một thời gian bóng bị rơi sẽ hồi sinh, khi cả 2 bóng cùng rơi thì mới mất mạng."
    },

    6: {
        name: "Invisible Ball",
        objective: "Phá hủy toàn bộ mục tiêu trong khi bóng có thể biến mất.",
        mechanic: "Bóng sẽ tạm thời vô hình nhưng vẫn tiếp tục di chuyển.",
        tip: "Theo dõi hướng và tốc độ của bóng trước khi nó biến mất để dự đoán vị trí tiếp theo."
    },

    7: {
        name: "Bomb & Trap",
        objective: "Tận dụng bom để phá mục tiêu và xoay xở khi dính bẫy.",
        mechanic: "Bom có thể phá nhiều mục tiêu, trong khi bẫy làm chậm người chơi.",
        tip: "Đưa bóng tới bom khi có nhiều mục tiêu xung quanh nhưng tránh các khu vực có bẫy."
    },

    8: {
        name: "Portal",
        objective: "Sử dụng các cổng dịch chuyển để đưa bóng tới những vị trí thuận lợi.",
        mechanic: "Bóng đi vào một portal sẽ xuất hiện tại portal còn lại.",
        tip: "Quan sát vị trí cổng ra để dự đoán hướng tiếp theo của bóng."
    },

    9: {
        name: "Gravity Zone",
        objective: "Phá hủy toàn bộ mục tiêu trong môi trường có lực tác động lên bóng.",
        mechanic: "Các vùng trọng lực hoặc gió sẽ làm thay đổi quỹ đạo của bóng.",
        tip: "Đừng chỉ nhìn hướng hiện tại của bóng, hãy tính cả lực đang tác động lên nó."
    },

    10: {
        name: "Boss Battle",
        objective: "Đánh bóng vào Boss cho đến khi thanh máu của Boss về 0.",
        mechanic: "Boss có thể di chuyển và tấn công. Nếu người chơi hết máu, trận đấu kết thúc.",
        tip: "Ưu tiên né đòn của Boss nhưng vẫn giữ ít nhất 1 bóng trong sân để duy trì sát thương."
    }
};

function getLevelObjective(level) {
    return LEVEL_OBJECTIVES[level] || LEVEL_OBJECTIVES[1];
}


const LEVEL_CONFIGS = {
        1: {
            targets: {
                rows: 3,
                columns: 6,
                width: 80,
                height: 20,
                gapX: 50,
                gapY: 20,
                startY: 70,

                moving: false,
                speed: 0,
                moveRange: 0,

                blinking: false,
            },

            walls: []
        },

        2: {
            targets: {
                rows: 4,
                columns: 6,
                width: 80,
                height: 20,
                gapX: 100,
                gapY: 60,
                startY: 70,

                moving: true,
                speed: 70,
                moveRange: 45,

                blinking: false,
            },

            walls: []
        },

        3: {
            targets: {
                rows: 4,
                columns: 5,
                width: 50,
                height: 20,
                gapX: 100,
                gapY: 70,
                startY: 70,

                moving: true,
                speed: 90,
                moveRange: 90,

                blinking: false,
            },

            walls: [
                {
                    x: 220,
                    y: 230,
                    width: 25,
                    height: 150
                },

                {
                    x: 655,
                    y: 230,
                    width: 25,
                    height: 150
                },

                {
                    x: 370,
                    y: 315,
                    width: 160,
                    height: 22
                }
            ]
        },

        4: {
            targets: {
                rows: 5,
                columns: 3,
                width: 80,
                height: 20,
                gapX: 200,
                gapY: 80,
                startY: 70,

                moving: true,
                speed: 30,
                moveRange: 30,

                blinking: true,
                visibleTime: 4,
                hiddenTime: 3
            },

            walls: [
                {
                    x: 200,
                    y: 430,
                    width: 125,
                    height: 25
                },

                {
                    x: 655,
                    y: 430,
                    width: 125,
                    height: 25
                },
            ]
        },

        5: {
            targets: {
                rows: 6,
                columns: 6,
                width: 80,
                height: 20,
                gapX: 50,
                gapY: 20,
                startY: 70,

                moving: false,
                speed: 0,
                moveRange: 0,

                blinking: true
            },

            walls: [
                {
                    x: 180,
                    y: 330,
                    width: 125,
                    height: 25
                },

                {
                    x: 655,
                    y: 130,
                    width: 125,
                    height: 25
                },
            ],

            balls: {
                count: 2
            }
        },

        6: {
            targets: {
                rows: 7,
                columns: 6,
                width: 80,
                height: 20,
                gapX: 50,
                gapY: 20,
                startY: 70,

                moving: true,
                speed: 40,
                moveRange: 20,

                blinking: false
            },

            walls: [
                {
                    x: 305,
                    y: 250,
                    width: 300,
                    height: 25
                },
            ],

            balls: {
                count: 1,
                blinking: true,
                visibleTime: 2.5,
                hiddenTime: 1
            }
        },

        7: {
            targets: {
                rows: 5,
                columns: 6,
                width: 70,
                height: 20,
                gapX: 60,
                gapY: 60,
                startY: 100,

                moving: true,
                speed: 100,
                moveRange: 80,

                blinking: false
            },

            walls: [
                {
                    x: 220,
                    y: 200,
                    width: 25,
                    height: 150
                },
                {
                    x: 655,
                    y: 200,
                    width: 25,
                    height: 150
                },
                {
                    x: 370,
                    y: 115,
                    width: 160,
                    height: 22
                },
                {
                    x: 370,
                    y: 415,
                    width: 160,
                    height: 22
                }
            ],

            balls: {
                count: 1
            },

            specialTargets: {
                bombs: [2, 14, 22],
                traps: [8, 17, 20, 23, 11],
                bombRadius: 130
            }
        },

        8: {
            targets: {
                rows: 6,
                columns: 5,
                width: 70,
                height: 20,
                gapX: 80,
                gapY: 45,
                startY: 100,

                moving: false,
                speed: 0,
                moveRange: 0,

                blinking: false
            },

            walls: [
                {
                    x: 305,
                    y: 250,
                    width: 200,
                    height: 25
                },
            ],

            balls: {
                count: 1
            },

            specialTargets: {
                bombs: [2, 14],
                traps: [8, 20],
                bombRadius: 130
            },

            portals: [
                {
                    x: 120,
                    y: 350,
                    radius: 30,
                    color: "cyan"
                },
                {
                    x: 780,
                    y: 350,
                    radius: 30,
                    color: "purple"
                },
                {
                    x: 700,
                    y: 100,
                    radius: 30,
                    color: "purple"
                },
                {
                    x: 220,
                    y: 150,
                    radius: 30,
                    color: "cyan"
                },
            ]
        },

        9: {
            targets: {
                rows: 4,
                columns: 7,
                width: 50,
                height: 20,
                gapX: 90,
                gapY: 55,
                startY: 70,

                moving: false,
                speed: 0,
                moveRange: 0,

                blinking: true
            },

            walls: [],

            balls: {
                count: 1
            },

            portals: [
                {
                    x: 780,
                    y: 350,
                    radius: 30,
                    color: "purple"
                },
                {
                    x: 220,
                    y: 100,
                    radius: 30,
                    color: "cyan"
                },
            ],

            gravityZones: [
                {
                    x: 100,
                    y: 170,
                    width: 280,
                    height: 220,
                    forceX: 140,
                    forceY: 0
                },

                {
                    x: 520,
                    y: 170,
                    width: 280,
                    height: 220,
                    forceX: -140,
                    forceY: 0
                }
            ]
        },

        10: {
            targets: {
                rows: 0,
                columns: 1,
                width: 70,
                height: 20,
                gapX: 0,
                gapY: 0,
                startY: 70,

                moving: false,
                speed: 0,
                moveRange: 0,

                blinking: false
            },

            walls: [],

            balls: {
                count: 2
            },

            portals: [
                {
                    x: 200,
                    y: 100,
                    radius: 30,
                    color: "cyan"
                },
                {
                    x: 750,
                    y: 350,
                    radius: 40,
                    color: "purple"
                },
            ],

            gravityZones: [
                {
                    x: 100,
                    y: 170,
                    width: 280,
                    height: 300,
                    forceX: 140,
                    forceY: 0
                },
            ],

            boss: {
                width: 180,
                height: 90,
                y: 75,

                hp: 350,
                speed: 100,
                damagePerHit: 25,
                shotInterval: 1.5,
                spreadInterval: 5
            }
        },
    }
;

class LevelManager {
    constructor(level) {
        this.level = level;
    }

    getConfig() {
        return LEVEL_CONFIGS[this.level] || LEVEL_CONFIGS[1];
    }

    getWallConfig() {
        return this.getConfig().walls || [];
    }

    getTargetConfig() {
        return this.getConfig().targets;
    }

    getBallConfig() {
        return this.getConfig().balls || {count: 1};
    }

    getSpecialTargetConfig() {
        return this.getConfig().specialTargets || {
            bombs: [],
            traps: [],
            bombRadius: 0
        };
    }

    getPortalConfig() {
        return this.getConfig().portals || [];
    }

    getGravityZoneConfig() {
        return this.getConfig().gravityZones || [];
    }

    getBossConfig() {
        return this.getConfig().boss || null;
    }
}


class Game {
    constructor(canvas, level, ui) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.level = level;
        this.levelManager = new LevelManager(this.level);
        this.objective = getLevelObjective(this.level);
        this.state = "ready";
        this.score = 0;
        this.lives = 3;

        this.ctx.imageSmoothingEnabled = false;
        this.backgroundImage = new Image();
        this.backgroundLoaded = false;
        this.loadBackground();
        this.ui = ui;

        this.input = new Input();
        this.paddle = new Paddle(canvas);
        this.normalPaddleSpeed = this.paddle.speed;
        this.trapTimer = 0;
        this.trapDuration = 5;

        this.balls = this.createBalls();
        this.ballRespawnTimer = null;
        this.ballRespawnDelay = 2;

        this.targets = this.createTargets();
        this.walls = this.createWalls();
        this.portals = this.createPortals();
        this.gravityZones = this.createGravityZones();

        this.boss = this.createBoss();
        this.bossProjectiles = [];
        this.playerHitCooldown = 0;

        this.lastTime = 0;
        this.animationFrameId = null;
        this.screenButtons = {};
        this.gameLoop = this.gameLoop.bind(this);
    }

    start() {
        this.state = "objective";
        this.lastTime = performance.now();
        this.animationFrameId = requestAnimationFrame(this.gameLoop);
    }

    beginLevel() {
        if (this.state !== "objective") {
            return;
        }

        this.state = "playing";
    }

    addScore(points) {
        this.score += points;
        this.updateScore();
    }

    gameLoop(timestamp) {
        const deltaTime = (timestamp - this.lastTime) / 1000;

        this.lastTime = timestamp;

        this.update(deltaTime);
        this.render();

        this.animationFrameId = requestAnimationFrame(this.gameLoop);
    }

    loseLife() {
        this.lives--;
        this.updateLives();
        if (this.lives <= 0) {
            this.state = "gameOver";
            return;
        }

        this.ballRespawnTimer = null;
        this.balls = this.createBalls();

        this.trapTimer = 0;
        this.paddle.speed = this.normalPaddleSpeed;
    }

    checkWinCondition() {
        if (this.boss) {
            if (this.boss.hp <= 0) {
                this.state = "won";
            }
            return;
        }

        const allTargetDestroyed = this.targets.every(target => !target.active);
        if (allTargetDestroyed) {
            this.state = "won";
        }
    }

    // CREATE
    createTargets() {
        const targets = [];
        const config = this.levelManager.getTargetConfig();
        const specialConfig = this.levelManager.getSpecialTargetConfig();

        const rows = config.rows;
        const columns = config.columns;
        const targetWidth = config.width;
        const targetHeight = config.height;
        const gapX = config.gapX;
        const gapY = config.gapY;
        const totalWidth = columns * targetWidth + (columns - 1) * gapX;
        const startX = (this.canvas.width - totalWidth) / 2;

        for (let row = 0; row < rows; row++) {
            const direction = row % 2 === 0 ? 1 : -1;

            for (let column = 0; column < columns; column++) {
                const x = startX + column * (targetWidth + gapX);
                const y = config.startY + row * (targetHeight + gapY);
                const index = row * columns + column;

                let type = "normal";

                if (specialConfig.bombs.includes(index)) {
                    type = "bomb";
                }

                if (specialConfig.traps.includes(index)) {
                    type = "trap";
                }

                const target = new Target(x, y, targetWidth, targetHeight, 100, row, {
                    // lv2
                    moving: config.moving,
                    speed: config.speed,
                    moveRange: config.moveRange,
                    direction,

                    // lv4
                    blinking: config.blinking,
                    visibleTime: config.visibleTime,
                    hiddenTime: config.hiddenTime,

                    // lv7
                    type,
                });

                targets.push(target);
            }
        }

        return targets;
    }

    explodeBomb(bomb) {
        const config = this.levelManager.getSpecialTargetConfig();

        for (const target of this.targets) {
            if (!target.active) {
                continue;
            }

            const bombX = bomb.x + bomb.width / 2;
            const bombY = bomb.y + bomb.height / 2;
            const targetX = target.x + target.width / 2;
            const targetY = target.y + target.height / 2;
            const nearX = Math.abs(targetX - bombX) <= config.bombRadius;
            const nearY = Math.abs(targetY - bombY) <= config.bombRadius;

            if (nearX && nearY) {
                target.hit();
                this.addScore(target.points);
            }
        }
    }

    createWalls() {
        const wallConfigs = this.levelManager.getWallConfig();

        return wallConfigs.map(config => {
            return new Wall(config.x, config.y, config.width, config.height);
        });
    }

    createPortals() {
        const portalConfigs = this.levelManager.getPortalConfig();

        return portalConfigs.map(config => {
            return new Portal(config.x, config.y, config.radius, config.color);
        });
    }

    createGravityZones() {
        const configs = this.levelManager.getGravityZoneConfig();

        return configs.map(config => {
            return new GravityZone(config.x, config.y, config.width, config.height, config.forceX, config.forceY);
        });
    }

    createBoss() {
        const config = this.levelManager.getBossConfig();

        if (!config) {
            return null;
        }

        return new Boss(this.canvas, config);
    }


    createBalls() {
        const config = this.levelManager.getBallConfig();
        const balls = [];

        for (let i = 0; i < config.count; i++) {
            const ball = new Ball(this.canvas, {
                blinking: config.blinking, visibleTime: config.visibleTime, hiddenTime: config.hiddenTime
            });

            if (config.count > 1) {
                const direction = i % 2 === 0 ? -1 : 1;
                ball.vx = direction * ball.speed * 0.5;
                ball.vy = -ball.speed * 0.8;
            }

            balls.push(ball);
        }

        return balls;
    }

    // UPDATE
    update(deltaTime) {
        if (this.state !== "playing") {
            return;
        }

        this.paddle.update(this.input, deltaTime);
        if (this.trapTimer > 0) {
            this.trapTimer -= deltaTime;

            if (this.trapTimer <= 0) {
                this.trapTimer = 0;
                this.paddle.speed = this.normalPaddleSpeed;
            }
        }

        for (const target of this.targets) {
            target.update(deltaTime);
        }

        if (this.boss) {
            const attacks = this.boss.update(deltaTime, this.paddle);
            for (const attack of attacks) {
                this.bossProjectiles.push(new BossProjectile(attack.x, attack.y, attack.vx, attack.vy));
            }
        }

        for (const projectile of this.bossProjectiles) {
            projectile.update(deltaTime);
        }

        if (this.playerHitCooldown > 0) {
            this.playerHitCooldown -= deltaTime;
        }

        for (const ball of this.balls) {
            ball.update(deltaTime);

            if ((ball.portalCooldown ?? 0) > 0) {
                ball.portalCooldown -= deltaTime;
            }

            this.handleCollisions(ball);
            this.handleWallCollisions(ball);
            this.handlePortalCollisions(ball);
            this.handleGravityZones(ball, deltaTime);
            this.handleBossCollision(ball);
            this.handleTargetCollisions(ball);
        }

        this.handleBossProjectiles();
        this.bossProjectiles = this.bossProjectiles.filter(projectile => !projectile.isOutOfCanvas(this.canvas));

        const hasLostBall = this.balls.some(ball => ball.isOutOfBottom());
        if (hasLostBall) {
            this.handleLostBalls();
        }

        if (this.ballRespawnTimer !== null && this.state === "playing") {
            this.ballRespawnTimer -= deltaTime;

            if (this.ballRespawnTimer <= 0) {
                const ballConfig = this.levelManager.getBallConfig();

                while (this.balls.length < ballConfig.count) {
                    const newBall = new Ball(this.canvas, ballConfig);
                    newBall.x = this.paddle.x + this.paddle.width / 2;
                    newBall.y = this.paddle.y - newBall.radius - 5;
                    newBall.preX = newBall.x;
                    newBall.preY = newBall.y;

                    const otherBall = this.balls[0];
                    newBall.vx = otherBall.vx > 0 ? -150 : 150;
                    newBall.vy = -250;

                    this.balls.push(newBall);
                }

                this.ballRespawnTimer = null;
            }
        }

        if (this.state !== "playing") {
            return;
        }

        this.checkWinCondition();
    }

    updateScore() {
        if (this.ui?.score) {
            this.ui.score.textContent = this.score;
        }
    }

    updateLives() {
        if (this.ui?.lives) {
            this.ui.lives.textContent = this.lives;
        }
    }

    updateUI() {
        this.updateScore();
        this.updateLives();
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawBackground();

        for (const zone of this.gravityZones) {
            zone.draw(this.ctx);
        }

        for (const wall of this.walls) {
            wall.draw(this.ctx);
        }

        for (const portal of this.portals) {
            portal.draw(this.ctx);
        }

        for (const target of this.targets) {
            target.draw(this.ctx);
        }

        if (this.boss) {
            this.boss.draw(this.ctx);
        }
        for (const projectile of this.bossProjectiles) {
            projectile.draw(this.ctx);
        }

        this.paddle.draw(this.ctx);
        for (const ball of this.balls) {
            ball.draw(this.ctx);
        }

        const screenStates = ["objective", "paused", "won", "gameOver",];
        if (screenStates.includes(this.state)) {
            this.drawScreen(this.state);
        }
    }

    restart() {
        this.score = 0;
        this.lives = 3;
        this.state = "playing";
        this.screenButtons = {};
        this.targets = this.createTargets();

        this.boss = this.createBoss();
        this.bossProjectiles = [];
        this.playerHitCooldown = 0;

        this.balls = this.createBalls();
        this.ballRespawnTimer = null;

        this.trapTimer = 0;
        this.paddle.speed = this.normalPaddleSpeed;
        this.paddle.reset();
        if (this.ui?.pauseButton) {
            this.ui.pauseButton.textContent = "Tạm dừng";
        }
        this.updateUI();
    }

    togglePause() {
        if (this.state === "won" || this.state === "gameOver") {
            return;
        }

        if (this.state === "playing") {
            this.state = "paused";

            if (this.ui?.pauseButton) {
                this.ui.pauseButton.textContent = "Tiếp tục";
            }

            return;
        }

        if (this.state === "paused") {
            this.state = "playing";

            if (this.ui?.pauseButton) {
                this.ui.pauseButton.textContent = "Tạm dừng";
            }
        }
    }

    // HANDLE
    handleCollisions(ball) {
        const ballIsMovingDown = ball.vy > 0;
        const ballWasAbovePaddle = ball.preY + ball.radius <= this.paddle.y;

        if (ballIsMovingDown && ballWasAbovePaddle && isBallCollidingWithPaddle(ball, this.paddle)) {
            ball.bounceFromPaddle(this.paddle);
        }
    }

    handleTargetCollisions(ball) {
        for (const target of this.targets) {
            if (!target.active) {
                continue;
            }

            if (isBallCollidingWithTarget(ball, target)) {
                target.hit();
                this.addScore(target.points);

                // lv7 - bomb
                if (target.type === "bomb") {
                    this.explodeBomb(target);
                }

                // lv7 - trap
                if (target.type === "trap") {
                    this.paddle.speed = 150;
                    this.trapTimer = this.trapDuration;
                }

                ball.vy *= -1;
                break;
            }
        }
    }

    handleWallCollisions(ball) {
        for (const wall of this.walls) {
            const side = getBallRectangleCollisionSide(ball, wall);

            if (!side) {
                continue;
            }

            this.bounceBall(ball, wall, side);
            break;
        }
    }

    bounceBall(ball, rectangle, side) {
        if (side === "top") {
            ball.y = rectangle.y - ball.radius;
            ball.vy = -Math.abs(ball.vy);
        }

        if (side === "bottom") {
            ball.y = rectangle.y + rectangle.height + ball.radius;
            ball.vy = Math.abs(ball.vy);
        }

        if (side === "left") {
            ball.x = rectangle.x - ball.radius;
            ball.vx = -Math.abs(ball.vx);
        }

        if (side === "right") {
            ball.x = rectangle.x + rectangle.width + ball.radius;
            ball.vx = Math.abs(ball.vx);
        }
    }

    handleBossCollision(ball) {
        if (!this.boss || this.boss.hp <= 0) {
            return;
        }

        const side = getBallRectangleCollisionSide(ball, this.boss);

        if (!side) {
            return;
        }

        this.boss.takeDamage(this.boss.damagePerHit);
        this.bounceBall(ball, this.boss, side);
    }

    handleBossProjectiles() {
        if (this.playerHitCooldown > 0) {
            return;
        }

        for (let i = this.bossProjectiles.length - 1; i >= 0; i--) {
            const projectile = this.bossProjectiles[i];

            if (!projectile.hitsPaddle(this.paddle)) {
                continue;
            }

            this.bossProjectiles.splice(i, 1);
            this.lives--;
            this.updateLives();
            this.playerHitCooldown = 1;

            if (this.lives <= 0) {
                this.state = "gameOver";
            }

            return;
        }
    }

    handleCanvasClick(x, y) {
        if (this.state === "objective") {
            this.beginLevel();
            return;
        }

        if (this.state !== "won") {
            return;
        }

        const menuButton = this.screenButtons.menu;
        const nextButton = this.screenButtons.next;

        if (menuButton && x >= menuButton.x && x <= menuButton.x + menuButton.width && y >= menuButton.y && y <= menuButton.y + menuButton.height) {
            window.location.href = "index.html";
            return;
        }

        if (nextButton && x >= nextButton.x && x <= nextButton.x + nextButton.width && y >= nextButton.y && y <= nextButton.y + nextButton.height) {
            window.location.href = `index.html?level=${this.level + 1}`;
        }
    }

    handleLostBalls() {
        this.balls = this.balls.filter(ball => !ball.isOutOfBottom());
        if (this.balls.length === 0) {
            this.ballRespawnTimer = null;
            this.loseLife();
            return;
        }

        if (this.ballRespawnTimer === null) {
            this.ballRespawnTimer = this.ballRespawnDelay;
        }
    }

    handlePortalCollisions(ball) {
        if ((ball.portalCooldown ?? 0) > 0) {
            return;
        }

        for (let i = 0; i < this.portals.length; i += 2) {
            const portalA = this.portals[i];
            const portalB = this.portals[i + 1];

            if (!portalB) {
                continue;
            }

            const rangeA = ball.radius + portalA.radius;
            const rangeB = ball.radius + portalB.radius;
            const insideA = Math.abs(ball.x - portalA.x) <= rangeA && Math.abs(ball.y - portalA.y) <= rangeA;
            const insideB = Math.abs(ball.x - portalB.x) <= rangeB && Math.abs(ball.y - portalB.y) <= rangeB;

            let exitPortal = null;
            if (insideA) {
                exitPortal = portalB;
            } else if (insideB) {
                exitPortal = portalA;
            }

            if (!exitPortal) {
                continue;
            }

            ball.x = exitPortal.x;
            ball.y = exitPortal.y;
            ball.preX = ball.x;
            ball.preY = ball.y;
            ball.portalCooldown = 0.3;

            break;
        }
    }

    handleGravityZones(ball, deltaTime) {
        for (const zone of this.gravityZones) {
            if (!zone.contains(ball)) {
                continue;
            }

            ball.vx += zone.forceX * deltaTime;
            ball.vy += zone.forceY * deltaTime;

            const maxSpeed = 420;

            if (ball.vx > maxSpeed) {
                ball.vx = maxSpeed;
            }
            if (ball.vx < -maxSpeed) {
                ball.vx = -maxSpeed;
            }
            if (ball.vy > maxSpeed) {
                ball.vy = maxSpeed;
            }
            if (ball.vy < -maxSpeed) {
                ball.vy = -maxSpeed;
            }
        }
    }

    // DRAW
    drawScreen(state) {
        let title = "";
        let subtitle = "";
        let color = "white";
        let text = "";
        let panelHeight = 230;

        if (state === "objective") {
            title = `LEVEL ${this.level}`;
            subtitle = this.objective.name.toUpperCase();
            color = "cyan";
            panelHeight = 500;
        } else if (state === "paused") {
            title = "TẠM DỪNG";
            color = "orange";
            text = "Nhấn Tiếp tục hoặc Space để chơi tiếp";
        } else if (state === "won") {
            title = "BẠN THẮNG!";
            color = "limegreen";
            text = "Bạn đã hoàn thành màn chơi.";
        } else if (state === "gameOver") {
            title = "GAME OVER";
            color = "red";
            text = "Bạn đã hết mạng.";
        } else {
            return;
        }

        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const panelWidth = 660;
        const panelX = centerX - panelWidth / 2;
        const panelY = centerY - panelHeight / 2;
        this.ctx.save();

        // Overlay
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Panel
        this.ctx.fillStyle = "midnightblue";
        this.ctx.fillRect(panelX, panelY, panelWidth, panelHeight);

        // Border
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";

        // Tiêu đề
        this.ctx.fillStyle = color;
        this.ctx.font = "bold 38px monospace";
        this.ctx.fillText(title, centerX, panelY + 50);
        let currentY = panelY + 100;

        // Phụ đề
        if (subtitle) {
            this.ctx.fillStyle = "white";
            this.ctx.font = "bold 22px monospace";
            this.ctx.fillText(subtitle, centerX, currentY);
            currentY += 50;
        }

        // Sections
        if (state === "objective") {
            const labels = [
                ["MỤC TIÊU", this.objective.objective, "orange"],
                ["CƠ CHẾ", this.objective.mechanic, "violet"],
                ["GỢI Ý", this.objective.tip, "cyan"]
            ];

            for (const item of labels) {
                this.ctx.fillStyle = item[2];
                this.ctx.font = "bold 15px monospace";
                this.ctx.fillText(item[0], centerX, currentY);
                currentY += 25;

                this.ctx.fillStyle = "white";
                this.ctx.font = "16px Arial";
                const lines = this.drawWrappedText(item[1], centerX, currentY, 540, 22);
                currentY += lines * 22 + 25;
            }
        } else {
            this.ctx.fillStyle = "white";
            this.ctx.font = "16px Arial";
            this.drawWrappedText(text, centerX, currentY, 540, 22);
        }

        // Mẹo
        if (state === "objective") {
            this.ctx.fillStyle = "limegreen";
            this.ctx.font = "bold 14px monospace";
            this.ctx.fillText("ENTER / CLICK ĐỂ BẮT ĐẦU", centerX, panelY + panelHeight - 28);
        } else if (state === "gameOver") {
            this.ctx.fillStyle = "limegreen";
            this.ctx.font = "bold 14px monospace";
            this.ctx.fillText("Nhấn Chơi lại hoặc F5 để thử lại", centerX, panelY + panelHeight - 28);
        }

        if (state === "won") {
            const buttonWidth = 180;
            const buttonHeight = 42;
            const gap = 20;
            const buttonY = panelY + panelHeight - 65;
            const hasNextLevel = this.level < 10;
            const menuX = hasNextLevel ? centerX - buttonWidth - gap / 2 : centerX - buttonWidth / 2;

            // Menu button
            this.ctx.fillStyle = "gray";
            this.ctx.fillRect(menuX, buttonY, buttonWidth, buttonHeight);
            this.ctx.strokeStyle = "white";
            this.ctx.strokeRect(menuX, buttonY, buttonWidth, buttonHeight);
            this.ctx.fillStyle = "white";
            this.ctx.font = "bold 13px monospace";
            this.ctx.fillText("QUAY LẠI MENU", menuX + buttonWidth / 2, buttonY + buttonHeight / 2);
            this.screenButtons.menu = {x: menuX, y: buttonY, width: buttonWidth, height: buttonHeight};

            // Next level
            if (hasNextLevel) {
                const nextX = centerX + gap / 2;
                this.ctx.fillStyle = "blue";
                this.ctx.fillRect(nextX, buttonY, buttonWidth, buttonHeight);
                this.ctx.strokeStyle = "white";
                this.ctx.strokeRect(nextX, buttonY, buttonWidth, buttonHeight);
                this.ctx.fillStyle = "white";
                this.ctx.fillText("MÀN TIẾP THEO", nextX + buttonWidth / 2, buttonY + buttonHeight / 2);
                this.screenButtons.next = {x: nextX, y: buttonY, width: buttonWidth, height: buttonHeight};
            } else {
                delete this.screenButtons.next;
            }
        }

        this.ctx.restore();
    }

    drawWrappedText(text, x, y, maxWidth, lineHeight) {
        const words = text.split(" ");
        let line = "";
        const lines = [];

        for (const word of words) {
            const testLine = line ? `${line} ${word}` : word;
            const testWidth = this.ctx.measureText(testLine).width;

            if (testWidth > maxWidth && line !== "") {
                lines.push(line);
                line = word;
            } else {
                line = testLine;
            }
        }

        if (line) {
            lines.push(line);
        }

        lines.forEach((currentLine, index) => {
            this.ctx.fillText(currentLine, x, y + index * lineHeight);
        });

        return lines.length;
    }

    loadBackground() {
        const imagePath = `assets/images/lv${this.level}.webp`;

        this.backgroundImage.onload = () => {
            this.backgroundLoaded = true;
        };

        this.backgroundImage.onerror = () => {
            this.backgroundLoaded = false;
        };

        this.backgroundImage.src = imagePath;
    }

    drawBackground() {
        if (this.backgroundLoaded) {
            this.ctx.drawImage(this.backgroundImage, 0, 0, this.canvas.width, this.canvas.height);
            return;
        }

        this.ctx.fillStyle = "navy";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
}


const canvas = document.getElementById("gameCanvas");
const levelNumber = document.getElementById("levelNumber");
const livesElement = document.getElementById("lives");
const restartButton = document.getElementById("restartButton");
const pauseButton = document.getElementById("pauseButton");
const scoreElement = document.getElementById("score");
const gameHeader = document.querySelector(".game-header");
const gameInfo = document.querySelector(".game-info");

const ui = {
    score: scoreElement,
    lives: livesElement,
    pauseButton: pauseButton
};

function getSelectedLevel() {
    const params = new URLSearchParams(window.location.search);
    const level = Number(params.get("level"));

    if (Number.isInteger(level) && level >= 1 && level <= 10) {
        return level;
    }

    return 1;
}

function resizeCanvas() {
    const ratio = canvas.width / canvas.height;
    const sideSpace = 30;
    const bottomSpace = 30;
    const topHeight = gameHeader.offsetHeight + gameInfo.offsetHeight + 55;

    let width = Math.max(200, window.innerWidth - sideSpace);
    let height = Math.max(180, window.innerHeight - topHeight - bottomSpace);

    if (width / ratio > height) {
        width = height * ratio;
    } else {
        height = width / ratio;
    }

    canvas.style.width = `${Math.floor(width)}px`;
    canvas.style.height = `${Math.floor(height)}px`;
}

if (!canvas) {
    throw new Error("Can't find a canvas object");
}

const menuPage = document.getElementById("menuPage");
const gamePage = document.getElementById("gamePage");
const hasLevel = new URLSearchParams(window.location.search).has("level");

if (hasLevel) {
    gamePage.hidden = false;
    document.title = "Ping Pong";
    const selectedLevel = getSelectedLevel();
    levelNumber.textContent = selectedLevel;

    const game = new Game(canvas, selectedLevel, ui);

    canvas.addEventListener("click", event => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = (event.clientX - rect.left) * canvas.width / rect.width;
        const mouseY = (event.clientY - rect.top) * canvas.height / rect.height;
        game.handleCanvasClick(mouseX, mouseY);
    });

    restartButton.addEventListener("click", () => game.restart());
    pauseButton.addEventListener("click", () => game.togglePause());

    window.addEventListener("keydown", event => {
        if (event.code === "Enter" && !event.repeat) {
            event.preventDefault();
            game.beginLevel();
        }

        if (event.code === "Space" && !event.repeat) {
            event.preventDefault();
            game.togglePause();
        }
    });

    window.addEventListener("resize", resizeCanvas);

    resizeCanvas();
    game.start();
} else {
    menuPage.hidden = false;
}