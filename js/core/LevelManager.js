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
        },

        6: {
            targets: {
                rows: 7,
                columns: 6,
                width: 80,
                height: 20,
                gapX: 50,
                gapY: 20,
                startY: 70,

                moving: true,
                speed: 40,
                moveRange: 20,

                blinking: false
            },

            walls: [
                {
                    x: 305,
                    y: 250,
                    width: 300,
                    height: 25
                },
            ],

            balls: {
                count: 1,
                blinking: true,
                visibleTime: 2.5,
                hiddenTime: 1
            }
        },

        7: {
            targets: {
                rows: 5,
                columns: 6,
                width: 70,
                height: 20,
                gapX: 60,
                gapY: 60,
                startY: 100,

                moving: true,
                speed: 100,
                moveRange: 80,

                blinking: false
            },

            walls: [
                {
                    x: 220,
                    y: 200,
                    width: 25,
                    height: 150
                },
                {
                    x: 655,
                    y: 200,
                    width: 25,
                    height: 150
                },
                {
                    x: 370,
                    y: 115,
                    width: 160,
                    height: 22
                },
                {
                    x: 370,
                    y: 415,
                    width: 160,
                    height: 22
                }
            ],

            balls: {
                count: 1
            },

            specialTargets: {
                bombs: [2, 14, 22],
                traps: [8, 17, 20, 23, 2, 11, 48],
                bombRadius: 130
            }
        },

        8: {
            targets: {
                rows: 6,
                columns: 5,
                width: 70,
                height: 20,
                gapX: 80,
                gapY: 45,
                startY: 100,

                moving: false,
                speed: 0,
                moveRange: 0,

                blinking: false
            },

            walls: [
                {
                    x: 305,
                    y: 250,
                    width: 300,
                    height: 25
                },
            ],

            balls: {
                count: 1
            },

            specialTargets: {
                bombs: [2, 14],
                traps: [8, 20, 11],
                bombRadius: 130
            },

            portals: [
                {
                    x: 120,
                    y: 350,
                    radius: 30,
                    color: "#22d3ee"
                },
                {
                    x: 780,
                    y: 350,
                    radius: 30,
                    color: "#a855f7"
                },
                {
                    x: 680,
                    y: 100,
                    radius: 30,
                    color: "#a855f7"
                },
                {
                    x: 220,
                    y: 100,
                    radius: 30,
                    color: "#22d3ee"
                },
            ]
        },

        9: {
            targets: {
                rows: 4,
                columns: 7,
                width: 50,
                height: 20,
                gapX: 90,
                gapY: 55,
                startY: 70,

                moving: false,
                speed: 0,
                moveRange: 0,

                blinking: true
            },

            walls: [],

            balls: {
                count: 1
            },

            portals: [
                {
                    x: 780,
                    y: 350,
                    radius: 30,
                    color: "#a855f7"
                },
                {
                    x: 220,
                    y: 100,
                    radius: 30,
                    color: "#22d3ee"
                },
            ],

            gravityZones: [
                {
                    x: 100,
                    y: 170,
                    width: 280,
                    height: 220,
                    forceX: 140,
                    forceY: 0
                },

                {
                    x: 520,
                    y: 170,
                    width: 280,
                    height: 220,
                    forceX: -140,
                    forceY: 0
                }
            ]
        }
    }
;

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

    getSpecialTargetConfig() {
        return this.getConfig().specialTargets || {
            bombs: [],
            traps: [],
            bombRadius: 0
        };
    }

    getPortalConfig() {
        return this.getConfig().portals || [];
    }

    getGravityZoneConfig() {
        return this.getConfig().gravityZones || [];
    }
}