const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreSpan = document.getElementById('scoreValue');

const ROWS = 8;
const COLS = 8;
const TILE_SIZE = 60;
canvas.width = COLS * TILE_SIZE;
canvas.height = ROWS * TILE_SIZE;

const EMOJIS = ['🍎', '🍊', '🍇', '🍒', '🍉'];
let board = [];
let score = 0;
let selectedRow = -1;
let selectedCol = -1;
let isProcessing = false;

// --- Анимационные переменные ---
let animating = false;
let animationQueue = [];
let matchHighlights = []; // подсвеченные совпадения
let fallingCells = []; // падающие клетки {row, col, offset}

// --- Создание доски БЕЗ совпадений ---
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

// --- Поиск совпадений ---
function findMatches() {
    const matches = [];
    const visited = new Set();

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS - 2; c++) {
            const val = board[r][c];
            if (val === -1) continue;
            let len = 1;
            while (c + len < COLS && board[r][c + len] === val) len++;
            if (len >= 3) {
                for (let i = 0; i < len; i++) {
                    const key = r + ',' + (c + i);
                    if (!visited.has(key)) {
                        visited.add(key);
                        matches.push({r: r, c: c + i});
                    }
                }
            }
            c += len - 1;
        }
    }

    for (let c = 0; c < COLS; c++) {
        for (let r = 0; r < ROWS - 2; r++) {
            const val = board[r][c];
            if (val === -1) continue;
            let len = 1;
            while (r + len < ROWS && board[r + len][c] === val) len++;
            if (len >= 3) {
                for (let i = 0; i < len; i++) {
                    const key = (r + i) + ',' + c;
                    if (!visited.has(key)) {
                        visited.add(key);
                        matches.push({r: r + i, c: c});
                    }
                }
            }
            r += len - 1;
        }
    }

    return matches;
}

function hasMatches() {
    return findMatches().length > 0;
}

// --- Проверка, образуются ли совпадения ПОСЛЕ обмена ---
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

// --- Анимированное удаление с падением ---
function processBoardWithAnimation() {
    if (isProcessing || animating) return;
    isProcessing = true;
    animating = true;

    function step() {
        const matches = findMatches();
        
        if (matches.length === 0) {
            // Закончили обработку
            animating = false;
            isProcessing = false;
            matchHighlights = [];
            fallingCells = [];
            drawBoard();
            
            if (!hasValidMoves()) {
                setTimeout(() => {
                    alert('Нет доступных ходов! Перемешиваем...');
                    board = createBoard();
                    selectedRow = -1;
                    selectedCol = -1;
                    drawBoard();
                }, 300);
            }
            return;
        }

        // 1. Показываем совпадения (подсветка)
        matchHighlights = matches;
        drawBoard();

        // 2. Через 300ms удаляем и запускаем падение
        setTimeout(() => {
            // Удаляем совпадения
            for (let cell of matches) {
                board[cell.r][cell.c] = -1;
            }
            matchHighlights = [];
            
            // Сохраняем, что было до падения
            const beforeDrop = board.map(row => [...row]);
            
            // Применяем гравитацию
            const dropInfo = [];
            for (let c = 0; c < COLS; c++) {
                let emptyRow = ROWS - 1;
                let dropCount = 0;
                for (let r = ROWS - 1; r >= 0; r--) {
                    if (board[r][c] !== -1) {
                        if (emptyRow !== r) {
                            dropInfo.push({
                                fromRow: r,
                                toRow: emptyRow,
                                col: c,
                                value: board[r][c]
                            });
                            board[emptyRow][c] = board[r][c];
                            board[r][c] = -1;
                            dropCount++;
                        }
                        emptyRow--;
                    }
                }
                // Заполняем пустоты новыми
                for (let r = emptyRow; r >= 0; r--) {
                    const newVal = Math.floor(Math.random() * EMOJIS.length);
                    dropInfo.push({
                        fromRow: r - 1,
                        toRow: r,
                        col: c,
                        value: newVal,
                        isNew: true
                    });
                    board[r][c] = newVal;
                }
            }

            // Начисляем очки
            score += matches.length * 10;
            updateScore();

            // Анимируем падение
            animateDrop(dropInfo, step);

        }, 300);
    }

    step();
}

