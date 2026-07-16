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

// --- 5 разных цветов с уникальными эмодзи и цветами бомб ---
const COLORS = [
    { id: 0, emoji: '🔴', name: 'Красный', bombH: '💥', bombV: '💫', hex: '#ff4444' },
    { id: 1, emoji: '🔵', name: 'Синий', bombH: '💥', bombV: '💫', hex: '#4488ff' },
    { id: 2, emoji: '🟢', name: 'Зелёный', bombH: '💥', bombV: '💫', hex: '#44ff44' },
    { id: 3, emoji: '🟡', name: 'Жёлтый', bombH: '💥', bombV: '💫', hex: '#ffdd00' },
    { id: 4, emoji: '🟣', name: 'Фиолетовый', bombH: '💥', bombV: '💫', hex: '#cc66ff' }
];

// --- Типы бомб для каждого цвета ---
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

function getBombDisplay(value) {
    const colorId = getBombColor(value);
    const dir = getBombDirection(value);
    if (colorId === -1) return '❓';
    const color = COLORS[colorId];
    return dir === 'horizontal' ? color.bombH : color.bombV;
}

function getBombColorHex(value) {
    const colorId = getBombColor(value);
    if (colorId === -1) return '#ffffff';
    return COLORS[colorId].hex;
}

// --- АДАПТАЦИЯ ПОД ТЕЛЕФОН ---
function getTileSize() {
    const maxWidth = window.innerWidth - 40;
    const maxHeight = window.innerHeight - 200;
    const size = Math.min(maxWidth, maxHeight) / 8;
    return Math.max(30, Math.min(60, size));
}

let TILE_SIZE = getTileSize();

