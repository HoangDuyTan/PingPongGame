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
            moveRange: 90
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

};

export default class LevelManager {
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
}