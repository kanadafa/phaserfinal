let waveIndex = 0;
let stageIndex = 0;
let enemies;
let player;
let cursors;
let keyA, keyS, keyD, keyW,keyX,keySpace;
let bullets;
let playerBullets;
let lastWaveCleared = false;
let boss        = null;   // 指向當前關卡的 Boss
let bossAlive   = false;  // 是否仍在場
let bossBullets;          // 給 Boss 的子彈
const speed = 300;
const bulletsize = 10;

//第一關
const waveDataone = [
    [
        { type: 'a', x: 120, y: 100 },
        { type: 'a', x: 240, y: 100 },
        { type: 'a', x: 360, y: 100 },
        { type: 'a', x: 480, y: 100 }
    ],
    [
        { type: 'b', x: 100, y: 100 },
        { type: 'a', x: 200, y: 180 },
        { type: 'b', x: 300, y: 100 },
        { type: 'a', x: 400, y: 180 },
        { type: 'b', x: 500, y: 100 }
    ],
    [
        { type: 'b', x: 120, y: 100 },
        { type: 'b', x: 240, y: 100 },
        { type: 'b', x: 360, y: 100 },
        { type: 'b', x: 480, y: 100 }
    ],
    [
        { type: 'a', x: 100, y: 250 },
        { type: 'c', x: 170, y: 80 },
        { type: 'a', x: 300, y: 150 },
        { type: 'c', x: 430, y: 80 },
        { type: 'a', x: 500, y: 250 }
    ],
    [
        { type: 'a', x: 100, y: 80 },
        { type: 'b', x: 200, y: 230 },
        { type: 'c', x: 300, y: 100 },
        { type: 'b', x: 400, y: 230 },
        { type: 'a', x: 500, y: 80 }
    ]
];
//第二關
const waveDatatwo = [
    [
        { type: 'd', x: 120, y: 300 },
        { type: 'e', x: 240, y: 100 },
        { type: 'e', x: 360, y: 100 },
        { type: 'd', x: 480, y: 300 }
    ],
    [
        { type: 'e', x: 100, y: 100 },
        { type: 'd', x: 200, y: 100 },
        { type: 'e', x: 300, y: 100 },
        { type: 'd', x: 400, y: 100 },
        { type: 'e', x: 500, y: 100 }
    ],
    [
        { type: 'f', x: 80, y: 300 },
        { type: 'f', x: 220, y: 100 },
        { type: 'f', x: 380, y: 100 },
        { type: 'f', x: 520, y: 300 }
    ],
    [
        { type: 'e', x: 100, y: 100 },
        { type: 'f', x: 200, y: 100 },
        { type: 'd', x: 300, y: 100 },
        { type: 'f', x: 400, y: 100 },
        { type: 'e', x: 500, y: 100 }
    ],
    [
        { type: 'f', x: 100, y: 100 },
        { type: 'e', x: 200, y: 100 },
        { type: 'f', x: 300, y: 100 },
        { type: 'e', x: 400, y: 100 },
        { type: 'f', x: 500, y: 100 }
    ]
];
//第三關
const waveDatathree = [
    [
        { type: 'h', x: 120, y: 200 },
        { type: 'h', x: 240, y: 100 },
        { type: 'h', x: 360, y: 100 },
        { type: 'h', x: 480, y: 200 }
    ],
    [
        { type: 'i', x: 100, y: 100 },
        { type: 'i', x: 200, y: 200 },
        { type: 'i', x: 300, y: 250 },
        { type: 'i', x: 400, y: 200 },
        { type: 'i', x: 500, y: 100 }
    ],
    [
        { type: 'g', x: 120, y: 300 },
        { type: 'h', x: 240, y: 100 },
        { type: 'h', x: 360, y: 100 },
        { type: 'g', x: 480, y: 300 }
    ],
    [
        { type: 'h', x: 100, y: 120 },
        { type: 'g', x: 200, y: 140 },
        { type: 'g', x: 300, y: 160 },
        { type: 'g', x: 400, y: 140 },
        { type: 'h', x: 500, y: 120 }
    ],
    [
        { type: 'i', x: 100, y: 200 },
        { type: 'g', x: 200, y: 100 },
        { type: 'i', x: 300, y: 200 },
        { type: 'g', x: 400, y: 100 },
        { type: 'i', x: 500, y: 200 }
    ]
];

const stages = [
    { bgKey: 'sky', waves: waveDataone },
    { bgKey: 'sky2', waves: waveDatatwo },
    { bgKey: 'sky3', waves: waveDatathree }
];
/*
const bosses = [
    { key: 'boss1', hp: 500, shootFn: startPhase2AttackCycle },
    { key: 'boss2', hp: 800, shootFn: startBoss2 },
    { key: 'boss3', hp: 1200, shootFn: startBoss3 }
];
function boss1Pattern(){
 
}*/