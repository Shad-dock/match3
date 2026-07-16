// ============================================================
// 1. ДАННЫЕ УРОВНЕЙ (25 уровней, 5 типов)
// ============================================================
const LEVELS = [
    // ===== УРОВЕНЬ 1-5: НАЧАЛЬНЫЕ =====
    {
        id: 1,
        name: 'Уровень 1',
        type: 'moves',
        goal: 100,
        maxMoves: 10,
        timeLimit: 0,
        message: 'Набери 100 очков за 10 ходов!'
    },
    {
        id: 2,
        name: 'Уровень 2',
        type: 'time',
        goal: 200,
        maxMoves: 0,
        timeLimit: 30,
        message: 'Набери 200 очков за 30 секунд!'
    },
    {
        id: 3,
        name: 'Уровень 3',
        type: 'moves',
        goal: 300,
        maxMoves: 15,
        timeLimit: 0,
        message: 'Набери 300 очков за 15 ходов!'
    },
    {
        id: 4,
        name: 'Уровень 4',
        type: 'time',
        goal: 400,
        maxMoves: 0,
        timeLimit: 25,
        message: 'Набери 400 очков за 25 секунд!'
    },
    {
        id: 5,
        name: 'Уровень 5',
        type: 'moves',
        goal: 500,
        maxMoves: 20,
        timeLimit: 0,
        message: 'Набери 500 очков за 20 ходов!'
    },

    // ===== УРОВЕНЬ 6-10: С ПРЕПЯТСТВИЯМИ =====
    {
        id: 6,
        name: 'Ледяной уровень',
        type: 'blocks',
        goal: 0,
        maxMoves: 12,
        timeLimit: 0,
        blocksCount: 8,
        message: 'Разбей 8 льдин за 12 ходов! ❄️'
    },
    {
        id: 7,
        name: 'Скальный уровень',
        type: 'blocks',
        goal: 0,
        maxMoves: 15,
        timeLimit: 0,
        blocksCount: 12,
        message: 'Разбей 12 камней за 15 ходов! 🪨'
    },
    {
        id: 8,
        name: 'Ледяной уровень 2',
        type: 'blocks',
        goal: 0,
        maxMoves: 18,
        timeLimit: 0,
        blocksCount: 15,
        message: 'Разбей 15 льдин за 18 ходов! ❄️💪'
    },
    {
        id: 9,
        name: 'Скальный уровень 2',
        type: 'blocks',
        goal: 0,
        maxMoves: 20,
        timeLimit: 0,
        blocksCount: 18,
        message: 'Разбей 18 камней за 20 ходов! 🪨💪'
    },
    {
        id: 10,
        name: 'Ледяная пещера',
        type: 'blocks',
        goal: 0,
        maxMoves: 22,
        timeLimit: 0,
        blocksCount: 20,
        message: 'Разбей 20 льдин за 22 хода! 🏔️'
    },

    // ===== УРОВЕНЬ 11-15: С ИНГРЕДИЕНТАМИ =====
    {
        id: 11,
        name: 'Сбор яблок',
        type: 'collect',
        goal: 0,
        maxMoves: 12,
        timeLimit: 0,
        collectColor: 0,
        collectCount: 10,
        message: 'Собери 10 🔴 фигур за 12 ходов!'
    },
    {
        id: 12,
        name: 'Сбор апельсинов',
        type: 'collect',
        goal: 0,
        maxMoves: 14,
        timeLimit: 0,
        collectColor: 1,
        collectCount: 12,
        message: 'Собери 12 🔵 фигур за 14 ходов!'
    },
    {
        id: 13,
        name: 'Сбор урожая',
        type: 'collect',
        goal: 0,
        maxMoves: 16,
        timeLimit: 0,
        collectColor: 2,
        collectCount: 14,
        message: 'Собери 14 🟢 фигур за 16 ходов!'
    },
    {
        id: 14,
        name: 'Сбор звёзд',
        type: 'collect',
        goal: 0,
        maxMoves: 18,
        timeLimit: 0,
        collectColor: 3,
        collectCount: 16,
        message: 'Собери 16 🟡 фигур за 18 ходов!'
    },
    {
        id: 15,
        name: 'Сбор сокровищ',
        type: 'collect',
        goal: 0,
        maxMoves: 20,
        timeLimit: 0,
        collectColor: 4,
        collectCount: 18,
        message: 'Собери 18 🟣 фигур за 20 ходов!'
    },

    // ===== УРОВЕНЬ 16-20: С БОССАМИ =====
    {
        id: 16,
        name: 'Босс-слизень',
        type: 'boss',
        goal: 0,
        maxMoves: 15,
        timeLimit: 0,
        bombsRequired: 3,
        message: 'Активируй 3 бомбы за 15 ходов! 👾'
    },
    {
        id: 17,
        name: 'Босс-дракон',
        type: 'boss',
        goal: 0,
        maxMoves: 18,
        timeLimit: 0,
        bombsRequired: 5,
        message: 'Активируй 5 бомб за 18 ходов! 🐉'
    },
    {
        id: 18,
        name: 'Босс-голем',
        type: 'boss',
        goal: 0,
        maxMoves: 20,
        timeLimit: 0,
        bombsRequired: 7,
        message: 'Активируй 7 бомб за 20 ходов! 🗿'
    },
    {
        id: 19,
        name: 'Босс-демон',
        type: 'boss',
        goal: 0,
        maxMoves: 22,
        timeLimit: 0,
        bombsRequired: 9,
        message: 'Активируй 9 бомб за 22 хода! 👿'
    },
    {
        id: 20,
        name: 'Босс-титан',
        type: 'boss',
        goal: 0,
        maxMoves: 25,
        timeLimit: 0,
        bombsRequired: 10,
        message: 'Активируй 10 бомб за 25 ходов! ⚡'
    },

    // ===== УРОВЕНЬ 21-25: КОМБО =====
    {
        id: 21,
        name: 'Цепная реакция',
        type: 'combo',
        goal: 0,
        maxMoves: 15,
        timeLimit: 0,
        combosRequired: 5,
        message: 'Сделай 5 комбо за 15 ходов! 🔥'
    },
    {
        id: 22,
        name: 'Мастер комбо',
        type: 'combo',
        goal: 0,
        maxMoves: 18,
        timeLimit: 0,
        combosRequired: 8,
        message: 'Сделай 8 комбо за 18 ходов! 🔥🔥'
    },
    {
        id: 23,
        name: 'Эксперт комбо',
        type: 'combo',
        goal: 0,
        maxMoves: 20,
        timeLimit: 0,
        combosRequired: 10,
        message: 'Сделай 10 комбо за 20 ходов! 🔥🔥🔥'
    },
    {
        id: 24,
        name: 'Легенда комбо',
        type: 'combo',
        goal: 0,
        maxMoves: 22,
        timeLimit: 0,
        combosRequired: 12,
        message: 'Сделай 12 комбо за 22 хода! ⭐'
    },
    {
        id: 25,
        name: 'Комбо-король',
        type: 'combo',
        goal: 0,
        maxMoves: 25,
        timeLimit: 0,
        combosRequired: 15,
        message: 'Сделай 15 комбо за 25 ходов! 👑'
    }
];

