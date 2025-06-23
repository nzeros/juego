// Archivo: Enemigo.java
import java.awt.*;
import java.util.ArrayList;

public class Enemigo extends Personaje {

    private Jugador objetivo;
    private ArrayList<Proyectil> proyectiles;
    private int velocidadX = 0;
    private double agresividad, comboChance;
    private boolean enCombo = false;
    private int cooldownProyectil = 0;

    public Enemigo(int x, int y, int sueloY, PanelJuego.Dificultad dificultad, Jugador objetivo, ArrayList<Proyectil> proyectiles) {
        super(x, y, sueloY);
        this.objetivo = objetivo;
        this.proyectiles = proyectiles;
        this.vida = dificultad.getVidaEnemigo();
        this.vidaMaxima = vida;
        this.potenciaAtaque = dificultad.getDanoEnemigo();
        this.velocidad = dificultad.getVelocidadEnemigo();
        this.agresividad = dificultad.getAgresividadIA();
        this.comboChance = dificultad.getComboChanceIA();
    }

    @Override
    public void actualizar() {
        mirandoDerecha = (objetivo.x > this.x);
        velocidadX = 0;
        
        // Actualizar cooldown de proyectiles
        if (cooldownProyectil > 0) cooldownProyectil--;

        if (!estaAtacando && !estaLanzandoSuper) {
            int distanciaX = Math.abs(this.x - objetivo.x);
            
            if (ki >= MAX_KI && distanciaX < 500) {
                lanzarSuper();
            } else if (distanciaX > 300 && ki < MAX_KI && Math.random() < 0.8) {
                empezarCargaKi();
            } else {
                detenerCargaKi();
            }
            
            // IA para lanzar proyectiles
            if (distanciaX > 200 && distanciaX < 600 && cooldownProyectil == 0 && Math.random() < 0.3) {
                lanzarProyectil();
            }
            
            if (!estaCargandoKi) {
                int distanciaY = Math.abs(this.y - objetivo.y);
                if (objetivo.estaAtacando && distanciaX < 120 && Math.random() < 0.6) saltar();
                else if (distanciaY > 80 && objetivo.y < this.y && Math.random() < 0.3) saltar();

                if (distanciaX < 90 && distanciaY < 50) {
                    if (Math.random() < agresividad) {
                        atacar();
                        if (Math.random() < comboChance) enCombo = true;
                    } else {
                        velocidadX = mirandoDerecha ? -velocidad : velocidad;
                    }
                } else {
                    velocidadX = mirandoDerecha ? velocidad : -velocidad;
                }
                if (enCombo && estaEnElSuelo) { atacar(); enCombo = false; }
            }
        } else {
            detenerCargaKi();
        }

        x += velocidadX;
        super.actualizar();
        
        if (estaLanzandoSuper) estadoAnimacion = EstadoAnimacion.SUPER_ATTACK;
        else if (estaCargandoKi) estadoAnimacion = EstadoAnimacion.CHARGING;
        else if (estaAtacando) estadoAnimacion = EstadoAnimacion.ATTACKING;
        else if (!estaEnElSuelo) estadoAnimacion = EstadoAnimacion.JUMPING;
        else if (velocidadX != 0) estadoAnimacion = EstadoAnimacion.WALKING;
        else estadoAnimacion = EstadoAnimacion.IDLE;
    }

