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
    }
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

    getBallConfig() {
        return this.getConfig().balls || {count: 1};
    }
}