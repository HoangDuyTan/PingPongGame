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