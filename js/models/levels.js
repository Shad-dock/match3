import { 
    createBoard, 
    processMatches, 
    hasValidMoves,
    getScore,
    setScore,
    resetGameState
} from '../game.js';
import { drawBoard, updateScore, showMessage, updateTimer, updateMoves } from '../renderer.js';
import { LEVELS } from '../levels/levelData.js';

let currentLevel = 0;
let maxMoves = 0;
let movesLeft = 0;
let timeLeft = 0;
let timerInterval = null;
let isLevelRunning = false;
let levelCallback = null;

export function startLevelMode() {
    console.log('Запуск режима уровней');
    isLevelRunning = true;
    currentLevel = 0;
    resetGameState();
    
    // Показываем всю информацию
    document.getElementById('scoreContainer').style.display = 'block';
    document.getElementById('movesContainer').style.display = 'block';
    document.getElementById('timerContainer').style.display = 'block';
    document.getElementById('levelInfo').style.display = 'block';
    
    startLevel();
}

export function isLevelMode() {
    return isLevelRunning;
}

function startLevel() {
    if (currentLevel >= LEVELS.length) {
        // Все уровни пройдены!
        showMessage('🎉 Поздравляем! Вы прошли все уровни! 🎉', 5000);
        isLevelRunning = false;
        if (levelCallback) levelCallback('complete');
        return;
    }
    
    const level = LEVELS[currentLevel];
    const board = createBoard();
    setScore(0);
    
    // Настройка уровня
    document.getElementById('levelTitle').textContent = level.name;
    document.getElementById('levelGoal').textContent = `Цель: ${level.goal} очков`;
    
    if (level.type === 'moves') {
        maxMoves = level.maxMoves;
        movesLeft = maxMoves;
        document.getElementById('movesLabel').textContent = 'Ходов:';
        document.getElementById('movesContainer').style.display = 'block';
        document.getElementById('timerContainer').style.display = 'none';
        updateMoves(movesLeft, maxMoves);
    } else if (level.type === 'time') {
        timeLeft = level.timeLimit;
        document.getElementById('timerContainer').style.display = 'block';
        document.getElementById('movesContainer').style.display = 'none';
        updateTimer(timeLeft);
        startTimer();
    }
    
    updateScore(0);
    drawBoard(board);
    showMessage(level.message, 2000);
}

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimer(timeLeft);
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            // Время вышло
            checkLevelResult(false);
        }
    }, 1000);
}

function checkLevelResult(won) {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    const level = LEVELS[currentLevel];
    const score = getScore();
    
    if (won || score >= level.goal) {
        // Уровень пройден!
        showMessage(`✅ Уровень пройден! +${score} очков`, 2000);
        currentLevel++;
        setTimeout(() => {
            startLevel();
        }, 2500);
    } else {
        // Уровень провален
        showMessage(`❌ Попробуйте снова! Нужно ${level.goal} очков`, 3000);
        setTimeout(() => {
            // Перезапускаем уровень
            startLevel();
        }, 3000);
    }
}

export function handleLevelMove(board, callback) {
    if (!isLevelRunning) return;
    
    const level = LEVELS[currentLevel];
    const result = processMatches(board);
    
    if (result.removed.length > 0) {
        const newScore = getScore() + result.removed.length * 10 + result.explosions.length * 50;
        setScore(newScore);
        updateScore(newScore);
        
        // Проверяем, достигли ли цели
        if (newScore >= level.goal) {
            checkLevelResult(true);
            callback(result);
            return;
        }
        
        // Уменьшаем ходы, если режим moves
        if (level.type === 'moves') {
            movesLeft--;
            updateMoves(movesLeft, maxMoves);
            
            if (movesLeft <= 0) {
                // Ходы закончились
                checkLevelResult(false);
                callback(result);
                return;
            }
        }
    }
    
    callback(result);
}

export function getLevelInfo() {
    if (currentLevel < LEVELS.length) {
        return LEVELS[currentLevel];
    }
    return null;
}

export function getCurrentLevel() {
    return currentLevel;
}

export function resetLevels() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    currentLevel = 0;
    isLevelRunning = false;
}