const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreSpan = document.getElementById('scoreValue');

const ROWS = 8;
const COLS = 8;
let board = [];
let score = 0;
let selectedRow = -1;
let selectedCol = -1;
let isProcessing = false;

// --- Анимационные переменные ---
let particles = [];
let matchCells = [];
let dropAnimations = [];
let bombSpawned = null;
let bombSpawnTimer = 0;
let animationFrameId = null;

// --- 5 разных цветов ---
const COLORS = [
    { id: 0, emoji: '🔴', name: 'Красный', hex: '#ff4444' },
    { id: 1, emoji: '🔵', name: 'Синий', hex: '#4488ff' },
    { id: 2, emoji: '🟢', name: 'Зелёный', hex: '#44ff44' },
    { id: 3, emoji: '🟡', name: 'Жёлтый', hex: '#ffdd00' },
    { id: 4, emoji: '🟣', name: 'Фиолетовый', hex: '#cc66ff' }
];

// --- Типы бомб ---
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

// --- АДАПТАЦИЯ ПОД ТЕЛЕФОН (Retina) ---
let TILE_SIZE = 60;
let scale = 1;
let canvasWidth = 0;
let canvasHeight = 0;

function setupCanvas() {
    const maxWidth = window.innerWidth - 40;
    const maxHeight = window.innerHeight - 200;
    const size = Math.min(maxWidth, maxHeight) / 8;
    TILE_SIZE = Math.max(30, Math.min(60, size));
    
    const dpr = window.devicePixelRatio || 1;
    scale = dpr;
    
    canvas.style.width = (COLS * TILE_SIZE) + 'px';
    canvas.style.height = (ROWS * TILE_SIZE) + 'px';
    
    canvas.width = COLS * TILE_SIZE * dpr;
    canvas.height = ROWS * TILE_SIZE * dpr;
    
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    
    canvasWidth = COLS * TILE_SIZE;
    canvasHeight = ROWS * TILE_SIZE;
}

function resizeCanvas() {
    setupCanvas();
    if (board && board.length > 0) {
        drawBoard();
    }
}

window.addEventListener('resize', resizeCanvas);

// --- Создание доски ---
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

// --- Поиск совпадений (возвращает группы) ---
function findMatchGroups() {
    const groups = [];
    const visited = new Set();

    // Горизонтальные
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS - 2; c++) {
            const val = board[r][c];
            if (val === -1 || isBomb(val)) continue;
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
                        isHorizontal: true,
                        row: r,
                        startCol: c
                    });
                }
            }
            c += len - 1;
        }
    }

    // Вертикальные
    for (let c = 0; c < COLS; c++) {
        for (let r = 0; r < ROWS - 2; r++) {
            const val = board[r][c];
            if (val === -1 || isBomb(val)) continue;
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
                        isHorizontal: false,
                        col: c,
                        startRow: r
                    });
                }
            }
            r += len - 1;
        }
    }

    return groups;
}

// --- Получение всех клеток для удаления ---
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

// --- Проверка, образует ли бомба ряд из 3+ ---
function checkBombMatch(r, c, bombColor) {
    // Проверяем горизонтально
    let horizontalCount = 1;
    // Влево
    for (let col = c - 1; col >= 0; col--) {
        const val = board[r][col];
        if (val === -1 || isBomb(val) || val !== bombColor) break;
        horizontalCount++;
    }
    // Вправо
    for (let col = c + 1; col < COLS; col++) {
        const val = board[r][col];
        if (val === -1 || isBomb(val) || val !== bombColor) break;
        horizontalCount++;
    }
    
    if (horizontalCount >= 3) return true;
    
    // Проверяем вертикально
    let verticalCount = 1;
    // Вверх
    for (let row = r - 1; row >= 0; row--) {
        const val = board[row][c];
        if (val === -1 || isBomb(val) || val !== bombColor) break;
        verticalCount++;
    }
    // Вниз
    for (let row = r + 1; row < ROWS; row++) {
        const val = board[row][c];
        if (val === -1 || isBomb(val) || val !== bombColor) break;
        verticalCount++;
    }
    
    return verticalCount >= 3;
}

