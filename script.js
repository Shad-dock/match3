// ============================================================
// 1. ДАННЫЕ УРОВНЕЙ (25 уровней, 5 типов)
// ============================================================
const LEVELS = [
    // ===== УРОВЕНЬ 1-5: НАЧАЛЬНЫЕ =====
    {
        id: 1,
        name: 'Уровень 1',
        type: 'moves',
        goal: 100,
        maxMoves: 10,
        timeLimit: 0,
        message: 'Набери 100 очков за 10 ходов!'
    },
    {
        id: 2,
        name: 'Уровень 2',
        type: 'time',
        goal: 200,
        maxMoves: 0,
        timeLimit: 30,
        message: 'Набери 200 очков за 30 секунд!'
    },
    {
        id: 3,
        name: 'Уровень 3',
        type: 'moves',
        goal: 300,
        maxMoves: 15,
        timeLimit: 0,
        message: 'Набери 300 очков за 15 ходов!'
    },
    {
        id: 4,
        name: 'Уровень 4',
        type: 'time',
        goal: 400,
        maxMoves: 0,
        timeLimit: 25,
        message: 'Набери 400 очков за 25 секунд!'
    },
    {
        id: 5,
        name: 'Уровень 5',
        type: 'moves',
        goal: 500,
        maxMoves: 20,
        timeLimit: 0,
        message: 'Набери 500 очков за 20 ходов!'
    },

    // ===== УРОВЕНЬ 6-10: С ПРЕПЯТСТВИЯМИ =====
    {
        id: 6,
        name: 'Ледяной уровень',
        type: 'blocks',
        goal: 0,
        maxMoves: 12,
        timeLimit: 0,
        blocksCount: 8,
        message: 'Разбей 8 льдин за 12 ходов! ❄️'
    },
    {
        id: 7,
        name: 'Скальный уровень',
        type: 'blocks',
        goal: 0,
        maxMoves: 15,
        timeLimit: 0,
        blocksCount: 12,
        message: 'Разбей 12 камней за 15 ходов! 🪨'
    },
    {
        id: 8,
        name: 'Ледяной уровень 2',
        type: 'blocks',
        goal: 0,
        maxMoves: 18,
        timeLimit: 0,
        blocksCount: 15,
        message: 'Разбей 15 льдин за 18 ходов! ❄️💪'
    },
    {
        id: 9,
        name: 'Скальный уровень 2',
        type: 'blocks',
        goal: 0,
        maxMoves: 20,
        timeLimit: 0,
        blocksCount: 18,
        message: 'Разбей 18 камней за 20 ходов! 🪨💪'
    },
    {
        id: 10,
        name: 'Ледяная пещера',
        type: 'blocks',
        goal: 0,
        maxMoves: 22,
        timeLimit: 0,
        blocksCount: 20,
        message: 'Разбей 20 льдин за 22 хода! 🏔️'
    },

    // ===== УРОВЕНЬ 11-15: С ИНГРЕДИЕНТАМИ =====
    {
        id: 11,
        name: 'Сбор яблок',
        type: 'collect',
        goal: 0,
        maxMoves: 12,
        timeLimit: 0,
        collectColor: 0, // красный
        collectCount: 10,
        message: 'Собери 10 красных фигур за 12 ходов! 🍎'
    },
    {
        id: 12,
        name: 'Сбор апельсинов',
        type: 'collect',
        goal: 0,
        maxMoves: 14,
        timeLimit: 0,
        collectColor: 1, // синий
        collectCount: 12,
        message: 'Собери 12 синих фигур за 14 ходов! 🔵'
    },
    {
        id: 13,
        name: 'Сбор урожая',
        type: 'collect',
        goal: 0,
        maxMoves: 16,
        timeLimit: 0,
        collectColor: 2, // зелёный
        collectCount: 14,
        message: 'Собери 14 зелёных фигур за 16 ходов! 🟢'
    },
    {
        id: 14,
        name: 'Сбор звёзд',
        type: 'collect',
        goal: 0,
        maxMoves: 18,
        timeLimit: 0,
        collectColor: 3, // жёлтый
        collectCount: 16,
        message: 'Собери 16 жёлтых фигур за 18 ходов! 🟡'
    },
    {
        id: 15,
        name: 'Сбор сокровищ',
        type: 'collect',
        goal: 0,
        maxMoves: 20,
        timeLimit: 0,
        collectColor: 4, // фиолетовый
        collectCount: 18,
        message: 'Собери 18 фиолетовых фигур за 20 ходов! 🟣'
    },

    // ===== УРОВЕНЬ 16-20: С БОССАМИ =====
    {
        id: 16,
        name: 'Босс-слизень',
        type: 'boss',
        goal: 0,
        maxMoves: 15,
        timeLimit: 0,
        bombsRequired: 3,
        message: 'Активируй 3 бомбы за 15 ходов! 👾'
    },
    {
        id: 17,
        name: 'Босс-дракон',
        type: 'boss',
        goal: 0,
        maxMoves: 18,
        timeLimit: 0,
        bombsRequired: 5,
        message: 'Активируй 5 бомб за 18 ходов! 🐉'
    },
    {
        id: 18,
        name: 'Босс-голем',
        type: 'boss',
        goal: 0,
        maxMoves: 20,
        timeLimit: 0,
        bombsRequired: 7,
        message: 'Активируй 7 бомб за 20 ходов! 🗿'
    },
    {
        id: 19,
        name: 'Босс-демон',
        type: 'boss',
        goal: 0,
        maxMoves: 22,
        timeLimit: 0,
        bombsRequired: 9,
        message: 'Активируй 9 бомб за 22 хода! 👿'
    },
    {
        id: 20,
        name: 'Босс-титан',
        type: 'boss',
        goal: 0,
        maxMoves: 25,
        timeLimit: 0,
        bombsRequired: 10,
        message: 'Активируй 10 бомб за 25 ходов! ⚡'
    },

    // ===== УРОВЕНЬ 21-25: КОМБО =====
    {
        id: 21,
        name: 'Цепная реакция',
        type: 'combo',
        goal: 0,
        maxMoves: 15,
        timeLimit: 0,
        combosRequired: 5,
        message: 'Сделай 5 комбо за 15 ходов! 🔥'
    },
    {
        id: 22,
        name: 'Мастер комбо',
        type: 'combo',
        goal: 0,
        maxMoves: 18,
        timeLimit: 0,
        combosRequired: 8,
        message: 'Сделай 8 комбо за 18 ходов! 🔥🔥'
    },
    {
        id: 23,
        name: 'Эксперт комбо',
        type: 'combo',
        goal: 0,
        maxMoves: 20,
        timeLimit: 0,
        combosRequired: 10,
        message: 'Сделай 10 комбо за 20 ходов! 🔥🔥🔥'
    },
    {
        id: 24,
        name: 'Легенда комбо',
        type: 'combo',
        goal: 0,
        maxMoves: 22,
        timeLimit: 0,
        combosRequired: 12,
        message: 'Сделай 12 комбо за 22 хода! ⭐'
    },
    {
        id: 25,
        name: 'Комбо-король',
        type: 'combo',
        goal: 0,
        maxMoves: 25,
        timeLimit: 0,
        combosRequired: 15,
        message: 'Сделай 15 комбо за 25 ходов! 👑'
    }
];