// ============================================================
// 2. ОСНОВНЫЕ ПЕРЕМЕННЫЕ
// ============================================================
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreSpan = document.getElementById('scoreValue');
const movesSpan = document.getElementById('movesValue');
const timerSpan = document.getElementById('timerValue');
const levelTitleSpan = document.getElementById('levelTitle');
const levelGoalSpan = document.getElementById('levelGoal');

const ROWS = 8;
const COLS = 8;
let board = [];
let score = 0;
let moves = 0;
let maxMoves = 0;
let timeLeft = 0;
let timerInterval = null;
let selectedRow = -1;
let selectedCol = -1;
let isProcessing = false;
let currentMode = 'endless';
let currentLevel = 0;

// --- Дополнительные переменные для новых типов уровней ---
let blocks = [];
let blocksRemaining = 0;
let collectedCount = 0;
let bombsActivated = 0;
let totalCombos = 0;

// --- Анимационные переменные ---
let particles = [];
let matchCells = [];
let dropAnimations = [];
let bombSpawned = null;
let bombSpawnTimer = 0;
let isAnimating = false;
let lastFrameTime = 0;
const TARGET_FPS = 30;
let levelTimerInterval = null;

// --- Цвета ---
const COLORS = [
    { id: 0, emoji: '🔴', name: 'Красный', hex: '#ff4444' },
    { id: 1, emoji: '🔵', name: 'Синий', hex: '#4488ff' },
    { id: 2, emoji: '🟢', name: 'Зелёный', hex: '#44ff44' },
    { id: 3, emoji: '🟡', name: 'Жёлтый', hex: '#ffdd00' },
    { id: 4, emoji: '🟣', name: 'Фиолетовый', hex: '#cc66ff' }
];

// --- Размеры ---
let TILE_SIZE = 60;
let scale = 1;
let canvasWidth = 0;
let canvasHeight = 0;
let dpr = 1;

// ============================================================
// 3. ФУНКЦИИ ДЛЯ БОМБ
// ============================================================
function getBombType(colorId, isHorizontal) {
    return isHorizontal ? `H${colorId}` : `V${colorId}`;
}

function isBomb(value) {
    return typeof value === 'string' && (value.startsWith('H') || value.startsWith('V'));
}

function getBombColor(value) {
    if (!isBomb(value)) return -1;
    return parseInt(value.slice(1));
}

function getBombDirection(value) {
    if (!isBomb(value)) return null;
    return value.startsWith('H') ? 'horizontal' : 'vertical';
}

function getBombColorHex(value) {
    const colorId = getBombColor(value);
    if (colorId === -1) return '#ffffff';
    return COLORS[colorId].hex;
}

// ============================================================
// 4. НАСТРОЙКА CANVAS
// ============================================================
function setupCanvas() {
    const maxWidth = window.innerWidth - 40;
    const maxHeight = window.innerHeight - 200;
    const size = Math.min(maxWidth, maxHeight) / 8;
    TILE_SIZE = Math.max(30, Math.min(60, size));
    
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    scale = dpr;
    
    canvas.width = COLS * TILE_SIZE * dpr;
    canvas.height = ROWS * TILE_SIZE * dpr;
    
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    
    canvasWidth = COLS * TILE_SIZE;
    canvasHeight = ROWS * TILE_SIZE;
}

window.addEventListener('resize', setupCanvas);

