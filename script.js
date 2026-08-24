// Dunk Hit Game - Main Script

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game Variables
let gameState = 'idle'; // idle, playing, paused, gameOver
let score = 0;
let bestScore = localStorage.getItem('dunkHitBestScore') || 0;
let level = 1;
let combo = 0;

// Ball Properties
const ball = {
    x: canvas.width / 2,
    y: canvas.height - 100,
    radius: 15,
    vx: 0,
    vy: 0,
    gravity: 0.5,
    friction: 0.98,
    isDragging: false,
    dragStartX: 0,
    dragStartY: 0
};

// Hoop Properties
const hoop = {
    x: canvas.width / 2,
    y: 80,
    width: 60,
    height: 10,
    speed: 2,
    direction: 1
};

// Rim Properties
const rim = {
    x: hoop.x,
    y: hoop.y + hoop.height,
    width: hoop.width,
    height: 8
};

let gameTime = 0;
let missCount = 0;
const MAX_MISSES = 3;

// UI Elements
const scoreDisplay = document.getElementById('score');
const bestDisplay = document.getElementById('best');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreDisplay = document.getElementById('finalScore');
const bestScoreDisplay = document.getElementById('bestScore');

// Event Listeners
startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);
restartBtn.addEventListener('click', startGame);

canvas.addEventListener('mousedown', startDrag);
canvas.addEventListener('mousemove', dragBall);
canvas.addEventListener('mouseup', releaseBall);
canvas.addEventListener('touchstart', startDrag);
canvas.addEventListener('touchmove', dragBall);
canvas.addEventListener('touchend', releaseBall);

// Initialize
bestDisplay.textContent = bestScore;
draw();

function startGame() {
    gameState = 'playing';
    score = 0;
    combo = 0;
    missCount = 0;
    level = 1;
    gameTime = 0;
    hoop.speed = 2;
    
    ball.x = canvas.width / 2;
    ball.y = canvas.height - 100;
    ball.vx = 0;
    ball.vy = 0;
    
    hoop.x = canvas.width / 2;
    hoop.direction = 1;
    
    scoreDisplay.textContent = score;
    gameOverScreen.classList.add('hidden');
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    
    gameLoop();
}

function togglePause() {
    if (gameState === 'playing') {
        gameState = 'paused';
        pauseBtn.textContent = 'Resume';
    } else if (gameState === 'paused') {
        gameState = 'playing';
        pauseBtn.textContent = 'Pause';
        gameLoop();
    }
}

function startDrag(e) {
    if (gameState !== 'playing') return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let clientX, clientY;
    if (e.touches) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }
    
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    
    const dx = x - ball.x;
    const dy = y - ball.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < ball.radius * 2) {
        ball.isDragging = true;
        ball.dragStartX = x;
        ball.dragStartY = y;
    }
}

function dragBall(e) {
    if (!ball.isDragging || gameState !== 'playing') return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    let clientX, clientY;
    if (e.touches) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }
    
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    
    // Constrain ball movement
    ball.x = Math.max(ball.radius, Math.min(canvas.width - ball.radius, x));
    ball.y = Math.max(ball.radius, Math.min(canvas.height - ball.radius, y));
}

function releaseBall(e) {
    if (!ball.isDragging) return;
    
    ball.isDragging = false;
    
    // Calculate velocity based on drag distance
    const dx = ball.x - ball.dragStartX;
    const dy = ball.y - ball.dragStartY;
    
    ball.vx = -dx * 0.1;
    ball.vy = -dy * 0.1;
}

function gameLoop() {
    if (gameState !== 'playing') return;
    
    update();
    draw();
    
    requestAnimationFrame(gameLoop);
}

function update() {
    gameTime++;
    
    // Update ball position and physics
    ball.vy += ball.gravity;
    ball.x += ball.vx;
    ball.y += ball.vy;
    
    ball.vx *= ball.friction;
    ball.vy *= ball.friction;
    
    // Wall collision
    if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
        ball.vx *= -0.8;
        ball.x = Math.max(ball.radius, Math.min(canvas.width - ball.radius, ball.x));
    }
    
    // Top collision
    if (ball.y - ball.radius < 0) {
        ball.vy *= -0.8;
        ball.y = ball.radius;
    }
    
    // Bottom - Ball fell
    if (ball.y > canvas.height + 50) {
        missShot();
    }
    
    // Update hoop position (moves back and forth)
    hoop.x += hoop.speed * hoop.direction;
    if (hoop.x - hoop.width / 2 < 20 || hoop.x + hoop.width / 2 > canvas.width - 20) {
        hoop.direction *= -1;
    }
    
    rim.x = hoop.x;
    
    // Check if ball goes through hoop
    checkHoopCollision();
}

