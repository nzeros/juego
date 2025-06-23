import javax.swing.*;

public class JuegoPeleaMejorado extends JFrame {
    
    public JuegoPeleaMejorado() {
        setTitle("Stickman Fight - Versión Mejorada");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setResizable(false);
        
        // Usar el panel original por ahora hasta que solucionemos el problema del constructor
        PanelJuego panelJuego = new PanelJuego();
        add(panelJuego);
        
        pack();
        setLocationRelativeTo(null);
        setVisible(true);
    }
    
    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            new JuegoPeleaMejorado();
        });
    }
} 