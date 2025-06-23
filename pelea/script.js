// Game variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('gameOverlay');

// Game state
let gameState = 'menu'; // menu, playing, paused, roundEnd, gameEnd
let currentRound = 1;
let playerScore = 0;
let enemyScore = 0;
let difficulty = 'medium';
let animationId;

// Physics constants
const GRAVITY = 0.8;
const GROUND_Y = canvas.height - 50;
const CANVAS_WIDTH = canvas.width;
const CANVAS_HEIGHT = canvas.height;

// Player and Enemy objects
let player, enemy;
let projectiles = [];
let particles = [];

// Input handling
const keys = {};
document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
});
document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

// Difficulty settings
const difficultySettings = {
    easy: { enemySpeed: 2, enemyHealth: 80, enemyAggression: 0.3, enemyReactionTime: 60 },
    medium: { enemySpeed: 3, enemyHealth: 100, enemyAggression: 0.5, enemyReactionTime: 40 },
    hard: { enemySpeed: 4, enemyHealth: 120, enemyAggression: 0.7, enemyReactionTime: 25 },
    nightmare: { enemySpeed: 5, enemyHealth: 150, enemyAggression: 0.9, enemyReactionTime: 15 }
};

// Character class
class Character {
    constructor(x, y, isPlayer = true) {
        this.x = x;
        this.y = y;
        this.width = 30;
        this.height = 60;
        this.velocityX = 0;
        this.velocityY = 0;
        this.isPlayer = isPlayer;
        this.health = 100;
        this.maxHealth = 100;
        this.ki = 0;
        this.maxKi = 100;
        this.projectiles = 5;
        this.maxProjectiles = 5;
        this.isOnGround = false;
        this.facingRight = isPlayer ? true : false;
        
        // Animation states
        this.animationState = 'idle';
        this.animationFrame = 0;
        this.animationSpeed = 0.2;
        
        // Combat states
        this.isAttacking = false;
        this.isChargingKi = false;
        this.isSuperAttacking = false;
        this.isShootingProjectile = false;
        this.attackCooldown = 0;
        this.kiChargeCooldown = 0;
        this.projectileCooldown = 0;
        this.invulnerable = false;
        this.invulnerabilityTime = 0;
        
        // AI specific
        this.aiTimer = 0;
        this.aiDecision = 'idle';
        this.aiReactionTime = difficultySettings[difficulty].enemyReactionTime;
    }
    
    update() {
        // Update cooldowns
        if (this.attackCooldown > 0) this.attackCooldown--;
        if (this.kiChargeCooldown > 0) this.kiChargeCooldown--;
        if (this.projectileCooldown > 0) this.projectileCooldown--;
        if (this.invulnerabilityTime > 0) {
            this.invulnerabilityTime--;
            this.invulnerable = this.invulnerabilityTime > 0;
        }
        
        if (this.isPlayer) {
            this.handlePlayerInput();
        } else {
            this.handleAI();
        }
        
        // Apply physics
        this.velocityY += GRAVITY;
        this.x += this.velocityX;
        this.y += this.velocityY;
        
        // Ground collision
        if (this.y + this.height >= GROUND_Y) {
            this.y = GROUND_Y - this.height;
            this.velocityY = 0;
            this.isOnGround = true;
        } else {
            this.isOnGround = false;
        }
        
        // Horizontal boundaries
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > CANVAS_WIDTH) this.x = CANVAS_WIDTH - this.width;
        
        // Apply friction
        this.velocityX *= 0.8;
        
        // Update animation
        this.updateAnimation();
        
