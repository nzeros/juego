// Archivo: PanelJuego.java
import javax.swing.*;
import java.awt.*;
import java.awt.event.*;
import java.util.HashSet;
import java.util.Set;
import java.util.ArrayList;
import java.util.Iterator;

public class PanelJuego extends JPanel implements ActionListener {

    private final int ANCHO = 800;
    private final int ALTO = 600;
    private final int SUELO_Y = ALTO - 150;
    private enum EstadoJuego { MENU, JUGANDO, ROUND_END, GAME_OVER, VICTORIA }
    private EstadoJuego estadoActual = EstadoJuego.MENU;

    public enum Dificultad {
        FACIL("Fácil", 100, 10, 3, 0.4, 0.0),
        MEDIO("Medio", 120, 15, 4, 0.6, 0.1),
        DIFICIL("Difícil", 150, 20, 6, 0.8, 0.3),
        PESADILLA("Pesadilla", 200, 25, 7, 0.95, 0.5);
        
        private final String n; private final int v,d,vel; private final double a,c;
        Dificultad(String n,int v,int d,int vel,double a,double c){this.n=n;this.v=v;this.d=d;this.vel=vel;this.a=a;this.c=c;}
        public String getNombre(){return n;} public int getVidaEnemigo(){return v;} public int getDanoEnemigo(){return d;}
        public int getVelocidadEnemigo(){return vel;} public double getAgresividadIA(){return a;} public double getComboChanceIA(){return c;}
    }

    private Dificultad[] dificultades = Dificultad.values();
    private int opcionSeleccionada = 0;
    private Dificultad dificultadElegida;
    private Timer timer;
    private Jugador jugador;
    private Enemigo enemigo;
    
    // Sistema de rounds
    private int roundActual = 1;
    private int maxRounds = 3;
    private int victoriasJugador = 0;
    private int victoriasEnemigo = 0;
    private int tiempoRoundEnd = 0;
    
    // Proyectiles de energía
    private ArrayList<Proyectil> proyectiles = new ArrayList<>();
    
    private Set<Integer> teclasPresionadas = new HashSet<>();

    public PanelJuego() {
        setPreferredSize(new Dimension(ANCHO, ALTO));
        setBackground(new Color(30, 30, 50));
        setFocusable(true);
        
        addKeyListener(new KeyAdapter() {
            @Override
            public void keyPressed(KeyEvent e) {
                int keyCode = e.getKeyCode();
                if (estadoActual == EstadoJuego.JUGANDO) {
                    teclasPresionadas.add(keyCode);
                    if (keyCode == KeyEvent.VK_S) jugador.empezarCargaKi();
                    if (keyCode == KeyEvent.VK_K) jugador.lanzarSuper();
                    if (keyCode == KeyEvent.VK_L) jugador.lanzarProyectil(proyectiles);
                } else if (estadoActual == EstadoJuego.MENU) {
                    manejarControlesMenu(keyCode);
                } else if ((estadoActual == EstadoJuego.GAME_OVER || estadoActual == EstadoJuego.VICTORIA || estadoActual == EstadoJuego.ROUND_END) && keyCode == KeyEvent.VK_ENTER) {
                    if (estadoActual == EstadoJuego.ROUND_END) {
                        siguienteRound();
                    } else {
                        volverAlMenu();
                    }
                }
            }
            @Override
            public void keyReleased(KeyEvent e) {
                int keyCode = e.getKeyCode();
                teclasPresionadas.remove(keyCode);
                if (estadoActual == EstadoJuego.JUGANDO && keyCode == KeyEvent.VK_S) {
                    jugador.detenerCargaKi();
                }
            }
        });
        timer = new Timer(16, this);
        timer.start();
    }
    
