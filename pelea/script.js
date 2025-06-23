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
let kamehamehas = [];

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
        this.isKicking = false;
        this.isChargingKi = false;
        this.isSuperAttacking = false;
        this.isChargingKamehameha = false;
        this.isShootingKamehameha = false;
        this.isShootingProjectile = false;
        this.isComboAttacking = false;
        this.kamehamehaChargeTime = 0;
        this.attackCooldown = 0;
        this.kickCooldown = 0;
        this.kiChargeCooldown = 0;
        this.projectileCooldown = 0;
        this.comboCooldown = 0;
        this.invulnerable = false;
        this.invulnerabilityTime = 0;
        
        // Combo system
        this.comboCount = 0;
        this.maxCombo = 5;
        this.comboTimer = 0;
        this.lastAttackType = '';
        this.comboSequence = [];
        
        // AI specific
        this.aiTimer = 0;
        this.aiDecision = 'idle';
        this.aiReactionTime = difficultySettings[difficulty].enemyReactionTime;
    }
    
    update() {
        // Update cooldowns
        if (this.attackCooldown > 0) this.attackCooldown--;
        if (this.kickCooldown > 0) this.kickCooldown--;
        if (this.kiChargeCooldown > 0) this.kiChargeCooldown--;
        if (this.projectileCooldown > 0) this.projectileCooldown--;
        if (this.comboCooldown > 0) this.comboCooldown--;
        if (this.invulnerabilityTime > 0) {
            this.invulnerabilityTime--;
            this.invulnerable = this.invulnerabilityTime > 0;
        }
        
        // Update combo timer
        if (this.comboTimer > 0) {
            this.comboTimer--;
        } else if (this.comboCount > 0) {
            this.resetCombo();
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
        if (keys['a'] && !this.isAttacking && !this.isSuperAttacking && !this.isKicking && !this.isComboAttacking) {
            this.velocityX = -4;
            this.facingRight = false;
            this.animationState = 'walking';
        } else if (keys['d'] && !this.isAttacking && !this.isSuperAttacking && !this.isKicking && !this.isComboAttacking) {
            this.velocityX = 4;
            this.facingRight = true;
            this.animationState = 'walking';
        } else if (!this.isAttacking && !this.isSuperAttacking && !this.isChargingKi && !this.isKicking && !this.isComboAttacking) {
            this.animationState = 'idle';
        }
        
        // Jump
        if (keys['w'] && this.isOnGround && !this.isAttacking && !this.isSuperAttacking && !this.isKicking) {
            this.velocityY = -15;
            this.animationState = 'jumping';
        }
        
        // Basic punch attack
        if (keys['j'] && this.attackCooldown === 0 && !this.isChargingKi && !this.isSuperAttacking && !this.isKicking) {
            this.punchAttack();
        }
        
        // Kick attack
        if (keys['h'] && this.kickCooldown === 0 && !this.isChargingKi && !this.isSuperAttacking && !this.isAttacking) {
            this.kickAttack();
        }
        
        // Combo attack (punch + kick sequence)
        if (keys['u'] && this.comboCooldown === 0 && !this.isChargingKi && !this.isSuperAttacking && !this.isAttacking && !this.isKicking) {
            this.comboAttack();
        }
        
        // Special combo moves
        if (keys['i'] && this.comboCount >= 3 && this.comboCooldown === 0) {
            this.specialCombo();
        }
        
        // Charge Ki
        if (keys['s'] && !this.isAttacking && !this.isSuperAttacking && !this.isKicking && !this.isComboAttacking) {
            this.chargeKi();
        } else {
            this.isChargingKi = false;
        }
        
        // Super attack
        if (keys['k'] && this.ki >= this.maxKi && this.attackCooldown === 0 && !this.isChargingKi && !this.isKicking) {
            this.superAttack();
        }
        
        // Projectile
        if (keys['l'] && this.projectiles > 0 && this.projectileCooldown === 0 && !this.isAttacking && !this.isSuperAttacking && !this.isKicking) {
            this.shootProjectile();
        }
        
        // Advanced combo inputs
        this.handleComboInputs();
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
                
            case 'punch':
                if (this.attackCooldown === 0) {
                    this.punchAttack();
                }
                break;
                
            case 'kick':
                if (this.kickCooldown === 0) {
                    this.kickAttack();
                }
                break;
                
            case 'combo':
                if (this.comboCooldown === 0) {
                    this.comboAttack();
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
            if (this.ki >= this.maxKi && randomFactor < 0.2) {
                this.aiDecision = 'superAttack';
            } else if (this.comboCount >= 2 && randomFactor < 0.3) {
                this.aiDecision = 'combo';
            } else if (randomFactor < 0.4) {
                this.aiDecision = 'punch';
            } else {
                this.aiDecision = 'kick';
            }
        } else if (distanceToPlayer > 80 && this.projectiles > 0 && randomFactor < 0.4) {
            this.aiDecision = 'shootProjectile';
        } else if (distanceToPlayer < 50 && randomFactor < 0.2) {
            this.aiDecision = 'jump';
        }
    }
    
    // Combo input handling
    handleComboInputs() {
        // Check for combo sequences (punch -> kick -> punch)
        if (this.comboSequence.length >= 3) {
            const sequence = this.comboSequence.join('-');
            if (sequence === 'punch-kick-punch' && this.comboCooldown === 0) {
                this.executeComboFinisher('triple-strike');
            } else if (sequence === 'kick-kick-punch' && this.comboCooldown === 0) {
                this.executeComboFinisher('hurricane-kick');
            } else if (sequence === 'punch-punch-kick' && this.comboCooldown === 0) {
                this.executeComboFinisher('power-slam');
            }
        }
    }

    punchAttack() {
        this.isAttacking = true;
        this.attackCooldown = 25;
        this.animationState = 'punching';
        this.addToCombo('punch');
        
        // Check for hit
        const otherCharacter = this.isPlayer ? enemy : player;
        const attackRange = 50;
        const distance = Math.abs(this.x - otherCharacter.x);
        
        if (distance < attackRange) {
            const damage = this.comboCount > 0 ? 18 + (this.comboCount * 2) : 15;
            otherCharacter.takeDamage(damage);
            this.increaseCombo();
        }
        
        setTimeout(() => {
            this.isAttacking = false;
        }, 250);
    }
    
    kickAttack() {
        this.isKicking = true;
        this.kickCooldown = 35;
        this.animationState = 'kicking';
        this.addToCombo('kick');
        
        // Check for hit
        const otherCharacter = this.isPlayer ? enemy : player;
        const attackRange = 60; // Kicks have longer range
        const distance = Math.abs(this.x - otherCharacter.x);
        
        if (distance < attackRange) {
            const damage = this.comboCount > 0 ? 22 + (this.comboCount * 3) : 20;
            otherCharacter.takeDamage(damage);
            // Kicks can knock back the enemy
            const knockbackDirection = this.facingRight ? 1 : -1;
            otherCharacter.velocityX += knockbackDirection * 3;
            this.increaseCombo();
        }
        
        setTimeout(() => {
            this.isKicking = false;
        }, 350);
    }
    
    comboAttack() {
        this.isComboAttacking = true;
        this.comboCooldown = 60;
        this.animationState = 'comboAttacking';
        
        // Multi-hit combo attack
        let hitCount = 0;
        const maxHits = 3;
        const otherCharacter = this.isPlayer ? enemy : player;
        const attackRange = 55;
        const distance = Math.abs(this.x - otherCharacter.x);
        
        const performHit = () => {
            if (hitCount < maxHits && distance < attackRange) {
                const damage = 12 + (hitCount * 3);
                otherCharacter.takeDamage(damage);
                this.increaseCombo();
                
                // Create combo particles
                for (let i = 0; i < 3; i++) {
                    particles.push(new Particle(
                        otherCharacter.x + Math.random() * otherCharacter.width,
                        otherCharacter.y + Math.random() * otherCharacter.height,
                        'combo'
                    ));
                }
                
                hitCount++;
                if (hitCount < maxHits) {
                    setTimeout(performHit, 150);
                }
            }
        };
        
        if (distance < attackRange) {
            performHit();
        }
        
        setTimeout(() => {
            this.isComboAttacking = false;
        }, 600);
    }
    
    specialCombo() {
        if (this.comboCount < 3) return;
        
        this.isComboAttacking = true;
        this.comboCooldown = 90;
        this.animationState = 'specialCombo';
        this.comboCount = 0; // Reset combo after special
        
        const otherCharacter = this.isPlayer ? enemy : player;
        const attackRange = 80;
        const distance = Math.abs(this.x - otherCharacter.x);
        
        if (distance < attackRange) {
            otherCharacter.takeDamage(40);
            
            // Create spectacular effect
            for (let i = 0; i < 15; i++) {
                particles.push(new Particle(
                    this.x + this.width / 2,
                    this.y + this.height / 2,
                    'specialCombo'
                ));
            }
            
            // Screen shake effect (visual only)
            const knockbackDirection = this.facingRight ? 1 : -1;
            otherCharacter.velocityX += knockbackDirection * 8;
            otherCharacter.velocityY = -10;
        }
        
        setTimeout(() => {
            this.isComboAttacking = false;
        }, 800);
    }
    
    executeComboFinisher(finisherType) {
        this.comboCooldown = 120;
        this.comboSequence = []; // Clear sequence
        this.comboCount = 0;
        
        const otherCharacter = this.isPlayer ? enemy : player;
        const distance = Math.abs(this.x - otherCharacter.x);
        
        switch (finisherType) {
            case 'triple-strike':
                if (distance < 70) {
                    otherCharacter.takeDamage(50);
                    this.animationState = 'tripleStrike';
                }
                break;
            case 'hurricane-kick':
                if (distance < 80) {
                    otherCharacter.takeDamage(45);
                    otherCharacter.velocityX += (this.facingRight ? 1 : -1) * 10;
                    this.animationState = 'hurricaneKick';
                }
                break;
            case 'power-slam':
                if (distance < 60) {
                    otherCharacter.takeDamage(55);
                    otherCharacter.velocityY = -12;
                    this.animationState = 'powerSlam';
                }
                break;
        }
        
        // Create finisher particles
        for (let i = 0; i < 20; i++) {
            particles.push(new Particle(
                this.x + this.width / 2,
                this.y + this.height / 2,
                'finisher'
            ));
        }
    }
    
    addToCombo(attackType) {
        this.comboSequence.push(attackType);
        if (this.comboSequence.length > 3) {
            this.comboSequence.shift(); // Keep only last 3 attacks
        }
    }
    
    increaseCombo() {
        this.comboCount++;
        this.comboTimer = 180; // 3 seconds to continue combo
        if (this.comboCount > this.maxCombo) {
            this.comboCount = this.maxCombo;
        }
    }
    
    resetCombo() {
        this.comboCount = 0;
        this.comboSequence = [];
        this.comboTimer = 0;
    }
    
    // Legacy method name for AI compatibility
    basicAttack() {
        // AI will randomly choose between punch and kick
        if (Math.random() < 0.6) {
            this.punchAttack();
        } else {
            this.kickAttack();
        }
    }
    
    superAttack() {
        if (this.ki < this.maxKi) return;
        
        // Start Kamehameha sequence
        this.isChargingKamehameha = true;
        this.kamehamehaChargeTime = 0;
        this.animationState = 'chargingKamehameha';
        this.attackCooldown = 180; // Long cooldown for super attack
        
        // Charge phase (1.5 seconds)
        const chargePhase = () => {
            this.kamehamehaChargeTime++;
            
            // Create charging particles
            if (Math.random() < 0.5) {
                particles.push(new Particle(
                    this.x + this.width / 2 + (Math.random() - 0.5) * 40,
                    this.y + this.height / 2 + (Math.random() - 0.5) * 40,
                    'kamehamehaCharge'
                ));
            }
            
            // Continue charging for 90 frames (1.5 seconds)
            if (this.kamehamehaChargeTime < 90) {
                setTimeout(chargePhase, 16); // ~60fps
            } else {
                this.executeKamehameha();
            }
        };
        
        chargePhase();
    }
    
    executeKamehameha() {
        this.isChargingKamehameha = false;
        this.isShootingKamehameha = true;
        this.ki = 0; // Consume all Ki
        this.animationState = 'shootingKamehameha';
        
        // Create the Kamehameha beam
        const beamStartX = this.facingRight ? this.x + this.width : this.x;
        const beamY = this.y + this.height / 2;
        const direction = this.facingRight ? 1 : -1;
        
        kamehamehas.push(new Kamehameha(beamStartX, beamY, direction, this.isPlayer));
        
        // Massive particle explosion at start
        for (let i = 0; i < 30; i++) {
            particles.push(new Particle(
                beamStartX,
                beamY,
                'kamehamehaCharge'
            ));
        }
        
        setTimeout(() => {
            this.isShootingKamehameha = false;
            this.isSuperAttacking = false;
        }, 2000); // 2 seconds duration
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
        
        // Calculate center positions
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        const headY = this.y;
        const bodyTopY = this.y + 15;
        const bodyBottomY = this.y + this.height - 20;
        const feetY = this.y + this.height + 15;
        
        // Character color
        const color = this.isPlayer ? '#4CAF50' : '#f44336';
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        
        // Head (circle)
        ctx.beginPath();
        ctx.arc(centerX, headY, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#FFDBAC';
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Eyes
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(centerX - 3, headY - 2, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(centerX + 3, headY - 2, 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        // Smile (when not taking damage)
        if (!this.invulnerable) {
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(centerX, headY + 1, 4, 0.2, Math.PI - 0.2);
            ctx.stroke();
        }
        
        // Body (vertical line)
        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(centerX, bodyTopY);
        ctx.lineTo(centerX, bodyBottomY);
        ctx.stroke();
        
        // Arms - adjust based on animation state
        ctx.lineWidth = 3;
        let leftArmX, leftArmY, rightArmX, rightArmY;
        
        if (this.isAttacking && this.facingRight) {
            // Right punch forward
            leftArmX = centerX - 15;
            leftArmY = bodyTopY + 15;
            rightArmX = centerX + 25;
            rightArmY = bodyTopY + 10;
        } else if (this.isAttacking && !this.facingRight) {
            // Left punch forward
            leftArmX = centerX - 25;
            leftArmY = bodyTopY + 10;
            rightArmX = centerX + 15;
            rightArmY = bodyTopY + 15;
        } else if (this.isKicking) {
            // Arms for balance during kick
            leftArmX = centerX - 20;
            leftArmY = bodyTopY + 5;
            rightArmX = centerX + 20;
            rightArmY = bodyTopY + 5;
        } else if (this.isChargingKi) {
            // Arms raised for Ki charging
            leftArmX = centerX - 10;
            leftArmY = bodyTopY - 5;
            rightArmX = centerX + 10;
            rightArmY = bodyTopY - 5;
        } else if (this.isChargingKamehameha) {
            // Kamehameha charging pose - hands together at side
            const sideOffset = this.facingRight ? -20 : 20;
            leftArmX = centerX + sideOffset - 5;
            leftArmY = bodyTopY + 25;
            rightArmX = centerX + sideOffset + 5;
            rightArmY = bodyTopY + 25;
        } else if (this.isShootingKamehameha) {
            // Kamehameha shooting pose - hands extended forward
            const forwardOffset = this.facingRight ? 25 : -25;
            leftArmX = centerX + forwardOffset - 3;
            leftArmY = bodyTopY + 15;
            rightArmX = centerX + forwardOffset + 3;
            rightArmY = bodyTopY + 15;
        } else if (this.animationState === 'walking') {
            // Swinging arms while walking
            const swingOffset = Math.sin(this.animationFrame * 3) * 8;
            leftArmX = centerX - 12 + swingOffset;
            leftArmY = bodyTopY + 20 - Math.abs(swingOffset);
            rightArmX = centerX + 12 - swingOffset;
            rightArmY = bodyTopY + 20 - Math.abs(swingOffset);
        } else {
            // Default arm position
            leftArmX = centerX - 15;
            leftArmY = bodyTopY + 20;
            rightArmX = centerX + 15;
            rightArmY = bodyTopY + 20;
        }
        
        // Draw arms
        ctx.beginPath();
        ctx.moveTo(centerX - 5, bodyTopY + 10);
        ctx.lineTo(leftArmX, leftArmY);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(centerX + 5, bodyTopY + 10);
        ctx.lineTo(rightArmX, rightArmY);
        ctx.stroke();
        
        // Legs - adjust based on animation state
        let leftLegX, leftLegY, rightLegX, rightLegY;
        
        if (this.isKicking && this.facingRight) {
            // Right kick forward
            leftLegX = centerX - 12;
            leftLegY = feetY;
            rightLegX = centerX + 25;
            rightLegY = bodyBottomY + 10;
        } else if (this.isKicking && !this.facingRight) {
            // Left kick forward
            leftLegX = centerX - 25;
            leftLegY = bodyBottomY + 10;
            rightLegX = centerX + 12;
            rightLegY = feetY;
        } else if (this.animationState === 'walking') {
            // Walking animation
            const stepOffset = Math.sin(this.animationFrame * 4) * 10;
            leftLegX = centerX - 8 + stepOffset;
            leftLegY = feetY;
            rightLegX = centerX + 8 - stepOffset;
            rightLegY = feetY;
        } else if (this.animationState === 'jumping' || !this.isOnGround) {
            // Jumping pose
            leftLegX = centerX - 15;
            leftLegY = bodyBottomY + 15;
            rightLegX = centerX + 15;
            rightLegY = bodyBottomY + 15;
        } else {
            // Default standing position
            leftLegX = centerX - 10;
            leftLegY = feetY;
            rightLegX = centerX + 10;
            rightLegY = feetY;
        }
        
        // Draw legs
        ctx.beginPath();
        ctx.moveTo(centerX - 3, bodyBottomY);
        ctx.lineTo(leftLegX, leftLegY);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(centerX + 3, bodyBottomY);
        ctx.lineTo(rightLegX, rightLegY);
        ctx.stroke();
        
        // Animation effects with stickman style
        if (this.isChargingKi) {
            // Ki aura around stickman
            ctx.strokeStyle = 'rgba(0, 255, 255, 0.6)';
            ctx.lineWidth = 2;
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.arc(centerX, centerY, 25 + i * 8, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
        
        if (this.isChargingKamehameha) {
            // Kamehameha charging aura - intense and growing
            const chargeIntensity = this.kamehamehaChargeTime / 90;
            const sideOffset = this.facingRight ? -20 : 20;
            const handsX = centerX + sideOffset;
            const handsY = bodyTopY + 25;
            
            // Growing energy ball at hands
            ctx.fillStyle = this.isPlayer ? 
                `rgba(0, 150, 255, ${0.3 + chargeIntensity * 0.7})` : 
                `rgba(255, 100, 0, ${0.3 + chargeIntensity * 0.7})`;
            ctx.beginPath();
            ctx.arc(handsX, handsY, 5 + chargeIntensity * 15, 0, Math.PI * 2);
            ctx.fill();
            
            // Inner white core
            ctx.fillStyle = `rgba(255, 255, 255, ${chargeIntensity * 0.8})`;
            ctx.beginPath();
            ctx.arc(handsX, handsY, 2 + chargeIntensity * 8, 0, Math.PI * 2);
            ctx.fill();
            
            // Lightning effects around character
            ctx.strokeStyle = this.isPlayer ? 
                `rgba(0, 200, 255, ${chargeIntensity})` : 
                `rgba(255, 150, 0, ${chargeIntensity})`;
            ctx.lineWidth = 2;
            for (let i = 0; i < 6; i++) {
                const angle = (i * Math.PI) / 3 + this.kamehamehaChargeTime * 0.2;
                const innerRadius = 30;
                const outerRadius = 30 + chargeIntensity * 20;
                ctx.beginPath();
                ctx.moveTo(
                    centerX + Math.cos(angle) * innerRadius,
                    centerY + Math.sin(angle) * innerRadius
                );
                ctx.lineTo(
                    centerX + Math.cos(angle) * outerRadius,
                    centerY + Math.sin(angle) * outerRadius
                );
                ctx.stroke();
            }
            
            // Screen shake effect (visual vibration)
            if (chargeIntensity > 0.7) {
                const shakeX = (Math.random() - 0.5) * 4;
                const shakeY = (Math.random() - 0.5) * 4;
                ctx.translate(shakeX, shakeY);
            }
        }
        
        if (this.isShootingKamehameha) {
            // Kamehameha shooting aura
            const forwardOffset = this.facingRight ? 25 : -25;
            const handsX = centerX + forwardOffset;
            const handsY = bodyTopY + 15;
            
            // Intense energy burst at hands
            ctx.fillStyle = this.isPlayer ? 'rgba(0, 150, 255, 0.8)' : 'rgba(255, 100, 0, 0.8)';
            ctx.beginPath();
            ctx.arc(handsX, handsY, 20, 0, Math.PI * 2);
            ctx.fill();
            
            // White core
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.beginPath();
            ctx.arc(handsX, handsY, 10, 0, Math.PI * 2);
            ctx.fill();
            
            // Recoil effect - character pushed back slightly
            const recoilForce = this.facingRight ? -2 : 2;
            ctx.translate(recoilForce, 0);
        }
        
        if (this.isAttacking || this.isKicking) {
            // Attack effect lines
            ctx.strokeStyle = 'rgba(255, 255, 0, 0.8)';
            ctx.lineWidth = 4;
            const effectX = this.facingRight ? centerX + 20 : centerX - 20;
            
            for (let i = 0; i < 5; i++) {
                ctx.beginPath();
                ctx.moveTo(effectX - 10, centerY - 15 + i * 6);
                ctx.lineTo(effectX + 15, centerY - 15 + i * 6);
                ctx.stroke();
            }
        }
        
        if (this.isSuperAttacking) {
            // Super attack aura
            ctx.strokeStyle = 'rgba(255, 0, 255, 0.8)';
            ctx.lineWidth = 3;
            for (let i = 0; i < 6; i++) {
                const angle = (i * Math.PI) / 3;
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.lineTo(
                    centerX + Math.cos(angle) * 35,
                    centerY + Math.sin(angle) * 35
                );
                ctx.stroke();
            }
        }
        
        if (this.isComboAttacking) {
            // Combo effect spiral
            ctx.strokeStyle = 'rgba(255, 165, 0, 0.7)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            for (let i = 0; i < 20; i++) {
                const angle = i * 0.5;
                const radius = i * 2;
                const x = centerX + Math.cos(angle) * radius;
                const y = centerY + Math.sin(angle) * radius;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
        
        // Combo counter display
        if (this.comboCount > 0) {
            ctx.fillStyle = '#FFD700';
            ctx.strokeStyle = '#000';
            ctx.font = 'bold 16px Arial';
            ctx.lineWidth = 1;
            const comboText = `${this.comboCount}x COMBO!`;
            const textWidth = ctx.measureText(comboText).width;
            const textX = centerX - textWidth / 2;
            const textY = this.y - 30;
            
            // Text outline
            ctx.strokeText(comboText, textX, textY);
            ctx.fillText(comboText, textX, textY);
        }
        
        // Direction indicator (small arrow or facing indicator)
        if (this.animationState === 'walking') {
            ctx.fillStyle = color;
            ctx.beginPath();
            if (this.facingRight) {
                ctx.moveTo(centerX + 20, headY);
                ctx.lineTo(centerX + 25, headY - 3);
                ctx.lineTo(centerX + 25, headY + 3);
            } else {
                ctx.moveTo(centerX - 20, headY);
                ctx.lineTo(centerX - 25, headY - 3);
                ctx.lineTo(centerX - 25, headY + 3);
            }
            ctx.closePath();
            ctx.fill();
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

// Kamehameha class
class Kamehameha {
    constructor(x, y, direction, isPlayerKamehameha) {
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.isPlayerKamehameha = isPlayerKamehameha;
        this.width = 0;
        this.maxWidth = 60;
        this.length = 0;
        this.maxLength = 400;
        this.growing = true;
        this.life = 120; // 2 seconds at 60fps
        this.maxLife = 120;
        this.damage = 50;
        this.hasHit = false;
        
        // Kamehameha particles
        this.particles = [];
        this.coreParticles = [];
    }
    
    update() {
        this.life--;
        
        // Growth phase
        if (this.growing) {
            this.width = Math.min(this.width + 3, this.maxWidth);
            this.length = Math.min(this.length + 15, this.maxLength);
            
            if (this.length >= this.maxLength) {
                this.growing = false;
            }
        }
        
        // Create beam particles
        if (Math.random() < 0.8) {
            for (let i = 0; i < 5; i++) {
                const particleX = this.x + (Math.random() * this.length * this.direction);
                const particleY = this.y + (Math.random() - 0.5) * this.width;
                
                this.particles.push({
                    x: particleX,
                    y: particleY,
                    vx: (Math.random() - 0.5) * 4,
                    vy: (Math.random() - 0.5) * 4,
                    life: 30,
                    maxLife: 30,
                    size: Math.random() * 8 + 2
                });
            }
        }
        
        // Update particles
        this.particles = this.particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life--;
            return p.life > 0;
        });
        
        // Core energy particles
        if (Math.random() < 0.6) {
            this.coreParticles.push({
                x: this.x + Math.random() * this.length * this.direction,
                y: this.y + (Math.random() - 0.5) * (this.width * 0.6),
                life: 20,
                maxLife: 20,
                size: Math.random() * 4 + 2
            });
        }
        
        this.coreParticles = this.coreParticles.filter(p => {
            p.life--;
            return p.life > 0;
        });
        
        // Check collision
        const target = this.isPlayerKamehameha ? enemy : player;
        if (!this.hasHit && this.collision(target)) {
            target.takeDamage(this.damage);
            this.hasHit = true;
            
            // Massive knockback
            const knockbackForce = 15;
            target.velocityX += this.direction * knockbackForce;
            target.velocityY = -8;
            
            // Explosion effect
            for (let i = 0; i < 20; i++) {
                particles.push(new Particle(
                    target.x + target.width / 2,
                    target.y + target.height / 2,
                    'kamehamehaHit'
                ));
            }
        }
        
        return this.life > 0;
    }
    
    collision(target) {
        const beamStartX = this.x;
        const beamEndX = this.x + (this.length * this.direction);
        const beamTopY = this.y - this.width / 2;
        const beamBottomY = this.y + this.width / 2;
        
        // Check if target intersects with beam
        return target.x < Math.max(beamStartX, beamEndX) &&
               target.x + target.width > Math.min(beamStartX, beamEndX) &&
               target.y < beamBottomY &&
               target.y + target.height > beamTopY;
    }
    
    draw() {
        if (this.length <= 0) return;
        
        ctx.save();
        
        const startX = this.x;
        const endX = this.x + (this.length * this.direction);
        const centerY = this.y;
        
        // Main beam gradient
        const gradient = ctx.createLinearGradient(startX, centerY, endX, centerY);
        if (this.isPlayerKamehameha) {
            gradient.addColorStop(0, 'rgba(0, 150, 255, 0.9)');
            gradient.addColorStop(0.3, 'rgba(100, 200, 255, 1)');
            gradient.addColorStop(0.7, 'rgba(150, 220, 255, 1)');
            gradient.addColorStop(1, 'rgba(200, 240, 255, 0.8)');
        } else {
            gradient.addColorStop(0, 'rgba(255, 100, 0, 0.9)');
            gradient.addColorStop(0.3, 'rgba(255, 150, 50, 1)');
            gradient.addColorStop(0.7, 'rgba(255, 200, 100, 1)');
            gradient.addColorStop(1, 'rgba(255, 220, 150, 0.8)');
        }
        
        // Outer glow
        ctx.fillStyle = this.isPlayerKamehameha ? 'rgba(0, 150, 255, 0.3)' : 'rgba(255, 100, 0, 0.3)';
        ctx.fillRect(
            Math.min(startX, endX) - 10,
            centerY - this.width / 2 - 10,
            Math.abs(endX - startX) + 20,
            this.width + 20
        );
        
        // Main beam
        ctx.fillStyle = gradient;
        ctx.fillRect(
            Math.min(startX, endX),
            centerY - this.width / 2,
            Math.abs(endX - startX),
            this.width
        );
        
        // Inner core
        const coreHeight = this.width * 0.4;
        const coreGradient = ctx.createLinearGradient(startX, centerY, endX, centerY);
        if (this.isPlayerKamehameha) {
            coreGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            coreGradient.addColorStop(0.5, 'rgba(200, 240, 255, 1)');
            coreGradient.addColorStop(1, 'rgba(255, 255, 255, 0.9)');
        } else {
            coreGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            coreGradient.addColorStop(0.5, 'rgba(255, 220, 150, 1)');
            coreGradient.addColorStop(1, 'rgba(255, 255, 255, 0.9)');
        }
        
        ctx.fillStyle = coreGradient;
        ctx.fillRect(
            Math.min(startX, endX),
            centerY - coreHeight / 2,
            Math.abs(endX - startX),
            coreHeight
        );
        
        // Draw particles
        ctx.globalAlpha = 0.8;
        this.particles.forEach(p => {
            const alpha = p.life / p.maxLife;
            ctx.globalAlpha = alpha * 0.8;
            ctx.fillStyle = this.isPlayerKamehameha ? '#00AAFF' : '#FF6600';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Draw core particles
        ctx.globalAlpha = 1;
        this.coreParticles.forEach(p => {
            const alpha = p.life / p.maxLife;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        
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
            case 'combo':
                ctx.fillStyle = '#FF8C00';
                break;
            case 'specialCombo':
                ctx.fillStyle = '#8A2BE2';
                break;
            case 'finisher':
                ctx.fillStyle = '#FF1493';
                break;
            case 'kamehamehaHit':
                ctx.fillStyle = '#00FFFF';
                this.size += 0.5; // Expanding explosion
                break;
            case 'kamehamehaCharge':
                ctx.fillStyle = '#FFFFFF';
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
    kamehamehas = [];
    
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
    kamehamehas = [];
    
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
        document.getElementById('playerCombo').textContent = player.comboCount;
        
        // Update enemy stats
        document.getElementById('enemyHealth').textContent = Math.max(0, enemy.health);
        document.getElementById('enemyKi').textContent = Math.floor(enemy.ki);
        document.getElementById('enemyProjectiles').textContent = enemy.projectiles;
        document.getElementById('enemyCombo').textContent = enemy.comboCount;
        
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
    
    // Update Kamehamehas
    kamehamehas = kamehamehas.filter(kamehameha => {
        const alive = kamehameha.update();
        if (alive) kamehameha.draw();
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