const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreSpan = document.getElementById('scoreValue');

const ROWS = 8;
const COLS = 8;
const TILE_SIZE = 60;
canvas.width = COLS * TILE_SIZE;
canvas.height = ROWS * TILE_SIZE;

const EMOJIS = ['🍎', '🍊', '🍇', '🍒', '🍉'];
// Специальные символы для бомб
const BOMB_TYPES = {
    HORIZONTAL: '💥', // горизонтальная бомба
    VERTICAL: '💫'    // вертикальная бомба
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

// --- Поиск совпадений с учётом бомб ---
function findMatches() {
    const matches = [];
    const visited = new Set();

    // Горизонтальные
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS - 2; c++) {
            const val = board[r][c];
            if (val === -1 || isBomb(val)) continue;
            let len = 1;
            while (c + len < COLS && board[r][c + len] === val) len++;
            if (len >= 3) {
                // Если собрали ровно 4, создаём бомбу
                if (len === 4) {
                    // Создаём горизонтальную бомбу
                    const bombRow = r;
                    const bombCol = c + 1; // центр линии
                    board[bombRow][bombCol] = 'HORIZONTAL';
                    // Добавляем все клетки кроме бомбы в совпадения
                    for (let i = 0; i < len; i++) {
                        if (i !== 1) {
                            const key = r + ',' + (c + i);
                            if (!visited.has(key)) {
                                visited.add(key);
                                matches.push({r: r, c: c + i});
                            }
                        }
                    }
                } else {
                    // Обычные совпадения (3 или 5+)
                    for (let i = 0; i < len; i++) {
                        const key = r + ',' + (c + i);
                        if (!visited.has(key)) {
                            visited.add(key);
                            matches.push({r: r, c: c + i});
                        }
                    }
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
                if (len === 4) {
                    // Создаём вертикальную бомбу
                    const bombRow = r + 1; // центр линии
                    const bombCol = c;
                    board[bombRow][bombCol] = 'VERTICAL';
                    // Добавляем все клетки кроме бомбы в совпадения
                    for (let i = 0; i < len; i++) {
                        if (i !== 1) {
                            const key = (r + i) + ',' + c;
                            if (!visited.has(key)) {
                                visited.add(key);
                                matches.push({r: r + i, c: c});
                            }
                        }
                    }
                } else {
                    for (let i = 0; i < len; i++) {
                        const key = (r + i) + ',' + c;
                        if (!visited.has(key)) {
                            visited.add(key);
                            matches.push({r: r + i, c: c});
                        }
                    }
                }
            }
            r += len - 1;
        }
    }

    return matches;
}

// --- Активация бомб ---
function activateBombs() {
    const explosions = [];
    const toRemove = new Set();

    // Ищем все бомбы на доске
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const val = board[r][c];
            if (val === 'HORIZONTAL' || val === 'VERTICAL') {
                // Активируем бомбу
                if (val === 'HORIZONTAL') {
                    // Очищаем всю горизонтальную линию
                    for (let col = 0; col < COLS; col++) {
                        if (board[r][col] !== -1) {
                            toRemove.add(`${r},${col}`);
                        }
                    }
                    explosions.push({r, c, type: 'horizontal'});
                } else if (val === 'VERTICAL') {
                    // Очищаем всю вертикальную линию
                    for (let row = 0; row < ROWS; row++) {
                        if (board[row][c] !== -1) {
                            toRemove.add(`${row},${c}`);
                        }
                    }
                    explosions.push({r, c, type: 'vertical'});
                }
            }
        }
    }

    // Удаляем клетки, попавшие под взрыв
    const removedCells = [];
    for (let key of toRemove) {
        const [r, c] = key.split(',').map(Number);
        if (board[r][c] !== -1) {
            removedCells.push({r, c});
            board[r][c] = -1;
        }
    }

    return { explosions, removedCells };
}

