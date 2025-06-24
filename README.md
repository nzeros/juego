# 🎮 Gaming Hub - Colección de Juegos Web

Entrar a la web: https://nzeros.github.io/juego/menu.html

¡Bienvenido al **Gaming Hub**! Una colección épica de juegos web desarrollados con HTML5, CSS3 y JavaScript puro. Experimenta nostalgia retro con gráficos modernos y mecánicas de juego avanzadas.

![Gaming Hub](https://img.shields.io/badge/Gaming%20Hub-4%20Juegos-brightgreen)
![HTML5](https://img.shields.io/badge/HTML5-Canvas-orange)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)
![CSS3](https://img.shields.io/badge/CSS3-Responsive-blue)

## 🚀 Juegos Incluidos

### 🐍 **Snake - Clásico Mejorado**
El eterno favorito reinventado con efectos visuales modernos.
- **Estilo**: Retro con efectos neon
- **Características**: Sistema de puntuación, niveles de velocidad
- **Controles**: Flechas direccionales
- **Objetivo**: Come manzanas, crece y evita chocar

### 🧟‍♂️ **Zombie Shooter - Supervivencia**
Acción frenética contra hordas de zombies.
- **Estilo**: Top-down shooter
- **Características**: 4 dificultades, power-ups, estadísticas
- **Controles**: WASD + Mouse, R para recargar
- **Objetivo**: Sobrevive el mayor tiempo posible

### 🏎️ **Carrera Extrema - Racing**
Velocidad pura en carreteras infinitas.
- **Estilo**: Arcade racing
- **Características**: Física realista, múltiples obstáculos
- **Controles**: Flechas direccionales
- **Objetivo**: Evita obstáculos y alcanza la máxima velocidad

### 🥊 **Stickman Fight - Combate Épico** ⭐ *NUEVO*
Sistema de combate avanzado con mecánicas únicas.
- **Estilo**: Fighting game 2D con stickmen
- **Características**: Sistema de 3 rounds, combos, **KAMEHAMEHA**
- **Controles**: JHUIK + WASD
- **Objetivo**: Gana 2 de 3 rounds para la victoria

## ⚡ Características Especiales

### 🥊 Stickman Fight - Sistema de Combate Avanzado

#### 🎯 **Movimientos de Combate**
- **👊 Puñetazos (J)**: Ataques rápidos con 15-20 HP de daño
- **🦵 Patadas (H)**: Ataques de largo alcance con knockback (20-25 HP)
- **🔥 Combos Multi-Hit (U)**: Secuencia de 3 golpes devastadores
- **⚡ Combos Especiales (I)**: Movimientos únicos cuando tienes 3+ combo
- **🌀 Proyectiles de Energía (L)**: Ataques a distancia (20 HP)

#### 🎪 **Sistema de Combos**
```
Contador de Combos: Hasta 5x multiplicador
Tiempo de Combo: 3 segundos para continuar
Secuencias Especiales:
├── Puñetazo → Patada → Puñetazo = "Triple Strike" (50 HP)
├── Patada → Patada → Puñetazo = "Hurricane Kick" (45 HP + knockback masivo)
└── Puñetazo → Puñetazo → Patada = "Power Slam" (55 HP + lanzamiento aéreo)
```

#### ⚡ **KAMEHAMEHA - Súper Ataque Épico**
- **Carga**: 1.5 segundos con efectos visuales intensos
- **Daño**: 50 HP + knockback devastador
- **Efectos**: Rayo láser masivo que cruza toda la pantalla
- **Costo**: Todo el Ki disponible
- **Visuales**: Partículas, gradientes, núcleo brillante

#### 🎨 **Efectos Visuales**
- **Stickmen Auténticos**: Figuras de palitos con animaciones fluidas
- **Partículas Dinámicas**: Explosiones, Ki, combos, daño
- **Auras de Energía**: Efectos circulares durante carga de Ki
- **Contador Visual**: Texto de combo flotante en tiempo real

## 🛠️ Tecnologías Utilizadas

```javascript
Frontend:
├── HTML5 Canvas para renderizado de juegos
├── CSS3 con Flexbox/Grid para layouts responsivos
├── JavaScript ES6+ con clases y módulos
├── Animaciones CSS para transiciones suaves
└── Google Fonts para tipografías modernas

Características Técnicas:
├── 60 FPS de rendimiento estable
├── Sistema de partículas personalizado
├── Física de colisiones optimizada
├── IA enemiga con múltiples dificultades
└── Diseño responsivo para móviles y desktop
```

## 📁 Estructura del Proyecto

```
Gaming-Hub/
├── menu.html              # Página principal del hub
├── style.css              # Estilos globales del menú
├── script.js              # JavaScript del menú principal
├── snake/                 # Juego Snake
│   ├── index.html
│   ├── script.js
│   └── style.css
├── disparos/              # Zombie Shooter
│   ├── index.html
│   ├── script.js
│   └── style.css
├── autos/                 # Carrera Extrema
│   ├── index.html
│   ├── script.js
│   └── style.css
├── pelea/                 # Stickman Fight ⭐
│   ├── index.html         # Interfaz del juego
│   ├── script.js          # Lógica de combate avanzada
│   ├── style.css          # Estilos del fighting game
│   └── README.md          # Documentación específica
└── README.md              # Este archivo
```

## 🚀 Instalación y Uso

### 📋 Requisitos
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- JavaScript habilitado
- Pantalla mínima de 800x600px recomendada

### 🔧 Instalación Local

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/gaming-hub.git

# Navegar al directorio
cd gaming-hub

# Abrir con servidor local (recomendado)
# Opción 1: Python
python -m http.server 8000

# Opción 2: Node.js
npx http-server

# Opción 3: PHP
php -S localhost:8000

# Luego abrir: http://localhost:8000
```

### 🌐 Uso Directo
Simplemente abre `menu.html` en tu navegador para comenzar.

## 🎮 Controles de Juegos

### 🐍 Snake
```
Flechas ← ↑ → ↓  : Direcciones
Espacio          : Pausa
```

### 🧟‍♂️ Zombie Shooter
```
W A S D          : Movimiento
Mouse            : Apuntar y disparar
R                : Recargar munición
Espacio          : Pausa
```

### 🏎️ Carrera Extrema
```
↑                : Acelerar
↓                : Frenar
← →              : Dirección
Espacio          : Pausa
```

### 🥊 Stickman Fight
```
A / D            : Moverse izquierda/derecha
W                : Saltar
J                : Puñetazo básico
H                : Patada con knockback
U                : Combo multi-hit
I                : Combo especial (requiere 3+ combo)
S (mantener)     : Cargar Ki
K                : ¡KAMEHAMEHA! (requiere Ki lleno)
L                : Proyectil de energía
```

## 🏆 Características Destacadas

### 🎨 **Diseño Visual**
- **Tema Cyberpunk**: Colores neon, gradientes, efectos de glassmorphism
- **Animaciones Fluidas**: Transiciones suaves en todas las interfaces
- **Responsive Design**: Adaptable a móviles, tablets y desktop
- **Tipografías Futuristas**: Google Fonts optimizadas

### 🎯 **Mecánicas de Juego**
- **Sistemas de Puntuación**: Leaderboards locales en cada juego
- **Dificultades Múltiples**: 4 niveles en juegos compatibles
- **Efectos de Partículas**: Sistemas personalizados para cada juego
- **IA Avanzada**: Enemigos inteligentes con comportamientos únicos

### ⚡ **Rendimiento**
- **60 FPS**: Optimizado para mantener frame rate estable
- **Gestión de Memoria**: Cleanup automático de objetos no utilizados
- **Carga Rápida**: Assets optimizados y código minificado
- **Compatibilidad**: Funciona en todos los navegadores modernos

## 🎪 Próximas Características

### 🔮 **En Desarrollo**
- [ ] Sistema de logros y trofeos
- [ ] Multijugador local en Stickman Fight
- [ ] Nuevos personajes con habilidades únicas
- [ ] Efectos de sonido y música
- [ ] Sistema de guardado de progreso
- [ ] Modo historia en Stickman Fight
- [ ] Nuevos escenarios de combate
- [ ] Power-ups temporales en todos los juegos

### 🌟 **Ideas Futuras**
- [ ] Modo torneo en Stickman Fight
- [ ] Customización de personajes
- [ ] Integración con redes sociales
- [ ] Versión PWA (Progressive Web App)
- [ ] Soporte para gamepads

## 🐛 Reporte de Bugs

¿Encontraste un bug? ¡Ayúdanos a mejorar!

1. **Abre un Issue** en GitHub
2. **Describe el problema** con detalles
3. **Incluye pasos** para reproducir el bug
4. **Menciona tu navegador** y versión
5. **Adjunta capturas** si es posible

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Para contribuir:

1. **Fork** el repositorio
2. **Crea una rama** para tu feature (`git checkout -b feature/nueva-caracteristica`)
3. **Commit** tus cambios (`git commit -m 'Agregar nueva característica'`)
4. **Push** a la rama (`git push origin feature/nueva-caracteristica`)
5. **Abre un Pull Request**

### 📝 **Guías de Contribución**
- Sigue la convención de nombres existente
- Comenta tu código apropiadamente
- Prueba en múltiples navegadores
- Mantén el rendimiento de 60 FPS
- Documenta nuevas características

## 📄 Licencia

```
MIT License

Copyright (c) 2024 Gaming Hub

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

## 👨‍💻 Créditos

**Desarrollado con ❤️ por:**
- **Game Design**: Mecánicas innovadoras y balanceadas
- **Frontend**: HTML5 Canvas, CSS3, JavaScript ES6+
- **Visual Effects**: Sistema de partículas personalizado
- **Audio**: *Próximamente*

## 🌟 Agradecimientos

- **Inspiración**: Clásicos arcade y fighting games
- **Comunidad**: Feedback y testing de usuarios
- **Open Source**: Librerías y recursos utilizados

## 📊 Estadísticas del Proyecto

```
📈 Métricas del Código:
├── Líneas de JavaScript: ~2,500
├── Líneas de CSS: ~1,800
├── Líneas de HTML: ~400
├── Archivos totales: 15+
├── Clases implementadas: 8+
└── Funciones principales: 50+

🎮 Características del Gaming:
├── Juegos completamente funcionales: 4
├── Sistemas de combate únicos: 1
├── Movimientos especiales: 15+
├── Efectos de partículas: 20+
└── Niveles de dificultad: 16 (4 por juego)
```

---

### 🎯 **¡Comienza a Jugar Ahora!**

```bash
git clone https://github.com/tu-usuario/gaming-hub.git
cd gaming-hub
# Abre menu.html en tu navegador
# ¡Disfruta de la experiencia gaming épica! 🎮
```

**¿Listo para el combate épico con KAMEHAMEHA? 🥊⚡**

---

*Última actualización: Diciembre 2024*
*Versión: 2.0.0 - Stickman Fight Edition* 