        // Regenerate resources slowly
        if (this.ki < this.maxKi && Math.random() < 0.01) this.ki++;
        if (this.projectiles < this.maxProjectiles && Math.random() < 0.005) this.projectiles++;
    }
    
    handlePlayerInput() {
        // Movement
        if (keys['a'] && !this.isAttacking && !this.isSuperAttacking) {
            this.velocityX = -4;
            this.facingRight = false;
            this.animationState = 'walking';
        } else if (keys['d'] && !this.isAttacking && !this.isSuperAttacking) {
            this.velocityX = 4;
            this.facingRight = true;
            this.animationState = 'walking';
        } else if (!this.isAttacking && !this.isSuperAttacking && !this.isChargingKi) {
            this.animationState = 'idle';
        }
        
        // Jump
        if (keys['w'] && this.isOnGround && !this.isAttacking && !this.isSuperAttacking) {
            this.velocityY = -15;
            this.animationState = 'jumping';
        }
        
        // Basic attack
        if (keys['j'] && this.attackCooldown === 0 && !this.isChargingKi && !this.isSuperAttacking) {
            this.basicAttack();
        }
        
        // Charge Ki
        if (keys['s'] && !this.isAttacking && !this.isSuperAttacking) {
            this.chargeKi();
        } else {
            this.isChargingKi = false;
        }
        
        // Super attack
        if (keys['k'] && this.ki >= this.maxKi && this.attackCooldown === 0 && !this.isChargingKi) {
            this.superAttack();
        }
        
        // Projectile
        if (keys['l'] && this.projectiles > 0 && this.projectileCooldown === 0 && !this.isAttacking && !this.isSuperAttacking) {
            this.shootProjectile();
        }
    }
    
    handleAI() {
        this.aiTimer++;
        const settings = difficultySettings[difficulty];
        
        if (this.aiTimer >= this.aiReactionTime) {
            this.aiTimer = 0;
            this.makeAIDecision();
        }
        
        // Execute AI decision
        switch (this.aiDecision) {
            case 'moveToward':
                if (this.x < player.x) {
                    this.velocityX = settings.enemySpeed;
                    this.facingRight = true;
                } else {
                    this.velocityX = -settings.enemySpeed;
                    this.facingRight = false;
                }
                this.animationState = 'walking';
                break;
                
            case 'attack':
                if (this.attackCooldown === 0) {
                    this.basicAttack();
                }
                break;
                
            case 'superAttack':
                if (this.ki >= this.maxKi && this.attackCooldown === 0) {
                    this.superAttack();
                }
                break;
                
            case 'chargeKi':
                this.chargeKi();
                break;
                
            case 'shootProjectile':
                if (this.projectiles > 0 && this.projectileCooldown === 0) {
                    this.shootProjectile();
                }
                break;
                
            case 'jump':
                if (this.isOnGround) {
                    this.velocityY = -15;
                    this.animationState = 'jumping';
                }
                break;
                
            default:
                this.animationState = 'idle';
        }
    }
    
    makeAIDecision() {
        const distanceToPlayer = Math.abs(this.x - player.x);
        const settings = difficultySettings[difficulty];
        const randomFactor = Math.random();
        
        // Reset decision
        this.aiDecision = 'idle';
        
        if (this.health < 30 && this.ki < 50 && randomFactor < 0.3) {
            this.aiDecision = 'chargeKi';
        } else if (distanceToPlayer > 100 && randomFactor < settings.enemyAggression) {
            this.aiDecision = 'moveToward';
        } else if (distanceToPlayer < 60 && randomFactor < settings.enemyAggression * 0.8) {
            if (this.ki >= this.maxKi && randomFactor < 0.3) {
                this.aiDecision = 'superAttack';
            } else {
                this.aiDecision = 'attack';
            }
        } else if (distanceToPlayer > 80 && this.projectiles > 0 && randomFactor < 0.4) {
            this.aiDecision = 'shootProjectile';
        } else if (distanceToPlayer < 50 && randomFactor < 0.2) {
            this.aiDecision = 'jump';
        }
    }
    
    basicAttack() {
        this.isAttacking = true;
        this.attackCooldown = 30;
        this.animationState = 'attacking';
        
        // Check for hit
        const otherCharacter = this.isPlayer ? enemy : player;
        const attackRange = 50;
        const distance = Math.abs(this.x - otherCharacter.x);
        
        if (distance < attackRange) {
            otherCharacter.takeDamage(15);
        }
        
        setTimeout(() => {
            this.isAttacking = false;
        }, 300);
    }
    
    superAttack() {
        this.isSuperAttacking = true;
        this.ki = 0;
        this.attackCooldown = 60;
        this.animationState = 'superAttacking';
        
        // Check for hit
        const otherCharacter = this.isPlayer ? enemy : player;
        const attackRange = 80;
        const distance = Math.abs(this.x - otherCharacter.x);
        
        if (distance < attackRange) {
            otherCharacter.takeDamage(30);
        }
        
        // Create explosion effect
        for (let i = 0; i < 10; i++) {
            particles.push(new Particle(
                this.x + this.width / 2,
                this.y + this.height / 2,
                'explosion'
            ));
        }
        
        setTimeout(() => {
            this.isSuperAttacking = false;
        }, 500);
    }
    
    chargeKi() {
        this.isChargingKi = true;
        this.animationState = 'chargingKi';
        
        if (this.ki < this.maxKi) {
            this.ki += 2;
        }
        
        // Create ki particles
        if (Math.random() < 0.3) {
            particles.push(new Particle(
                this.x + Math.random() * this.width,
                this.y + Math.random() * this.height,
                'ki'
            ));
        }
    }
    
    shootProjectile() {
        if (this.projectiles <= 0) return;
        
        this.projectiles--;
        this.projectileCooldown = 45;
        this.isShootingProjectile = true;
        this.animationState = 'shooting';
        
        const projectileX = this.facingRight ? this.x + this.width : this.x;
        const projectileY = this.y + this.height / 2;
        const direction = this.facingRight ? 1 : -1;
        
        projectiles.push(new Projectile(projectileX, projectileY, direction, this.isPlayer));
        
        setTimeout(() => {
            this.isShootingProjectile = false;
        }, 200);
    }
    
    takeDamage(damage) {
        if (this.invulnerable) return;
        
        this.health -= damage;
        this.invulnerable = true;
        this.invulnerabilityTime = 30;
        
        // Create damage particles
        for (let i = 0; i < 5; i++) {
            particles.push(new Particle(
                this.x + Math.random() * this.width,
                this.y + Math.random() * this.height,
                'damage'
            ));
        }
        
        if (this.health <= 0) {
            this.health = 0;
            this.die();
        }
    }
    
    die() {
        if (this.isPlayer) {
            enemyScore++;
        } else {
            playerScore++;
        }
        endRound();
    }
    
    updateAnimation() {
        this.animationFrame += this.animationSpeed;
        if (this.animationFrame >= 4) {
            this.animationFrame = 0;
        }
    }
    
    draw() {
        ctx.save();
        
        // Apply invulnerability flashing
        if (this.invulnerable && Math.floor(this.invulnerabilityTime / 5) % 2) {
            ctx.globalAlpha = 0.5;
        }
        
        // Character body
        const color = this.isPlayer ? '#4CAF50' : '#f44336';
        ctx.fillStyle = color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Head
        ctx.fillStyle = '#FFDBAC';
        ctx.fillRect(this.x + 5, this.y - 15, 20, 20);
        
        // Eyes
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x + 8, this.y - 10, 3, 3);
        ctx.fillRect(this.x + 19, this.y - 10, 3, 3);
        
        // Arms
        ctx.fillStyle = color;
        ctx.fillRect(this.x - 5, this.y + 10, 10, 25);
        ctx.fillRect(this.x + this.width - 5, this.y + 10, 10, 25);
        
        // Legs
        ctx.fillRect(this.x + 5, this.y + this.height, 8, 20);
        ctx.fillRect(this.x + this.width - 13, this.y + this.height, 8, 20);
        
        // Animation effects
        if (this.isChargingKi) {
            ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
            ctx.fillRect(this.x - 10, this.y - 10, this.width + 20, this.height + 20);
        }
        
        if (this.isAttacking) {
            ctx.fillStyle = 'rgba(255, 255, 0, 0.5)';
            const attackX = this.facingRight ? this.x + this.width : this.x - 30;
            ctx.fillRect(attackX, this.y, 30, this.height);
        }
        
        if (this.isSuperAttacking) {
            ctx.fillStyle = 'rgba(255, 0, 255, 0.7)';
            ctx.fillRect(this.x - 20, this.y - 20, this.width + 40, this.height + 40);
        }
        
        ctx.restore();
    }
}