// ============================================================
// 5. СОЗДАНИЕ ДОСКИ
// ============================================================
function createBoard() {
    const newBoard = [];
    for (let r = 0; r < ROWS; r++) {
        newBoard[r] = [];
        for (let c = 0; c < COLS; c++) {
            let candy;
            let attempts = 0;
            do {
                candy = Math.floor(Math.random() * COLORS.length);
                attempts++;
                const leftMatch = (c >= 2 && newBoard[r][c-1] === candy && newBoard[r][c-2] === candy);
                const upMatch = (r >= 2 && newBoard[r-1][c] === candy && newBoard[r-2][c] === candy);
                if (!leftMatch && !upMatch) break;
                if (attempts > 50) break;
            } while (true);
            newBoard[r][c] = candy;
        }
    }
    return newBoard;
}

function createBoardWithBlocks(blocksCount) {
    const newBoard = createBoard();
    blocks = [];
    blocksRemaining = blocksCount;
    
    let placed = 0;
    let attempts = 0;
    while (placed < blocksCount && attempts < 1000) {
        attempts++;
        const r = Math.floor(Math.random() * ROWS);
        const c = Math.floor(Math.random() * COLS);
        
        if (newBoard[r][c] !== -1 && !blocks.some(b => b.r === r && b.c === c)) {
            let hasMatch = false;
            let count = 1;
            for (let col = c - 1; col >= 0; col--) {
                if (newBoard[r][col] === newBoard[r][c]) count++; else break;
            }
            for (let col = c + 1; col < COLS; col++) {
                if (newBoard[r][col] === newBoard[r][c]) count++; else break;
            }
            if (count >= 3) hasMatch = true;
            
            count = 1;
            for (let row = r - 1; row >= 0; row--) {
                if (newBoard[row][c] === newBoard[r][c]) count++; else break;
            }
            for (let row = r + 1; row < ROWS; row++) {
                if (newBoard[row][c] === newBoard[r][c]) count++; else break;
            }
            if (count >= 3) hasMatch = true;
            
            if (!hasMatch) {
                blocks.push({r, c});
                newBoard[r][c] = -2;
                placed++;
            }
        }
    }
    
    return newBoard;
}

// ============================================================
// 6. ПОИСК СОВПАДЕНИЙ (оставляем как было)
// ============================================================
function findMatchGroups() {
    const groups = [];
    const visited = new Set();

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS - 2; c++) {
            const val = board[r][c];
            if (val === -1 || isBomb(val) || val === -2) continue;
            let len = 1;
            while (c + len < COLS && board[r][c + len] === val) len++;
            if (len >= 3) {
                const group = [];
                for (let i = 0; i < len; i++) {
                    const key = r + ',' + (c + i);
                    if (!visited.has(key)) {
                        visited.add(key);
                        group.push({r: r, c: c + i});
                    }
                }
                if (group.length >= 3) {
                    groups.push({
                        cells: group,
                        color: val,
                        length: len,
                        isHorizontal: true
                    });
                }
            }
            c += len - 1;
        }
    }

    for (let c = 0; c < COLS; c++) {
        for (let r = 0; r < ROWS - 2; r++) {
            const val = board[r][c];
            if (val === -1 || isBomb(val) || val === -2) continue;
            let len = 1;
            while (r + len < ROWS && board[r + len][c] === val) len++;
            if (len >= 3) {
                const group = [];
                for (let i = 0; i < len; i++) {
                    const key = (r + i) + ',' + c;
                    if (!visited.has(key)) {
                        visited.add(key);
                        group.push({r: r + i, c: c});
                    }
                }
                if (group.length >= 3) {
                    groups.push({
                        cells: group,
                        color: val,
                        length: len,
                        isHorizontal: false
                    });
                }
            }
            r += len - 1;
        }
    }

    return groups;
}

function getAllMatches() {
    const groups = findMatchGroups();
    const allCells = [];
    const bombToCreate = [];

    for (let group of groups) {
        if (group.length === 4) {
            const centerIndex = Math.floor(group.cells.length / 2);
            const center = group.cells[centerIndex];
            const bombType = getBombType(group.color, group.isHorizontal);
            bombToCreate.push({
                row: center.r,
                col: center.c,
                color: group.color,
                type: bombType,
                isHorizontal: group.isHorizontal
            });
            for (let i = 0; i < group.cells.length; i++) {
                if (i !== centerIndex) {
                    allCells.push(group.cells[i]);
                }
            }
        } else {
            allCells.push(...group.cells);
        }
    }

    return { cells: allCells, bombs: bombToCreate };
}

function checkBombMatch(r, c, bombColor) {
    let horizontalCount = 1;
    for (let col = c - 1; col >= 0; col--) {
        const val = board[r][col];
        if (val === -1 || isBomb(val) || val === -2 || val !== bombColor) break;
        horizontalCount++;
    }
    for (let col = c + 1; col < COLS; col++) {
        const val = board[r][col];
        if (val === -1 || isBomb(val) || val === -2 || val !== bombColor) break;
        horizontalCount++;
    }
    if (horizontalCount >= 3) return true;
    
    let verticalCount = 1;
    for (let row = r - 1; row >= 0; row--) {
        const val = board[row][c];
        if (val === -1 || isBomb(val) || val === -2 || val !== bombColor) break;
        verticalCount++;
    }
    for (let row = r + 1; row < ROWS; row++) {
        const val = board[row][c];
        if (val === -1 || isBomb(val) || val === -2 || val !== bombColor) break;
        verticalCount++;
    }
    return verticalCount >= 3;
}