function checkHoopCollision() {
    // Check if ball is in hoop area
    const ballAboveHoop = ball.y < hoop.y + 30;
    const ballInHoopX = Math.abs(ball.x - hoop.x) < hoop.width / 2 + ball.radius;
    const ballMovingDown = ball.vy > 0;
    
    // Check if ball passes through the hoop opening
    if (ballInHoopX && ballAboveHoop && ballMovingDown) {
        // Check more precise collision
        const distToHoopCenter = Math.abs(ball.x - hoop.x);
        if (distToHoopCenter < hoop.width / 2) {
            if (ball.y > hoop.y && ball.y < hoop.y + 40) {
                scoreShot();
            }
        }
    }
}

function scoreShot() {
    combo++;
    const points = 10 * combo;
    score += points;
    scoreDisplay.textContent = score;
    
    // Increase difficulty
    if (combo % 3 === 0) {
        level++;
        hoop.speed += 0.5;
    }
    
    // Reset ball
    resetBall();
    
    // Visual feedback
    showEffect('SCORE!', hoop.x, hoop.y, points);
}

function missShot() {
    combo = 0;
    missCount++;
    
    if (missCount >= MAX_MISSES) {
        endGame();
    } else {
        resetBall();
        showEffect('MISS!', canvas.width / 2, canvas.height / 2, 0);
    }
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height - 100;
    ball.vx = 0;
    ball.vy = 0;
}

function endGame() {
    gameState = 'gameOver';
    
    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('dunkHitBestScore', bestScore);
        bestDisplay.textContent = bestScore;
    }
    
    finalScoreDisplay.textContent = score;
    bestScoreDisplay.textContent = bestScore;
    gameOverScreen.classList.remove('hidden');
    
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    pauseBtn.textContent = 'Pause';
}

function showEffect(text, x, y, points) {
    // Floating text effect (would need canvas animation)
    // This is a placeholder for visual feedback
}

function draw() {
    // Clear canvas
    ctx.fillStyle = 'rgba(135, 206, 235, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw hoop
    drawHoop();
    
    // Draw rim
    drawRim();
    
    // Draw ball
    drawBall();
    
    // Draw miss counter
    drawMissCounter();
    
    // Draw level
    drawLevel();
}

function drawHoop() {
    ctx.strokeStyle = '#FF6B35';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(hoop.x - hoop.width / 2, hoop.y);
    ctx.lineTo(hoop.x + hoop.width / 2, hoop.y);
    ctx.stroke();
    
    // Hoop pole
    ctx.strokeStyle = '#8B4513';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(hoop.x, hoop.y);
    ctx.lineTo(hoop.x, hoop.y + 80);
    ctx.stroke();
    
    // Backboard
    ctx.fillStyle = 'rgba(200, 200, 255, 0.3)';
    ctx.fillRect(hoop.x - 50, 10, 100, 80);
    ctx.strokeStyle = '#4169E1';
    ctx.lineWidth = 2;
    ctx.strokeRect(hoop.x - 50, 10, 100, 80);
}

function drawRim() {
    ctx.strokeStyle = '#FF6B35';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(hoop.x, rim.y, hoop.width / 2 - 5, 0, Math.PI * 2);
    ctx.stroke();
    
    // Net
    ctx.strokeStyle = 'rgba(255, 107, 53, 0.5)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(hoop.x - hoop.width / 2 + i * 10, rim.y);
        ctx.lineTo(hoop.x - hoop.width / 2 + i * 10 + 5, rim.y + 30);
        ctx.stroke();
    }
}

function drawBall() {
    // Ball shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.beginPath();
    ctx.ellipse(ball.x, canvas.height - 20, ball.radius * 1.5, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Ball
    ctx.fillStyle = '#FF8C00';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Ball lines
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Basketball lines
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(ball.x, ball.y - ball.radius);
    ctx.lineTo(ball.x, ball.y + ball.radius);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius * 0.6, 0, Math.PI, false);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius * 0.6, Math.PI, 0, false);
    ctx.stroke();
    
    // Dragging indicator
    if (ball.isDragging) {
        ctx.strokeStyle = 'rgba(255, 107, 53, 0.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(ball.x, ball.y);
        ctx.lineTo(ball.dragStartX, ball.dragStartY);
        ctx.stroke();
        ctx.setLineDash([]);
    }
}

function drawMissCounter() {
    ctx.fillStyle = '#333';
    ctx.font = '16px Arial';
    ctx.fillText(`Misses: ${missCount}/${MAX_MISSES}`, 15, 30);
}

function drawLevel() {
    ctx.fillStyle = '#333';
    ctx.font = '16px Arial';
    ctx.fillText(`Level: ${level}`, canvas.width - 100, 30);
}

// Update best score display on page load
bestDisplay.textContent = bestScore;