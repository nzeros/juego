// Configuración del juego
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gameOverlay = document.getElementById('gameOverlay');
const crosshair = document.getElementById('crosshair');

// Variables del juego
let gameState = 'menu'; // 'menu', 'playing', 'paused', 'gameOver'
let gameSpeed = 16;
let lastTime = 0;
let keys = {};
let mouse = { x: 0, y: 0, clicked: false };

// Estado del jugador
const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: 20,
    speed: 4,
    health: 100,
    maxHealth: 100,
    angle: 0,
    shield: 0,
    maxShield: 50
};

// Estado del juego
const gameStats = {
    score: 0,
    level: 1,
    zombiesKilled: 0,
    shotsFired: 0,
    shotsHit: 0,
    startTime: 0,
    difficulty: 'medium'
};

// Tipos de armas disponibles
const weaponTypes = {
    pistola: {
        name: 'Pistola',
        damage: 25,
        fireRate: 300,
        maxAmmo: 30,
        reloadTime: 2000,
        spread: 0.1,
        color: '#ffff00'
    },
    metralleta: {
        name: 'Metralleta',
        damage: 15,
        fireRate: 100,
        maxAmmo: 50,
        reloadTime: 3000,
        spread: 0.2,
        color: '#ff6600'
    },
    escopeta: {
        name: 'Escopeta',
        damage: 60,
        fireRate: 800,
        maxAmmo: 8,
        reloadTime: 2500,
        spread: 0.4,
        pellets: 5,
        color: '#ff0000'
    }
};

// Arma actual
const weapon = {
    type: 'pistola',
    name: 'Pistola',
    damage: 25,
    fireRate: 300, // ms entre disparos
    ammo: 30,
    maxAmmo: 30,
    reloadTime: 2000,
    lastShot: 0,
    reloading: false,
    spread: 0.1,
    color: '#ffff00',
    pellets: 1
};

// Arrays para entidades del juego
let bullets = [];
let zombies = [];
let particles = [];
let powerUps = [];
let boss = null;
let bossSpawned = false;

// Tipos de zombies
const zombieTypes = {
    basic: { health: 50, speed: 1, size: 15, color: '#4a4a4a', points: 10 },
    fast: { health: 30, speed: 2.5, size: 12, color: '#ff6b6b', points: 20 },
    tank: { health: 120, speed: 0.8, size: 25, color: '#2d5a2d', points: 30 },
    spitter: { health: 40, speed: 1.2, size: 18, color: '#9b59b6', points: 25 },
    boss: { health: 800, speed: 0.7, size: 55, color: '#8b0000', points: 1000 }
};

// Tipos de drops con sus probabilidades
const dropTypes = {
    ammo: { chance: 0.25, icon: 'A', color: '#ffff00', text: '+15 MUNICIÓN' },
    health: { chance: 0.15, icon: 'H', color: '#00ff88', text: '+25 VIDA' },
    metralleta: { chance: 0.08, icon: 'M', color: '#ff6600', text: 'METRALLETA' },
    escopeta: { chance: 0.08, icon: 'E', color: '#ff0000', text: 'ESCOPETA' },
    shield: { chance: 0.12, icon: 'S', color: '#00aaff', text: '+25 ESCUDO' }
};

// Configuración de dificultad
const difficultySettings = {
    easy: { zombieSpawnRate: 2000, maxZombies: 8, speedMultiplier: 0.8 },
    medium: { zombieSpawnRate: 1500, maxZombies: 12, speedMultiplier: 1.0 },
    hard: { zombieSpawnRate: 1000, maxZombies: 18, speedMultiplier: 1.3 },
    nightmare: { zombieSpawnRate: 800, maxZombies: 25, speedMultiplier: 1.5 }
};

// Event Listeners
document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    
    if (e.code === 'KeyR' && !weapon.reloading && weapon.ammo < weapon.maxAmmo) {
        reloadWeapon();
    }
    
    if (e.code === 'Space') {
        e.preventDefault();
    }
    
    if (e.code === 'Enter') {
        e.preventDefault();
        if (gameState === 'playing') {
            pauseGame();
        } else if (gameState === 'paused') {
            resumeGame();
        }
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
    
    // Calcular ángulo del jugador hacia el mouse
    player.angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);
});

canvas.addEventListener('mousedown', (e) => {
    if (gameState === 'playing') {
        mouse.clicked = true;
    }
});

canvas.addEventListener('mouseup', () => {
    mouse.clicked = false;
});

// Actualizar crosshair
document.addEventListener('mousemove', (e) => {
    crosshair.style.left = e.clientX + 'px';
    crosshair.style.top = e.clientY + 'px';
});

// Botones del juego
document.getElementById('startButton').addEventListener('click', startGame);
document.getElementById('restartButton').addEventListener('click', startGame);

