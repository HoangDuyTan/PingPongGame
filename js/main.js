import Game from "./core/Game.js"

const canvas = document.getElementById("gameCanvas");
const levelNumber = document.getElementById("levelNumber");
const  gameStatus = document.getElementById("gameStatus");
const livesElement = document.getElementById("lives");
const restartButton = document.getElementById("restartButton");
const pauseButton = document.getElementById("pauseButton")
const scoreElement = document.getElementById("score");
const ui = {
    score: scoreElement,
    lives: livesElement,
    status: gameStatus,
    pauseButton: pauseButton,}

function getSelectedLevel() {
    const param = new URLSearchParams(window.location.search);
    const level = Number(param.get("level"));

    if (!Number.isInteger(level) || level < 1 || level > 10) {
        return 1;
    }

    return level;
}

if (!canvas) {
    throw new Error("Can't find a canvas object");
}

const selectedLevel = getSelectedLevel();
levelNumber.textContent = selectedLevel;
gameStatus.textContent = "Đang chơi";

//-----
const game = new Game(canvas, selectedLevel, ui);
canvas.addEventListener("click", event => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (event.clientX - rect.left) * scaleX;
    const mouseY = (event.clientY - rect.top) * scaleY;
    game.handleCanvasClick(mouseX, mouseY);
});

restartButton.addEventListener("click", () => {game.restart()})
pauseButton.addEventListener("click", () => {game.togglePause();});

window.addEventListener("keydown", event => {
    if (event.code === "Enter" && !event.repeat) {
        event.preventDefault();
        game.beginLevel();
        return;
    }

    if (event.code === "Space" && !event.repeat) {
        event.preventDefault();
        game.togglePause();
    }
});

requestAnimationFrame(() => {
   canvas.scrollIntoView({behavior: "auto", block: "center"});
   game.start();
});