class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.overlay = document.getElementById('gameOverlay');
        this.startButton = document.getElementById('startButton');
        this.restartButton = document.getElementById('restartButton');
        this.scoreElement = document.getElementById('score');
        this.levelElement = document.getElementById('level');
        this.highScoreElement = document.getElementById('highScore');
        this.difficultySelect = document.getElementById('difficulty');
        this.overlayTitle = document.getElementById('overlayTitle');
        this.overlayMessage = document.getElementById('overlayMessage');

        // Game settings
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;

        // Game state
        this.gameRunning = false;
        this.gamePaused = false;
        this.score = 0;
        this.level = 1;
        this.highScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;

        // Difficulty settings
        this.difficulties = {
            easy: { speed: 8, speedIncrease: 0.5 },
            medium: { speed: 12, speedIncrease: 1 },
            hard: { speed: 16, speedIncrease: 1.5 },
            extreme: { speed: 20, speedIncrease: 2 }
        };

        // Snake properties
        this.snake = [{ x: 10, y: 10 }];
        this.direction = { x: 0, y: 0 };
        this.nextDirection = { x: 0, y: 0 };

        // Food
        this.food = this.generateFood();

        // Particles for effects
        this.particles = [];

        // Game loop
        this.gameSpeed = this.difficulties.medium.speed;
        this.gameInterval = null;

        this.init();
    }

    init() {
        this.highScoreElement.textContent = this.highScore;
        this.setupEventListeners();
        this.showOverlay();
    }

    setupEventListeners() {
        this.startButton.addEventListener('click', () => this.startGame());
        this.restartButton.addEventListener('click', () => this.restartGame());

        document.addEventListener('keydown', (e) => this.handleKeyPress(e));

        // Touch controls for mobile
        let touchStartX = 0;
        let touchStartY = 0;

        this.canvas.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });

        this.canvas.addEventListener('touchend', (e) => {
            if (!touchStartX || !touchStartY) return;

            let touchEndX = e.changedTouches[0].clientX;
            let touchEndY = e.changedTouches[0].clientY;

            let diffX = touchStartX - touchEndX;
            let diffY = touchStartY - touchEndY;

            if (Math.abs(diffX) > Math.abs(diffY)) {
                if (diffX > 0) this.changeDirection(-1, 0); // Left
                else this.changeDirection(1, 0); // Right
            } else {
                if (diffY > 0) this.changeDirection(0, -1); // Up
                else this.changeDirection(0, 1); // Down
            }

            touchStartX = 0;
            touchStartY = 0;
        });
    }

    handleKeyPress(e) {
        if (!this.gameRunning) return;

        switch (e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                e.preventDefault();
                this.changeDirection(0, -1);
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                e.preventDefault();
                this.changeDirection(0, 1);
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                e.preventDefault();
                this.changeDirection(-1, 0);
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                e.preventDefault();
                this.changeDirection(1, 0);
                break;
            case ' ':
                e.preventDefault();
                this.togglePause();
                break;
            case 'r':
            case 'R':
                e.preventDefault();
                this.restartGame();
                break;
        }
    }

    changeDirection(x, y) {
        // Prevent reversing into itself
        if (this.direction.x !== -x || this.direction.y !== -y) {
            this.nextDirection = { x, y };
        }
    }

    togglePause() {
        this.gamePaused = !this.gamePaused;
        if (this.gamePaused) {
            this.showPauseOverlay();
        } else {
            this.hideOverlay();
        }
    }

    startGame() {
        this.gameRunning = true;
        this.gamePaused = false;
        this.score = 0;
        this.level = 1;
        this.snake = [{ x: 10, y: 10 }];
        this.direction = { x: 0, y: 0 };
        this.nextDirection = { x: 0, y: 0 };
        this.food = this.generateFood();
        this.particles = [];

        const difficulty = this.difficultySelect.value;
        this.gameSpeed = this.difficulties[difficulty].speed;

        this.updateDisplay();
        this.hideOverlay();
        this.gameLoop();
    }

    restartGame() {
        this.gameRunning = false;
        if (this.gameInterval) {
            clearInterval(this.gameInterval);
        }
        this.startGame();
    }

    gameLoop() {
        if (this.gameInterval) {
            clearInterval(this.gameInterval);
        }

        this.gameInterval = setInterval(() => {
            if (!this.gamePaused) {
                this.update();
                this.draw();
            }
        }, 1000 / this.gameSpeed);
    }

    update() {
        // Update direction
        this.direction = { ...this.nextDirection };

        if (this.direction.x === 0 && this.direction.y === 0) return;

        // Move snake head
        const head = { ...this.snake[0] };
        head.x += this.direction.x;
        head.y += this.direction.y;

        // Check wall collision
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            this.gameOver();
            return;
        }

        // Check self collision
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver();
            return;
        }

        this.snake.unshift(head);

        // Check food collision
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10 * this.level;
            this.createFoodParticles();
            this.food = this.generateFood();
            
            // Level up every 5 foods
            if (this.score > 0 && this.score % 50 === 0) {
                this.level++;
                const difficulty = this.difficultySelect.value;
                this.gameSpeed += this.difficulties[difficulty].speedIncrease;
                this.gameLoop(); // Restart with new speed
                this.createLevelUpParticles();
            }
        } else {
            this.snake.pop();
        }

        // Update particles
        this.updateParticles();
        this.updateDisplay();
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw grid
        this.drawGrid();

        // Draw food
        this.drawFood();

        // Draw snake
        this.drawSnake();

        // Draw particles
        this.drawParticles();
    }

    drawGrid() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        
        for (let x = 0; x <= this.tileCount; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.gridSize, 0);
            this.ctx.lineTo(x * this.gridSize, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y <= this.tileCount; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.gridSize);
            this.ctx.lineTo(this.canvas.width, y * this.gridSize);
            this.ctx.stroke();
        }
    }

    drawSnake() {
        this.snake.forEach((segment, index) => {
            if (index === 0) {
                // Head
                this.ctx.fillStyle = '#4ecdc4';
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = '#4ecdc4';
            } else {
                // Body
                const alpha = 1 - (index * 0.05);
                this.ctx.fillStyle = `rgba(69, 196, 191, ${Math.max(alpha, 0.3)})`;
                this.ctx.shadowBlur = 5;
                this.ctx.shadowColor = '#45c4bf';
            }
            
            this.ctx.fillRect(
                segment.x * this.gridSize + 2,
                segment.y * this.gridSize + 2,
                this.gridSize - 4,
                this.gridSize - 4
            );
        });
        
        this.ctx.shadowBlur = 0;
    }

    drawFood() {
        this.ctx.fillStyle = '#ff6b6b';
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = '#ff6b6b';
        
        this.ctx.fillRect(
            this.food.x * this.gridSize + 3,
            this.food.y * this.gridSize + 3,
            this.gridSize - 6,
            this.gridSize - 6
        );
        
        this.ctx.shadowBlur = 0;
    }

    generateFood() {
        let food;
        do {
            food = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
        } while (this.snake.some(segment => segment.x === food.x && segment.y === food.y));
        
        return food;
    }

    createFoodParticles() {
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: (this.food.x * this.gridSize) + this.gridSize / 2,
                y: (this.food.y * this.gridSize) + this.gridSize / 2,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 30,
                maxLife: 30,
                color: '#ffd700'
            });
        }
    }

    createLevelUpParticles() {
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: this.canvas.width / 2,
                y: this.canvas.height / 2,
                vx: (Math.random() - 0.5) * 12,
                vy: (Math.random() - 0.5) * 12,
                life: 60,
                maxLife: 60,
                color: '#4ecdc4'
            });
        }
    }

    updateParticles() {
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            particle.vy += 0.1; // Gravity
            return particle.life > 0;
        });
    }

    drawParticles() {
        this.particles.forEach(particle => {
            const alpha = particle.life / particle.maxLife;
            this.ctx.fillStyle = particle.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
            this.ctx.fillRect(particle.x - 2, particle.y - 2, 4, 4);
        });
    }

    updateDisplay() {
        this.scoreElement.textContent = this.score;
        this.levelElement.textContent = this.level;
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.highScoreElement.textContent = this.highScore;
            localStorage.setItem('snakeHighScore', this.highScore.toString());
        }
    }

    gameOver() {
        this.gameRunning = false;
        clearInterval(this.gameInterval);
        
        this.overlayTitle.textContent = '¡Game Over!';
        this.overlayMessage.textContent = `Puntuación final: ${this.score} | Nivel alcanzado: ${this.level}`;
        
        if (this.score === this.highScore && this.score > 0) {
            this.overlayMessage.textContent += '\n¡Nuevo récord! 🏆';
        }
        
        this.showGameOverOverlay();
    }

    showOverlay() {
        this.overlay.style.display = 'flex';
        this.startButton.style.display = 'inline-block';
        this.restartButton.style.display = 'none';
    }

    showGameOverOverlay() {
        this.overlay.style.display = 'flex';
        this.startButton.style.display = 'none';
        this.restartButton.style.display = 'inline-block';
    }

    showPauseOverlay() {
        this.overlayTitle.textContent = '⏸️ Pausa';
        this.overlayMessage.textContent = 'Presiona ESPACIO para continuar';
        this.overlay.style.display = 'flex';
        this.startButton.style.display = 'none';
        this.restartButton.style.display = 'none';
    }

    hideOverlay() {
        this.overlay.style.display = 'none';
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new SnakeGame();
});

// Prevent context menu on canvas (for mobile)
document.addEventListener('contextmenu', (e) => {
    if (e.target.tagName === 'CANVAS') {
        e.preventDefault();
    }
}); 