// Funciones principales del juego
function startGame() {
    gameStats.difficulty = document.getElementById('difficulty').value;
    
    // Reiniciar estado del juego
    gameStats.score = 0;
    gameStats.level = 1;
    gameStats.zombiesKilled = 0;
    gameStats.shotsFired = 0;
    gameStats.shotsHit = 0;
    gameStats.startTime = Date.now();
    
    // Reiniciar jugador
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
    player.health = player.maxHealth;
    player.shield = 0;
    
    // Reiniciar arma a pistola
    changeWeapon('pistola');
    weapon.reloading = false;
    
    // Limpiar arrays
    bullets = [];
    zombies = [];
    particles = [];
    powerUps = [];
    boss = null;
    bossSpawned = false;
    
    // Cambiar estado
    gameState = 'playing';
    gameOverlay.style.display = 'none';
    
    // Iniciar bucle del juego
    gameLoop();
    
    // Iniciar spawn de zombies
    spawnZombie();
}

function gameLoop(currentTime) {
    if (gameState !== 'playing') return;
    
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;
    
    update(deltaTime);
    render();
    
    requestAnimationFrame(gameLoop);
}

function update(deltaTime) {
    updatePlayer();
    updateBullets();
    updateZombies();
    updateBoss();
    updateParticles();
    updatePowerUps();
    checkCollisions();
    updateGameStats();
    
    // Spawn jefe cada 5 niveles
    if (gameStats.level % 5 === 0 && gameStats.level > 0 && !bossSpawned && !boss) {
        spawnBoss();
        bossSpawned = true;
    }
    
    // Spawn zombies periódicamente (no spawrear si hay jefe)
    const settings = difficultySettings[gameStats.difficulty];
    if (!boss && zombies.length < settings.maxZombies && Math.random() < 0.02) {
        spawnZombie();
    }
    
    // Verificar game over
    if (player.health <= 0) {
        gameOver();
    }
    
    // Aumentar nivel basado en zombies eliminados
    const newLevel = Math.floor(gameStats.zombiesKilled / 10) + 1;
    if (newLevel > gameStats.level) {
        gameStats.level = newLevel;
        bossSpawned = false; // Reset para permitir nuevo jefe
        createParticle(player.x, player.y, '#ffff00', 'NIVEL ' + newLevel, 60);
    }
}

function updatePlayer() {
    let moveX = 0;
    let moveY = 0;
    
    if (keys['KeyW'] || keys['ArrowUp']) moveY -= 1;
    if (keys['KeyS'] || keys['ArrowDown']) moveY += 1;
    if (keys['KeyA'] || keys['ArrowLeft']) moveX -= 1;
    if (keys['KeyD'] || keys['ArrowRight']) moveX += 1;
    
    // Normalizar movimiento diagonal
    if (moveX !== 0 && moveY !== 0) {
        moveX *= 0.707;
        moveY *= 0.707;
    }
    
    // Aplicar movimiento con límites
    player.x = Math.max(player.size, Math.min(canvas.width - player.size, 
        player.x + moveX * player.speed));
    player.y = Math.max(player.size, Math.min(canvas.height - player.size, 
        player.y + moveY * player.speed));
    
    // Disparo continuo con ESPACIO
    if (keys['Space'] && gameState === 'playing') {
        shoot();
    }
}

function shoot() {
    const now = Date.now();
    if (now - weapon.lastShot < weapon.fireRate || weapon.reloading || weapon.ammo <= 0) {
        if (weapon.ammo <= 0 && !weapon.reloading) {
            reloadWeapon();
        }
        return;
    }
    
    weapon.lastShot = now;
    weapon.ammo--;
    gameStats.shotsFired++;
    
    // Crear balas (múltiples para escopeta)
    const bulletsToCreate = weapon.pellets || 1;
    
    for (let i = 0; i < bulletsToCreate; i++) {
        const spread = (Math.random() - 0.5) * weapon.spread;
        const bulletAngle = player.angle + spread;
        
        bullets.push({
            x: player.x + Math.cos(player.angle) * player.size,
            y: player.y + Math.sin(player.angle) * player.size,
            vx: Math.cos(bulletAngle) * 8,
            vy: Math.sin(bulletAngle) * 8,
            life: 100,
            color: weapon.color
        });
    }
    
    // Efecto de disparo
    createMuzzleFlash();
    createParticle(player.x, player.y, weapon.color, null, 10);
}

function reloadWeapon() {
    if (weapon.reloading) return;
    
    weapon.reloading = true;
    createParticle(player.x, player.y, '#00ff88', 'RECARGANDO...', 120);
    
    setTimeout(() => {
        weapon.ammo = weapon.maxAmmo;
        weapon.reloading = false;
    }, weapon.reloadTime);
}

