const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreSpan = document.getElementById('scoreValue');

const ROWS = 8;
const COLS = 8;
const TILE_SIZE = 60;
canvas.width = COLS * TILE_SIZE;
canvas.height = ROWS * TILE_SIZE;

const COLORS = ['🍎', '🍊', '🍇', '🍒', '🍉']; // 5 видов
let board = [];
let score = 0;
let selectedRow = -1;
let selectedCol = -1;
let isProcessing = false;

// --- Инициализация ---
function initBoard() {
    board = [];
    for (let r = 0; r < ROWS; r++) {
        board[r] = [];
        for (let c = 0; c < COLS; c++) {
            board[r][c] = Math.floor(Math.random() * COLORS.length);
        }
    }
    // Убираем начальные совпадения
    while (findMatches().length > 0) {
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                board[r][c] = Math.floor(Math.random() * COLORS.length);
            }
        }
    }
    score = 0;
    updateScore();
}

// --- Поиск совпадений ---
function findMatches() {
    const matches = new Set(); // используем Set, чтобы не дублировать ячейки

    // Горизонтальные (3+)
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS - 2; c++) {
            const val = board[r][c];
            if (val === -1) continue;
            let len = 1;
            while (c + len < COLS && board[r][c + len] === val) len++;
            if (len >= 3) {
                for (let i = 0; i < len; i++) {
                    matches.add(`${r},${c + i}`);
                }
            }
            c += len - 1;
        }
    }

    // Вертикальные (3+)
    for (let c = 0; c < COLS; c++) {
        for (let r = 0; r < ROWS - 2; r++) {
            const val = board[r][c];
            if (val === -1) continue;
            let len = 1;
            while (r + len < ROWS && board[r + len][c] === val) len++;
            if (len >= 3) {
                for (let i = 0; i < len; i++) {
                    matches.add(`${r + i},${c}`);
                }
            }
            r += len - 1;
        }
    }

    return [...matches].map(str => {
        const [r, c] = str.split(',').map(Number);
        return { r, c };
    });
}

// --- Удаление совпадений и падение ---
function clearAndDrop() {
    let matches = findMatches();
    if (matches.length === 0) return false;

    // Удаляем
    for (let cell of matches) {
        board[cell.r][cell.c] = -1;
    }

    // Падение (гравитация)
    for (let c = 0; c < COLS; c++) {
        let writeRow = ROWS - 1;
        for (let r = ROWS - 1; r >= 0; r--) {
            if (board[r][c] !== -1) {
                board[writeRow][c] = board[r][c];
                if (writeRow !== r) board[r][c] = -1;
                writeRow--;
            }
        }
        // Заполняем пустоты новыми случайными
        for (let r = writeRow; r >= 0; r--) {
            board[r][c] = Math.floor(Math.random() * COLORS.length);
        }
    }

    // Начисляем очки (за каждый удалённый элемент)
    score += matches.length * 10;
    updateScore();

    return true;
}

// --- Цикл удаления, пока есть совпадения ---
function processBoard() {
    isProcessing = true;
    let anyCleared = false;
    while (true) {
        const cleared = clearAndDrop();
        if (!cleared) break;
        anyCleared = true;
    }
    isProcessing = false;
    drawBoard();
    return anyCleared;
}

// --- Обмен двух клеток ---
function swap(r1, c1, r2, c2) {
    const temp = board[r1][c1];
    board[r1][c1] = board[r2][c2];
    board[r2][c2] = temp;
}

// --- Проверка: есть ли совпадения после обмена ---
function hasValidSwap(r1, c1, r2, c2) {
    swap(r1, c1, r2, c2);
    const matches = findMatches();
    swap(r1, c1, r2, c2); // меняем обратно
    return matches.length > 0;
}

// --- Обработка клика ---
canvas.addEventListener('click', (e) => {
    if (isProcessing) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const col = Math.floor(x / TILE_SIZE);
    const row = Math.floor(y / TILE_SIZE);
    if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return;

    // Если ничего не выбрано — выбираем
    if (selectedRow === -1) {
        selectedRow = row;
        selectedCol = col;
        drawBoard();
        return;
    }

    // Если кликнули на ту же клетку — снимаем выделение
    if (selectedRow === row && selectedCol === col) {
        selectedRow = -1;
        selectedCol = -1;
        drawBoard();
        return;
    }

    // Проверяем, что клетки соседние (по горизонтали или вертикали)
    const dr = Math.abs(selectedRow - row);
    const dc = Math.abs(selectedCol - col);
    if ((dr === 1 && dc === 0) || (dr === 0 && dc === 1)) {
        // Пробуем обменять
        swap(selectedRow, selectedCol, row, col);
        if (hasValidSwap(selectedRow, selectedCol, row, col)) {
            // Обмен валидный — оставляем и обрабатываем
            processBoard();
        } else {
            // Невалидный — меняем обратно
            swap(selectedRow, selectedCol, row, col);
        }
    }

    selectedRow = -1;
    selectedCol = -1;
    drawBoard();
});

// --- Отрисовка ---
function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const x = c * TILE_SIZE;
            const y = r * TILE_SIZE;
            const val = board[r][c];

            // Рисуем фон ячейки
            ctx.fillStyle = (selectedRow === r && selectedCol === c) ? '#63547c' : '#4a3a5c';
            ctx.shadowColor = 'rgba(0,0,0,0.3)';
            ctx.shadowBlur = 8;
            ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
            ctx.shadowBlur = 0;

            // Рисуем эмодзи
            if (val !== -1) {
                ctx.font = `${TILE_SIZE * 0.65}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#fff';
                ctx.shadowColor = 'rgba(0,0,0,0.4)';
                ctx.shadowBlur = 10;
                ctx.fillText(COLORS[val], x + TILE_SIZE / 2, y + TILE_SIZE / 2 + 2);
                ctx.shadowBlur = 0;
            }
        }
    }
}

function updateScore() {
    scoreSpan.textContent = score;
}

// --- Новая игра ---
document.getElementById('resetBtn').addEventListener('click', () => {
    initBoard();
    selectedRow = -1;
    selectedCol = -1;
    isProcessing = false;
    drawBoard();
});

// --- Запуск ---
initBoard();
drawBoard();
