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
            moveRange: 0
        }
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
            moveRange: 45
        }
    }
};

export default class LevelManager {
    constructor(level) {
        this.level = level;
    }

    getConfig() {
        return LEVEL_CONFIGS[this.level] || LEVEL_CONFIGS[1];
    }

    getTargetConfig() {
        return this.getConfig().targets;
    }
}