function changeWeapon(weaponType) {
    const newWeapon = weaponTypes[weaponType];
    if (!newWeapon) return;
    
    weapon.type = weaponType;
    weapon.name = newWeapon.name;
    weapon.damage = newWeapon.damage;
    weapon.fireRate = newWeapon.fireRate;
    weapon.maxAmmo = newWeapon.maxAmmo;
    weapon.reloadTime = newWeapon.reloadTime;
    weapon.spread = newWeapon.spread;
    weapon.color = newWeapon.color;
    weapon.pellets = newWeapon.pellets || 1;
    weapon.ammo = weapon.maxAmmo;
    weapon.reloading = false;
    
    // Actualizar UI
    document.getElementById('weaponName').textContent = weapon.name;
    document.getElementById('weaponDamage').textContent = weapon.damage;
    
    let rateText = 'Normal';
    if (weapon.fireRate < 200) rateText = 'Muy Rápida';
    else if (weapon.fireRate < 400) rateText = 'Rápida';
    else if (weapon.fireRate > 600) rateText = 'Lenta';
    
    document.getElementById('weaponRate').textContent = rateText;
}

function spawnZombie() {
    const side = Math.floor(Math.random() * 4);
    let x, y;
    
    switch (side) {
        case 0: x = Math.random() * canvas.width; y = -20; break;
        case 1: x = canvas.width + 20; y = Math.random() * canvas.height; break;
        case 2: x = Math.random() * canvas.width; y = canvas.height + 20; break;
        case 3: x = -20; y = Math.random() * canvas.height; break;
    }
    
    // Seleccionar tipo de zombie basado en nivel (excluir boss)
    const types = Object.keys(zombieTypes).filter(type => type !== 'boss');
    let type = 'basic';
    
    if (gameStats.level >= 3) {
        type = types[Math.floor(Math.random() * types.length)];
    } else if (gameStats.level >= 2 && Math.random() < 0.3) {
        type = 'fast';
    }
    
    const zombieData = zombieTypes[type];
    const settings = difficultySettings[gameStats.difficulty];
    
    zombies.push({
        x: x,
        y: y,
        type: type,
        health: zombieData.health,
        maxHealth: zombieData.health,
        speed: zombieData.speed * settings.speedMultiplier,
        size: zombieData.size,
        color: zombieData.color,
        points: zombieData.points,
        angle: 0,
        lastAttack: 0
    });
}

function spawnBoss() {
    const bossData = zombieTypes.boss;
    const settings = difficultySettings[gameStats.difficulty];
    
    // El jefe se vuelve más fuerte con cada aparición
    const bossLevel = Math.floor(gameStats.level / 5);
    const healthMultiplier = 1 + (bossLevel - 1) * 0.3; // +30% vida por cada jefe
    const sizeMultiplier = 1 + (bossLevel - 1) * 0.1; // +10% tamaño
    
    boss = {
        x: canvas.width / 2,
        y: 50,
        type: 'boss',
        health: bossData.health * settings.speedMultiplier * healthMultiplier,
        maxHealth: bossData.health * settings.speedMultiplier * healthMultiplier,
        speed: bossData.speed * (1 + (bossLevel - 1) * 0.1), // +10% velocidad
        size: bossData.size * sizeMultiplier,
        color: bossData.color,
        points: bossData.points * bossLevel, // Más puntos por jefe más fuerte
        angle: 0,
        lastAttack: 0,
        lastSpecialAttack: 0,
        phase: 1,
        level: bossLevel
    };
    
    createParticle(boss.x, boss.y, '#ff0000', `¡JEFE NIVEL ${bossLevel} APARECE!`, 120);
    
    // Limpiar zombies normales cuando aparece el jefe
    zombies = [];
}

function updateBoss() {
    if (!boss) return;
    
    // Mover hacia el jugador
    const dx = player.x - boss.x;
    const dy = player.y - boss.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 0) {
        boss.angle = Math.atan2(dy, dx);
        boss.x += (dx / distance) * boss.speed;
        boss.y += (dy / distance) * boss.speed;
    }
    
    // Mantener el jefe en pantalla
    boss.x = Math.max(boss.size, Math.min(canvas.width - boss.size, boss.x));
    boss.y = Math.max(boss.size, Math.min(canvas.height - boss.size, boss.y));
    
    // Cambio de fase basado en vida
    const healthPercent = boss.health / boss.maxHealth;
    if (healthPercent < 0.5 && boss.phase === 1) {
        boss.phase = 2;
        boss.speed *= 1.5;
        createParticle(boss.x, boss.y, '#ff0000', '¡JEFE ENFURECIDO!', 60);
    }
    
    // Ataque normal (más fuerte)
    if (distance < boss.size + player.size + 15) {
        const now = Date.now();
        if (now - boss.lastAttack > 600) { // Ataca más frecuentemente
            let damage = boss.phase === 1 ? 25 : 35; // Más daño en fase 2
            boss.lastAttack = now;
            
            // El escudo absorbe daño primero
            if (player.shield > 0) {
                const shieldDamage = Math.min(damage, player.shield);
                player.shield -= shieldDamage;
                damage -= shieldDamage;
                createParticle(player.x, player.y, '#00aaff', '-' + shieldDamage + ' ESCUDO', 30);
            }
            
            // El daño restante va a la vida
            if (damage > 0) {
                player.health -= damage;
                createParticle(player.x, player.y, '#ff0000', '-' + damage, 30);
            }
            
            // Efecto de sacudida más fuerte
            canvas.style.animation = 'screenShake 0.5s';
            setTimeout(() => canvas.style.animation = '', 500);
        }
    }
    
    // Ataque especial: disparar proyectiles (más frecuente y letal)
    const now = Date.now();
    const specialAttackRate = boss.phase === 1 ? 1800 : 1200; // Más rápido en fase 2
    if (now - boss.lastSpecialAttack > specialAttackRate) {
        boss.lastSpecialAttack = now;
        bossSpecialAttack();
    }
}