// Projectile class
class Projectile {
    constructor(x, y, direction, isPlayerProjectile) {
        this.x = x;
        this.y = y;
        this.width = 15;
        this.height = 15;
        this.velocityX = direction * 8;
        this.isPlayerProjectile = isPlayerProjectile;
        this.life = 100;
    }
    
    update() {
        this.x += this.velocityX;
        this.life--;
        
        // Check collision with characters
        const target = this.isPlayerProjectile ? enemy : player;
        
        if (this.x < target.x + target.width &&
            this.x + this.width > target.x &&
            this.y < target.y + target.height &&
            this.y + this.height > target.y) {
            
            target.takeDamage(20);
            this.life = 0;
            
            // Create hit particles
            for (let i = 0; i < 8; i++) {
                particles.push(new Particle(this.x, this.y, 'projectileHit'));
            }
        }
        
        // Remove if off screen or life expired
        return this.life > 0 && this.x > -50 && this.x < CANVAS_WIDTH + 50;
    }
    
    draw() {
        ctx.save();
        ctx.fillStyle = this.isPlayerProjectile ? '#00FFFF' : '#FF6600';
        ctx.shadowColor = ctx.fillStyle;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + this.height/2, this.width/2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// Particle class
class Particle {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.velocityX = (Math.random() - 0.5) * 6;
        this.velocityY = (Math.random() - 0.5) * 6;
        this.life = 60;
        this.maxLife = 60;
        this.type = type;
        this.size = Math.random() * 5 + 2;
    }
    
    update() {
        this.x += this.velocityX;
        this.y += this.velocityY;
        this.life--;
        
        if (this.type === 'ki') {
            this.y -= 2;
        }
        
        return this.life > 0;
    }
    
    draw() {
        const alpha = this.life / this.maxLife;
        ctx.save();
        ctx.globalAlpha = alpha;
        
        switch (this.type) {
            case 'explosion':
                ctx.fillStyle = '#FF6600';
                break;
            case 'ki':
                ctx.fillStyle = '#00FFFF';
                break;
            case 'damage':
                ctx.fillStyle = '#FF0000';
                break;
            case 'projectileHit':
                ctx.fillStyle = '#FFFF00';
                break;
        }
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// Game functions
function initGame() {
    const settings = difficultySettings[difficulty];
    
    player = new Character(100, GROUND_Y - 60, true);
    enemy = new Character(CANVAS_WIDTH - 130, GROUND_Y - 60, false);
    enemy.health = settings.enemyHealth;
    enemy.maxHealth = settings.enemyHealth;
    
    projectiles = [];
    particles = [];
    
    updateUI();
}

function startRound() {
    gameState = 'playing';
    overlay.style.display = 'none';
    
    // Reset characters for new round
    player.health = player.maxHealth;
    player.ki = 0;
    player.projectiles = player.maxProjectiles;
    player.x = 100;
    player.y = GROUND_Y - 60;
    player.velocityX = 0;
    player.velocityY = 0;
    
    const settings = difficultySettings[difficulty];
    enemy.health = enemy.maxHealth;
    enemy.ki = 0;
    enemy.projectiles = enemy.maxProjectiles;
    enemy.x = CANVAS_WIDTH - 130;
    enemy.y = GROUND_Y - 60;
    enemy.velocityX = 0;
    enemy.velocityY = 0;
    
    projectiles = [];
    particles = [];
    
    updateUI();
    gameLoop();
}

function endRound() {
    gameState = 'roundEnd';
    
    document.getElementById('roundResultTitle').textContent = 
        playerScore > enemyScore ? '¡Round Ganado!' : 'Round Perdido';
    document.getElementById('roundResultMessage').textContent = 
        playerScore > enemyScore ? 'Has ganado este round' : 'El enemigo ganó este round';
    
    document.getElementById('roundResult').style.display = 'block';
    
    if (playerScore >= 2 || enemyScore >= 2) {
        // Game ended
        gameState = 'gameEnd';
        document.getElementById('finalResultTitle').textContent = 
            playerScore >= 2 ? '🏆 ¡VICTORIA!' : '💀 DERROTA';
        document.getElementById('finalResultMessage').textContent = 
            playerScore >= 2 ? 'Has ganado el combate' : 'El enemigo ha ganado el combate';
        
        document.getElementById('finalResult').style.display = 'block';
        document.getElementById('restartButton').style.display = 'inline-block';
        document.getElementById('nextRoundButton').style.display = 'none';
    } else {
        // Continue to next round
        currentRound++;
        document.getElementById('nextRoundButton').style.display = 'inline-block';
        document.getElementById('restartButton').style.display = 'none';
    }
    
    updateUI();
    overlay.style.display = 'flex';
}

function nextRound() {
    document.getElementById('roundResult').style.display = 'none';
    document.getElementById('nextRoundButton').style.display = 'none';
    
    document.getElementById('overlayTitle').textContent = `ROUND ${currentRound}`;
    document.getElementById('overlayMessage').textContent = 'Prepárate para el siguiente round!';
    document.getElementById('startButton').style.display = 'inline-block';
    document.getElementById('startButton').textContent = '¡Comenzar Round!';
}

function restartGame() {
    currentRound = 1;
    playerScore = 0;
    enemyScore = 0;
    gameState = 'menu';
    
    document.getElementById('roundResult').style.display = 'none';
    document.getElementById('finalResult').style.display = 'none';
    document.getElementById('restartButton').style.display = 'none';
    document.getElementById('nextRoundButton').style.display = 'none';
    document.getElementById('startButton').style.display = 'inline-block';
    document.getElementById('startButton').textContent = '¡Comenzar Combate!';
    
    document.getElementById('overlayTitle').textContent = '🥊 ¡COMBATE ÉPICO!';
    document.getElementById('overlayMessage').textContent = '¡Sistema de 3 rounds! El primero en ganar 2 rounds gana el combate.';
    
    updateUI();
}

function updateUI() {
    // Update round info
    document.getElementById('roundTitle').textContent = `ROUND ${currentRound}`;
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('enemyScore').textContent = enemyScore;
    
    if (player && enemy) {
        // Update player stats
        document.getElementById('playerHealth').textContent = Math.max(0, player.health);
        document.getElementById('playerKi').textContent = Math.floor(player.ki);
        document.getElementById('playerProjectiles').textContent = player.projectiles;
        
        // Update enemy stats
        document.getElementById('enemyHealth').textContent = Math.max(0, enemy.health);
        document.getElementById('enemyKi').textContent = Math.floor(enemy.ki);
        document.getElementById('enemyProjectiles').textContent = enemy.projectiles;
        
        // Update health bars
        const playerHealthPercent = (player.health / player.maxHealth) * 100;
        const enemyHealthPercent = (enemy.health / enemy.maxHealth) * 100;
        document.getElementById('playerHealthBar').style.width = playerHealthPercent + '%';
        document.getElementById('enemyHealthBar').style.width = enemyHealthPercent + '%';
        
        // Update ki bars
        const playerKiPercent = (player.ki / player.maxKi) * 100;
        const enemyKiPercent = (enemy.ki / enemy.maxKi) * 100;
        document.getElementById('playerKiBar').style.width = playerKiPercent + '%';
        document.getElementById('enemyKiBar').style.width = enemyKiPercent + '%';
    }
}

function drawBackground() {
    // Sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.5, '#98FB98');
    gradient.addColorStop(1, '#90EE90');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Ground
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, GROUND_Y, canvas.width, canvas.height - GROUND_Y);
    
    // Arena border
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.strokeRect(50, 50, canvas.width - 100, GROUND_Y - 60);
}

function gameLoop() {
    if (gameState !== 'playing') return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    drawBackground();
    
    // Update and draw game objects
    if (player) {
        player.update();
        player.draw();
    }
    
    if (enemy) {
        enemy.update();
        enemy.draw();
    }
    
    // Update projectiles
    projectiles = projectiles.filter(projectile => {
        const alive = projectile.update();
        if (alive) projectile.draw();
        return alive;
    });
    
    // Update particles
    particles = particles.filter(particle => {
        const alive = particle.update();
        if (alive) particle.draw();
        return alive;
    });
    
    // Update UI
    updateUI();
    
    // Continue game loop
    animationId = requestAnimationFrame(gameLoop);
}

// Event listeners
document.getElementById('startButton').addEventListener('click', () => {
    difficulty = document.getElementById('difficulty').value;
    initGame();
    startRound();
});

document.getElementById('nextRoundButton').addEventListener('click', () => {
    nextRound();
});

document.getElementById('restartButton').addEventListener('click', () => {
    restartGame();
});

// Initialize
updateUI();