    @Override
    public void dibujar(Graphics2D g2d) {
        g2d.setStroke(new BasicStroke(6, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));
        g2d.setColor(Color.RED); // Color base del enemigo

        Point cabeza = new Point(x + 25, y + 15);
        Point cuello = new Point(x + 25, y + 30);
        Point torso = new Point(x + 25, y + 60);
        float animSin = (float)Math.sin(contadorAnimacion * 0.2);

        switch (estadoAnimacion) {
            case IDLE:
                dibujarCuerpo(g2d, cabeza, cuello, torso);
                g2d.drawLine(cuello.x, cuello.y, x + 5, y + 50); g2d.drawLine(cuello.x, cuello.y, x + 45, y + 50);
                g2d.drawLine(torso.x, torso.y, x + 10, y + 100); g2d.drawLine(torso.x, torso.y, x + 40, y + 100);
                break;
            case WALKING:
                dibujarCuerpo(g2d, cabeza, cuello, torso);
                g2d.drawLine(cuello.x, cuello.y, x + 25 + (int)(animSin * 15), y + 50);
                g2d.drawLine(cuello.x, cuello.y, x + 25 - (int)(animSin * 15), y + 50);
                g2d.drawLine(torso.x, torso.y, x + 25 - (int)(animSin * 15), y + 100);
                g2d.drawLine(torso.x, torso.y, x + 25 + (int)(animSin * 15), y + 100);
                break;
            case JUMPING:
                dibujarCuerpo(g2d, cabeza, cuello, torso);
                g2d.drawLine(cuello.x, cuello.y, x + 10, y + 20); g2d.drawLine(cuello.x, cuello.y, x + 40, y + 20);
                g2d.drawLine(torso.x, torso.y, x + 10, y + 80); g2d.drawLine(torso.x, torso.y, x + 40, y + 80);
                break;
            case ATTACKING:
                dibujarCuerpo(g2d, cabeza, cuello, torso);
                g2d.drawLine(torso.x, torso.y, x + 10, y + 100); g2d.drawLine(torso.x, torso.y, x + 40, y + 100);
                int armX = mirandoDerecha ? x + 60 : x - 10;
                g2d.drawLine(cuello.x, cuello.y, armX, y + 40);
                g2d.setColor(Color.PINK); g2d.fillOval(armX - 10, y + 30, 20, 20);
                break;
            case CHARGING:
                dibujarCuerpo(g2d, new Point(x + 25, y + 25), cuello, new Point(x + 25, y + 70));
                g2d.drawLine(cuello.x, cuello.y, x + 15, y + 60); g2d.drawLine(cuello.x, cuello.y, x + 35, y + 60);
                g2d.drawLine(torso.x, torso.y, x + 10, y + 100); g2d.drawLine(torso.x, torso.y, x + 40, y + 100);
                float alpha = 0.3f + (float)(Math.sin(contadorAnimacion * 0.5) * 0.2f);
                g2d.setColor(new Color(1f, 0f, 1f, alpha)); // Aura morada
                int auraSize = 60 + (int)(Math.sin(contadorAnimacion * 0.5) * 10);
                g2d.fillOval(x + 25 - auraSize / 2, y + 50 - auraSize / 2, auraSize, auraSize);
                break;
            case SUPER_ATTACK:
                if (contadorSuper > DURACION_SUPER - 15) {
                    dibujarCuerpo(g2d, cabeza, cuello, torso);
                    int handX = mirandoDerecha ? x + 10 : x + 40;
                    g2d.drawLine(cuello.x, cuello.y, handX, y + 40); g2d.drawLine(cuello.x, cuello.y, handX, y + 40);
                    g2d.setColor(Color.MAGENTA); g2d.fillOval(handX - 15, y + 25, 30, 30);
                } else {
                    dibujarCuerpo(g2d, cabeza, cuello, torso);
                    int armX_end = mirandoDerecha ? x + 60 : x - 10;
                    g2d.drawLine(cuello.x, cuello.y, armX_end, y + 40);
                    Rectangle beam = getBoundsSuperAtaque();
                    GradientPaint gp = new GradientPaint(beam.x, beam.y, Color.WHITE, beam.x, beam.y + beam.height, Color.MAGENTA, true);
                    g2d.setPaint(gp); g2d.fill(beam);
                    g2d.setColor(Color.BLACK); g2d.draw(beam);
                }
                break;
        }
    }
    
    @Override
    protected void dibujarCuerpo(Graphics2D g2d, Point cabeza, Point cuello, Point torso) {
        g2d.drawLine(cuello.x, cuello.y, torso.x, torso.y);
        g2d.fillOval(cabeza.x - 12, cabeza.y - 12, 24, 24);
    }
    
    public void lanzarProyectil() {
        if (cooldownProyectil == 0 && !estaCargandoKi && !estaLanzandoSuper) {
            int proyectilX = mirandoDerecha ? x + ancho : x;
            int proyectilY = y + 40;
            proyectiles.add(new Proyectil(proyectilX, proyectilY, mirandoDerecha, false, 8));
            cooldownProyectil = 60; // 1 segundo de cooldown
        }
    }
}