function bossSpecialAttack() {
    if (!boss) return;
    
    // Número de proyectiles aumenta según la fase
    const projectileCount = boss.phase === 1 ? 10 : 16;
    const projectileSpeed = boss.phase === 1 ? 3.5 : 4.5;
    const projectileDamage = boss.phase === 1 ? 20 : 25;
    
    // Disparar proyectiles en todas las direcciones
    for (let i = 0; i < projectileCount; i++) {
        const angle = (i / projectileCount) * Math.PI * 2;
        bullets.push({
            x: boss.x,
            y: boss.y,
            vx: Math.cos(angle) * projectileSpeed,
            vy: Math.sin(angle) * projectileSpeed,
            life: 150,
            color: '#ff0000',
            isBossProjectile: true,
            damage: projectileDamage
        });
    }
    
    // Ataque dirigido adicional en fase 2
    if (boss.phase === 2) {
        const angleToPlayer = Math.atan2(player.y - boss.y, player.x - boss.x);
        for (let i = 0; i < 3; i++) {
            const spread = (i - 1) * 0.3; // Spread de proyectiles
            bullets.push({
                x: boss.x,
                y: boss.y,
                vx: Math.cos(angleToPlayer + spread) * 5,
                vy: Math.sin(angleToPlayer + spread) * 5,
                life: 180,
                color: '#ff4444',
                isBossProjectile: true,
                damage: 30
            });
        }
        createParticle(boss.x, boss.y, '#ff0000', '¡ATAQUE DIRIGIDO!', 45);
    } else {
        createParticle(boss.x, boss.y, '#ff0000', 'ATAQUE ESPECIAL', 45);
    }
}

function updateBullets() {
    bullets = bullets.filter(bullet => {
        bullet.x += bullet.vx;
        bullet.y += bullet.vy;
        bullet.life--;
        
        return bullet.life > 0 && 
               bullet.x > -10 && bullet.x < canvas.width + 10 &&
               bullet.y > -10 && bullet.y < canvas.height + 10;
    });
}

function updateZombies() {
    zombies.forEach(zombie => {
        // Mover hacia el jugador
        const dx = player.x - zombie.x;
        const dy = player.y - zombie.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            zombie.angle = Math.atan2(dy, dx);
            zombie.x += (dx / distance) * zombie.speed;
            zombie.y += (dy / distance) * zombie.speed;
        }
        
        // Ataque zombie
        if (distance < zombie.size + player.size + 5) {
            const now = Date.now();
            if (now - zombie.lastAttack > 1000) {
                let damage = 10;
                zombie.lastAttack = now;
                
                // El escudo absorbe daño primero
                if (player.shield > 0) {
                    const shieldDamage = Math.min(damage, player.shield);
                    player.shield -= shieldDamage;
                    damage -= shieldDamage;
                    createParticle(player.x, player.y, '#00aaff', '-' + shieldDamage + ' ESCUDO', 30);
                }
                
                // El daño restante va a la vida
                if (damage > 0) {
                    player.health -= damage;
                    createParticle(player.x, player.y, '#ff0000', '-' + damage, 30);
                }
                
                // Efecto de sacudida
                canvas.style.animation = 'screenShake 0.2s';
                setTimeout(() => canvas.style.animation = '', 200);
            }
        }
    });
}

function updateParticles() {
    particles = particles.filter(particle => {
        particle.life--;
        particle.y -= particle.vy;
        particle.alpha = particle.life / particle.maxLife;
        return particle.life > 0;
    });
}

function updatePowerUps() {
    powerUps = powerUps.filter(powerUp => {
        powerUp.life--;
        powerUp.angle += 0.1;
        return powerUp.life > 0;
    });
}

