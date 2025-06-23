// Archivo: JuegoPelea.java
import javax.swing.JFrame;
import java.awt.EventQueue;

public class JuegoPelea extends JFrame {

    public JuegoPelea() {
        add(new PanelJuego());
        setTitle("Stickman Fighterz");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setResizable(false);
        pack(); // Ajusta el tamaño de la ventana al del panel
        setLocationRelativeTo(null); // Centra la ventana
    }

    public static void main(String[] args) {
        // Ejecuta el juego en el hilo de despacho de eventos de Swing
        EventQueue.invokeLater(() -> {
            JFrame ex = new JuegoPelea();
            ex.setVisible(true);
        });
    }
}