// ============================================================
// 2. ОСНОВНЫЕ ПЕРЕМЕННЫЕ (добавляем новые)
// ============================================================
// ... (все предыдущие переменные остаются)

// --- Дополнительные переменные для новых типов уровней ---
let blocks = []; // позиции блоков {r, c}
let blocksRemaining = 0;
let collectedCount = 0;
let bombsActivated = 0;
let combosMade = 0;
let totalCombos = 0; // считаем комбо за весь уровень

// ============================================================
// 3. ФУНКЦИЯ СОЗДАНИЯ ДОСКИ С ПРЕПЯТСТВИЯМИ
// ============================================================
function createBoardWithBlocks(blocksCount) {
    const newBoard = createBoard();
    blocks = [];
    blocksRemaining = blocksCount;
    
    // Расставляем блоки в случайные позиции
    let placed = 0;
    let attempts = 0;
    while (placed < blocksCount && attempts < 1000) {
        attempts++;
        const r = Math.floor(Math.random() * ROWS);
        const c = Math.floor(Math.random() * COLS);
        
        // Проверяем, что клетка не занята и не создаёт совпадений
        if (newBoard[r][c] !== -1 && !blocks.some(b => b.r === r && b.c === c)) {
            // Проверяем, не создаст ли блок совпадений
            let hasMatch = false;
            // Проверяем горизонтально
            let count = 1;
            for (let col = c - 1; col >= 0; col--) {
                if (newBoard[r][col] === newBoard[r][c]) count++; else break;
            }
            for (let col = c + 1; col < COLS; col++) {
                if (newBoard[r][col] === newBoard[r][c]) count++; else break;
            }
            if (count >= 3) hasMatch = true;
            
            // Проверяем вертикально
            count = 1;
            for (let row = r - 1; row >= 0; row--) {
                if (newBoard[row][c] === newBoard[r][c]) count++; else break;
            }
            for (let row = r + 1; row < ROWS; row++) {
                if (newBoard[row][c] === newBoard[r][c]) count++; else break;
            }
            if (count >= 3) hasMatch = true;
            
            if (!hasMatch) {
                blocks.push({r, c});
                newBoard[r][c] = -2; // специальное значение для блока
                placed++;
            }
        }
    }
    
    return newBoard;
}

