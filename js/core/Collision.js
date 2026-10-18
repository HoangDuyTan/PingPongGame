function isBallCollidingWithRectangle(ball, rectangle) {
    return (
        ball.x + ball.radius >= rectangle.x &&
        ball.x - ball.radius <= rectangle.x + rectangle.width &&
        ball.y + ball.radius >= rectangle.y &&
        ball.y - ball.radius <= rectangle.y + rectangle.height
    );
}

export function isBallCollidingWithPaddle(ball, paddle) {
    return isBallCollidingWithRectangle(ball, paddle);
}

export function isBallCollidingWithTarget(ball, target) {
    if (!target.active) {
        return false;
    }

    return isBallCollidingWithRectangle(ball, target);
}

export function getBallRectangleCollisionSide(ball, rectangle) {
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