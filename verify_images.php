<?php
// Script para verificar integridad de imágenes
require_once __DIR__ . '/controllers/core/MySqlConnect.php';

$db = new MySqlConnect();
$sql = "SELECT id_imagen, id_ticket, imagen FROM imagen ORDER BY id_imagen";
$imagenes = $db->ExecuteSQL($sql);

$uploadsDir = __DIR__ . '/uploads/';
$huerfanos = [];
$correctos = [];

echo "<h2>Verificación de Integridad de Imágenes</h2>";
echo "<table border='1' cellpadding='5'>";
echo "<tr><th>ID Imagen</th><th>Ticket</th><th>Nombre Archivo</th><th>¿Existe?</th><th>Acción</th></tr>";

foreach ($imagenes as $img) {
    $filePath = $uploadsDir . $img->imagen;
    $existe = file_exists($filePath);
    
    if (!$existe) {
        $huerfanos[] = $img;
    } else {
        $correctos[] = $img;
    }
    
    $color = $existe ? 'green' : 'red';
    $texto = $existe ? 'SÍ' : 'NO';
    $accion = !$existe ? '<a href="fix_images.php?delete=' . $img->id_imagen . '">Eliminar registro</a>' : '-';
    
    echo "<tr>";
    echo "<td>{$img->id_imagen}</td>";
    echo "<td>{$img->id_ticket}</td>";
    echo "<td>{$img->imagen}</td>";
    echo "<td style='color: $color; font-weight: bold;'>$texto</td>";
    echo "<td>$accion</td>";
    echo "</tr>";
}

echo "</table>";

echo "<h3>Resumen</h3>";
echo "<p>Total de registros: " . count($imagenes) . "</p>";
echo "<p style='color: green;'>Correctos (archivo existe): " . count($correctos) . "</p>";
echo "<p style='color: red;'>Huérfanos (sin archivo): " . count($huerfanos) . "</p>";

if (count($huerfanos) > 0) {
    echo "<h3>Registros Huérfanos</h3>";
    echo "<ul>";
    foreach ($huerfanos as $h) {
        echo "<li>ID {$h->id_imagen} - Ticket {$h->id_ticket} - {$h->imagen}</li>";
    }
    echo "</ul>";
    echo "<p><a href='fix_images.php?delete_all=1'>Eliminar todos los registros huérfanos</a></p>";
}
?>
