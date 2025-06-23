// Archivo: Personaje.java
import java.awt.*;

public abstract class Personaje {

    protected enum EstadoAnimacion { IDLE, WALKING, JUMPING, ATTACKING, CHARGING, SUPER_ATTACK }
    protected EstadoAnimacion estadoAnimacion = EstadoAnimacion.IDLE;
    protected int contadorAnimacion = 0;

    protected int ki = 0;
    protected final int MAX_KI = 100;
    protected boolean estaCargandoKi = false;
    protected boolean estaLanzandoSuper = false;
    protected int contadorSuper = 0;
    protected final int DURACION_SUPER = 60;

    protected int x, y, ancho = 50, alto = 100;
    protected int velocidad, vida, vidaMaxima, potenciaAtaque;
    protected double velocidadY = 0;
    protected final double GRAVEDAD = 0.5;
    protected boolean estaEnElSuelo = true;
    protected final int SUELO_Y;
    protected boolean estaAtacando = false;
    protected int contadorAtaque = 0;
    protected final int DURACION_ATAQUE = 20;
    protected boolean mirandoDerecha = true;

    public Personaje(int x, int y, int sueloY) { this.x=x; this.y=y; this.SUELO_Y=sueloY; }

    public void actualizar() {
        contadorAnimacion++;
        
        if (estaCargandoKi && estaEnElSuelo) {
            ki += 1;
            if (ki > MAX_KI) ki = MAX_KI;
        }
        
        if (estaAtacando) {
            contadorAtaque--;
            if (contadorAtaque <= 0) estaAtacando = false;
        }

        if (estaLanzandoSuper) {
            contadorSuper--;
            if (contadorSuper <= 0) estaLanzandoSuper = false;
        }
        
        if (!estaEnElSuelo) {
            velocidadY += GRAVEDAD;
            y += velocidadY;
        }
        if (y >= SUELO_Y) { y = SUELO_Y; velocidadY = 0; estaEnElSuelo = true; }
    }
    
    public void empezarCargaKi() { if (estaEnElSuelo) this.estaCargandoKi = true; }
    public void detenerCargaKi() { this.estaCargandoKi = false; }
    public void lanzarSuper() {
        if (ki >= MAX_KI && !estaLanzandoSuper && !estaCargandoKi) {
            ki = 0;
            estaLanzandoSuper = true;
            contadorSuper = DURACION_SUPER;
        }
    }

    public abstract void dibujar(Graphics2D g2d);
    protected abstract void dibujarCuerpo(Graphics2D g2d, Point cabeza, Point cuello, Point torso);

    public void atacar() { if (!estaAtacando && !estaCargandoKi && !estaLanzandoSuper) { estaAtacando = true; contadorAtaque = DURACION_ATAQUE; } }
    public void saltar() { if (estaEnElSuelo && !estaCargandoKi && !estaLanzandoSuper) { velocidadY = -14; estaEnElSuelo = false; } }
    public void recibirDano(int d) { this.vida -= d; if (this.vida < 0) this.vida = 0; }
    
    public Rectangle getBounds() { return new Rectangle(x, y, ancho, alto); }
    public Rectangle getBoundsAtaque() { int aX = mirandoDerecha ? x + ancho : x - 40; return new Rectangle(aX, y + 30, 40, 20); }
    public Rectangle getBoundsSuperAtaque() {
        if (!estaLanzandoSuper || contadorSuper > DURACION_SUPER - 15) return new Rectangle(0,0,0,0);
        int beamX = mirandoDerecha ? x + ancho : x - 400;
        return new Rectangle(beamX, y + 20, 400, 60);
    }
    
    public int getVida() { return vida; }
    public int getVidaMaxima() { return vidaMaxima; }
    public int getKi() { return ki; }
    public int getMaxKi() { return MAX_KI; }
    public boolean estaVivo() { return vida > 0; }
}