// --- Активация бомб (только при 3+ в ряд) ---
function activateBombs() {
    const toRemove = [];
    const explosions = [];

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const val = board[r][c];
            if (isBomb(val)) {
                const bombColor = getBombColor(val);
                const direction = getBombDirection(val);
                
                // Проверяем, образует ли бомба ряд из 3+
                if (checkBombMatch(r, c, bombColor)) {
                    // Активируем бомбу
                    if (direction === 'horizontal') {
                        for (let col = 0; col < COLS; col++) {
                            if (board[r][col] !== -1) {
                                toRemove.push({r, c: col});
                            }
                        }
                        explosions.push({r, c, type: 'horizontal', color: bombColor});
                    } else {
                        for (let row = 0; row < ROWS; row++) {
                            if (board[row][c] !== -1) {
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

// --- Основная обработка ---
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
        if (!allRemoved.has(`${bomb.row},${bomb.col}`)) {
            board[bomb.row][bomb.col] = bomb.type;
            bombSpawned = bomb;
            bombSpawnTimer = 20;
        }
    }

    const removedCells = [];
    for (let key of allRemoved) {
        const [r, c] = key.split(',').map(Number);
        if (board[r][c] !== -1) {
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

// --- Проверка наличия совпадений ---
function hasMatches() {
    const groups = findMatchGroups();
    for (let group of groups) {
        if (group.length >= 3) return true;
    }
    
    // Проверяем бомбы (только если они образуют ряд из 3+)
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

// --- Проверка обмена ---
function wouldMatchAfterSwap(r1, c1, r2, c2) {
    const temp = board[r1][c1];
    board[r1][c1] = board[r2][c2];
    board[r2][c2] = temp;
    const has = hasMatches();
    const tempBack = board[r1][c1];
    board[r1][c1] = board[r2][c2];
    board[r2][c2] = tempBack;
    return has;
}

function hasValidMoves() {
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (c < COLS - 1 && wouldMatchAfterSwap(r, c, r, c + 1)) return true;
            if (r < ROWS - 1 && wouldMatchAfterSwap(r, c, r + 1, c)) return true;
        }
    }
    return false;
}

function swap(r1, c1, r2, c2) {
    const temp = board[r1][c1];
    board[r1][c1] = board[r2][c2];
    board[r2][c2] = temp;
}

// --- Частицы (оптимизированные) ---
let particleAnimationRunning = false;

function createExplosionParticles(cells, color = '#ff6b6b') {
    const count = Math.min(cells.length * 8, 60); // Ограничиваем количество частиц
    for (let cell of cells) {
        const x = cell.c * TILE_SIZE + TILE_SIZE/2;
        const y = cell.r * TILE_SIZE + TILE_SIZE/2;
        const numParticles = Math.min(6, Math.floor(60 / cells.length));
        for (let i = 0; i < numParticles; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 4;
            particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 2,
                life: 0.8 + Math.random() * 0.2,
                maxLife: 0.8 + Math.random() * 0.2,
                size: 2 + Math.random() * 5,
                color: color
            });
        }
    }
}

function updateParticles() {
    let hasActive = false;
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2;
        p.life -= 0.025;
        if (p.life <= 0) {
            particles.splice(i, 1);
        } else {
            hasActive = true;
        }
    }
    return hasActive;
}

// --- Обработка с анимацией ---
function processBoardWithAnimation() {
    if (isProcessing) return;
    isProcessing = true;
    bombSpawned = null;
    bombSpawnTimer = 0;

    function step() {
        const result = processMatches();
        
        if (result.removed.length === 0) {
            isProcessing = false;
            bombSpawned = null;
            bombSpawnTimer = 0;
            if (!hasValidMoves()) {
                setTimeout(() => {
                    alert('Нет ходов! Перемешиваем...');
                    board = createBoard();
                    selectedRow = -1;
                    selectedCol = -1;
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
        
        drawBoard();

        setTimeout(() => {
            matchCells = [];

            // Гравитация
            const dropData = [];
            for (let c = 0; c < COLS; c++) {
                let emptyRow = ROWS - 1;
                for (let r = ROWS - 1; r >= 0; r--) {
                    if (board[r][c] !== -1) {
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

            const points = result.removed.length * 10 + result.explosions.length * 50;
            score += points;
            updateScore();

            dropAnimations = dropData.map(d => ({
                ...d,
                progress: 0,
                startY: d.fromRow === -1 ? -TILE_SIZE : d.fromRow * TILE_SIZE,
                endY: d.toRow * TILE_SIZE
            }));

            let startTime = Date.now();
            const duration = 250;

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
                            if (!hasValidMoves()) {
                                setTimeout(() => {
                                    alert('Нет ходов! Перемешиваем...');
                                    board = createBoard();
                                    selectedRow = -1;
                                    selectedCol = -1;
                                    drawBoard();
                                }, 300);
                            }
                        }
                    }, 150);
                }
            }

            animateDrop();

        }, 350);
    }

    step();
}

// --- Отрисовка (оптимизированная) ---
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
            
            let fillColor = '#4a3a5c';
            let shadowColor = 'rgba(0,0,0,0.3)';
            let shadowBlur = 8;
            
            if (selectedRow === r && selectedCol === c) {
                fillColor = '#8b6fb0';
                shadowColor = '#b392d0';
                shadowBlur = 25;
            } else if (isMatch) {
                const pulse = Math.sin(Date.now() / 100) * 0.3 + 0.7;
                fillColor = `rgba(255, 215, 0, ${pulse})`;
                shadowColor = '#ffd700';
                shadowBlur = 40;
            } else if (isBomb(candy)) {
                const bombColorHex = getBombColorHex(candy);
                const dir = getBombDirection(candy);
                fillColor = bombColorHex;
                shadowColor = bombColorHex;
                shadowBlur = 30;
                
                ctx.fillStyle = fillColor;
                ctx.shadowColor = shadowColor;
                ctx.shadowBlur = shadowBlur;
                
                const size = TILE_SIZE - 4;
                ctx.beginPath();
                ctx.roundRect(x + 2, drawY + 2, size, size, 8);
                ctx.fill();
                ctx.shadowBlur = 0;
                
                ctx.beginPath();
                ctx.arc(x + TILE_SIZE/2, drawY + TILE_SIZE/2, TILE_SIZE * 0.35, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255,255,255,0.25)';
                ctx.fill();
                
                ctx.font = `${TILE_SIZE * 0.5}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#ffffff';
                ctx.shadowColor = 'rgba(0,0,0,0.8)';
                ctx.shadowBlur = 10;
                
                if (dir === 'horizontal') {
                    ctx.fillText('↔', x + TILE_SIZE/2, drawY + TILE_SIZE/2 + 1);
                } else {
                    ctx.fillText('↕', x + TILE_SIZE/2, drawY + TILE_SIZE/2 + 1);
                }
                ctx.shadowBlur = 0;
                
                const color = COLORS[getBombColor(candy)];
                ctx.beginPath();
                ctx.arc(x + TILE_SIZE - 8, drawY + 8, 4, 0, Math.PI * 2);
                ctx.fillStyle = color.hex;
                ctx.shadowColor = color.hex;
                ctx.shadowBlur = 10;
                ctx.fill();
                ctx.shadowBlur = 0;
                
                continue;
                
            } else if (candy !== -1 && candy < COLORS.length) {
                const color = COLORS[candy];
                fillColor = color.hex + '88';
                shadowColor = color.hex;
                shadowBlur = 15;
            }
            
            ctx.fillStyle = fillColor;
            ctx.shadowColor = shadowColor;
            ctx.shadowBlur = shadowBlur;
            
            const size = TILE_SIZE - 4;
            ctx.beginPath();
            ctx.roundRect(x + 2, drawY + 2, size, size, 8);
            ctx.fill();
            ctx.shadowBlur = 0;
            
            if (candy !== -1 && candy !== undefined && !isBomb(candy) && candy < COLORS.length) {
                const color = COLORS[candy];
                ctx.font = `${TILE_SIZE * 0.55}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.shadowColor = 'rgba(0,0,0,0.5)';
                ctx.shadowBlur = 8;
                ctx.fillStyle = '#ffffff';
                ctx.fillText(color.emoji, x + TILE_SIZE/2, drawY + TILE_SIZE/2 + 1);
                ctx.shadowBlur = 0;
            }
        }
    }
    
    // Частицы (оптимизированные)
    if (particles.length > 0) {
        for (let p of particles) {
            ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(p.x, p.y, Math.max(0.5, p.size * (p.life / p.maxLife)), 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
        ctx.globalAlpha = 1;
        
        const hasActive = updateParticles();
        if (hasActive) {
            requestAnimationFrame(drawBoard);
        }
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

function updateScore() {
    scoreSpan.textContent = score;
}

// --- Клик ---
function handleClick(clientX, clientY) {
    if (isProcessing) return;

    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) * (canvasWidth / rect.width);
    const y = (clientY - rect.top) * (canvasHeight / rect.height);
    
    const col = Math.floor(x / TILE_SIZE);
    const row = Math.floor(y / TILE_SIZE);
    
    if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return;

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
        
        if (wouldMatchAfterSwap(r1, c1, r2, c2)) {
            swap(r1, c1, r2, c2);
            selectedRow = -1;
            selectedCol = -1;
            drawBoard();
            processBoardWithAnimation();
        } else {
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

canvas.addEventListener('click', function(e) {
    handleClick(e.clientX, e.clientY);
});

canvas.addEventListener('touchstart', function(e) {
    e.preventDefault();
    const touch = e.touches[0];
    handleClick(touch.clientX, touch.clientY);
}, { passive: false });

// --- Новая игра ---
document.getElementById('resetBtn').addEventListener('click', function() {
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
    updateScore();
    resizeCanvas();
});

// --- Запуск ---
board = createBoard();
resizeCanvas();
drawBoard();
console.log('Игра запущена!2.4');
console.log('🔴🔵🟢🟡🟣 - 5 разных цветов');
console.log('Собери 4 в ряд → появится бомба');
console.log('Бомба активируется только при 3+ в ряд с её цветом!');
