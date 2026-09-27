export function isBallCollidingWithPaddle(ball, paddle) {
    const nearestX = Math.max(paddle.x, Math.min(ball.x, paddle.x + paddle.width));
    const nearestY = Math.max(paddle.y, Math.min(ball.y, paddle.y + paddle.height));
    const dx = ball.x - nearestX;
    const dy = ball.y - nearestY;
    return dx * dx + dy * dy <= ball.radius * ball.radius;
}