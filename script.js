const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreSpan = document.getElementById('scoreValue');

// --- АДАПТАЦИЯ ПОД ТЕЛЕФОН ---
// Автоматический расчёт размера клетки
function getTileSize() {
    const maxWidth = window.innerWidth - 40;
    const maxHeight = window.innerHeight - 200;
    const size = Math.min(maxWidth, maxHeight) / 8;
    return Math.max(30, Math.min(60, size));
}

let TILE_SIZE = getTileSize();
const ROWS = 8;
const COLS = 8;

// Обновляем размер canvas при изменении окна
function resizeCanvas() {
    TILE_SIZE = getTileSize();
    canvas.width = COLS * TILE_SIZE;
    canvas.height = ROWS * TILE_SIZE;
    drawBoard();
}

window.addEventListener('resize', resizeCanvas);

const EMOJIS = ['🍎', '🍊', '🍇', '🍒', '🍉'];
const BOMB_TYPES = {
    HORIZONTAL: 'HORIZONTAL',
    VERTICAL: 'VERTICAL'
};

let board = [];
let score = 0;
let selectedRow = -1;
let selectedCol = -1;
let isProcessing = false;

// --- Анимационные переменные ---
let particles = [];
let matchCells = [];
let dropAnimations = [];
let bombExplosions = [];
let bombSpawned = null; // {row, col, color, type}

// --- Создание доски ---
function createBoard() {
    const newBoard = [];
    for (let r = 0; r < ROWS; r++) {
        newBoard[r] = [];
        for (let c = 0; c < COLS; c++) {
            let candy;
            let attempts = 0;
            do {
                candy = Math.floor(Math.random() * EMOJIS.length);
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

// --- Проверка, является ли клетка бомбой ---
function isBomb(value) {
    return value === 'HORIZONTAL' || value === 'VERTICAL';
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
            // Создаём бомбу
            const centerIndex = Math.floor(group.cells.length / 2);
            const center = group.cells[centerIndex];
            bombToCreate.push({
                row: center.r,
                col: center.c,
                color: group.color,
                type: group.isHorizontal ? 'HORIZONTAL' : 'VERTICAL'
            });
            // Добавляем все клетки кроме центральной
            for (let i = 0; i < group.cells.length; i++) {
                if (i !== centerIndex) {
                    allCells.push(group.cells[i]);
                }
            }
        } else {
            // Обычные совпадения (3 или 5+)
            allCells.push(...group.cells);
        }
    }

    return { cells: allCells, bombs: bombToCreate };
}

// --- Активация бомб (только когда они соединяются с цветом) ---
function activateBombs() {
    const toRemove = [];
    const explosions = [];

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const val = board[r][c];
            if (val === 'HORIZONTAL' || val === 'VERTICAL') {
                // Проверяем, есть ли рядом клетки того же цвета, что и бомба
                // (цвет бомбы хранится отдельно, но у нас его нет, поэтому проверяем соседей)
                let hasMatch = false;
                const directions = [[0,1],[0,-1],[1,0],[-1,0]];
                for (let [dr, dc] of directions) {
                    const nr = r + dr, nc = c + dc;
                    if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
                        if (!isBomb(board[nr][nc]) && board[nr][nc] !== -1) {
                            hasMatch = true;
                            break;
                        }
                    }
                }

                if (hasMatch) {
                    // Активируем бомбу
                    if (val === 'HORIZONTAL') {
                        for (let col = 0; col < COLS; col++) {
                            if (board[r][col] !== -1) {
                                toRemove.push({r, c: col});
                            }
                        }
                        explosions.push({r, c, type: 'horizontal'});
                    } else {
                        for (let row = 0; row < ROWS; row++) {
                            if (board[row][c] !== -1) {
                                toRemove.push({r: row, c});
                            }
                        }
                        explosions.push({r, c, type: 'vertical'});
                    }
                }
            }
        }
    }

    return { removed: toRemove, explosions };
}