function resizeCanvas() {
    TILE_SIZE = getTileSize();
    canvas.width = COLS * TILE_SIZE;
    canvas.height = ROWS * TILE_SIZE;
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
            // Создаём бомбу соответствующего цвета
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

// --- Активация бомб (только при соединении с цветом) ---
function activateBombs() {
    const toRemove = [];
    const explosions = [];

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const val = board[r][c];
            if (isBomb(val)) {
                const bombColor = getBombColor(val);
                const direction = getBombDirection(val);
                
                // Проверяем, есть ли рядом клетки того же цвета (не бомбы)
                let hasMatch = false;
                const directions = [[0,1],[0,-1],[1,0],[-1,0]];
                for (let [dr, dc] of directions) {
                    const nr = r + dr, nc = c + dc;
                    if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
                        const neighbor = board[nr][nc];
                        if (neighbor !== -1 && !isBomb(neighbor) && neighbor === bombColor) {
                            hasMatch = true;
                            break;
                        }
                    }
                }

                if (hasMatch) {
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
    // 1. Сначала активируем существующие бомбы
    const bombResult = activateBombs();
    
    // 2. Находим новые совпадения
    const matchResult = getAllMatches();
    
    // 3. Объединяем всё для удаления
    const allRemoved = new Set();
    for (let cell of bombResult.removed) {
        allRemoved.add(`${cell.r},${cell.c}`);
    }
    for (let cell of matchResult.cells) {
        allRemoved.add(`${cell.r},${cell.c}`);
    }

    // 4. Создаём новые бомбы (если есть)
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
    // Проверяем обычные совпадения
    const groups = findMatchGroups();
    for (let group of groups) {
        if (group.length >= 3) return true;
    }
    
    // Проверяем, есть ли бомбы, готовые к активации
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const val = board[r][c];
            if (isBomb(val)) {
                const bombColor = getBombColor(val);
                const directions = [[0,1],[0,-1],[1,0],[-1,0]];
                for (let [dr, dc] of directions) {
                    const nr = r + dr, nc = c + dc;
                    if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
                        const neighbor = board[nr][nc];
                        if (neighbor !== -1 && !isBomb(neighbor) && neighbor === bombColor) {
                            return true;
                        }
                    }
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

        // Подсветка удалённых клеток
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
            let displayText = '';
            let fontSize = TILE_SIZE * 0.55;
            let textColor = '#ffffff';
            
            // Определяем цвет и содержимое клетки
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
                // БОМБА - цветная и с уникальным символом
                const bombColorHex = getBombColorHex(candy);
                const dir = getBombDirection(candy);
                fillColor = bombColorHex;
                shadowColor = bombColorHex;
                shadowBlur = 30;
                displayText = dir === 'horizontal' ? '⟷' : '⟷';
                // Поворачиваем для вертикальной
                if (dir === 'vertical') {
                    displayText = '⟷';
                    // Рисуем вертикальную стрелку отдельно
                }
                fontSize = TILE_SIZE * 0.7;
                textColor = '#ffffff';
            } else if (isBombSpawn) {
                fillColor = '#ffd700';
                shadowColor = '#ffd700';
                shadowBlur = 40;
            } else if (candy !== -1 && candy < COLORS.length) {
                // Обычная клетка
                const color = COLORS[candy];
                // Используем светлый фон для цветных клеток
                const colorHex = color.hex;
                fillColor = colorHex + '88'; // Полупрозрачный
                shadowColor = colorHex;
                shadowBlur = 15;
                displayText = color.emoji;
                fontSize = TILE_SIZE * 0.6;
                textColor = '#ffffff';
            }
            
            // Рисуем клетку
            ctx.fillStyle = fillColor;
            ctx.shadowColor = shadowColor;
            ctx.shadowBlur = shadowBlur;
            
            const size = TILE_SIZE - 4;
            ctx.beginPath();
            ctx.roundRect(x + 2, drawY + 2, size, size, 8);
            ctx.fill();
            ctx.shadowBlur = 0;
            
            // Рисуем содержимое
            if (candy !== -1 && candy !== undefined) {
                // Для бомб рисуем специальный дизайн
                if (isBomb(candy)) {
                    const dir = getBombDirection(candy);
                    const colorId = getBombColor(candy);
                    const color = COLORS[colorId];
                    
                    // Рисуем круглый фон для бомбы
                    ctx.beginPath();
                    ctx.arc(x + TILE_SIZE/2, drawY + TILE_SIZE/2, TILE_SIZE * 0.35, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(255,255,255,0.3)';
                    ctx.fill();
                    
                    // Рисуем символ направления
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
                    
                    // Рисуем маленький цветной индикатор
                    ctx.beginPath();
                    ctx.arc(x + TILE_SIZE - 8, drawY + 8, 4, 0, Math.PI * 2);
                    ctx.fillStyle = color.hex;
                    ctx.shadowColor = color.hex;
                    ctx.shadowBlur = 10;
                    ctx.fill();
                    ctx.shadowBlur = 0;
                    
                } else if (!isBombSpawn && candy < COLORS.length) {
                    // Обычная клетка - рисуем эмодзи
                    const color = COLORS[candy];
                    ctx.font = `${fontSize}px Arial`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.shadowColor = 'rgba(0,0,0,0.5)';
                    ctx.shadowBlur = 8;
                    ctx.fillStyle = textColor;
                    ctx.fillText(displayText, x + TILE_SIZE/2, drawY + TILE_SIZE/2 + 1);
                    ctx.shadowBlur = 0;
                } else if (isBombSpawn) {
                    // Анимация появления бомбы
                    const pulse = Math.sin(Date.now() / 150) * 0.3 + 0.7;
                    ctx.font = `${TILE_SIZE * 0.7}px Arial`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.shadowColor = '#ffd700';
                    ctx.shadowBlur = 30 * pulse;
                    ctx.fillStyle = '#ffffff';
                    ctx.fillText('⭐', x + TILE_SIZE/2, drawY + TILE_SIZE/2 + 1);
                    ctx.shadowBlur = 0;
                }
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
    drawBoard();
});

// --- Запуск ---
board = createBoard();
resizeCanvas();
drawBoard();
console.log('Игра запущена!2.2');
console.log('🔴🔵🟢🟡🟣 - 5 разных цветов');
console.log('Собери 4 в ряд → появится бомба соответствующего цвета');
console.log('Бомбы: ↔ - горизонтальная, ↕ - вертикальная');
console.log('Бомба активируется только при соединении 3+ с цветом');
