import { 
    getBoard, 
    getSelected, 
    getIsProcessing,
    getBombSpawned,
    isBomb,
    getBombDirection,
    getBombColorHex,
    COLORS
} from './game.js';

let particles = [];
let matchCells = [];
let dropAnimations = [];
let isAnimating = false;
let lastFrameTime = 0;
const TARGET_FPS = 30;

let TILE_SIZE = 60;
let scale = 1;
let canvasWidth = 0;
let canvasHeight = 0;
let canvas, ctx;

export function initRenderer(canvasElement) {
    canvas = canvasElement;
    ctx = canvas.getContext('2d');
    setupCanvas();
    window.addEventListener('resize', setupCanvas);
}

function setupCanvas() {
    const maxWidth = window.innerWidth - 40;
    const maxHeight = window.innerHeight - 200;
    const size = Math.min(maxWidth, maxHeight) / 8;
    TILE_SIZE = Math.max(30, Math.min(60, size));
    
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    scale = dpr;
    
    canvas.style.width = (8 * TILE_SIZE) + 'px';
    canvas.style.height = (8 * TILE_SIZE) + 'px';
    
    canvas.width = 8 * TILE_SIZE * dpr;
    canvas.height = 8 * TILE_SIZE * dpr;
    
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    canvasWidth = 8 * TILE_SIZE;
    canvasHeight = 8 * TILE_SIZE;
}

export function drawBoard(board) {
    if (!ctx) return;
    
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    const selected = getSelected();
    const bombSpawned = getBombSpawned();
    
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
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
            
            let fillColor = '#3a2a4a';
            
            if (selected.row === r && selected.col === c) {
                fillColor = '#7b5ea7';
            } else if (isMatch) {
                fillColor = '#ffd700';
            } else if (isBomb(candy)) {
                fillColor = getBombColorHex(candy);
            } else if (candy !== -1 && candy < COLORS.length) {
                fillColor = COLORS[candy].hex + '88';
            }
            
            const size = TILE_SIZE - 3;
            ctx.fillStyle = fillColor;
            ctx.beginPath();
            ctx.roundRect(x + 1.5, drawY + 1.5, size, size, 6);
            ctx.fill();
            
            // Рисуем содержимое
            if (candy !== -1 && candy !== undefined) {
                let displayText = '';
                let fontSize = TILE_SIZE * 0.5;
                let isBombCell = false;
                
                if (isBomb(candy)) {
                    const dir = getBombDirection(candy);
                    displayText = dir === 'horizontal' ? '↔' : '↕';
                    fontSize = TILE_SIZE * 0.5;
                    isBombCell = true;
                } else if (candy < COLORS.length) {
                    displayText = COLORS[candy].emoji;
                    fontSize = TILE_SIZE * 0.5;
                }
                
                if (displayText) {
                    ctx.font = `${fontSize}px Arial`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = isBombCell ? '#ffffff' : '#ffffff';
                    ctx.fillText(displayText, x + TILE_SIZE/2, drawY + TILE_SIZE/2 + 1);
                }
                
                if (isBombCell) {
                    const color = COLORS[getBombColorHex(candy) ? 0 : 0];
                    ctx.fillStyle = getBombColorHex(candy);
                    ctx.beginPath();
                    ctx.arc(x + TILE_SIZE - 6, drawY + 6, 3, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
    }
    
    // Частицы
    if (particles.length > 0) {
        for (let p of particles) {
            const alpha = Math.max(0, p.life / p.maxLife);
            ctx.globalAlpha = alpha;
            ctx.fillStyle = p.color;
            const size = Math.max(1, p.size * alpha);
            ctx.beginPath();
            ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }
}

export function createExplosionParticles(cells, color = '#ff6b6b') {
    const maxParticles = 30;
    let count = 0;
    for (let cell of cells) {
        if (count >= maxParticles) break;
        const x = cell.c * TILE_SIZE + TILE_SIZE/2;
        const y = cell.r * TILE_SIZE + TILE_SIZE/2;
        const angle = Math.random() * Math.PI * 2;
        const speed = 1 + Math.random() * 3;
        particles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 1.5,
            life: 0.6 + Math.random() * 0.2,
            maxLife: 0.6 + Math.random() * 0.2,
            size: 2 + Math.random() * 3,
            color: color
        });
        count++;
    }
}

export function updateParticles() {
    let hasActive = false;
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15;
        p.life -= 0.035;
        if (p.life <= 0) {
            particles.splice(i, 1);
        } else {
            hasActive = true;
        }
    }
    return hasActive;
}

export function getParticles() { return particles; }
export function setMatchCells(cells) { matchCells = cells; }
export function setDropAnimations(animations) { dropAnimations = animations; }

// --- UI обновления ---
export function updateScore(score) {
    document.getElementById('scoreValue').textContent = score;
}

export function updateMoves(moves, maxMoves) {
    document.getElementById('movesValue').textContent = `${moves}/${maxMoves}`;
}

export function updateTimer(time) {
    document.getElementById('timerValue').textContent = time + 'с';
}

export function showMessage(text, duration = 2000) {
    const overlay = document.getElementById('gameOverlay');
    const title = document.getElementById('overlayTitle');
    const message = document.getElementById('overlayMessage');
    const btn = document.getElementById('overlayBtn');
    
    title.textContent = text;
    message.textContent = '';
    btn.style.display = 'none';
    overlay.style.display = 'flex';
    
    setTimeout(() => {
        overlay.style.display = 'none';
    }, duration);
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