function activateBombs() {
    const toRemove = [];
    const explosions = [];

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const val = board[r][c];
            if (isBomb(val)) {
                const bombColor = getBombColor(val);
                const direction = getBombDirection(val);
                
                if (checkBombMatch(r, c, bombColor)) {
                    if (direction === 'horizontal') {
                        for (let col = 0; col < COLS; col++) {
                            if (board[r][col] !== -1 && board[r][col] !== -2) {
                                toRemove.push({r, c: col});
                            }
                        }
                        explosions.push({r, c, type: 'horizontal', color: bombColor});
                    } else {
                        for (let row = 0; row < ROWS; row++) {
                            if (board[row][c] !== -1 && board[row][c] !== -2) {
                                toRemove.push({r: row, c});
                            }
                        }
                        explosions.push({r, c, type: 'vertical', color: bombColor});
                    }
                }
            }
        }
    }

    return { removed: toRemove, explosions };
}

function processMatches() {
    const bombResult = activateBombs();
    const matchResult = getAllMatches();
    
    const allRemoved = new Set();
    for (let cell of bombResult.removed) {
        allRemoved.add(`${cell.r},${cell.c}`);
    }
    for (let cell of matchResult.cells) {
        allRemoved.add(`${cell.r},${cell.c}`);
    }

    const bombsToAdd = matchResult.bombs;
    for (let bomb of bombsToAdd) {
        if (!allRemoved.has(`${bomb.row},${bomb.col}`) && board[bomb.row][bomb.col] !== -2) {
            board[bomb.row][bomb.col] = bomb.type;
            bombSpawned = bomb;
            bombSpawnTimer = 15;
        }
    }

    const removedCells = [];
    for (let key of allRemoved) {
        const [r, c] = key.split(',').map(Number);
        if (board[r][c] !== -1 && board[r][c] !== -2) {
            removedCells.push({r, c});
            board[r][c] = -1;
        }
    }

    return {
        removed: removedCells,
        explosions: bombResult.explosions,
        bombsCreated: bombsToAdd
    };
}

function hasMatches() {
    const groups = findMatchGroups();
    for (let group of groups) {
        if (group.length >= 3) return true;
    }
    
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const val = board[r][c];
            if (isBomb(val)) {
                const bombColor = getBombColor(val);
                if (checkBombMatch(r, c, bombColor)) {
                    return true;
                }
            }
        }
    }
    return false;
}

function hasValidMoves() {
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (board[r][c] === -2) continue;
            if (c < COLS - 1 && board[r][c+1] !== -2) {
                swap(r, c, r, c + 1);
                const has = hasMatches();
                swap(r, c, r, c + 1);
                if (has) return true;
            }
            if (r < ROWS - 1 && board[r+1][c] !== -2) {
                swap(r, c, r + 1, c);
                const has = hasMatches();
                swap(r, c, r + 1, c);
                if (has) return true;
            }
        }
    }
    return false;
}

function swap(r1, c1, r2, c2) {
    const temp = board[r1][c1];
    board[r1][c1] = board[r2][c2];
    board[r2][c2] = temp;
}

// ============================================================
// 7. ЧАСТИЦЫ И АНИМАЦИЯ
// ============================================================
function createExplosionParticles(cells, color = '#ff6b6b') {
    const maxParticles = 30;
    let count = 0;
    for (let cell of cells) {
        if (count >= maxParticles) break;
        const x = cell.c * TILE_SIZE + TILE_SIZE/2;
        const y = cell.r * TILE_SIZE + TILE_SIZE/2;
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 3;
        particles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 1.5,
            life: 0.6 + Math.random() * 0.2,
            maxLife: 0.6 + Math.random() * 0.2,
            size: 2 + Math.random() * 3,
            color: color
        });
        count++;
    }
}

function updateParticles() {
    let hasActive = false;
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15;
        p.life -= 0.035;
        if (p.life <= 0) {
            particles.splice(i, 1);
        } else {
            hasActive = true;
        }
    }
    return hasActive;
}