function checkCollisions() {
    // Balas vs Zombies
    bullets.forEach((bullet, bulletIndex) => {
        // Saltar si es proyectil del jefe
        if (bullet.isBossProjectile) return;
        
        zombies.forEach((zombie, zombieIndex) => {
            const dx = bullet.x - zombie.x;
            const dy = bullet.y - zombie.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < zombie.size) {
                // Eliminar bala
                bullets.splice(bulletIndex, 1);
                
                // Dañar zombie
                zombie.health -= weapon.damage;
                gameStats.shotsHit++;
                
                // Efectos visuales
                createParticle(zombie.x, zombie.y, '#ff0000', '-' + weapon.damage, 30);
                createBloodEffect(zombie.x, zombie.y);
                
                if (zombie.health <= 0) {
                    // Zombie eliminado
                    gameStats.score += zombie.points;
                    gameStats.zombiesKilled++;
                    
                    createParticle(zombie.x, zombie.y, '#00ff88', '+' + zombie.points, 45);
                    createExplosion(zombie.x, zombie.y);
                    
                    zombies.splice(zombieIndex, 1);
                    
                    // Sistema de drops mejorado
                    const dropRoll = Math.random();
                    let currentChance = 0;
                    
                    for (const [dropType, dropData] of Object.entries(dropTypes)) {
                        currentChance += dropData.chance;
                        if (dropRoll < currentChance) {
                            spawnPowerUp(zombie.x, zombie.y, dropType);
                            break;
                        }
                    }
                }
            }
        });
        
        // Balas vs Jefe
        if (boss && !bullet.isBossProjectile) {
            const dx = bullet.x - boss.x;
            const dy = bullet.y - boss.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < boss.size) {
                // Eliminar bala
                bullets.splice(bulletIndex, 1);
                
                // Dañar jefe
                boss.health -= weapon.damage;
                gameStats.shotsHit++;
                
                // Efectos visuales
                createParticle(boss.x, boss.y, '#ff0000', '-' + weapon.damage, 30);
                createBloodEffect(boss.x, boss.y);
                
                if (boss.health <= 0) {
                    // Jefe eliminado
                    gameStats.score += boss.points;
                    gameStats.zombiesKilled++;
                    
                    createParticle(boss.x, boss.y, '#00ff88', '+' + boss.points, 60);
                    createExplosion(boss.x, boss.y);
                    
                    // Drops especiales del jefe
                    spawnPowerUp(boss.x - 20, boss.y, 'health');
                    spawnPowerUp(boss.x + 20, boss.y, 'ammo');
                    spawnPowerUp(boss.x, boss.y - 20, 'shield');
                    
                    boss = null;
                    createParticle(canvas.width / 2, canvas.height / 2, '#ffff00', '¡JEFE DERROTADO!', 120);
                }
            }
        }
    });
    
    // Proyectiles del jefe vs Jugador
    bullets.forEach((bullet, bulletIndex) => {
        if (!bullet.isBossProjectile) return;
        
        const dx = bullet.x - player.x;
        const dy = bullet.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < player.size) {
            bullets.splice(bulletIndex, 1);
            
            let damage = bullet.damage || 20;
            
            // El escudo absorbe daño primero
            if (player.shield > 0) {
                const shieldDamage = Math.min(damage, player.shield);
                player.shield -= shieldDamage;
                damage -= shieldDamage;
                createParticle(player.x, player.y, '#00aaff', '-' + shieldDamage + ' ESCUDO', 30);
            }
            
            // El daño restante va a la vida
            if (damage > 0) {
                player.health -= damage;
                createParticle(player.x, player.y, '#ff0000', '-' + damage, 30);
            }
        }
    });
    
    // Jugador vs PowerUps
    powerUps.forEach((powerUp, index) => {
        const dx = player.x - powerUp.x;
        const dy = player.y - powerUp.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < player.size + powerUp.size) {
            applyPowerUp(powerUp.type);
            powerUps.splice(index, 1);
        }
    });
}

function spawnPowerUp(x, y, type) {
    const dropData = dropTypes[type];
    if (!dropData) return;
    
    powerUps.push({
        x: x,
        y: y,
        type: type,
        size: 15,
        angle: 0,
        life: 300, // 5 segundos a 60fps
        maxLife: 300,
        icon: dropData.icon,
        color: dropData.color,
        text: dropData.text
    });
}

function applyPowerUp(type) {
    const dropData = dropTypes[type];
    if (!dropData) return;
    
    switch (type) {
        case 'ammo':
            weapon.ammo = Math.min(weapon.maxAmmo, weapon.ammo + 15);
            createParticle(player.x, player.y, dropData.color, dropData.text, 45);
            break;
        case 'health':
            player.health = Math.min(player.maxHealth, player.health + 25);
            createParticle(player.x, player.y, dropData.color, dropData.text, 45);
            break;
        case 'metralleta':
            changeWeapon('metralleta');
            createParticle(player.x, player.y, dropData.color, dropData.text, 60);
            break;
        case 'escopeta':
            changeWeapon('escopeta');
            createParticle(player.x, player.y, dropData.color, dropData.text, 60);
            break;
        case 'shield':
            player.shield = Math.min(player.maxShield, player.shield + 25);
            createParticle(player.x, player.y, dropData.color, dropData.text, 45);
            break;
    }
}

