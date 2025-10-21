<?php
// Script de prueba de conexión
echo "Probando conexión a MySQL...\n";

try {
    $conn = new mysqli('localhost', 'root', '123456');
    
    if ($conn->connect_error) {
        die("Conexión fallida: " . $conn->connect_error);
    }
    
    echo "¡Conexión exitosa a MySQL!\n";
    
    // Intentar crear la base de datos
    $sql = file_get_contents(__DIR__ . '/database/schema.sql');
    
    if ($conn->multi_query($sql)) {
        do {
            if ($result = $conn->store_result()) {
                $result->free();
            }
        } while ($conn->next_result());
        
        echo "¡Base de datos creada exitosamente!\n";
    } else {
        echo "Error creando la base de datos: " . $conn->error . "\n";
    }
    
    // Verificar si podemos consultar tickets
    $conn->select_db('ticket_system');
    $result = $conn->query("SELECT COUNT(*) as total FROM ticket");
    if ($result) {
        $row = $result->fetch_assoc();
        echo "Total de tickets en la base de datos: " . $row['total'] . "\n";
    }
    
    $conn->close();
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>