    @Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g);
        Graphics2D g2d = (Graphics2D) g;
        g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

        switch(estadoActual) {
            case MENU: 
                dibujarMenu(g2d); 
                break;
            case JUGANDO: 
                dibujarEscena(g2d); 
                break;
            case ROUND_END:
                dibujarEscena(g2d);
                dibujarMensajeRoundEnd(g2d);
                break;
            case GAME_OVER: 
                dibujarEscena(g2d);
                dibujarMensajeFinal(g2d, false); 
                break;
            case VICTORIA:
                dibujarEscena(g2d);
                dibujarMensajeFinal(g2d, true);
                break;
        }
        Toolkit.getDefaultToolkit().sync();
    }

    private void dibujarEscena(Graphics2D g2d) {
        // Fondo mejorado
        GradientPaint fondoGradient = new GradientPaint(0, 0, new Color(50, 30, 80), 0, ALTO, new Color(20, 20, 40));
        g2d.setPaint(fondoGradient);
        g2d.fillRect(0, 0, ANCHO, ALTO);
        
        // Suelo mejorado
        g2d.setColor(new Color(120, 80, 60));
        g2d.fillRect(0, SUELO_Y + 100, ANCHO, 50);
        g2d.setColor(new Color(90, 60, 40));
        for (int i = 0; i < ANCHO; i += 40) {
            g2d.fillRect(i, SUELO_Y + 100, 35, 10);
        }
        
        // Línea central del ring
        g2d.setColor(Color.WHITE);
        g2d.setStroke(new BasicStroke(2, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));
        g2d.drawLine(ANCHO/2, SUELO_Y, ANCHO/2, SUELO_Y + 100);
        
        jugador.dibujar(g2d);
        enemigo.dibujar(g2d);
        
        // Dibujar proyectiles
        for (Proyectil p : proyectiles) {
            p.dibujar(g2d);
        }
        
        dibujarUIRounds(g2d);
        dibujarInstruccionesCompletas(g2d);
    }
    
    private void dibujarUIRounds(Graphics2D g2d) {
        // UI Mejorada con efectos
        g2d.setFont(new Font("Arial", Font.BOLD, 18));
        
        // Panel de información del jugador con sombra
        g2d.setColor(new Color(0, 0, 0, 100));
        g2d.fillRoundRect(12, 12, 220, 88, 10, 10);
        g2d.setColor(new Color(0, 50, 150, 200));
        g2d.fillRoundRect(10, 10, 220, 88, 10, 10);
        g2d.setColor(Color.WHITE);
        g2d.drawRoundRect(10, 10, 220, 88, 10, 10);
        
        g2d.setColor(Color.WHITE);
        g2d.drawString("JUGADOR", 15, 30);
        
        // Barra de vida con efectos
        g2d.setColor(Color.BLACK);
        g2d.fillRoundRect(15, 35, 200, 20, 5, 5);
        int vidaJugador = (int)(200 * ((double)jugador.getVida() / jugador.getVidaMaxima()));
        GradientPaint vidaGradient = new GradientPaint(15, 35, Color.GREEN, 15 + vidaJugador, 35, Color.YELLOW);
        g2d.setPaint(vidaGradient);
        g2d.fillRoundRect(15, 35, vidaJugador, 20, 5, 5);
        g2d.setColor(Color.WHITE);
        g2d.drawRoundRect(15, 35, 200, 20, 5, 5);
        g2d.drawString(jugador.getVida() + "/" + jugador.getVidaMaxima(), 20, 50);
        
        // Barra de Ki con efectos
        g2d.setColor(Color.BLACK);
        g2d.fillRoundRect(15, 60, 200, 15, 5, 5);
        int kiJugador = (int)(200 * ((double)jugador.getKi() / jugador.getMaxKi()));
        GradientPaint kiGradient = new GradientPaint(15, 60, Color.BLUE, 15 + kiJugador, 60, Color.CYAN);
        g2d.setPaint(kiGradient);
        g2d.fillRoundRect(15, 60, kiJugador, 15, 5, 5);
        g2d.setColor(Color.WHITE);
        g2d.drawRoundRect(15, 60, 200, 15, 5, 5);
        g2d.drawString("Ki: " + jugador.getKi() + "/" + jugador.getMaxKi(), 20, 72);
        
        g2d.setColor(Color.WHITE);
        g2d.drawString("Proyectiles: " + jugador.getProyectiles(), 15, 90);

        // Panel de información del enemigo
        g2d.setColor(new Color(0, 0, 0, 100));
        g2d.fillRoundRect(ANCHO - 232, 12, 220, 88, 10, 10);
        g2d.setColor(new Color(150, 50, 0, 200));
        g2d.fillRoundRect(ANCHO - 230, 10, 220, 88, 10, 10);
        g2d.setColor(Color.WHITE);
        g2d.drawRoundRect(ANCHO - 230, 10, 220, 88, 10, 10);
        
        g2d.drawString("ENEMIGO", ANCHO - 80, 30);
        
        // Barra de vida enemigo
        g2d.setColor(Color.BLACK);
        g2d.fillRoundRect(ANCHO - 215, 35, 200, 20, 5, 5);
        int vidaEnemigo = (int)(200 * ((double)enemigo.getVida() / enemigo.getVidaMaxima()));
        GradientPaint vidaEnemigoGradient = new GradientPaint(ANCHO - 215, 35, Color.RED, ANCHO - 215 + vidaEnemigo, 35, Color.ORANGE);
        g2d.setPaint(vidaEnemigoGradient);
        g2d.fillRoundRect(ANCHO - 215, 35, vidaEnemigo, 20, 5, 5);
        g2d.setColor(Color.WHITE);
        g2d.drawRoundRect(ANCHO - 215, 35, 200, 20, 5, 5);
        g2d.drawString(enemigo.getVida() + "/" + enemigo.getVidaMaxima(), ANCHO - 210, 50);
        
        // Barra de Ki enemigo
        g2d.setColor(Color.BLACK);
        g2d.fillRoundRect(ANCHO - 215, 60, 200, 15, 5, 5);
        int kiEnemigo = (int)(200 * ((double)enemigo.getKi() / enemigo.getMaxKi()));
        GradientPaint kiEnemigoGradient = new GradientPaint(ANCHO - 215, 60, Color.MAGENTA, ANCHO - 215 + kiEnemigo, 60, Color.PINK);
        g2d.setPaint(kiEnemigoGradient);
        g2d.fillRoundRect(ANCHO - 215, 60, kiEnemigo, 15, 5, 5);
        g2d.setColor(Color.WHITE);
        g2d.drawRoundRect(ANCHO - 215, 60, 200, 15, 5, 5);
        g2d.drawString("Ki: " + enemigo.getKi() + "/" + enemigo.getMaxKi(), ANCHO - 210, 72);

        // Información de rounds en el centro
        g2d.setFont(new Font("Arial", Font.BOLD, 24));
        g2d.setColor(new Color(0, 0, 0, 150));
        g2d.fillRoundRect(ANCHO/2 - 102, 12, 204, 48, 10, 10);
        g2d.setColor(new Color(100, 100, 100, 200));
        g2d.fillRoundRect(ANCHO/2 - 100, 10, 200, 48, 10, 10);
        g2d.setColor(Color.WHITE);
        g2d.drawRoundRect(ANCHO/2 - 100, 10, 200, 48, 10, 10);
        
        g2d.drawString("Round " + roundActual + "/" + maxRounds, ANCHO/2 - 80, 30);
        g2d.setFont(new Font("Arial", Font.BOLD, 16));
        g2d.drawString("Jugador: " + victoriasJugador + " - " + victoriasEnemigo + " :Enemigo", ANCHO/2 - 90, 50);
    }

    private void dibujarInstruccionesCompletas(Graphics2D g2d) {
        g2d.setFont(new Font("Arial", Font.BOLD, 12));
        String[] instrucciones = {
            "Mover: A/D | Saltar: W | Atacar: J | Cargar Ki: S | Súper: K | Proyectil: L"
        };
        
        for (int i = 0; i < instrucciones.length; i++) {
            g2d.setColor(Color.BLACK);
            g2d.drawString(instrucciones[i], 12, ALTO - 15 + (i * 15));
            g2d.setColor(Color.WHITE);
            g2d.drawString(instrucciones[i], 10, ALTO - 17 + (i * 15));
        }
    }
    
    @Override
    public void actionPerformed(ActionEvent e) {
        if (estadoActual == EstadoJuego.JUGANDO) {
            actualizarJuego();
        } else if (estadoActual == EstadoJuego.ROUND_END) {
            tiempoRoundEnd++;
        }
        repaint();
    }
    
    private void actualizarJuego() {
        jugador.actualizar();
        enemigo.actualizar();
        
        // Actualizar proyectiles
        Iterator<Proyectil> iter = proyectiles.iterator();
        while (iter.hasNext()) {
            Proyectil p = iter.next();
            p.actualizar();
            if (p.fueraDePantalla(ANCHO)) {
                iter.remove();
            }
        }
        
        verificarColisiones();
        verificarEstadoJuego();
    }
    
    private void verificarColisiones() {
        // Colisiones de ataques normales
        if (jugador.estaAtacando && jugador.getBoundsAtaque().intersects(enemigo.getBounds())) {
            enemigo.recibirDano(jugador.potenciaAtaque);
            jugador.estaAtacando = false;
        }
        if (enemigo.estaAtacando && enemigo.getBoundsAtaque().intersects(jugador.getBounds())) {
            jugador.recibirDano(enemigo.potenciaAtaque);
            enemigo.estaAtacando = false;
        }
        
        // Colisiones de súper ataques
        if (jugador.getBoundsSuperAtaque().intersects(enemigo.getBounds())) {
            enemigo.recibirDano(5);
        }
        if (enemigo.getBoundsSuperAtaque().intersects(jugador.getBounds())) {
            jugador.recibirDano(5);
        }
        
        // Colisiones de proyectiles
        Iterator<Proyectil> iter = proyectiles.iterator();
        while (iter.hasNext()) {
            Proyectil p = iter.next();
            if (p.esDelJugador && p.getBounds().intersects(enemigo.getBounds())) {
                enemigo.recibirDano(p.dano);
                iter.remove();
            } else if (!p.esDelJugador && p.getBounds().intersects(jugador.getBounds())) {
                jugador.recibirDano(p.dano);
                iter.remove();
            }
        }
    }
    
    private void verificarEstadoJuego() {
        if (!jugador.estaVivo()) {
            victoriasEnemigo++;
            finalizarRound();
        } else if (!enemigo.estaVivo()) {
            victoriasJugador++;
            finalizarRound();
        }
    }
    
    private void finalizarRound() {
        if (victoriasJugador >= 2) {
            estadoActual = EstadoJuego.VICTORIA;
        } else if (victoriasEnemigo >= 2) {
            estadoActual = EstadoJuego.GAME_OVER;
        } else {
            estadoActual = EstadoJuego.ROUND_END;
            tiempoRoundEnd = 0;
        }
    }
    
    private void siguienteRound() {
        roundActual++;
        if (roundActual > maxRounds) {
            if (victoriasJugador > victoriasEnemigo) {
                estadoActual = EstadoJuego.VICTORIA;
            } else {
                estadoActual = EstadoJuego.GAME_OVER;
            }
        } else {
            estadoActual = EstadoJuego.JUGANDO;
            jugador.resetearCompleto();
            crearNuevoEnemigo();
            proyectiles.clear();
        }
    }
    
    // ... existing code ...
    private void manejarControlesMenu(int k) { 
        if (k == KeyEvent.VK_W || k == KeyEvent.VK_UP) 
            opcionSeleccionada = (opcionSeleccionada > 0) ? opcionSeleccionada - 1 : dificultades.length - 1; 
        else if (k == KeyEvent.VK_S || k == KeyEvent.VK_DOWN) 
            opcionSeleccionada = (opcionSeleccionada < dificultades.length - 1) ? opcionSeleccionada + 1 : 0; 
        else if (k == KeyEvent.VK_ENTER) 
            iniciarPartida(dificultades[opcionSeleccionada]); 
    }
    
    private void iniciarPartida(Dificultad d) { 
        this.dificultadElegida = d; 
        this.roundActual = 1;
        this.victoriasJugador = 0;
        this.victoriasEnemigo = 0;
        this.estadoActual = EstadoJuego.JUGANDO; 
        jugador = new Jugador(100, SUELO_Y, SUELO_Y, teclasPresionadas); 
        crearNuevoEnemigo();
        proyectiles.clear();
    }
    
    private void crearNuevoEnemigo() { 
        enemigo = new Enemigo(650, SUELO_Y, SUELO_Y, dificultadElegida, jugador, proyectiles); 
    }
    
    private void volverAlMenu() { 
        estadoActual = EstadoJuego.MENU; 
        roundActual = 1;
        victoriasJugador = 0;
        victoriasEnemigo = 0;
        proyectiles.clear();
    }
    
    private void dibujarMenu(Graphics2D g2d) { 
        // Fondo del menú con gradiente
        GradientPaint fondoGradient = new GradientPaint(0, 0, new Color(20, 20, 60), 0, ALTO, new Color(60, 20, 80));
        g2d.setPaint(fondoGradient);
        g2d.fillRect(0, 0, ANCHO, ALTO);
        
        g2d.setColor(Color.YELLOW); 
        g2d.setFont(new Font("Consolas", Font.BOLD, 50)); 
        FontMetrics fm = g2d.getFontMetrics(); 
        g2d.drawString("STICKMAN FIGHT", (ANCHO - fm.stringWidth("STICKMAN FIGHT")) / 2, 100); 
        
        g2d.setFont(new Font("Consolas", Font.PLAIN, 24)); 
        fm = g2d.getFontMetrics(); 
        g2d.setColor(Color.CYAN);
        g2d.drawString("Sistema de 3 Rounds", (ANCHO - fm.stringWidth("Sistema de 3 Rounds")) / 2, 160);
        g2d.setColor(Color.WHITE);
        g2d.drawString("Selecciona Dificultad", (ANCHO - fm.stringWidth("Selecciona Dificultad")) / 2, 200); 
        
        for (int i = 0; i < dificultades.length; i++) { 
            if (i == opcionSeleccionada) { 
                g2d.setColor(Color.CYAN); 
                g2d.fillRoundRect((ANCHO - 300) / 2, 270 + i * 40, 300, 30, 10, 10);
                g2d.setColor(Color.BLACK);
                g2d.drawString("> " + dificultades[i].getNombre() + " <", (ANCHO - fm.stringWidth("> " + dificultades[i].getNombre() + " <")) / 2, 290 + i * 40); 
            } else { 
                g2d.setColor(Color.WHITE); 
                g2d.drawString(dificultades[i].getNombre(), (ANCHO - fm.stringWidth(dificultades[i].getNombre())) / 2, 290 + i * 40); 
            } 
        } 
        g2d.setColor(Color.WHITE); 
        g2d.setFont(new Font("Arial", Font.PLAIN, 16)); 
        g2d.drawString("Usa W/S o Flechas para navegar. ENTER para seleccionar.", 190, ALTO - 50); 
    }
    
    private void dibujarMensajeRoundEnd(Graphics2D g2d) {
        g2d.setColor(new Color(0, 0, 0, 150)); 
        g2d.fillRect(0, 0, ANCHO, ALTO);
        
        g2d.setColor(Color.YELLOW); 
        g2d.setFont(new Font("Arial", Font.BOLD, 40)); 
        FontMetrics fm = g2d.getFontMetrics();
        
        String mensaje = (victoriasJugador > victoriasEnemigo) ? "¡ROUND GANADO!" : "¡ROUND PERDIDO!";
        g2d.drawString(mensaje, (ANCHO - fm.stringWidth(mensaje)) / 2, ALTO / 2 - 50);
        
        g2d.setColor(Color.WHITE); 
        g2d.setFont(new Font("Arial", Font.PLAIN, 20)); 
        g2d.drawString("Presiona ENTER para continuar", (ANCHO - fm.stringWidth("Presiona ENTER para continuar")) / 2, ALTO / 2);
    }
    
    private void dibujarMensajeFinal(Graphics2D g2d, boolean victoria) { 
        g2d.setColor(new Color(0, 0, 0, 150)); 
        g2d.fillRect(0, 0, ANCHO, ALTO); 
        
        if (victoria) {
            g2d.setColor(Color.GREEN); 
            g2d.setFont(new Font("Arial", Font.BOLD, 50)); 
            FontMetrics fm = g2d.getFontMetrics(); 
            g2d.drawString("¡VICTORIA!", (ANCHO - fm.stringWidth("¡VICTORIA!")) / 2, ALTO / 2 - 50);
        } else {
            g2d.setColor(Color.RED); 
            g2d.setFont(new Font("Arial", Font.BOLD, 50)); 
            FontMetrics fm = g2d.getFontMetrics(); 
            g2d.drawString("¡DERROTA!", (ANCHO - fm.stringWidth("¡DERROTA!")) / 2, ALTO / 2 - 50);
        }
        
        g2d.setColor(Color.WHITE); 
        g2d.setFont(new Font("Arial", Font.PLAIN, 20)); 
        g2d.drawString("Presiona ENTER para volver al menú", (ANCHO - fm.stringWidth("Presiona ENTER para volver al menú")) / 2, ALTO / 2); 
    }
}