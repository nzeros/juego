class CarGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // Game state
        this.gameState = 'start'; // 'start', 'playing', 'gameOver'
        this.score = 0;
        this.time = 0;
        this.maxSpeed = 0;
        this.gameSpeed = 2;
        this.lastTime = 0;
        
        // Player car
        this.player = {
            x: this.width / 2 - 25,
            y: this.height - 80,
            width: 50,
            height: 80,
            speed: 5,
            color: '#ff4444',
            velocity: { x: 0, y: 0 }
        };
        
        // Game objects
        this.obstacles = [];
        this.powerUps = [];
        this.roadLines = [];
        this.otherCars = [];
        this.particles = [];
        
        // Input handling
        this.keys = {};
        
        // Road setup
        this.roadWidth = 400;
        this.roadOffset = (this.width - this.roadWidth) / 2;
        this.initRoadLines();
        
        this.setupEventListeners();
        this.showStartScreen();
    }
    
    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            this.keys[e.code] = true;
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
            this.keys[e.code] = false;
        });
        
        // Button events
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('restartBtn').addEventListener('click', () => this.restartGame());
    }
    
    initRoadLines() {
        const lineSpacing = 60;
        for (let i = 0; i < Math.ceil(this.height / lineSpacing) + 1; i++) {
            this.roadLines.push({
                y: i * lineSpacing - lineSpacing
            });
        }
    }
    
    showStartScreen() {
        document.getElementById('startScreen').classList.remove('hidden');
        document.getElementById('gameOverScreen').classList.add('hidden');
    }
    
    startGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.time = 0;
        this.maxSpeed = 0;
        this.gameSpeed = 2;
        this.obstacles = [];
        this.powerUps = [];
        this.otherCars = [];
        this.particles = [];
        
        // Reset player position
        this.player.x = this.width / 2 - 25;
        this.player.velocity = { x: 0, y: 0 };
        
        document.getElementById('startScreen').classList.add('hidden');
        document.getElementById('gameOverScreen').classList.add('hidden');
        
        this.gameLoop();
    }
    
    restartGame() {
        this.startGame();
    }
    
    gameLoop(currentTime = 0) {
        if (this.gameState !== 'playing') return;
        
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.render();
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    update(deltaTime) {
        // Update game time
        this.time += deltaTime * 0.001;
        
        // Gradually increase difficulty
        this.gameSpeed = Math.min(2 + this.time * 0.05, 8);
        
        this.updatePlayer();
        this.updateRoad();
        this.updateObstacles();
        this.updateOtherCars();
        this.updatePowerUps();
        this.updateParticles();
        this.spawnObjects();
        this.checkCollisions();
        this.updateScore();
        this.updateUI();
    }
    
    updatePlayer() {
        const acceleration = 0.5;
        const maxSpeed = 8;
        const friction = 0.8;
        
        // Handle input
        if (this.keys['arrowleft'] || this.keys['a']) {
            this.player.velocity.x = Math.max(this.player.velocity.x - acceleration, -maxSpeed);
        } else if (this.keys['arrowright'] || this.keys['d']) {
            this.player.velocity.x = Math.min(this.player.velocity.x + acceleration, maxSpeed);
        } else {
            this.player.velocity.x *= friction;
        }
        
        if (this.keys['arrowup'] || this.keys['w']) {
            this.player.velocity.y = Math.max(this.player.velocity.y - acceleration, -maxSpeed);
        } else if (this.keys['arrowdown'] || this.keys['s']) {
            this.player.velocity.y = Math.min(this.player.velocity.y + acceleration, maxSpeed);
        } else {
            this.player.velocity.y *= friction;
        }
        
        // Update position
        this.player.x += this.player.velocity.x;
        this.player.y += this.player.velocity.y;
        
        // Keep player on road
        const roadLeft = this.roadOffset + 10;
        const roadRight = this.roadOffset + this.roadWidth - this.player.width - 10;
        this.player.x = Math.max(roadLeft, Math.min(roadRight, this.player.x));
        
        // Keep player on screen vertically
        this.player.y = Math.max(10, Math.min(this.height - this.player.height - 10, this.player.y));
        
        // Calculate current speed for display
        const currentSpeed = Math.sqrt(this.player.velocity.x ** 2 + this.player.velocity.y ** 2) * 15;
        this.maxSpeed = Math.max(this.maxSpeed, currentSpeed);
    }
    
    updateRoad() {
        this.roadLines.forEach(line => {
            line.y += this.gameSpeed;
            if (line.y > this.height) {
                line.y = -60;
            }
        });
    }
    
    updateObstacles() {
        this.obstacles.forEach((obstacle, index) => {
            obstacle.y += this.gameSpeed;
            if (obstacle.y > this.height) {
                this.obstacles.splice(index, 1);
            }
        });
    }
    
    updateOtherCars() {
        this.otherCars.forEach((car, index) => {
            car.y += this.gameSpeed + car.speed;
            if (car.y > this.height) {
                this.otherCars.splice(index, 1);
                this.score += 10; // Points for passing cars
            }
        });
    }
    
    updatePowerUps() {
        this.powerUps.forEach((powerUp, index) => {
            powerUp.y += this.gameSpeed;
            powerUp.rotation += 0.1;
            if (powerUp.y > this.height) {
                this.powerUps.splice(index, 1);
            }
        });
    }
    
    updateParticles() {
        this.particles.forEach((particle, index) => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= 0.02;
            particle.size *= 0.98;
            
            if (particle.life <= 0 || particle.size < 0.5) {
                this.particles.splice(index, 1);
            }
        });
    }
    
    spawnObjects() {
        // Spawn obstacles
        if (Math.random() < 0.005 + this.time * 0.0001) {
            this.spawnObstacle();
        }
        
        // Spawn other cars
        if (Math.random() < 0.008 + this.time * 0.0001) {
            this.spawnOtherCar();
        }
        
        // Spawn power-ups
        if (Math.random() < 0.002) {
            this.spawnPowerUp();
        }
        
        // Spawn exhaust particles from player car
        if (Math.random() < 0.3) {
            this.spawnExhaustParticle();
        }
    }
    
    spawnObstacle() {
        const laneWidth = this.roadWidth / 3;
        const lane = Math.floor(Math.random() * 3);
        const x = this.roadOffset + lane * laneWidth + laneWidth / 2 - 15;
        
        this.obstacles.push({
            x: x,
            y: -40,
            width: 30,
            height: 40,
            type: Math.random() < 0.5 ? 'barrel' : 'cone'
        });
    }
    
    spawnOtherCar() {
        const laneWidth = this.roadWidth / 3;
        const lane = Math.floor(Math.random() * 3);
        const x = this.roadOffset + lane * laneWidth + laneWidth / 2 - 25;
        
        const colors = ['#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#607D8B'];
        
        this.otherCars.push({
            x: x,
            y: -80,
            width: 50,
            height: 80,
            speed: Math.random() * 2 - 1,
            color: colors[Math.floor(Math.random() * colors.length)]
        });
    }
    
    spawnPowerUp() {
        const laneWidth = this.roadWidth / 3;
        const lane = Math.floor(Math.random() * 3);
        const x = this.roadOffset + lane * laneWidth + laneWidth / 2 - 15;
        
        this.powerUps.push({
            x: x,
            y: -30,
            width: 30,
            height: 30,
            rotation: 0,
            type: Math.random() < 0.5 ? 'speed' : 'points'
        });
    }
    
    spawnExhaustParticle() {
        const exhaustX = this.player.x + this.player.width / 2;
        const exhaustY = this.player.y + this.player.height;
        
        this.particles.push({
            x: exhaustX + (Math.random() - 0.5) * 20,
            y: exhaustY,
            vx: (Math.random() - 0.5) * 2,
            vy: Math.random() * 3 + 2,
            size: Math.random() * 3 + 2,
            life: 1,
            color: `rgba(100, 100, 100, ${Math.random() * 0.5 + 0.3})`
        });
    }
    
    checkCollisions() {
        const playerRect = this.player;
        
        // Check obstacle collisions
        this.obstacles.forEach(obstacle => {
            if (this.isColliding(playerRect, obstacle)) {
                this.createExplosion(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2);
                this.gameOver();
            }
        });
        
        // Check car collisions
        this.otherCars.forEach(car => {
            if (this.isColliding(playerRect, car)) {
                this.createExplosion(car.x + car.width / 2, car.y + car.height / 2);
                this.gameOver();
            }
        });
        
        // Check power-up collisions
        this.powerUps.forEach((powerUp, index) => {
            if (this.isColliding(playerRect, powerUp)) {
                this.collectPowerUp(powerUp);
                this.powerUps.splice(index, 1);
            }
        });
    }
    
    isColliding(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    collectPowerUp(powerUp) {
        if (powerUp.type === 'speed') {
            this.score += 50;
            // Create speed boost effect
            this.createSpeedBoostEffect();
        } else {
            this.score += 100;
        }
        
        // Create collection effect
        this.createCollectionEffect(powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2);
    }
    
    createExplosion(x, y) {
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                size: Math.random() * 5 + 3,
                life: 1,
                color: `rgba(255, ${Math.random() * 100 + 50}, 0, 0.8)`
            });
        }
    }
    
    createCollectionEffect(x, y) {
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                size: Math.random() * 3 + 2,
                life: 1,
                color: `rgba(0, 255, 100, 0.8)`
            });
        }
    }
    
    createSpeedBoostEffect() {
        // Visual effect for speed boost
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: this.player.x + this.player.width / 2,
                y: this.player.y + this.player.height,
                vx: (Math.random() - 0.5) * 8,
                vy: Math.random() * 5 + 3,
                size: Math.random() * 4 + 2,
                life: 1,
                color: `rgba(0, 150, 255, 0.8)`
            });
        }
    }
    
    updateScore() {
        this.score += Math.floor(this.gameSpeed * 0.1);
    }
    
    updateUI() {
        document.getElementById('score').textContent = Math.floor(this.score);
        document.getElementById('speed').textContent = Math.floor(this.gameSpeed * 15);
        document.getElementById('time').textContent = Math.floor(this.time);
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        
        // Update final stats
        document.getElementById('finalScore').textContent = Math.floor(this.score);
        document.getElementById('finalTime').textContent = Math.floor(this.time);
        document.getElementById('maxSpeed').textContent = Math.floor(this.maxSpeed);
        
        // Show game over screen
        document.getElementById('gameOverScreen').classList.remove('hidden');
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#228B22';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        this.drawBackground();
        this.drawRoad();
        this.drawRoadLines();
        this.drawPlayer();
        this.drawObstacles();
        this.drawOtherCars();
        this.drawPowerUps();
        this.drawParticles();
    }
    
    drawBackground() {
        // Sky gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height * 0.3);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#87CEEB');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height * 0.3);
        
        // Grass/terrain
        this.ctx.fillStyle = '#32CD32';
        this.ctx.fillRect(0, this.height * 0.3, this.width, this.height * 0.7);
    }
    
    drawRoad() {
        // Main road
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(this.roadOffset, 0, this.roadWidth, this.height);
        
        // Road borders
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(this.roadOffset - 5, 0, 5, this.height);
        this.ctx.fillRect(this.roadOffset + this.roadWidth, 0, 5, this.height);
    }
    
    drawRoadLines() {
        this.ctx.fillStyle = '#fff';
        const lineWidth = 3;
        const lineHeight = 30;
        
        this.roadLines.forEach(line => {
            // Center line
            this.ctx.fillRect(this.width / 2 - lineWidth / 2, line.y, lineWidth, lineHeight);
            
            // Lane dividers
            const laneWidth = this.roadWidth / 3;
            this.ctx.fillRect(this.roadOffset + laneWidth - lineWidth / 2, line.y, lineWidth, lineHeight);
            this.ctx.fillRect(this.roadOffset + 2 * laneWidth - lineWidth / 2, line.y, lineWidth, lineHeight);
        });
    }
    
    drawPlayer() {
        this.drawCar(this.player.x, this.player.y, this.player.width, this.player.height, this.player.color, true);
    }
    
    drawObstacles() {
        this.obstacles.forEach(obstacle => {
            if (obstacle.type === 'barrel') {
                this.drawBarrel(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            } else {
                this.drawCone(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            }
        });
    }
    
    drawOtherCars() {
        this.otherCars.forEach(car => {
            this.drawCar(car.x, car.y, car.width, car.height, car.color, false);
        });
    }
    
    drawPowerUps() {
        this.powerUps.forEach(powerUp => {
            this.ctx.save();
            this.ctx.translate(powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2);
            this.ctx.rotate(powerUp.rotation);
            
            if (powerUp.type === 'speed') {
                // Lightning bolt
                this.ctx.fillStyle = '#00aaff';
                this.ctx.fillRect(-15, -15, 30, 30);
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = '20px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('⚡', 0, 7);
            } else {
                // Star for points
                this.ctx.fillStyle = '#ffdd00';
                this.ctx.fillRect(-15, -15, 30, 30);
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = '20px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('★', 0, 7);
            }
            
            this.ctx.restore();
        });
    }
    
    drawParticles() {
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.life;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
    }
    
    drawCar(x, y, width, height, color, isPlayer) {
        // Main body
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x + 5, y + 10, width - 10, height - 20);
        
        // Windshield
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(x + 10, y + 15, width - 20, height * 0.3);
        
        // Wheels
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(x, y + 10, 8, 15);
        this.ctx.fillRect(x + width - 8, y + 10, 8, 15);
        this.ctx.fillRect(x, y + height - 25, 8, 15);
        this.ctx.fillRect(x + width - 8, y + height - 25, 8, 15);
        
        // Details
        if (isPlayer) {
            // Racing stripes
            this.ctx.fillStyle = '#fff';
            this.ctx.fillRect(x + width / 2 - 2, y + 10, 4, height - 20);
            
            // Headlights
            this.ctx.fillStyle = '#ffff88';
            this.ctx.fillRect(x + 8, y + 5, 8, 5);
            this.ctx.fillRect(x + width - 16, y + 5, 8, 5);
        }
    }
    
    drawBarrel(x, y, width, height) {
        // Barrel body
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(x, y, width, height);
        
        // Barrel bands
        this.ctx.fillStyle = '#654321';
        this.ctx.fillRect(x, y + height * 0.2, width, 3);
        this.ctx.fillRect(x, y + height * 0.8, width, 3);
        
        // Top
        this.ctx.fillStyle = '#A0522D';
        this.ctx.fillRect(x, y, width, 5);
    }
    
    drawCone(x, y, width, height) {
        // Orange cone
        this.ctx.fillStyle = '#FF4500';
        this.ctx.beginPath();
        this.ctx.moveTo(x + width / 2, y);
        this.ctx.lineTo(x, y + height);
        this.ctx.lineTo(x + width, y + height);
        this.ctx.closePath();
        this.ctx.fill();
        
        // White stripe
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(x + 5, y + height * 0.6, width - 10, 4);
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    new CarGame();
}); 