// Archivo: Jugador.java
import java.awt.*;
import java.util.Set;
import java.util.ArrayList;
import java.awt.event.KeyEvent;

public class Jugador extends Personaje {
    
    private Set<Integer> teclasPresionadas;
    private int velocidadX = 0;
    private int proyectiles = 5;
    private int maxProyectiles = 5;
    private int cooldownProyectil = 0;
    
    public Jugador(int x, int y, int sueloY, Set<Integer> t) { super(x,y,sueloY); this.teclasPresionadas=t; this.velocidad=8; this.vida=100; this.vidaMaxima=100; this.potenciaAtaque=15; }
    
    @Override
    public void actualizar() {
        if (estaCargandoKi || estaLanzandoSuper) {
            velocidadX = 0;
        } else {
             velocidadX = 0;
             if (teclasPresionadas.contains(KeyEvent.VK_A)) { velocidadX = -velocidad; mirandoDerecha = false; }
             if (teclasPresionadas.contains(KeyEvent.VK_D)) { velocidadX = velocidad; mirandoDerecha = true; }
        }
        x += velocidadX;
        
        if (!estaCargandoKi && !estaLanzandoSuper) {
            if (teclasPresionadas.contains(KeyEvent.VK_W)) saltar();
            if (teclasPresionadas.contains(KeyEvent.VK_J)) atacar();
        }
        
        // Actualizar cooldown de proyectiles
        if (cooldownProyectil > 0) cooldownProyectil--;
        
        // Regenerar proyectiles lentamente
        if (contadorAnimacion % 120 == 0 && proyectiles < maxProyectiles) {
            proyectiles++;
        }

        super.actualizar();
        
        if (estaLanzandoSuper) estadoAnimacion = EstadoAnimacion.SUPER_ATTACK;
        else if (estaCargandoKi) estadoAnimacion = EstadoAnimacion.CHARGING;
        else if (estaAtacando) estadoAnimacion = EstadoAnimacion.ATTACKING;
        else if (!estaEnElSuelo) estadoAnimacion = EstadoAnimacion.JUMPING;
        else if (velocidadX != 0) estadoAnimacion = EstadoAnimacion.WALKING;
        else estadoAnimacion = EstadoAnimacion.IDLE;
        
        if (x < 0) x = 0;
        if (x > 750) x = 750;
    }
    
    @Override
    public void dibujar(Graphics2D g2d) {
        g2d.setStroke(new BasicStroke(6, BasicStroke.CAP_ROUND, BasicStroke.JOIN_ROUND));
        g2d.setColor(Color.BLUE);

        Point cabeza = new Point(x + 25, y + 15);
        Point cuello = new Point(x + 25, y + 30);
        Point torso = new Point(x + 25, y + 60);
        float animSin = (float)Math.sin(contadorAnimacion * 0.2);

        switch (estadoAnimacion) {
            case IDLE:
                dibujarCuerpo(g2d, cabeza, cuello, torso);
                g2d.drawLine(cuello.x, cuello.y, x + 5, y + 50);
                g2d.drawLine(cuello.x, cuello.y, x + 45, y + 50);
                g2d.drawLine(torso.x, torso.y, x + 10, y + 100);
                g2d.drawLine(torso.x, torso.y, x + 40, y + 100);
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
                g2d.drawLine(cuello.x, cuello.y, x + 10, y + 20);
                g2d.drawLine(cuello.x, cuello.y, x + 40, y + 20);
                g2d.drawLine(torso.x, torso.y, x + 10, y + 80);
                g2d.drawLine(torso.x, torso.y, x + 40, y + 80);
                break;
            case ATTACKING:
                dibujarCuerpo(g2d, cabeza, cuello, torso);
                g2d.drawLine(torso.x, torso.y, x + 10, y + 100);
                g2d.drawLine(torso.x, torso.y, x + 40, y + 100);
                int armX = mirandoDerecha ? x + 60 : x - 10;
                g2d.drawLine(cuello.x, cuello.y, armX, y + 40);
                g2d.setColor(Color.ORANGE);
                g2d.fillOval(armX - 10, y + 30, 20, 20);
                break;
            case CHARGING:
                dibujarCuerpo(g2d, new Point(x + 25, y + 25), cuello, new Point(x + 25, y + 70));
                g2d.drawLine(cuello.x, cuello.y, x + 15, y + 60); g2d.drawLine(cuello.x, cuello.y, x + 35, y + 60);
                g2d.drawLine(torso.x, torso.y, x + 10, y + 100); g2d.drawLine(torso.x, torso.y, x + 40, y + 100);
                float alpha = 0.3f + (float)(Math.sin(contadorAnimacion * 0.5) * 0.2f);
                g2d.setColor(new Color(1f, 1f, 0f, alpha));
                int auraSize = 60 + (int)(Math.sin(contadorAnimacion * 0.5) * 10);
                g2d.fillOval(x + 25 - auraSize / 2, y + 50 - auraSize / 2, auraSize, auraSize);
                break;
            case SUPER_ATTACK:
                if (contadorSuper > DURACION_SUPER - 15) {
                    dibujarCuerpo(g2d, cabeza, cuello, torso);
                    int handX = mirandoDerecha ? x + 10 : x + 40;
                    g2d.drawLine(cuello.x, cuello.y, handX, y + 40); g2d.drawLine(cuello.x, cuello.y, handX, y + 40);
                    g2d.setColor(Color.CYAN); g2d.fillOval(handX - 15, y + 25, 30, 30);
                } else {
                    dibujarCuerpo(g2d, cabeza, cuello, torso);
                    int armX_end = mirandoDerecha ? x + 60 : x - 10;
                    g2d.drawLine(cuello.x, cuello.y, armX_end, y + 40);
                    Rectangle beam = getBoundsSuperAtaque();
                    GradientPaint gp = new GradientPaint(beam.x, beam.y, Color.WHITE, beam.x, beam.y + beam.height, Color.CYAN, true);
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
    
    public void lanzarProyectil(ArrayList<Proyectil> listaProyectiles) {
        if (proyectiles > 0 && cooldownProyectil == 0 && !estaCargandoKi && !estaLanzandoSuper) {
            int proyectilX = mirandoDerecha ? x + ancho : x;
            int proyectilY = y + 40;
            listaProyectiles.add(new Proyectil(proyectilX, proyectilY, mirandoDerecha, true, 8));
            proyectiles--;
            cooldownProyectil = 30; // 0.5 segundos de cooldown
        }
    }
    
    public int getProyectiles() { return proyectiles; }
    public int getMaxProyectiles() { return maxProyectiles; }
    
    public void resetear() {this.vida=vidaMaxima; this.ki=0; this.x=100; this.y=SUELO_Y; this.estaEnElSuelo=true;}
    
    public void resetearCompleto() {
        resetear();
        this.proyectiles = maxProyectiles;
        this.cooldownProyectil = 0;
    }
}