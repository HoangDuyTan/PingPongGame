import Game from "./core/Game.js"

const canvas = document.getElementById("gameCanvas");
const levelNumber = document.getElementById("levelNumber");
const  gameStatus = document.getElementById("gameStatus");
const scoreElement = document.getElementById("score");
const ui = {score: scoreElement}

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

const game = new Game(canvas, selectedLevel, ui);
game.start();