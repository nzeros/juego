// Gaming Hub Interactive Effects
document.addEventListener('DOMContentLoaded', function() {
    
    // Add hover sound effects (using Web Audio API for retro gaming sounds)
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create hover sound effect
    function createHoverSound() {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    }
    
    // Create click sound effect
    function createClickSound() {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.2);
        
        gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    }
    
    // Game card interactions
    const gameCards = document.querySelectorAll('.game-card');
    
    gameCards.forEach(card => {
        const cardInner = card.querySelector('.card-inner');
        
        // Mouse enter effect
        card.addEventListener('mouseenter', function() {
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }
            createHoverSound();
            
            // Add glitch effect
            card.style.animation = 'glitch 0.3s ease-out';
            setTimeout(() => {
                card.style.animation = '';
            }, 300);
        });
        
        // Mouse move parallax effect
        card.addEventListener('mousemove', function(e) {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            cardInner.style.transform = `rotateY(${rotateY}deg) rotateX(${rotateX}deg) scale(1.05)`;
        });
        
        // Mouse leave effect
        card.addEventListener('mouseleave', function() {
            cardInner.style.transform = '';
        });
        
        // Click effect
        card.addEventListener('click', function() {
            createClickSound();
            
            // Screen flash effect
            document.body.style.background = '#00ff88';
            setTimeout(() => {
                document.body.style.background = '';
            }, 100);
        });
    });
    
    // Typing effect for the title
    const title = document.querySelector('.main-title');
    const originalText = title.textContent;
    title.textContent = '';
    
    let charIndex = 0;
    const typingSpeed = 100;
    
    function typeTitle() {
        if (charIndex < originalText.length) {
            title.textContent += originalText.charAt(charIndex);
            charIndex++;
            setTimeout(typeTitle, typingSpeed);
        }
    }
    
    // Start typing effect after a short delay
    setTimeout(typeTitle, 500);
    
    // Random matrix-style background updates
    function createMatrixDigit() {
        const digit = document.createElement('div');
        digit.textContent = Math.random() > 0.5 ? '1' : '0';
        digit.style.position = 'fixed';
        digit.style.left = Math.random() * window.innerWidth + 'px';
        digit.style.top = '-20px';
        digit.style.color = 'rgba(0, 255, 136, 0.3)';
        digit.style.fontSize = '14px';
        digit.style.fontFamily = 'monospace';
        digit.style.pointerEvents = 'none';
        digit.style.zIndex = '-1';
        digit.style.animation = 'fall 8s linear forwards';
        
        document.body.appendChild(digit);
        
        // Remove digit after animation
        setTimeout(() => {
            digit.remove();
        }, 8000);
    }
    
    // Add CSS animation for falling digits
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fall {
            to {
                transform: translateY(calc(100vh + 20px));
                opacity: 0;
            }
        }
        
        @keyframes glitch {
            0%, 100% { transform: translateX(0); }
            20% { transform: translateX(-2px); }
            40% { transform: translateX(2px); }
            60% { transform: translateX(-1px); }
            80% { transform: translateX(1px); }
        }
    `;
    document.head.appendChild(style);
    
    // Create falling matrix digits periodically
    setInterval(createMatrixDigit, 500);
    
    // Konami Code Easter Egg
    const konamiCode = [
        'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
        'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
        'KeyB', 'KeyA'
    ];
    let konamiIndex = 0;
    
    document.addEventListener('keydown', function(e) {
        if (e.code === konamiCode[konamiIndex]) {
            konamiIndex++;
            if (konamiIndex === konamiCode.length) {
                // Easter egg activated!
                document.body.style.animation = 'rainbow 2s ease-in-out infinite';
                setTimeout(() => {
                    document.body.style.animation = '';
                    konamiIndex = 0;
                }, 10000);
            }
        } else {
            konamiIndex = 0;
        }
    });
    
    // Add rainbow animation
    const rainbowStyle = document.createElement('style');
    rainbowStyle.textContent = `
        @keyframes rainbow {
            0% { filter: hue-rotate(0deg); }
            100% { filter: hue-rotate(360deg); }
        }
    `;
    document.head.appendChild(rainbowStyle);
    
    // Performance stats counter (fake but fun)
    const statValues = document.querySelectorAll('.stat-value');
    
    function animateStats() {
        statValues.forEach((stat, index) => {
            if (index === 0) { // Games count
                let count = 0;
                const target = 3;
                const increment = () => {
                    if (count < target) {
                        count++;
                        stat.textContent = count;
                        setTimeout(increment, 500);
                    }
                };
                increment();
            }
            // The infinity symbol stays as is
        });
    }
    
    // Start stats animation after title typing is done
    setTimeout(animateStats, originalText.length * typingSpeed + 1000);
});

// Service Worker for offline gaming experience (basic)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js').then(function(registration) {
            console.log('SW registered: ', registration);
        }, function(registrationError) {
            console.log('SW registration failed: ', registrationError);
        });
    });
} 