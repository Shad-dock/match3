// --- Состояние игры ---
let board = [];
let score = 0;
let selectedRow = -1;
let selectedCol = -1;
let isProcessing = false;
let bombSpawned = null;

// --- COLORS (экспортируем для других модулей) ---
export const COLORS = [
    { id: 0, emoji: '🔴', name: 'Красный', hex: '#ff4444' },
    { id: 1, emoji: '🔵', name: 'Синий', hex: '#4488ff' },
    { id: 2, emoji: '🟢', name: 'Зелёный', hex: '#44ff44' },
    { id: 3, emoji: '🟡', name: 'Жёлтый', hex: '#ffdd00' },
    { id: 4, emoji: '🟣', name: 'Фиолетовый', hex: '#cc66ff' }
];

// --- getters/setters ---
export function getBoard() { return board; }
export function setBoard(newBoard) { board = newBoard; }
export function getScore() { return score; }
export function setScore(newScore) { score = newScore; }
export function getSelected() { return { row: selectedRow, col: selectedCol }; }
export function setSelected(row, col) { selectedRow = row; selectedCol = col; }
export function getIsProcessing() { return isProcessing; }
export function setIsProcessing(val) { isProcessing = val; }
export function getBombSpawned() { return bombSpawned; }
export function setBombSpawned(val) { bombSpawned = val; }
export function resetGameState() {
    score = 0;
    selectedRow = -1;
    selectedCol = -1;
    isProcessing = false;
    bombSpawned = null;
}

// --- Создание доски ---
export function createBoard() {
    const newBoard = [];
    for (let r = 0; r < 8; r++) {
        newBoard[r] = [];
        for (let c = 0; c < 8; c++) {
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

// --- Проверка бомбы ---
export function isBomb(value) {
    return typeof value === 'string' && (value.startsWith('H') || value.startsWith('V'));
}

export function getBombColor(value) {
    if (!isBomb(value)) return -1;
    return parseInt(value.slice(1));
}

export function getBombDirection(value) {
    if (!isBomb(value)) return null;
    return value.startsWith('H') ? 'horizontal' : 'vertical';
}

export function getBombColorHex(value) {
    const colorId = getBombColor(value);
    if (colorId === -1) return '#ffffff';
    return COLORS[colorId].hex;
}

// --- Поиск совпадений ---
function findMatchGroups(board) {
    const groups = [];
    const visited = new Set();
    const ROWS = 8, COLS = 8;

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
                        isHorizontal: false
                    });
                }
            }
            r += len - 1;
        }
    }

    return groups;
}

// --- Проверка бомбы на 3+ ---
function checkBombMatch(board, r, c, bombColor) {
    const ROWS = 8, COLS = 8;
    let horizontalCount = 1;
    for (let col = c - 1; col >= 0; col--) {
        const val = board[r][col];
        if (val === -1 || isBomb(val) || val !== bombColor) break;
        horizontalCount++;
    }
    for (let col = c + 1; col < COLS; col++) {
        const val = board[r][col];
        if (val === -1 || isBomb(val) || val !== bombColor) break;
        horizontalCount++;
    }
    if (horizontalCount >= 3) return true;
    
    let verticalCount = 1;
    for (let row = r - 1; row >= 0; row--) {
        const val = board[row][c];
        if (val === -1 || isBomb(val) || val !== bombColor) break;
        verticalCount++;
    }
    for (let row = r + 1; row < ROWS; row++) {
        const val = board[row][c];
        if (val === -1 || isBomb(val) || val !== bombColor) break;
        verticalCount++;
    }
    return verticalCount >= 3;
}

// --- Обработка совпадений ---
export function processMatches(board) {
    // Активация бомб
    const bombResult = activateBombs(board);
    const matchResult = getAllMatches(board);
    
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

function getAllMatches(board) {
    const groups = findMatchGroups(board);
    const allCells = [];
    const bombToCreate = [];

    for (let group of groups) {
        if (group.length === 4) {
            const centerIndex = Math.floor(group.cells.length / 2);
            const center = group.cells[centerIndex];
            const bombType = (group.isHorizontal ? 'H' : 'V') + group.color;
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

function activateBombs(board) {
    const ROWS = 8, COLS = 8;
    const toRemove = [];
    const explosions = [];

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const val = board[r][c];
            if (isBomb(val)) {
                const bombColor = getBombColor(val);
                const direction = getBombDirection(val);
                
                if (checkBombMatch(board, r, c, bombColor)) {
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

export function hasValidMoves(board) {
    const ROWS = 8, COLS = 8;
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (c < COLS - 1) {
                swap(board, r, c, r, c + 1);
                const has = findMatchGroups(board).length > 0;
                swap(board, r, c, r, c + 1);
                if (has) return true;
            }
            if (r < ROWS - 1) {
                swap(board, r, c, r + 1, c);
                const has = findMatchGroups(board).length > 0;
                swap(board, r, c, r + 1, c);
                if (has) return true;
            }
        }
    }
    return false;
}

function swap(board, r1, c1, r2, c2) {
    const temp = board[r1][c1];
    board[r1][c1] = board[r2][c2];
    board[r2][c2] = temp;
}