function createParticle(x, y, color, text = null, life = 30) {
    particles.push({
        x: x,
        y: y,
        vy: 1,
        color: color,
        text: text,
        life: life,
        maxLife: life,
        alpha: 1
    });
}

function createMuzzleFlash() {
    const flashX = player.x + Math.cos(player.angle) * player.size;
    const flashY = player.y + Math.sin(player.angle) * player.size;
    
    for (let i = 0; i < 3; i++) {
        createParticle(
            flashX + (Math.random() - 0.5) * 10,
            flashY + (Math.random() - 0.5) * 10,
            '#ffff00',
            null,
            5
        );
    }
}

function createBloodEffect(x, y) {
    for (let i = 0; i < 5; i++) {
        particles.push({
            x: x + (Math.random() - 0.5) * 20,
            y: y + (Math.random() - 0.5) * 20,
            vy: Math.random() * 2,
            color: '#ff0000',
            life: 20,
            maxLife: 20,
            alpha: 1
        });
    }
}

function createExplosion(x, y) {
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        particles.push({
            x: x + Math.cos(angle) * 10,
            y: y + Math.sin(angle) * 10,
            vy: 2,
            color: '#ff6600',
            life: 25,
            maxLife: 25,
            alpha: 1
        });
    }
}

function updateGameStats() {
    document.getElementById('score').textContent = gameStats.score;
    document.getElementById('level').textContent = gameStats.level;
    document.getElementById('health').textContent = Math.max(0, player.health);
    document.getElementById('shield').textContent = Math.max(0, player.shield);
    document.getElementById('ammo').textContent = weapon.ammo;
    document.getElementById('zombiesKilled').textContent = gameStats.zombiesKilled;
    
    // Barra de vida
    const healthPercent = (player.health / player.maxHealth) * 100;
    document.getElementById('healthBar').style.width = healthPercent + '%';
}

