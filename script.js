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

// --- Вспомогательные функции ---
function getRandomCandy() {
    return Math.floor(Math.random() * EMOJIS.length);
}

// --- Создание доски без совпадений ---
function createBoard() {
    const newBoard = [];
    for (let r = 0; r < ROWS; r++) {
        newBoard[r] = [];
        for (let c = 0; c < COLS; c++) {
            let candy;
            let attempts = 0;
            do {
                candy = getRandomCandy();
                attempts++;
                // Проверяем, не создаст ли это совпадение
                const horizontalMatch = (c >= 2 && newBoard[r][c-1] === candy && newBoard[r][c-2] === candy);
                const verticalMatch = (r >= 2 && newBoard[r-1][c] === candy && newBoard[r-2][c] === candy);
                if (!horizontalMatch && !verticalMatch) break;
                if (attempts > 100) break;
            } while (true);
            newBoard[r][c] = candy;
        }
    }
    return newBoard;
}

// --- Поиск всех совпадений ---
function findAllMatches() {
    const matches = [];
    const matched = new Set();

    // Проверяем горизонтали
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS - 2; c++) {
            const val = board[r][c];
            if (val === -1) continue;
            let count = 1;
            while (c + count < COLS && board[r][c + count] === val) count++;
            if (count >= 3) {
                for (let i = 0; i < count; i++) {
                    const key = `${r},${c + i}`;
                    if (!matched.has(key)) {
                        matched.add(key);
                        matches.push({r, c: c + i});
                    }
                }
            }
        }
    }

    // Проверяем вертикали
    for (let c = 0; c < COLS; c++) {
        for (let r = 0; r < ROWS - 2; r++) {
            const val = board[r][c];
            if (val === -1) continue;
            let count = 1;
            while (r + count < ROWS && board[r + count][c] === val) count++;
            if (count >= 3) {
                for (let i = 0; i < count; i++) {
                    const key = `${r + i},${c}`;
                    if (!matched.has(key)) {
                        matched.add(key);
                        matches.push({r: r + i, c});
                    }
                }
            }
        }
    }

    return matches;
}

// --- Проверка, есть ли совпадения ---
function hasMatches() {
    return findAllMatches().length > 0;
}

// --- Удаление совпадений и гравитация ---
function clearMatches() {
    const matches = findAllMatches();
    if (matches.length === 0) return false;

    // Удаляем совпадения
    for (let cell of matches) {
        board[cell.r][cell.c] = -1;
    }

    // Применяем гравитацию
    for (let c = 0; c < COLS; c++) {
        let writeRow = ROWS - 1;
        for (let r = ROWS - 1; r >= 0; r--) {
            if (board[r][c] !== -1) {
                board[writeRow][c] = board[r][c];
                if (writeRow !== r) board[r][c] = -1;
                writeRow--;
            }
        }
        // Заполняем пустоты новыми конфетами
        for (let r = writeRow; r >= 0; r--) {
            board[r][c] = getRandomCandy();
        }
    }

    // Начисляем очки
    score += matches.length * 10;
    updateScore();

    return true;
}

// --- Полный цикл очистки ---
function processBoard() {
    if (isProcessing) return;
    isProcessing = true;

    let cleared = false;
    while (clearMatches()) {
        cleared = true;
        drawBoard();
    }

    isProcessing = false;
    
    if (cleared) {
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
    
    drawBoard();
}

// --- Проверка возможных ходов ---
function hasValidMoves() {
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            // Пробуем поменяться с правым соседом
            if (c < COLS - 1) {
                swap(r, c, r, c + 1);
                if (hasMatches()) {
                    swap(r, c, r, c + 1);
                    return true;
                }
                swap(r, c, r, c + 1);
            }
            // Пробуем поменяться с нижним соседом
            if (r < ROWS - 1) {
                swap(r, c, r + 1, c);
                if (hasMatches()) {
                    swap(r, c, r + 1, c);
                    return true;
                }
                swap(r, c, r + 1, c);
            }
        }
    }
    return false;
}

// --- Обмен двух клеток ---
function swap(r1, c1, r2, c2) {
    const temp = board[r1][c1];
    board[r1][c1] = board[r2][c2];
    board[r2][c2] = temp;
}

// --- Обработка кликов ---
canvas.addEventListener('click', function(e) {
    if (isProcessing) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    const col = Math.floor(x / TILE_SIZE);
    const row = Math.floor(y / TILE_SIZE);
    
    if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return;

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
        // Сохраняем координаты
        const r1 = selectedRow, c1 = selectedCol;
        const r2 = row, c2 = col;
        
        // Меняем местами
        swap(r1, c1, r2, c2);
        
        // Проверяем, есть ли совпадения
        if (hasMatches()) {
            // Ход валидный
            selectedRow = -1;
            selectedCol = -1;
            drawBoard();
            processBoard();
        } else {
            // Ход невалидный - меняем обратно
            swap(r1, c1, r2, c2);
            selectedRow = -1;
            selectedCol = -1;
            drawBoard();
        }
    } else {
        // Кликнули на не соседнюю клетку - выбираем её
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
            
            // Фон клетки
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
            
            // Рисуем конфету
            if (candy !== -1) {
                ctx.font = `${TILE_SIZE * 0.6}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = 'white';
                ctx.shadowColor = 'rgba(0,0,0,0.5)';
                ctx.shadowBlur = 8;
                ctx.fillText(EMOJIS[candy], x + TILE_SIZE/2, y + TILE_SIZE/2 + 2);
                ctx.shadowBlur = 0;
            }
        }
    }
}

// --- Функция для скругления прямоугольников ---
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
});

// --- Запуск ---
board = createBoard();
drawBoard();