// --- Анимация падения ---
function animateDrop(dropInfo, callback) {
    let progress = 0;
    const duration = 300; // мс
    const startTime = Date.now();

    // Сохраняем начальные позиции для анимации
    const animations = dropInfo.map(info => ({
        ...info,
        startRow: info.fromRow,
        currentOffset: 0
    }));

    function animateStep() {
        const elapsed = Date.now() - startTime;
        progress = Math.min(elapsed / duration, 1);
        
        // Плавная кривая (ease-in)
        const eased = progress * progress * (3 - 2 * progress);
        
        // Обновляем падающие клетки для отрисовки
        fallingCells = animations.map(anim => ({
            col: anim.col,
            toRow: anim.toRow,
            fromRow: anim.fromRow,
            value: anim.value,
            isNew: anim.isNew || false,
            offset: (1 - eased) * TILE_SIZE * (anim.toRow - anim.fromRow)
        }));

        drawBoard();

        if (progress < 1) {
            requestAnimationFrame(animateStep);
        } else {
            fallingCells = [];
            callback();
        }
    }

    animateStep();
}

// --- Клик ---
canvas.addEventListener('click', function(e) {
    if (isProcessing || animating) return;

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

// --- Отрисовка с анимацией ---
function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Сначала рисуем все клетки
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const x = c * TILE_SIZE;
            const y = r * TILE_SIZE;
            let candy = board[r][c];
            
            // Проверяем, не падает ли тут клетка
            let isFalling = false;
            let fallOffset = 0;
            for (let fall of fallingCells) {
                if (fall.toRow === r && fall.col === c) {
                    isFalling = true;
                    fallOffset = fall.offset;
                    candy = fall.value;
                    break;
                }
            }
            
            // Проверяем, подсвечена ли клетка как совпадение
            const isHighlighted = matchHighlights.some(m => m.r === r && m.c === c);
            
            // Рисуем фон
            let fillColor = '#4a3a5c';
            let shadowColor = 'rgba(0,0,0,0.3)';
            let shadowBlur = 8;
            
            if (selectedRow === r && selectedCol === c) {
                fillColor = '#8b6fb0';
                shadowColor = '#b392d0';
                shadowBlur = 25;
            } else if (isHighlighted) {
                fillColor = '#ffd966';
                shadowColor = '#ffb347';
                shadowBlur = 30;
            }
            
            ctx.fillStyle = fillColor;
            ctx.shadowColor = shadowColor;
            ctx.shadowBlur = shadowBlur;
            
            const drawY = y + (isFalling ? fallOffset : 0);
            ctx.beginPath();
            ctx.roundRect(x + 2, drawY + 2, TILE_SIZE - 4, TILE_SIZE - 4, 10);
            ctx.fill();
            ctx.shadowBlur = 0;
            
            // Рисуем эмодзи
            if (candy !== -1 && candy < EMOJIS.length) {
                ctx.font = `${TILE_SIZE * 0.6}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.shadowColor = 'rgba(0,0,0,0.5)';
                ctx.shadowBlur = 8;
                ctx.fillText(EMOJIS[candy], x + TILE_SIZE/2, drawY + TILE_SIZE/2 + 2);
                ctx.shadowBlur = 0;
            }
        }
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

// --- Новая игра ---
document.getElementById('resetBtn').addEventListener('click', function() {
    board = createBoard();
    score = 0;
    selectedRow = -1;
    selectedCol = -1;
    isProcessing = false;
    animating = false;
    matchHighlights = [];
    fallingCells = [];
    updateScore();
    drawBoard();
});

// --- Запуск ---
board = createBoard();
drawBoard();
console.log('Игра запущена с анимацией!');
