# 🥊 Stickman Fight - Versión Mejorada 2.0

## 🚀 Nuevas Características Implementadas

### ⚔️ Sistema de 3 Rounds
- **Combate épico**: Ahora el juego utiliza un sistema de "mejor de 3 rounds"
- **Marcador en tiempo real**: El primero en ganar 2 rounds gana el combate
- **Pantalla entre rounds**: Muestra el resultado de cada round y el marcador actual
- **Victoria definitiva**: Mensajes personalizados para victoria y derrota

### 🔮 Proyectiles de Energía
- **Nueva mecánica de combate**: Presiona `L` para lanzar proyectiles de energía
- **Sistema de munición**: Cada personaje tiene 5 proyectiles que se regeneran automáticamente
- **Efectos visuales**: Proyectiles con aura brillante y efectos de partículas
- **IA inteligente**: Los enemigos también pueden usar proyectiles estratégicamente
- **Cooldown balanceado**: Sistema de enfriamiento para evitar spam

### 🎨 Interfaz Mejorada
- **UI completamente rediseñada**: Paneles con transparencias y efectos de sombra
- **Barras de estado con gradientes**: Vida y Ki con efectos visuales mejorados
- **Información completa**: Contador de proyectiles y estadísticas en tiempo real
- **Indicador de rounds**: Panel central que muestra el progreso del combate
- **Controles visibles**: Instrucciones siempre visibles en pantalla

### 🌟 Efectos Visuales Avanzados
- **Fondo estrellado**: Ambiente espacial dinámico
- **Gradientes en todo**: Fondos, barras y efectos con gradientes profesionales
- **Auras de Ki mejoradas**: Efectos pulsantes y brillantes durante la carga
- **Proyectiles brillantes**: Esferas de energía con efectos de rastro
- **Animaciones suaves**: Transiciones fluidas entre estados

### 🎮 Mecánicas de Juego Avanzadas
- **IA enemiga mejorada**: Los enemigos usan proyectiles y estrategias más inteligentes
- **Sistema de cooldown**: Evita el abuso de proyectiles
- **Regeneración automática**: Los proyectiles se recargan lentamente
- **Balanceo mejorado**: Daño y mecánicas balanceadas para un combate justo

## 🎮 Controles del Juego

| Tecla | Acción |
|-------|--------|
| `A/D` | Moverse izquierda/derecha |
| `W` | Saltar |
| `J` | Ataque básico |
| `S` | Mantener para cargar Ki |
| `K` | Súper ataque (requiere Ki lleno) |
| `L` | **NUEVO**: Lanzar proyectil de energía |
| `Enter` | Seleccionar en menús / Continuar |
| `↑/↓` | Navegar en menús |

## 🏆 Objetivo del Juego

1. **Ganar 2 de 3 rounds** para la victoria total
2. Cada round termina cuando un luchador pierde toda su vida
3. Usa una **combinación estratégica** de:
   - Ataques básicos (J)
   - Súper ataques (K) 
   - Proyectiles de energía (L)
   - Saltos evasivos (W)

## 💡 Estrategias y Consejos

### Para Principiantes
- **Mantén la distancia**: Usa proyectiles para atacar desde lejos
- **Carga Ki frecuentemente**: Los súper ataques son devastadores
- **Salta para esquivar**: Evita ataques enemigos saltando en el momento preciso
- **Gestiona tu munición**: Los proyectiles se regeneran lentamente

### Para Jugadores Avanzados
- **Combos de ataque**: Combina ataques básicos con proyectiles
- **Timing perfecto**: Carga Ki cuando el enemigo esté lejos
- **Control del espacio**: Usa la línea central del ring estratégicamente
- **Lectura de IA**: Aprende los patrones de ataque enemigos

## 🛠️ Instalación y Ejecución

### Requisitos
- Java 8 o superior
- Un IDE como Eclipse, IntelliJ IDEA, o VSCode

### Pasos de Instalación
1. **Descargar archivos**: Clona o descarga todos los archivos `.java`
2. **Compilar**: 
   ```bash
   javac *.java
   ```
3. **Ejecutar**:
   ```bash
   java JuegoPeleaMejorado
   ```

