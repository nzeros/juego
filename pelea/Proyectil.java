import java.awt.*;

public class Proyectil {
    protected int x, y;
    protected int velocidadX;
    protected int ancho = 20, alto = 10;
    protected int dano;
    protected boolean esDelJugador;
    protected Color color;
    protected int tiempoVida = 0;
    protected int maxTiempoVida = 300; // 5 segundos a 60 FPS
    
    public Proyectil(int x, int y, boolean direccionDerecha, boolean esDelJugador, int dano) {
        this.x = x;
        this.y = y;
        this.velocidadX = direccionDerecha ? 8 : -8;
        this.esDelJugador = esDelJugador;
        this.dano = dano;
        this.color = esDelJugador ? Color.CYAN : Color.MAGENTA;
    }
    
    public void actualizar() {
        x += velocidadX;
        tiempoVida++;
    }
    
    public void dibujar(Graphics2D g2d) {
        // Efecto de brillo
        float alpha = 0.3f + (float)(Math.sin(tiempoVida * 0.3) * 0.2f);
        g2d.setColor(new Color(color.getRed(), color.getGreen(), color.getBlue(), (int)(alpha * 255)));
        g2d.fillOval(x - ancho, y - alto, ancho * 2, alto * 2);
        
        // Núcleo del proyectil
        g2d.setColor(color);
        g2d.fillOval(x - ancho/2, y - alto/2, ancho, alto);
        
        // Efecto de rastro
        g2d.setColor(Color.WHITE);
        g2d.fillOval(x - ancho/4, y - alto/4, ancho/2, alto/2);
    }
    
    public Rectangle getBounds() {
        return new Rectangle(x - ancho/2, y - alto/2, ancho, alto);
    }
    
    public boolean fueraDePantalla(int anchoVentana) {
        return x < -50 || x > anchoVentana + 50 || tiempoVida > maxTiempoVida;
    }
} 