// --- Основная обработка ---
function processMatches() {
    // 1. Активируем бомбы
    const bombResult = activateBombs();
    
    // 2. Находим обычные совпадения
    const matchResult = getAllMatches();
    
    // 3. Объединяем всё для удаления
    const allRemoved = new Set();
    for (let cell of bombResult.removed) {
        allRemoved.add(`${cell.r},${cell.c}`);
    }
    for (let cell of matchResult.cells) {
        allRemoved.add(`${cell.r},${cell.c}`);
    }

    // 4. Создаём бомбы (если есть)
    const bombsToAdd = matchResult.bombs;
    for (let bomb of bombsToAdd) {
        // Проверяем, не занята ли клетка
        if (!allRemoved.has(`${bomb.row},${bomb.col}`)) {
            board[bomb.row][bomb.col] = bomb.type;
            bombSpawned = bomb;
        }
    }

    // 5. Удаляем клетки
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
    const matchResult = getAllMatches();
    if (matchResult.cells.length > 0) return true;
    
    // Проверяем бомбы
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (isBomb(board[r][c])) return true;
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

// --- Частицы ---
function createExplosionParticles(cells, color = '#ff6b6b') {
    for (let cell of cells) {
        const x = cell.c * TILE_SIZE + TILE_SIZE/2;
        const y = cell.r * TILE_SIZE + TILE_SIZE/2;
        for (let i = 0; i < 10; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 5;
            particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 2,
                life: 1,
                size: 3 + Math.random() * 6,
                color: color
            });
        }
    }
}

// --- Обработка с анимацией ---
function processBoardWithAnimation() {
    if (isProcessing) return;
    isProcessing = true;
    bombSpawned = null;

    function step() {
        const result = processMatches();
        
        if (result.removed.length === 0) {
            isProcessing = false;
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

        // Подсветка
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
                    const newVal = Math.floor(Math.random() * EMOJIS.length);
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

            // Анимация падения
            dropAnimations = dropData.map(d => ({
                ...d,
                progress: 0,
                startY: d.fromRow === -1 ? -TILE_SIZE : d.fromRow * TILE_SIZE,
                endY: d.toRow * TILE_SIZE
            }));

            let startTime = Date.now();
            const duration = 300;

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
                    // Проверяем новые совпадения с задержкой
                    setTimeout(() => {
                        if (hasMatches()) {
                            step();
                        } else {
                            isProcessing = false;
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
                    }, 200);
                }
            }

            animateDrop();

        }, 400);
    }

    step();
}

// --- Отрисовка ---
function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
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
            const isBombSpawn = bombSpawned && bombSpawned.row === r && bombSpawned.col === c;
            
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
            } else if (candy === 'HORIZONTAL') {
                fillColor = '#ff6b6b';
                shadowColor = '#ff0000';
                shadowBlur = 20;
            } else if (candy === 'VERTICAL') {
                fillColor = '#4d96ff';
                shadowColor = '#0066ff';
                shadowBlur = 20;
            } else if (isBombSpawn) {
                fillColor = '#ffd700';
                shadowColor = '#ffd700';
                shadowBlur = 40;
            }
            
            ctx.fillStyle = fillColor;
            ctx.shadowColor = shadowColor;
            ctx.shadowBlur = shadowBlur;
            
            const size = TILE_SIZE - 4;
            ctx.beginPath();
            ctx.roundRect(x + 2, drawY + 2, size, size, 8);
            ctx.fill();
            ctx.shadowBlur = 0;
            
            // Рисуем содержимое
            if (candy !== -1) {
                let displayText = '';
                let fontSize = TILE_SIZE * 0.55;
                
                if (candy === 'HORIZONTAL') {
                    displayText = '💥';
                    fontSize = TILE_SIZE * 0.7;
                } else if (candy === 'VERTICAL') {
                    displayText = '💫';
                    fontSize = TILE_SIZE * 0.7;
                } else if (candy < EMOJIS.length) {
                    displayText = EMOJIS[candy];
                }
                
                ctx.font = `${fontSize}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.shadowColor = 'rgba(0,0,0,0.5)';
                ctx.shadowBlur = 8;
                ctx.fillText(displayText, x + TILE_SIZE/2, drawY + TILE_SIZE/2 + 1);
                ctx.shadowBlur = 0;
            }
        }
    }
    
    // Частицы
    for (let p of particles) {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
    ctx.globalAlpha = 1;
    
    if (particles.length > 0) {
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.15;
            p.life -= 0.025;
            if (p.life <= 0) {
                particles.splice(i, 1);
            }
        }
        requestAnimationFrame(drawBoard);
    }
}

// --- roundRect ---
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

// --- Клик (поддержка touch) ---
function handleClick(clientX, clientY) {
    if (isProcessing) return;

    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);
    
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

// --- События мыши и touch ---
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
    updateScore();
    resizeCanvas();
});

// --- Запуск ---
resizeCanvas();
board = createBoard();
drawBoard();
console.log('Игра запущена!');
console.log('Собери 4 в ряд, чтобы создать бомбу!');
console.log('Бомба активируется при соединении с цветом');
