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
                // Проверяем, не создаст ли это совпадение
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

// --- Поиск совпадений (возвращает массив объектов {r, c}) ---
function findMatches() {
    const matches = [];
    const visited = new Set();

    // Горизонтальные
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

    // Вертикальные
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

// --- Проверка наличия совпадений ---
function hasMatches() {
    return findMatches().length > 0;
}

// --- Удаление совпадений и гравитация ---
function removeMatches() {
    const matches = findMatches();
    if (matches.length === 0) return false;

    console.log('Удаляем совпадений:', matches.length);

    // 1. Помечаем ячейки как пустые
    for (let cell of matches) {
        board[cell.r][cell.c] = -1;
    }

    // 2. Гравитация (всё падает вниз)
    for (let c = 0; c < COLS; c++) {
        let emptyRow = ROWS - 1;
        // Сдвигаем все непустые ячейки вниз
        for (let r = ROWS - 1; r >= 0; r--) {
            if (board[r][c] !== -1) {
                board[emptyRow][c] = board[r][c];
                if (emptyRow !== r) {
                    board[r][c] = -1;
                }
                emptyRow--;
            }
        }
        // Заполняем пустоты новыми случайными значениями
        for (let r = emptyRow; r >= 0; r--) {
            board[r][c] = Math.floor(Math.random() * EMOJIS.length);
        }
    }

    // 3. Начисляем очки
    score += matches.length * 10;
    updateScore();

    return true;
}

// --- Основной игровой цикл ---
function processBoard() {
    if (isProcessing) return;
    isProcessing = true;

    console.log('Обработка доски...');
    let anyRemoved = false;

    // Удаляем совпадения, пока они есть
    let maxIterations = 50;
    while (maxIterations > 0 && removeMatches()) {
        anyRemoved = true;
        drawBoard();
        maxIterations--;
    }

    isProcessing = false;
    drawBoard();

    if (anyRemoved) {
        // Проверяем, есть ли доступные ходы
        if (!hasValidMoves()) {
            setTimeout(() => {
                alert('Нет доступных ходов! Перемешиваем...');
                board = createBoard();
                selectedRow = -1;
                selectedCol = -1;
                drawBoard();
            }, 300);
        }
    }
}

// --- Проверка, образуются ли совпадения ПОСЛЕ обмена ---
function wouldMatchAfterSwap(r1, c1, r2, c2) {
    // Меняем
    const temp = board[r1][c1];
    board[r1][c1] = board[r2][c2];
    board[r2][c2] = temp;
    
    // Проверяем совпадения
    const has = hasMatches();
    
    // Меняем обратно
    const tempBack = board[r1][c1];
    board[r1][c1] = board[r2][c2];
    board[r2][c2] = tempBack;
    
    return has;
}

// --- Проверка возможных ходов ---
function hasValidMoves() {
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            // Вправо
            if (c < COLS - 1) {
                if (wouldMatchAfterSwap(r, c, r, c + 1)) {
                    return true;
                }
            }
            // Вниз
            if (r < ROWS - 1) {
                if (wouldMatchAfterSwap(r, c, r + 1, c)) {
                    return true;
                }
            }
        }
    }
    return false;
}

// --- Обмен ---
function swap(r1, c1, r2, c2) {
    const temp = board[r1][c1];
    board[r1][c1] = board[r2][c2];
    board[r2][c2] = temp;
}

// --- Клик ---
canvas.addEventListener('click', function(e) {
    if (isProcessing) {
        console.log('Идёт обработка, подождите...');
        return;
    }

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    const col = Math.floor(x / TILE_SIZE);
    const row = Math.floor(y / TILE_SIZE);
    
    if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return;

    console.log(`Клик: row=${row}, col=${col}`);

    // Если ничего не выбрано
    if (selectedRow === -1) {
        selectedRow = row;
        selectedCol = col;
        drawBoard();
        return;
    }

    // Если кликнули на ту же клетку
    if (selectedRow === row && selectedCol === col) {
        selectedRow = -1;
        selectedCol = -1;
        drawBoard();
        return;
    }

    // Проверяем соседство
    const dr = Math.abs(selectedRow - row);
    const dc = Math.abs(selectedCol - col);
    
    if ((dr === 1 && dc === 0) || (dr === 0 && dc === 1)) {
        const r1 = selectedRow, c1 = selectedCol;
        const r2 = row, c2 = col;
        
        // Проверяем, будет ли совпадение после обмена
        if (wouldMatchAfterSwap(r1, c1, r2, c2)) {
            console.log('Валидный ход!');
            // Меняем местами (теперь уже насовсем)
            swap(r1, c1, r2, c2);
            selectedRow = -1;
            selectedCol = -1;
            drawBoard();
            processBoard();
        } else {
            console.log('Невалидный ход');
            selectedRow = -1;
            selectedCol = -1;
            drawBoard();
        }
    } else {
        // Выбираем новую клетку
        selectedRow = row;
        selectedCol = col;
        drawBoard();
    }
});

// --- Отрисовка ---
function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const x = c * TILE_SIZE;
            const y = r * TILE_SIZE;
            const candy = board[r][c];
            
            // Фон
            if (selectedRow === r && selectedCol === c) {
                ctx.fillStyle = '#8b6fb0';
                ctx.shadowColor = '#b392d0';
                ctx.shadowBlur = 25;
            } else {
                ctx.fillStyle = '#4a3a5c';
                ctx.shadowColor = 'rgba(0,0,0,0.3)';
                ctx.shadowBlur = 8;
            }
            
            ctx.beginPath();
            ctx.roundRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4, 10);
            ctx.fill();
            ctx.shadowBlur = 0;
            
            // Эмодзи
            if (candy !== -1 && candy < EMOJIS.length) {
                ctx.font = `${TILE_SIZE * 0.6}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.shadowColor = 'rgba(0,0,0,0.5)';
                ctx.shadowBlur = 8;
                ctx.fillText(EMOJIS[candy], x + TILE_SIZE/2, y + TILE_SIZE/2 + 2);
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
    updateScore();
    drawBoard();
    console.log('Новая игра!');
});

// --- Запуск ---
board = createBoard();
drawBoard();
console.log('Игра запущена!');
console.log('Начальных совпадений:', findMatches().length);
