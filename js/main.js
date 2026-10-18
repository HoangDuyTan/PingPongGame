import Game from "./core/Game.js";

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