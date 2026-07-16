import { 
    createBoard, 
    processMatches, 
    hasValidMoves,
    getScore,
    setScore,
    resetGameState
} from '../game.js';
import { drawBoard, updateScore, showMessage } from '../renderer.js';

let isEndlessRunning = false;

export function startEndlessMode() {
    console.log('Запуск бесконечного режима');
    isEndlessRunning = true;
    resetGameState();
    
    // Скрываем дополнительную информацию
    document.getElementById('movesContainer').style.display = 'none';
    document.getElementById('timerContainer').style.display = 'none';
    document.getElementById('levelInfo').style.display = 'none';
    
    // Показываем счёт
    document.getElementById('scoreContainer').style.display = 'block';
    
    const board = createBoard();
    setScore(0);
    updateScore(0);
    drawBoard(board);
    showMessage('Бесконечный режим! Набирай очки!', 2000);
}

export function isEndlessMode() {
    return isEndlessRunning;
}

export function handleEndlessMove(board, callback) {
    // Обычная логика игры без ограничений
    const result = processMatches(board);
    if (result.removed.length > 0) {
        const newScore = getScore() + result.removed.length * 10 + result.explosions.length * 50;
        setScore(newScore);
        updateScore(newScore);
    }
    callback(result);
}