### Usando un IDE
1. Crea un nuevo proyecto Java
2. Copia todos los archivos `.java` al src del proyecto
3. Ejecuta la clase `JuegoPeleaMejorado`

## 📁 Estructura de Archivos

```
pelea/
├── PanelJuego.java          # Lógica principal del juego (MEJORADO)
├── JuegoPeleaMejorado.java  # Clase principal para ejecutar
├── Jugador.java             # Clase del jugador (CON PROYECTILES)
├── Enemigo.java             # Clase del enemigo (IA MEJORADA)
├── Personaje.java           # Clase base para personajes
├── Proyectil.java           # NUEVA: Clase para proyectiles de energía
├── index.html               # NUEVO: Página web del juego
└── README.md                # Esta documentación
```

## 🎯 Dificultades Disponibles

| Dificultad | Vida Enemigo | Daño | Velocidad | Agresividad | Combos |
|------------|--------------|------|-----------|-------------|--------|
| **Fácil** | 100 HP | 10 | 3 | 40% | 0% |
| **Medio** | 120 HP | 15 | 4 | 60% | 10% |
| **Difícil** | 150 HP | 20 | 6 | 80% | 30% |
| **Pesadilla** | 200 HP | 25 | 7 | 95% | 50% |

## 🐛 Solución de Problemas

### Error de Compilación
- Asegúrate de que todos los archivos `.java` estén en la misma carpeta
- Verifica que tengas Java correctamente instalado
- Compila todos los archivos a la vez: `javac *.java`

### El juego no inicia
- Verifica que ejecutes `java JuegoPeleaMejorado` (sin .java)
- Asegúrate de estar en la carpeta correcta
- Revisa que no haya errores de compilación

### Problemas de rendimiento
- El juego está optimizado para 60 FPS
- Si hay lag, cierra otras aplicaciones
- Asegúrate de tener suficiente memoria disponible

## 🎨 Características Técnicas

### Nuevas Clases y Métodos
- **Clase Proyectil**: Sistema completo de proyectiles con efectos
- **Sistema de Rounds**: Lógica para manejar múltiples rounds
- **UI Mejorada**: Métodos de dibujo con gradientes y efectos
- **IA Avanzada**: Enemigos que usan proyectiles estratégicamente

### Optimizaciones
- **Gestión de memoria**: Los proyectiles se eliminan automáticamente
- **Renderizado eficiente**: Uso de Graphics2D con antialiasing
- **Cooldowns balanceados**: Evita sobrecarga del sistema
- **Animaciones suaves**: 60 FPS estables

## 🔄 Versiones

### Versión 1.0 (Original)
- Combate básico entre stickmen
- Sistema de Ki y súper ataques
- 4 niveles de dificultad

### Versión 2.0 (Actual - MEJORADA)
- ✅ Sistema de 3 rounds
- ✅ Proyectiles de energía
- ✅ Interfaz completamente renovada
- ✅ Efectos visuales avanzados
- ✅ IA enemiga mejorada
- ✅ Página web de presentación

## 🤝 Contribuciones

¿Quieres mejorar el juego? ¡Excelente! Aquí hay algunas ideas:

### Ideas para Futuras Mejoras
- 🏅 Sistema de logros
- 🎵 Efectos de sonido y música
- 🌍 Diferentes escenarios de combate
- 🥋 Nuevos personajes con habilidades únicas
- 🎮 Modo multijugador local
- 💾 Sistema de guardado de estadísticas

### Como Contribuir
1. Haz un fork del proyecto
2. Crea una rama para tu mejora
3. Implementa tu característica
4. Prueba thoroughly
5. Envía un pull request

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la Licencia MIT. Siéntete libre de modificar, distribuir y usar el código como desees.

## 👨‍💻 Créditos

- **Desarrollo Original**: Juego base de Stickman Fight
- **Mejoras v2.0**: Sistema de rounds, proyectiles, UI mejorada
- **Inspiración**: Clásicos juegos de pelea 2D

---

**¡Disfruta del combate épico con las nuevas mejoras! 🥊⚡🔮**

Para más información o soporte, consulta la página web del juego o revisa el código fuente. 