// ============================================================
// 4. ОБНОВЛЁННАЯ ОТРИСОВКА С ПОДДЕРЖКОЙ БЛОКОВ
// ============================================================
function drawBoard() {
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    if (bombSpawnTimer > 0) {
        bombSpawnTimer--;
        if (bombSpawnTimer === 0) {
            bombSpawned = null;
        }
    }
    
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
            const isBlock = blocks.some(b => b.r === r && b.c === c);
            
            let fillColor = '#3a2a4a';
            let isBlockCell = false;
            
            // Рисуем блоки
            if (isBlock && candy === -2) {
                isBlockCell = true;
                // Анимация льда (мерцание)
                const pulse = Math.sin(Date.now() / 500 + r + c) * 0.2 + 0.8;
                fillColor = `rgba(100, 200, 255, ${pulse})`;
                
                // Рисуем ледяной блок
                const size = TILE_SIZE - 3;
                ctx.fillStyle = fillColor;
                ctx.shadowColor = '#66ccff';
                ctx.shadowBlur = 15;
                ctx.beginPath();
                ctx.roundRect(x + 1.5, drawY + 1.5, size, size, 6);
                ctx.fill();
                ctx.shadowBlur = 0;
                
                // Рисуем кристалл
                ctx.font = `${TILE_SIZE * 0.5}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = '#ffffff';
                ctx.fillText('❄️', x + TILE_SIZE/2, drawY + TILE_SIZE/2 + 1);
                
                continue;
            }
            
            // ... (остальная отрисовка как раньше)
            // Обычная клетка
            if (selectedRow === r && selectedCol === c) {
                fillColor = '#7b5ea7';
            } else if (isMatch) {
                fillColor = '#ffd700';
            } else if (isBomb(candy)) {
                fillColor = getBombColorHex(candy);
            } else if (candy !== -1 && candy !== -2 && candy < COLORS.length) {
                fillColor = COLORS[candy].hex + '88';
            }
            
            // ... (остальной код отрисовки как раньше)
        }
    }
    
    // ... (частицы как раньше)
}

// ============================================================
// 5. ОБНОВЛЁННАЯ ОБРАБОТКА ХОДА
// ============================================================
function processBoardWithAnimation() {
    if (isProcessing) return;
    isProcessing = true;
    bombSpawned = null;
    bombSpawnTimer = 0;

    function step() {
        // Проверяем блоки рядом с совпадениями
        if (currentLevel < LEVELS.length && LEVELS[currentLevel].type === 'blocks') {
            // Удаляем блоки, если рядом с ними были совпадения
            const matches = findMatchGroups();
            for (let match of matches) {
                for (let cell of match.cells) {
                    // Проверяем соседние клетки на наличие блоков
                    const directions = [[0,1],[0,-1],[1,0],[-1,0]];
                    for (let [dr, dc] of directions) {
                        const nr = cell.r + dr;
                        const nc = cell.c + dc;
                        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
                            const blockIndex = blocks.findIndex(b => b.r === nr && b.c === nc);
                            if (blockIndex !== -1) {
                                blocks.splice(blockIndex, 1);
                                blocksRemaining--;
                                board[nr][nc] = Math.floor(Math.random() * COLORS.length);
                                createExplosionParticles([{r: nr, c: nc}], '#66ccff');
                            }
                        }
                    }
                }
            }
        }
        
        const result = processMatches();
        
        // Подсчёт комбо для уровней с комбо
        if (currentLevel < LEVELS.length && LEVELS[currentLevel].type === 'combo') {
            if (result.removed.length > 0) {
                totalCombos++;
            }
        }
        
        // Подсчёт активированных бомб для уровней с боссами
        if (currentLevel < LEVELS.length && LEVELS[currentLevel].type === 'boss') {
            if (result.explosions.length > 0) {
                bombsActivated += result.explosions.length;
            }
        }
        
        // Подсчёт собранных ингредиентов
        if (currentLevel < LEVELS.length && LEVELS[currentLevel].type === 'collect') {
            const level = LEVELS[currentLevel];
            for (let cell of result.removed) {
                const candy = board[cell.r]?.[cell.c];
                if (candy === level.collectColor) {
                    collectedCount++;
                }
            }
        }
        
        if (result.removed.length === 0) {
            isProcessing = false;
            bombSpawned = null;
            bombSpawnTimer = 0;
            
            // Проверяем условия уровня
            checkLevelConditions();
            
            if (!hasValidMoves()) {
                setTimeout(() => {
                    showMessage('🔄 Нет ходов! Перемешиваем...', 1500);
                    board = createBoard();
                    drawBoard();
                }, 300);
            }
            return;
        }

        matchCells = result.removed;
        if (result.explosions.length > 0) {
            createExplosionParticles(result.removed, '#ff4444');
        } else {
            createExplosionParticles(result.removed, '#ffd700');
        }
        
        const points = result.removed.length * 10 + result.explosions.length * 50;
        score += points;
        updateScore();
        
        // Обновляем UI для разных типов уровней
        updateLevelUI();
        
        // Проверяем условия уровня
        if (checkLevelConditions()) {
            isProcessing = false;
            return;
        }
        
        drawBoard();

        setTimeout(() => {
            matchCells = [];

            const dropData = [];
            for (let c = 0; c < COLS; c++) {
                let emptyRow = ROWS - 1;
                for (let r = ROWS - 1; r >= 0; r--) {
                    if (board[r][c] !== -1 && board[r][c] !== -2) {
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
                    // Проверяем, не блок ли это
                    const isBlock = blocks.some(b => b.r === r && b.c === c);
                    if (isBlock) {
                        board[r][c] = -2;
                    } else {
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
            }

            dropAnimations = dropData.map(d => ({
                ...d,
                progress: 0,
                startY: d.fromRow === -1 ? -TILE_SIZE : d.fromRow * TILE_SIZE,
                endY: d.toRow * TILE_SIZE
            }));

            let startTime = Date.now();
            const duration = 200;

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
                    setTimeout(() => {
                        if (hasMatches()) {
                            step();
                        } else {
                            isProcessing = false;
                            bombSpawned = null;
                            bombSpawnTimer = 0;
                            
                            // Проверяем условия уровня после завершения анимации
                            checkLevelConditions();
                            
                            if (!hasValidMoves()) {
                                setTimeout(() => {
                                    showMessage('🔄 Нет ходов! Перемешиваем...', 1500);
                                    board = createBoard();
                                    drawBoard();
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

// ============================================================
// 6. ПРОВЕРКА УСЛОВИЙ УРОВНЯ
// ============================================================
function checkLevelConditions() {
    if (currentLevel >= LEVELS.length) return true;
    
    const level = LEVELS[currentLevel];
    let isComplete = false;
    let message = '';
    
    switch (level.type) {
        case 'moves':
        case 'time':
            if (score >= level.goal) {
                isComplete = true;
                message = `✅ Уровень пройден! +${score} очков`;
            }
            break;
            
        case 'blocks':
            if (blocksRemaining <= 0) {
                isComplete = true;
                message = `✅ Все блоки разбиты!`;
            }
            break;
            
        case 'collect':
            if (collectedCount >= level.collectCount) {
                isComplete = true;
                message = `✅ Собрано ${collectedCount} фигур!`;
            }
            break;
            
        case 'boss':
            if (bombsActivated >= level.bombsRequired) {
                isComplete = true;
                message = `✅ Босс побеждён! ${bombsActivated} бомб активировано!`;
            }
            break;
            
        case 'combo':
            if (totalCombos >= level.combosRequired) {
                isComplete = true;
                message = `✅ Сделано ${totalCombos} комбо!`;
            }
            break;
    }
    
    if (isComplete) {
        showModal(
            '🎉 Уровень пройден!',
            message,
            'Продолжить →',
            function() {
                currentLevel++;
                startLevel();
            }
        );
        return true;
    }
    
    // Проверка на провал (для уровней с ходами)
    if (level.type === 'moves' || level.type === 'blocks' || 
        level.type === 'collect' || level.type === 'boss' || level.type === 'combo') {
        if (moves <= 0 && !isComplete) {
            showModal(
                '❌ Попробуйте снова!',
                `Ходы закончились!\nНужно: ${getLevelRequirement(level)}`,
                '🔄 Повторить уровень',
                function() {
                    startLevel();
                }
            );
            return true;
        }
    }
    
    // Проверка на провал (для уровней со временем)
    if (level.type === 'time') {
        // Таймер проверяется отдельно
    }
    
    return false;
}

function getLevelRequirement(level) {
    switch (level.type) {
        case 'moves':
        case 'time':
            return `набрать ${level.goal} очков`;
        case 'blocks':
            return `разбить ${level.blocksCount} блоков`;
        case 'collect':
            return `собрать ${level.collectCount} ${COLORS[level.collectColor].emoji} фигур`;
        case 'boss':
            return `активировать ${level.bombsRequired} бомб`;
        case 'combo':
            return `сделать ${level.combosRequired} комбо`;
        default:
            return 'выполнить задание';
    }
}

// ============================================================
// 7. ОБНОВЛЕНИЕ UI ДЛЯ РАЗНЫХ ТИПОВ УРОВНЕЙ
// ============================================================
function updateLevelUI() {
    if (currentLevel >= LEVELS.length) return;
    
    const level = LEVELS[currentLevel];
    let goalText = '';
    
    switch (level.type) {
        case 'moves':
        case 'time':
            goalText = `Цель: ${level.goal} очков (${score}/${level.goal})`;
            break;
        case 'blocks':
            goalText = `Блоков: ${blocksRemaining}/${level.blocksCount}`;
            break;
        case 'collect':
            const colorEmoji = COLORS[level.collectColor].emoji;
            goalText = `${colorEmoji}: ${collectedCount}/${level.collectCount}`;
            break;
        case 'boss':
            goalText = `💣 Бомб: ${bombsActivated}/${level.bombsRequired}`;
            break;
        case 'combo':
            goalText = `🔥 Комбо: ${totalCombos}/${level.combosRequired}`;
            break;
    }
    
    levelGoalSpan.textContent = goalText;
}

// ============================================================
// 8. ОБНОВЛЁННЫЙ ЗАПУСК УРОВНЯ
// ============================================================
function startLevel() {
    if (currentLevel >= LEVELS.length) {
        showModal(
            '🎉 Поздравляем! 🎉',
            'Вы прошли все 25 уровней!\nВы настоящий мастер 3 в ряд! 👑',
            '🔄 Пройти заново',
            function() {
                currentLevel = 0;
                startLevel();
            }
        );
        return;
    }
    
    const level = LEVELS[currentLevel];
    
    // Сбрасываем все счётчики
    score = 0;
    selectedRow = -1;
    selectedCol = -1;
    isProcessing = false;
    particles = [];
    matchCells = [];
    dropAnimations = [];
    bombSpawned = null;
    bombSpawnTimer = 0;
    isAnimating = false;
    bombsActivated = 0;
    collectedCount = 0;
    totalCombos = 0;
    blocks = [];
    blocksRemaining = 0;
    
    // Создаём доску в зависимости от типа уровня
    if (level.type === 'blocks') {
        board = createBoardWithBlocks(level.blocksCount);
    } else {
        board = createBoard();
    }
    
    // Настраиваем UI
    if (levelTimerInterval) {
        clearInterval(levelTimerInterval);
        levelTimerInterval = null;
    }
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    document.getElementById('levelInfo').style.display = 'flex';
    document.getElementById('scoreContainer').style.display = 'block';
    levelTitleSpan.textContent = `${level.name} (${currentLevel + 1}/${LEVELS.length})`;
    
    // Показываем нужные счётчики
    if (level.type === 'time') {
        timeLeft = level.timeLimit;
        document.getElementById('timerContainer').style.display = 'block';
        document.getElementById('movesContainer').style.display = 'none';
        updateTimer();
        startLevelTimer();
    } else {
        maxMoves = level.maxMoves;
        moves = maxMoves;
        document.getElementById('movesContainer').style.display = 'block';
        document.getElementById('timerContainer').style.display = 'none';
        updateMoves();
    }
    
    updateScore();
    updateLevelUI();
    drawBoard();
    showMessage(level.message, 2000);
}
