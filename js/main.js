import { 
    getBoard, 
    setBoard, 
    getScore, 
    setScore,
    getSelected,
    setSelected,
    getIsProcessing,
    setIsProcessing,
    resetGameState,
    createBoard,
    processMatches,
    hasValidMoves,
    isBomb,
    getBombColor,
    getBombDirection,
    getBombColorHex,
    COLORS
} from './game.js';

import { 
    initRenderer, 
    drawBoard, 
    updateScore, 
    updateMoves, 
    updateTimer,
    showMessage,
    createExplosionParticles,
    updateParticles,
    getParticles,
    setMatchCells,
    setDropAnimations
} from './renderer.js';

import { startEndlessMode, isEndlessMode, handleEndlessMove } from './modes/endless.js';
import { startLevelMode, isLevelMode, handleLevelMove, getLevelInfo, getCurrentLevel, resetLevels } from './modes/levels.js';

let board = [];
let selectedRow = -1;
let selectedCol = -1;
let isProcessing = false;
let currentMode = 'endless'; // 'endless' или 'levels'
let dropAnimations = [];
let matchCells = [];
let bombSpawnTimer = 0;
let bombSpawned = null;

// --- Инициализация ---
function init() {
    const canvas = document.getElementById('gameCanvas');
    initRenderer(canvas);
    
    // Настройка UI
    document.getElementById('menuOverlay').style.display = 'flex';
    document.getElementById('gameUI').style.display = 'none';
    
    // Кнопки меню
    document.getElementById('btnEndless').addEventListener('click', () => {
        startEndless();
    });
    
    document.getElementById('btnLevels').addEventListener('click', () => {
        startLevels();
    });
    
    // Кнопка новой игры
    document.getElementById('resetBtn').addEventListener('click', () => {
        resetGame();
    });
    
    // Обработка кликов
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('touchstart', handleTouch);
}

// --- Запуск бесконечного режима ---
function startEndless() {
    document.getElementById('menuOverlay').style.display = 'none';
    document.getElementById('gameUI').style.display = 'block';
    currentMode = 'endless';
    board = createBoard();
    resetGameState();
    setScore(0);
    updateScore(0);
    drawBoard(board);
    showMessage('🎮 Бесконечный режим!', 1500);
}

// --- Запуск режима уровней ---
function startLevels() {
    document.getElementById('menuOverlay').style.display = 'none';
    document.getElementById('gameUI').style.display = 'block';
    currentMode = 'levels';
    resetLevels();
    board = createBoard();
    resetGameState();
    startLevelMode();
    drawBoard(board);
}

// --- Обработка хода ---
function makeMove(r1, c1, r2, c2) {
    if (isProcessing) return;
    
    // Меняем местами
    swap(board, r1, c1, r2, c2);
    
    // Проверяем, есть ли совпадения
    if (hasValidMoves(board)) {
        // Ход валидный
        setSelected(-1, -1);
        processBoard();
    } else {
        // Меняем обратно
        swap(board, r1, c1, r2, c2);
        setSelected(-1, -1);
        drawBoard(board);
    }
}

// --- Обработка доски с анимацией ---
function processBoard() {
    if (isProcessing) return;
    isProcessing = true;
    setIsProcessing(true);
    bombSpawned = null;
    bombSpawnTimer = 0;

    function step() {
        const result = processMatches(board);
        
        if (result.removed.length === 0) {
            isProcessing = false;
            setIsProcessing(false);
            if (!hasValidMoves(board)) {
                setTimeout(() => {
                    showMessage('🔄 Нет ходов! Перемешиваем...', 1500);
                    board = createBoard();
                    drawBoard(board);
                }, 300);
            }
            return;
        }

        matchCells = result.removed;
        setMatchCells(matchCells);
        if (result.explosions.length > 0) {
            createExplosionParticles(result.removed, '#ff4444');
        } else {
            createExplosionParticles(result.removed, '#ffd700');
        }
        
        drawBoard(board);

        setTimeout(() => {
            matchCells = [];
            setMatchCells([]);

            // Гравитация
            const dropData = [];
            for (let c = 0; c < 8; c++) {
                let emptyRow = 7;
                for (let r = 7; r >= 0; r--) {
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

            // Обновляем счёт в зависимости от режима
            const points = result.removed.length * 10 + result.explosions.length * 50;
            const newScore = getScore() + points;
            setScore(newScore);
            updateScore(newScore);

            // Анимация падения
            dropAnimations = dropData.map(d => ({
                ...d,
                progress: 0,
                startY: d.fromRow === -1 ? -TILE_SIZE : d.fromRow * TILE_SIZE,
                endY: d.toRow * TILE_SIZE
            }));
            setDropAnimations(dropAnimations);

            let startTime = Date.now();
            const duration = 200;

            function animateDrop() {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased = progress * progress * (3 - 2 * progress);

                for (let d of dropAnimations) {
                    d.progress = eased;
                }

                drawBoard(board);

                if (progress < 1) {
                    requestAnimationFrame(animateDrop);
                } else {
                    dropAnimations = [];
                    setDropAnimations([]);
                    drawBoard(board);
                    setTimeout(() => {
                        if (hasValidMoves(board)) {
                            step();
                        } else {
                            isProcessing = false;
                            setIsProcessing(false);
                            bombSpawned = null;
                            if (!hasValidMoves(board)) {
                                setTimeout(() => {
                                    showMessage('🔄 Нет ходов! Перемешиваем...', 1500);
                                    board = createBoard();
                                    drawBoard(board);
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

// --- Обработка кликов ---
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
    const col = Math.floor(x / TILE_SIZE);
    const row = Math.floor(y / TILE_SIZE);
    
    if (row < 0 || row >= 8 || col < 0 || col >= 8) return;

    const selected = getSelected();
    
    if (selected.row === -1) {
        setSelected(row, col);
        drawBoard(board);
        return;
    }

    if (selected.row === row && selected.col === col) {
        setSelected(-1, -1);
        drawBoard(board);
        return;
    }

    const dr = Math.abs(selected.row - row);
    const dc = Math.abs(selected.col - col);
    
    if ((dr === 1 && dc === 0) || (dr === 0 && dc === 1)) {
        makeMove(selected.row, selected.col, row, col);
    } else {
        setSelected(row, col);
        drawBoard(board);
    }
}

// --- Сброс игры ---
function resetGame() {
    if (currentMode === 'endless') {
        startEndless();
    } else {
        startLevels();
    }
}

// --- Вспомогательные функции ---
function swap(board, r1, c1, r2, c2) {
    const temp = board[r1][c1];
    board[r1][c1] = board[r2][c2];
    board[r2][c2] = temp;
}

// --- Запуск ---
document.addEventListener('DOMContentLoaded', init);