function render() {
    // Limpiar canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar fondo con patrón
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
    
    // Dibujar balas
    bullets.forEach(bullet => {
        ctx.fillStyle = bullet.color || '#ffff00';
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Estela de la bala
        const bulletColor = bullet.color || '#ffff00';
        const rgb = bulletColor === '#ffff00' ? '255, 255, 0' : 
                   bulletColor === '#ff6600' ? '255, 102, 0' : 
                   bulletColor === '#ff0000' ? '255, 0, 0' : '255, 255, 0';
        ctx.strokeStyle = `rgba(${rgb}, 0.5)`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(bullet.x, bullet.y);
        ctx.lineTo(bullet.x - bullet.vx * 3, bullet.y - bullet.vy * 3);
        ctx.stroke();
    });
    
    // Dibujar zombies
    zombies.forEach(zombie => {
        ctx.save();
        ctx.translate(zombie.x, zombie.y);
        ctx.rotate(zombie.angle);
        
        // Sombra
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.arc(3, 3, zombie.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Cuerpo zombie (diferente según tipo)
        if (zombie.type === 'basic') {
            // Zombie básico - círculo con detalles
            ctx.fillStyle = zombie.color;
            ctx.beginPath();
            ctx.arc(0, 0, zombie.size, 0, Math.PI * 2);
            ctx.fill();
            
            // Ropa rasgada
            ctx.fillStyle = '#333';
            ctx.fillRect(-zombie.size/2, -2, zombie.size, 4);
            ctx.fillRect(-2, -zombie.size/2, 4, zombie.size);
            
        } else if (zombie.type === 'fast') {
            // Zombie rápido - más delgado y agresivo
            ctx.fillStyle = zombie.color;
            ctx.beginPath();
            ctx.ellipse(0, 0, zombie.size * 0.8, zombie.size, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Marcas de garras
            ctx.strokeStyle = '#darkred';
            ctx.lineWidth = 2;
            for (let i = 0; i < 3; i++) {
                ctx.beginPath();
                ctx.moveTo(-zombie.size/2, -zombie.size/2 + i * 4);
                ctx.lineTo(zombie.size/2, -zombie.size/2 + i * 4);
                ctx.stroke();
            }
            
        } else if (zombie.type === 'tank') {
            // Zombie tanque - más grande y robusto
            ctx.fillStyle = zombie.color;
            ctx.fillRect(-zombie.size, -zombie.size, zombie.size * 2, zombie.size * 2);
            
            // Armadura
            ctx.fillStyle = '#555';
            ctx.fillRect(-zombie.size * 0.8, -zombie.size * 0.8, zombie.size * 1.6, zombie.size * 0.4);
            ctx.fillRect(-zombie.size * 0.8, zombie.size * 0.4, zombie.size * 1.6, zombie.size * 0.4);
            
        } else if (zombie.type === 'spitter') {
            // Zombie escupidor - forma única
            ctx.fillStyle = zombie.color;
            ctx.beginPath();
            ctx.arc(0, 0, zombie.size, 0, Math.PI * 2);
            ctx.fill();
            
            // Boca grande
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(zombie.size/2, 0, zombie.size/3, 0, Math.PI * 2);
            ctx.fill();
            
            // Tentáculos tóxicos
            ctx.strokeStyle = '#9b59b6';
            ctx.lineWidth = 3;
            for (let i = 0; i < 4; i++) {
                const angle = (i / 4) * Math.PI * 2;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(Math.cos(angle) * zombie.size * 1.2, Math.sin(angle) * zombie.size * 1.2);
                ctx.stroke();
            }
        }
        
        // Ojos brillantes (todos los tipos)
        ctx.fillStyle = '#ff0000';
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 5;
        ctx.beginPath();
        ctx.arc(-zombie.size/3, -zombie.size/3, 3, 0, Math.PI * 2);
        ctx.arc(zombie.size/3, -zombie.size/3, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        ctx.restore();
        
        // Barra de vida zombie
        if (zombie.health < zombie.maxHealth) {
            const barWidth = zombie.size * 2;
            const barHeight = 4;
            const barX = zombie.x - barWidth / 2;
            const barY = zombie.y - zombie.size - 10;
            
            ctx.fillStyle = '#333';
            ctx.fillRect(barX, barY, barWidth, barHeight);
            
            ctx.fillStyle = '#ff0000';
            const healthPercent = zombie.health / zombie.maxHealth;
            ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
            
            // Borde de la barra
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1;
            ctx.strokeRect(barX, barY, barWidth, barHeight);
        }
    });
    
    // Dibujar Jefe
    if (boss) {
        ctx.save();
        ctx.translate(boss.x, boss.y);
        
        // Aura del jefe
        const pulseSize = boss.size + Math.sin(Date.now() * 0.01) * 10;
        ctx.fillStyle = 'rgba(139, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(0, 0, pulseSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Sombra del jefe
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.beginPath();
        ctx.arc(5, 5, boss.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Cuerpo del jefe - forma más compleja
        ctx.fillStyle = boss.color;
        ctx.beginPath();
        ctx.arc(0, 0, boss.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Armadura del jefe
        ctx.fillStyle = '#666';
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const x = Math.cos(angle) * boss.size * 0.7;
            const y = Math.sin(angle) * boss.size * 0.7;
            ctx.fillRect(x - 3, y - 3, 6, 6);
        }
        
        // Ojos del jefe (más grandes y amenazantes)
        ctx.fillStyle = '#ff0000';
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(-boss.size/3, -boss.size/3, 6, 0, Math.PI * 2);
        ctx.arc(boss.size/3, -boss.size/3, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Corona del jefe
        ctx.fillStyle = '#ffd700';
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
            const x = Math.cos(angle) * boss.size * 0.9;
            const y = Math.sin(angle) * boss.size * 0.9;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + Math.cos(angle) * 8, y + Math.sin(angle) * 8);
            ctx.lineWidth = 4;
            ctx.stroke();
        }
        
        ctx.restore();
        
        // Barra de vida del jefe (más grande y detallada)
        const barWidth = boss.size * 3;
        const barHeight = 8;
        const barX = boss.x - barWidth / 2;
        const barY = boss.y - boss.size - 20;
        
        // Fondo de la barra
        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Vida del jefe
        const healthPercent = boss.health / boss.maxHealth;
        const gradient = ctx.createLinearGradient(barX, barY, barX + barWidth, barY);
        gradient.addColorStop(0, '#ff0000');
        gradient.addColorStop(0.5, '#ff6600');
        gradient.addColorStop(1, '#ffff00');
        ctx.fillStyle = gradient;
        ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
        
        // Borde brillante de la barra
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
        
        // Texto del jefe
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Orbitron';
        ctx.textAlign = 'center';
        ctx.fillText(`JEFE LVL${boss.level} - FASE ${boss.phase}`, boss.x, barY - 5);
    }
    
    // Dibujar PowerUps
    powerUps.forEach(powerUp => {
        ctx.save();
        ctx.translate(powerUp.x, powerUp.y);
        ctx.rotate(powerUp.angle);
        
        // Efecto de pulso basado en tiempo restante
        const pulseScale = 1 + Math.sin(Date.now() * 0.01) * 0.1;
        const opacity = Math.min(1, powerUp.life / 60); // Fade en los últimos segundos
        
        ctx.globalAlpha = opacity;
        ctx.scale(pulseScale, pulseScale);
        
        // Fondo del item
        ctx.fillStyle = powerUp.color || '#ffff00';
        ctx.fillRect(-powerUp.size/2, -powerUp.size/2, powerUp.size, powerUp.size);
        
        // Borde brillante
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(-powerUp.size/2, -powerUp.size/2, powerUp.size, powerUp.size);
        
        // Icono del item
        ctx.fillStyle = '#000';
        ctx.font = 'bold 14px Orbitron';
        ctx.textAlign = 'center';
        ctx.fillText(powerUp.icon || '?', 0, 5);
        
        ctx.restore();
        
        // Mostrar nombre del item encima
        if (powerUp.life > 240) { // Solo durante los primeros segundos
            ctx.fillStyle = powerUp.color || '#ffff00';
            ctx.font = 'bold 10px Orbitron';
            ctx.textAlign = 'center';
            ctx.fillText(powerUp.text || '', powerUp.x, powerUp.y - 25);
        }
    });
    
    // Dibujar jugador
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle);
    
    // Escudo (si está activo)
    if (player.shield > 0) {
        ctx.strokeStyle = '#00aaff';
        ctx.lineWidth = 3;
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.arc(0, 0, player.size + 8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
    }
    
    // Sombra jugador
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(2, 2, player.size, 0, Math.PI * 2);
    ctx.fill();
    
    // Cuerpo jugador
    ctx.fillStyle = '#00ff88';
    ctx.beginPath();
    ctx.arc(0, 0, player.size, 0, Math.PI * 2);
    ctx.fill();
    
    // Arma (color según tipo)
    ctx.fillStyle = weapon.color;
    if (weapon.type === 'metralleta') {
        ctx.fillRect(player.size - 3, -4, 18, 8);
        ctx.fillRect(player.size + 12, -2, 3, 4);
    } else if (weapon.type === 'escopeta') {
        ctx.fillRect(player.size - 5, -3, 20, 6);
        ctx.fillRect(player.size + 10, -1, 5, 2);
    } else {
        ctx.fillRect(player.size - 5, -3, 15, 6);
    }
    
    // Dirección
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(player.size + 10, 0);
    ctx.stroke();
    
    ctx.restore();
    
    // Dibujar partículas
    particles.forEach(particle => {
        ctx.globalAlpha = particle.alpha;
        
        if (particle.text) {
            ctx.fillStyle = particle.color;
            ctx.font = 'bold 14px Orbitron';
            ctx.textAlign = 'center';
            ctx.fillText(particle.text, particle.x, particle.y);
        } else {
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    });
    
    ctx.globalAlpha = 1;
    
    // Efectos de recarga
    if (weapon.reloading) {
        ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // Efectos de vida baja
    if (player.health < 30) {
        ctx.fillStyle = `rgba(255, 0, 0, ${0.3 * (1 - player.health / 30)})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

function pauseGame() {
    gameState = 'paused';
    document.getElementById('overlayTitle').textContent = '⏸️ JUEGO PAUSADO';
    document.getElementById('overlayMessage').textContent = 'Presiona ENTER para continuar';
    document.getElementById('startButton').style.display = 'none';
    document.getElementById('restartButton').style.display = 'inline-block';
    document.getElementById('restartButton').textContent = 'Continuar';
    gameOverlay.style.display = 'flex';
}

function resumeGame() {
    gameState = 'playing';
    gameOverlay.style.display = 'none';
    requestAnimationFrame(gameLoop);
}

function gameOver() {
    gameState = 'gameOver';
    
    const survivalTime = Math.floor((Date.now() - gameStats.startTime) / 1000);
    const accuracy = gameStats.shotsFired > 0 ? 
        Math.floor((gameStats.shotsHit / gameStats.shotsFired) * 100) : 0;
    
    document.getElementById('overlayTitle').textContent = '💀 GAME OVER';
    document.getElementById('overlayMessage').textContent = 
        '¡Los zombies te han derrotado! Pero luchaste valientemente.';
    
    // Mostrar estadísticas finales
    document.getElementById('finalStats').style.display = 'block';
    document.getElementById('finalZombies').textContent = gameStats.zombiesKilled;
    document.getElementById('survivalTime').textContent = survivalTime;
    document.getElementById('accuracy').textContent = accuracy;
    
    document.getElementById('startButton').style.display = 'none';
    document.getElementById('restartButton').style.display = 'inline-block';
    document.getElementById('restartButton').textContent = 'Intentar de Nuevo';
    
    gameOverlay.style.display = 'flex';
}

// Inicializar el juego
function init() {
    updateGameStats();
    
    // Efecto de entrada
    document.getElementById('overlayTitle').textContent = '🧟‍♂️ ¡APOCALIPSIS ZOMBIE!';
    document.getElementById('overlayMessage').textContent = 
        'Los muertos han regresado... ¡Es hora de sobrevivir! Usa WASD para moverte, ESPACIO para disparar y ENTER para pausar. ¡Cada 5 niveles aparece un jefe!';
}

// Comenzar cuando se carga la página
init(); 