// --- Основная функция поиска совпадений и активации бомб ---
function processMatches() {
    let allMatches = [];
    let allRemoved = [];
    let allExplosions = [];

    // Сначала активируем существующие бомбы
    const bombResult = activateBombs();
    allRemoved = allRemoved.concat(bombResult.removedCells);
    allExplosions = allExplosions.concat(bombResult.explosions);

    // Затем ищем обычные совпадения
    const matches = findMatches();
    allMatches = allMatches.concat(matches);

    // Если есть и бомбы, и совпадения, объединяем
    const allToRemove = new Set();
    for (let cell of allRemoved) {
        allToRemove.add(`${cell.r},${cell.c}`);
    }
    for (let cell of allMatches) {
        allToRemove.add(`${cell.r},${cell.c}`);
    }

    // Преобразуем обратно в массив
    const finalRemoved = [];
    for (let key of allToRemove) {
        const [r, c] = key.split(',').map(Number);
        finalRemoved.push({r, c});
    }

    return {
        matches: allMatches,
        removed: finalRemoved,
        explosions: allExplosions,
        hasBombs: allExplosions.length > 0
    };
}

// --- Проверка наличия совпадений (упрощённая) ---
function hasMatches() {
    // Проверяем обычные совпадения
    const matches = findMatches();
    if (matches.length > 0) return true;
    
    // Проверяем, есть ли бомбы на доске
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (isBomb(board[r][c])) return true;
        }
    }
    return false;
}

// --- Проверка, образуются ли совпадения после обмена ---
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

// --- Создание частиц для взрыва ---
function createExplosionParticles(cells, color = '#ff6b6b') {
    for (let cell of cells) {
        const x = cell.c * TILE_SIZE + TILE_SIZE/2;
        const y = cell.r * TILE_SIZE + TILE_SIZE/2;
        for (let i = 0; i < 15; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 3 + Math.random() * 6;
            particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 3,
                life: 1,
                size: 3 + Math.random() * 8,
                color: color
            });
        }
    }
}

// --- Анимированная обработка ---
function processBoardWithAnimation() {
    if (isProcessing) return;
    isProcessing = true;

    function step() {
        const result = processMatches();
        
        if (result.removed.length === 0 && result.matches.length === 0) {
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

        console.log('Удалено клеток:', result.removed.length);
        if (result.explosions.length > 0) {
            console.log('Взрывов бомб:', result.explosions.length);
        }

        // Подсвечиваем удалённые клетки
        matchCells = result.removed;
        
        // Создаём частицы для взрывов
        if (result.explosions.length > 0) {
            createExplosionParticles(result.removed, '#ff4444');
        } else {
            createExplosionParticles(result.removed, '#ffd700');
        }
        
        drawBoard();

        // Через 500ms удаляем и запускаем падение
        setTimeout(() => {
            matchCells = [];

            // Применяем гравитацию
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

            // Начисляем очки
            const points = result.removed.length * 10 + result.explosions.length * 50;
            score += points;
            updateScore();

            // Анимируем падение
            dropAnimations = dropData.map(d => ({
                ...d,
                progress: 0,
                startY: d.fromRow === -1 ? -TILE_SIZE : d.fromRow * TILE_SIZE,
                endY: d.toRow * TILE_SIZE
            }));

            let startTime = Date.now();
            const duration = 400;

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
                    // Проверяем новые совпадения
                    setTimeout(() => step(), 100);
                }
            }

            animateDrop();

        }, 500);
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
            
            // Фон клетки
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
            }
            
            ctx.fillStyle = fillColor;
            ctx.shadowColor = shadowColor;
            ctx.shadowBlur = shadowBlur;
            
            ctx.beginPath();
            ctx.roundRect(x + 2, drawY + 2, TILE_SIZE - 4, TILE_SIZE - 4, 10);
            ctx.fill();
            ctx.shadowBlur = 0;
            
            // Рисуем содержимое
            if (candy !== -1) {
                let displayText = '';
                let fontSize = TILE_SIZE * 0.6;
                
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
                ctx.fillText(displayText, x + TILE_SIZE/2, drawY + TILE_SIZE/2 + 2);
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
            p.life -= 0.02;
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

// --- Обновление счёта ---
function updateScore() {
    scoreSpan.textContent = score;
}

// --- Клик ---
canvas.addEventListener('click', function(e) {
    if (isProcessing) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
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
});

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
    updateScore();
    drawBoard();
});

// --- Запуск ---
board = createBoard();
drawBoard();
console.log('Игра запущена с бомбами!');
console.log('Собери 4 в ряд, чтобы создать бомбу!');
