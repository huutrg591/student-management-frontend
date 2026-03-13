package view;

import javax.swing.*;
import javax.swing.table.DefaultTableModel;

public class mainFrame extends JFrame {

    JTable table;

    public mainFrame() {

        setTitle("Student Management");
        setSize(600,400);
        setLocationRelativeTo(null);
        setDefaultCloseOperation(EXIT_ON_CLOSE);

        String[] column = {"ID","Name","Email","Phone"};

        DefaultTableModel model = new DefaultTableModel(column,0);
        table = new JTable(model);

        JScrollPane pane = new JScrollPane(table);

        add(pane);

        setVisible(true);
    }

    public static void main(String[] args) {
        new mainFrame();
    }
}