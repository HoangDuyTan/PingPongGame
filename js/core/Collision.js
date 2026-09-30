function isBallCollidingWithRectangle(ball, rectangle) {
    const nearestX = Math.max(rectangle.x, Math.min(ball.x, rectangle.x + rectangle.width));
    const nearestY = Math.max(rectangle.y, Math.min(ball.y, rectangle.y + rectangle.height));
    const dx = ball.x - nearestX;
    const dy = ball.y - nearestY;

    return (dx * dx + dy * dy <= ball.radius * ball.radius);
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