// ============================================================
// 8. ОТРИСОВКА
// ============================================================
function drawBoard() {
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    if (bombSpawnTimer > 0) {
        bombSpawnTimer--;
        if (bombSpawnTimer === 0) {
            bombSpawned = null;
        }
    }
    
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const x = c * TILE_SIZE;
            const y = r * TILE_SIZE;
            let candy = board[r][c];
            let drawY = y;
            
            const drop = dropAnimations.find(d => d.toRow === r && d.col === c);
            if (drop && drop.progress < 1) {
                const currentY = drop.startY + (drop.endY - drop.startY) * drop.progress;
                drawY = currentY;
                candy = drop.value;
            }
            
            const isMatch = matchCells.some(m => m.r === r && m.c === c);
            const isBlock = blocks.some(b => b.r === r && b.c === c);
            
            let fillColor = '#3a2a4a';
            
            // Рисуем блоки
            if (isBlock && candy === -2) {
                const pulse = Math.sin(Date.now() / 500 + r + c) * 0.2 + 0.8;
                fillColor = `rgba(100, 200, 255, ${pulse})`;
                
                const size = TILE_SIZE - 3;
                ctx.fillStyle = fillColor;
                ctx.shadowColor = '#66ccff';
                ctx.shadowBlur = 15;
                ctx.beginPath();
                ctx.roundRect(x + 1.5, drawY + 1.5, size, size, 6);
                ctx.fill();
                ctx.shadowBlur = 0;
                
                ctx.font = `${TILE_SIZE * 0.5}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#ffffff';
                ctx.fillText('❄️', x + TILE_SIZE/2, drawY + TILE_SIZE/2 + 1);
                
                continue;
            }
            
            if (selectedRow === r && selectedCol === c) {
                fillColor = '#7b5ea7';
            } else if (isMatch) {
                fillColor = '#ffd700';
            } else if (isBomb(candy)) {
                fillColor = getBombColorHex(candy);
            } else if (candy !== -1 && candy !== -2 && candy < COLORS.length) {
                fillColor = COLORS[candy].hex + '88';
            }
            
            const size = TILE_SIZE - 3;
            ctx.fillStyle = fillColor;
            ctx.shadowColor = 'rgba(0,0,0,0.3)';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.roundRect(x + 1.5, drawY + 1.5, size, size, 6);
            ctx.fill();
            ctx.shadowBlur = 0;
            
            if (candy !== -1 && candy !== -2 && candy !== undefined) {
                let displayText = '';
                let fontSize = TILE_SIZE * 0.5;
                let isBombCell = false;
                
                if (isBomb(candy)) {
                    const dir = getBombDirection(candy);
                    displayText = dir === 'horizontal' ? '↔' : '↕';
                    fontSize = TILE_SIZE * 0.5;
                    isBombCell = true;
                } else if (candy < COLORS.length) {
                    displayText = COLORS[candy].emoji;
                    fontSize = TILE_SIZE * 0.5;
                }
                
                if (displayText) {
                    ctx.font = `${fontSize}px Arial`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = isBombCell ? '#ffffff' : '#ffffff';
                    ctx.fillText(displayText, x + TILE_SIZE/2, drawY + TILE_SIZE/2 + 1);
                }
                
                if (isBombCell) {
                    const color = COLORS[getBombColor(candy)];
                    ctx.fillStyle = color.hex;
                    ctx.beginPath();
                    ctx.arc(x + TILE_SIZE - 6, drawY + 6, 3, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
    }
    
    if (particles.length > 0) {
        for (let p of particles) {
            const alpha = Math.max(0, p.life / p.maxLife);
            ctx.globalAlpha = alpha;
            ctx.fillStyle = p.color;
            const size = Math.max(1, p.size * alpha);
            ctx.beginPath();
            ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
        
        const hasActive = updateParticles();
        if (hasActive && !isProcessing) {
            if (!isAnimating) {
                isAnimating = true;
                requestAnimationFrame(particleLoop);
            }
        } else {
            isAnimating = false;
        }
    }
}

function particleLoop(timestamp) {
    if (!isAnimating) return;
    
    if (timestamp - lastFrameTime < 1000 / TARGET_FPS) {
        requestAnimationFrame(particleLoop);
        return;
    }
    lastFrameTime = timestamp;
    
    if (particles.length > 0) {
        drawBoard();
        requestAnimationFrame(particleLoop);
    } else {
        isAnimating = false;
        drawBoard();
    }
}

CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    this.moveTo(x + r, y);
    this.lineTo(x + w - r, y);
    this.quadraticCurveTo(x + w, y, x + w, y + r);
    this.lineTo(x + w, y + h - r);
    this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    this.lineTo(x + r, y + h);
    this.quadraticCurveTo(x, y + h, x, y + h - r);
    this.lineTo(x, y + r);
    this.quadraticCurveTo(x, y, x + r, y);
    return this;
};

// ============================================================
// 9. ОБНОВЛЕНИЕ UI
// ============================================================
function updateScore() {
    scoreSpan.textContent = score;
}

function updateMoves() {
    movesSpan.textContent = `${moves}/${maxMoves}`;
}

function updateTimer() {
    timerSpan.textContent = timeLeft + 'с';
}

function showMessage(text, duration = 2000) {
    const overlay = document.getElementById('gameOverlay');
    const title = document.getElementById('overlayTitle');
    const message = document.getElementById('overlayMessage');
    const btn = document.getElementById('overlayBtn');
    
    title.textContent = text;
    message.textContent = '';
    btn.style.display = 'none';
    overlay.style.display = 'flex';
    
    setTimeout(() => {
        overlay.style.display = 'none';
    }, duration);
}

function showModal(title, messageText, buttonText, callback) {
    const overlay = document.getElementById('gameOverlay');
    const titleEl = document.getElementById('overlayTitle');
    const messageEl = document.getElementById('overlayMessage');
    const btn = document.getElementById('overlayBtn');
    
    titleEl.textContent = title;
    messageEl.textContent = messageText;
    btn.textContent = buttonText || 'OK';
    btn.style.display = 'inline-block';
    overlay.style.display = 'flex';
    
    btn.onclick = null;
    btn.onclick = function() {
        overlay.style.display = 'none';
        if (callback) callback();
    };
}

// ============================================================
// 10. ВОЗВРАТ В МЕНЮ
// ============================================================
function goToMenu() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    if (levelTimerInterval) {
        clearInterval(levelTimerInterval);
        levelTimerInterval = null;
    }
    
    isProcessing = false;
    particles = [];
    matchCells = [];
    dropAnimations = [];
    bombSpawned = null;
    bombSpawnTimer = 0;
    isAnimating = false;
    currentLevel = 0;
    blocks = [];
    blocksRemaining = 0;
    collectedCount = 0;
    bombsActivated = 0;
    totalCombos = 0;
    
    document.getElementById('gameUI').style.display = 'none';
    document.getElementById('menuOverlay').style.display = 'flex';
}

// ============================================================
// 11. РЕЖИМЫ ИГРЫ
// ============================================================
function startEndlessMode() {
    currentMode = 'endless';
    board = createBoard();
    score = 0;
    selectedRow = -1;
    selectedCol = -1;
    isProcessing = false;
    particles = [];
    matchCells = [];
    dropAnimations = [];
    bombSpawned = null;
    bombSpawnTimer = 0;
    isAnimating = false;
    blocks = [];
    blocksRemaining = 0;
    collectedCount = 0;
    bombsActivated = 0;
    totalCombos = 0;
    
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    if (levelTimerInterval) {
        clearInterval(levelTimerInterval);
        levelTimerInterval = null;
    }
    
    document.getElementById('movesContainer').style.display = 'none';
    document.getElementById('timerContainer').style.display = 'none';
    document.getElementById('levelInfo').style.display = 'none';
    document.getElementById('scoreContainer').style.display = 'block';
    
    updateScore();
    drawBoard();
    showMessage('♾️ Бесконечный режим!', 1500);
}

// ============================================================
// 12. РЕЖИМ УРОВНЕЙ
// ============================================================
function startLevelMode() {
    currentMode = 'levels';
    currentLevel = 0;
    document.getElementById('levelInfo').style.display = 'flex';
    startLevel();
}

function startLevel() {
    if (currentLevel >= LEVELS.length) {
        showModal(
            '🎉 Поздравляем! 🎉',
            'Вы прошли все 25 уровней!\nВы настоящий мастер 3 в ряд! 👑',
            '🔄 Пройти заново',
            function() {
                currentLevel = 0;
                startLevel();
            }
        );
        return;
    }
    
    const level = LEVELS[currentLevel];
    
    // Сбрасываем все счётчики
    score = 0;
    selectedRow = -1;
    selectedCol = -1;
    isProcessing = false;
    particles = [];
    matchCells = [];
    dropAnimations = [];
    bombSpawned = null;
    bombSpawnTimer = 0;
    isAnimating = false;
    bombsActivated = 0;
    collectedCount = 0;
    totalCombos = 0;
    blocks = [];
    blocksRemaining = 0;
    
    // Создаём доску
    if (level.type === 'blocks') {
        board = createBoardWithBlocks(level.blocksCount);
    } else {
        board = createBoard();
    }
    
    if (levelTimerInterval) {
        clearInterval(levelTimerInterval);
        levelTimerInterval = null;
    }
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    document.getElementById('levelInfo').style.display = 'flex';
    document.getElementById('scoreContainer').style.display = 'block';
    levelTitleSpan.textContent = `${level.name} (${currentLevel + 1}/${LEVELS.length})`;
    
    if (level.type === 'time') {
        timeLeft = level.timeLimit;
        document.getElementById('timerContainer').style.display = 'block';
        document.getElementById('movesContainer').style.display = 'none';
        updateTimer();
        startLevelTimer();
    } else {
        maxMoves = level.maxMoves;
        moves = maxMoves;
        document.getElementById('movesContainer').style.display = 'block';
        document.getElementById('timerContainer').style.display = 'none';
        updateMoves();
    }
    
    updateScore();
    updateLevelUI();
    drawBoard();
    showMessage(level.message, 2000);
}

function startLevelTimer() {
    if (levelTimerInterval) clearInterval(levelTimerInterval);
    levelTimerInterval = setInterval(() => {
        timeLeft--;
        updateTimer();
        if (timeLeft <= 0) {
            clearInterval(levelTimerInterval);
            levelTimerInterval = null;
            checkLevelResult(false);
        }
    }, 1000);
}

function getLevelRequirement(level) {
    switch (level.type) {
        case 'moves':
        case 'time':
            return `набрать ${level.goal} очков`;
        case 'blocks':
            return `разбить ${level.blocksCount} блоков`;
        case 'collect':
            return `собрать ${level.collectCount} фигур`;
        case 'boss':
            return `активировать ${level.bombsRequired} бомб`;
        case 'combo':
            return `сделать ${level.combosRequired} комбо`;
        default:
            return 'выполнить задание';
    }
}

function updateLevelUI() {
    if (currentLevel >= LEVELS.length) return;
    
    const level = LEVELS[currentLevel];
    let goalText = '';
    
    switch (level.type) {
        case 'moves':
        case 'time':
            goalText = `Цель: ${level.goal} очков (${score}/${level.goal})`;
            break;
        case 'blocks':
            goalText = `❄️ Блоков: ${blocksRemaining}/${level.blocksCount}`;
            break;
        case 'collect':
            const colorEmoji = COLORS[level.collectColor].emoji;
            goalText = `${colorEmoji}: ${collectedCount}/${level.collectCount}`;
            break;
        case 'boss':
            goalText = `💣 Бомб: ${bombsActivated}/${level.bombsRequired}`;
            break;
        case 'combo':
            goalText = `🔥 Комбо: ${totalCombos}/${level.combosRequired}`;
            break;
    }
    
    levelGoalSpan.textContent = goalText;
}

function checkLevelResult(won) {
    if (levelTimerInterval) {
        clearInterval(levelTimerInterval);
        levelTimerInterval = null;
    }
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    const level = LEVELS[currentLevel];
    let isComplete = false;
    let message = '';
    
    if (won) {
        isComplete = true;
        message = `✅ Уровень пройден!`;
    } else {
        // Проверяем условия
        switch (level.type) {
            case 'moves':
            case 'time':
                if (score >= level.goal) isComplete = true;
                break;
            case 'blocks':
                if (blocksRemaining <= 0) isComplete = true;
                break;
            case 'collect':
                if (collectedCount >= level.collectCount) isComplete = true;
                break;
            case 'boss':
                if (bombsActivated >= level.bombsRequired) isComplete = true;
                break;
            case 'combo':
                if (totalCombos >= level.combosRequired) isComplete = true;
                break;
        }
    }
    
    if (isComplete) {
        showModal(
            '✅ Уровень пройден!',
            message,
            'Продолжить →',
            function() {
                currentLevel++;
                startLevel();
            }
        );
    } else {
        let requirement = getLevelRequirement(level);
        showModal(
            '❌ Попробуйте снова!',
            `Нужно: ${requirement}\nПопробуйте ещё раз!`,
            '🔄 Повторить уровень',
            function() {
                startLevel();
            }
        );
    }
}

// ============================================================
// 13. ОБРАБОТКА ИГРОВОГО ЦИКЛА
// ============================================================
function processBoardWithAnimation() {
    if (isProcessing) return;
    isProcessing = true;
    bombSpawned = null;
    bombSpawnTimer = 0;

    function step() {
        // Проверяем блоки рядом с совпадениями
        if (currentLevel < LEVELS.length && LEVELS[currentLevel].type === 'blocks') {
            const matches = findMatchGroups();
            for (let match of matches) {
                for (let cell of match.cells) {
                    const directions = [[0,1],[0,-1],[1,0],[-1,0]];
                    for (let [dr, dc] of directions) {
                        const nr = cell.r + dr;
                        const nc = cell.c + dc;
                        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
                            const blockIndex = blocks.findIndex(b => b.r === nr && b.c === nc);
                            if (blockIndex !== -1) {
                                blocks.splice(blockIndex, 1);
                                blocksRemaining--;
                                board[nr][nc] = Math.floor(Math.random() * COLORS.length);
                                createExplosionParticles([{r: nr, c: nc}], '#66ccff');
                                updateLevelUI();
                            }
                        }
                    }
                }
            }
        }
        
        const result = processMatches();
        
        // Подсчёт комбо
        if (currentLevel < LEVELS.length && LEVELS[currentLevel].type === 'combo') {
            if (result.removed.length > 0) {
                totalCombos++;
                updateLevelUI();
            }
        }
        
        // Подсчёт активированных бомб
        if (currentLevel < LEVELS.length && LEVELS[currentLevel].type === 'boss') {
            if (result.explosions.length > 0) {
                bombsActivated += result.explosions.length;
                updateLevelUI();
            }
        }
        
        // Подсчёт собранных ингредиентов
        if (currentLevel < LEVELS.length && LEVELS[currentLevel].type === 'collect') {
            const level = LEVELS[currentLevel];
            for (let cell of result.removed) {
                if (board[cell.r] && board[cell.r][cell.c] === level.collectColor) {
                    collectedCount++;
                    updateLevelUI();
                }
            }
        }
        
        if (result.removed.length === 0) {
            isProcessing = false;
            bombSpawned = null;
            bombSpawnTimer = 0;
            
            // Проверяем условия уровня
            checkLevelResult(false);
            
            if (!hasValidMoves()) {
                setTimeout(() => {
                    showMessage('🔄 Нет ходов! Перемешиваем...', 1500);
                    board = createBoard();
                    drawBoard();
                }, 300);
            }
            return;
        }

        matchCells = result.removed;
        if (result.explosions.length > 0) {
            createExplosionParticles(result.removed, '#ff4444');
        } else {
            createExplosionParticles(result.removed, '#ffd700');
        }
        
        const points = result.removed.length * 10 + result.explosions.length * 50;
        score += points;
        updateScore();
        updateLevelUI();
        
        // Проверяем условия уровня
        checkLevelResult(false);
        
        drawBoard();

        setTimeout(() => {
            matchCells = [];

            const dropData = [];
            for (let c = 0; c < COLS; c++) {
                let emptyRow = ROWS - 1;
                for (let r = ROWS - 1; r >= 0; r--) {
                    if (board[r][c] !== -1 && board[r][c] !== -2) {
                        if (emptyRow !== r) {
                            dropData.push({
                                fromRow: r,
                                toRow: emptyRow,
                                col: c,
                                value: board[r][c]
                            });
                            board[emptyRow][c] = board[r][c];
                            board[r][c] = -1;
                        }
                        emptyRow--;
                    }
                }
                for (let r = emptyRow; r >= 0; r--) {
                    const isBlock = blocks.some(b => b.r === r && b.c === c);
                    if (isBlock) {
                        board[r][c] = -2;
                    } else {
                        const newVal = Math.floor(Math.random() * COLORS.length);
                        dropData.push({
                            fromRow: -1,
                            toRow: r,
                            col: c,
                            value: newVal,
                            isNew: true
                        });
                        board[r][c] = newVal;
                    }
                }
            }

            dropAnimations = dropData.map(d => ({
                ...d,
                progress: 0,
                startY: d.fromRow === -1 ? -TILE_SIZE : d.fromRow * TILE_SIZE,
                endY: d.toRow * TILE_SIZE
            }));

            let startTime = Date.now();
            const duration = 200;

            function animateDrop() {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased = progress * progress * (3 - 2 * progress);

                for (let d of dropAnimations) {
                    d.progress = eased;
                }

                drawBoard();

                if (progress < 1) {
                    requestAnimationFrame(animateDrop);
                } else {
                    dropAnimations = [];
                    drawBoard();
                    setTimeout(() => {
                        if (hasMatches()) {
                            step();
                        } else {
                            isProcessing = false;
                            bombSpawned = null;
                            bombSpawnTimer = 0;
                            
                            checkLevelResult(false);
                            
                            if (!hasValidMoves()) {
                                setTimeout(() => {
                                    showMessage('🔄 Нет ходов! Перемешиваем...', 1500);
                                    board = createBoard();
                                    drawBoard();
                                }, 300);
                            }
                        }
                    }, 100);
                }
            }

            animateDrop();

        }, 250);
    }

    step();
}

// ============================================================
// 14. ОБРАБОТКА КЛИКОВ
// ============================================================
function handleClick(e) {
    if (isProcessing) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvasWidth / rect.width);
    const y = (e.clientY - rect.top) * (canvasHeight / rect.height);
    
    handleCellClick(x, y);
}

function handleTouch(e) {
    e.preventDefault();
    if (isProcessing) return;
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = (touch.clientX - rect.left) * (canvasWidth / rect.width);
    const y = (touch.clientY - rect.top) * (canvasHeight / rect.height);
    handleCellClick(x, y);
}

function handleCellClick(x, y) {
    if (isProcessing) return;
    
    const col = Math.floor(x / TILE_SIZE);
    const row = Math.floor(y / TILE_SIZE);
    
    if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return;
    
    // Нельзя кликать на блоки
    if (board[row][col] === -2) return;

    if (selectedRow === -1) {
        selectedRow = row;
        selectedCol = col;
        drawBoard();
        return;
    }

    if (selectedRow === row && selectedCol === col) {
        selectedRow = -1;
        selectedCol = -1;
        drawBoard();
        return;
    }

    const dr = Math.abs(selectedRow - row);
    const dc = Math.abs(selectedCol - col);
    
    if ((dr === 1 && dc === 0) || (dr === 0 && dc === 1)) {
        const r1 = selectedRow, c1 = selectedCol;
        const r2 = row, c2 = col;
        
        // Нельзя менять с блоком
        if (board[r2][c2] === -2) {
            selectedRow = -1;
            selectedCol = -1;
            drawBoard();
            return;
        }
        
        swap(r1, c1, r2, c2);
        
        if (hasMatches()) {
            selectedRow = -1;
            selectedCol = -1;
            drawBoard();
            processBoardWithAnimation();
        } else {
            swap(r1, c1, r2, c2);
            selectedRow = -1;
            selectedCol = -1;
            drawBoard();
        }
    } else {
        selectedRow = row;
        selectedCol = col;
        drawBoard();
    }
}

// ============================================================
// 15. ИНИЦИАЛИЗАЦИЯ
// ============================================================
function initGame() {
    setupCanvas();
    
    // Кнопки меню
    document.getElementById('btnEndless').addEventListener('click', function() {
        document.getElementById('menuOverlay').style.display = 'none';
        document.getElementById('gameUI').style.display = 'block';
        startEndlessMode();
    });
    
    document.getElementById('btnLevels').addEventListener('click', function() {
        document.getElementById('menuOverlay').style.display = 'none';
        document.getElementById('gameUI').style.display = 'block';
        startLevelMode();
    });
    
    // Кнопка "Назад"
    document.getElementById('backBtn').addEventListener('click', function() {
        goToMenu();
    });
    
    // Кнопка "Новая игра"
    document.getElementById('resetBtn').addEventListener('click', function() {
        if (currentMode === 'endless') {
            startEndlessMode();
        } else {
            startLevelMode();
        }
    });
    
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('touchstart', handleTouch, { passive: false });
    
    // Показываем меню
    document.getElementById('menuOverlay').style.display = 'flex';
    document.getElementById('gameUI').style.display = 'none';
}

// ============================================================
// 16. ЗАПУСК
// ============================================================
document.addEventListener('DOMContentLoaded', initGame);
console.log('🎮 Игра 3 в ряд запущена!');
console.log('📊 Всего уровней: ' + LEVELS.length);
console.log('♾️ Бесконечный режим - набирай очки без ограничений');
console.log('🎯 Режим уровней - 25 уровней с разными механиками');
console.log('💣 Бомбы активируются при 3+ в ряд с цветом!');
console.log('❄️ Ледяные блоки разбиваются рядом с совпадениями');
console.log('🍎 Ингредиенты собираются при совпадениях');
console.log('👾 Боссы побеждаются активацией бомб');
console.log('🔥 Комбо считаются при цепных реакциях');
