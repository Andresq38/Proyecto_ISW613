<?php
/**
 * Script de Verificación y Prueba de Datos
 * Sistema de Tickets - Categorías y Técnicos
 */

// Incluir configuración
$config = require_once __DIR__ . '/config.php';

// Configuración de la base de datos
$host = $config['DB_HOST'];
$dbname = $config['DB_DBNAME'];
$username = $config['DB_USERNAME'];
$password = $config['DB_PASSWORD'];

// Crear conexión
$conn = new mysqli($host, $username, $password, $dbname);

// Verificar conexión
if ($conn->connect_error) {
    die("❌ Error de conexión: " . $conn->connect_error);
}

echo "<!DOCTYPE html>
<html lang='es'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Verificación de Datos - Sistema de Tickets</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            color: #333;
        }
        .container { 
            max-width: 1200px; 
            margin: 0 auto; 
            background: white; 
            border-radius: 10px; 
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
            padding: 30px;
        }
        h1 { 
            color: #667eea; 
            text-align: center; 
            margin-bottom: 30px;
            font-size: 2.5em;
        }
        h2 { 
            color: #764ba2; 
            margin: 30px 0 15px 0; 
            padding-bottom: 10px;
            border-bottom: 3px solid #667eea;
            font-size: 1.8em;
        }
        h3 { 
            color: #555; 
            margin: 20px 0 10px 0;
            font-size: 1.3em;
        }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 20px 0;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        th, td { 
            padding: 12px; 
            text-align: left; 
            border-bottom: 1px solid #e0e0e0;
        }
        th { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; 
            font-weight: 600;
            text-transform: uppercase;
            font-size: 0.9em;
            letter-spacing: 0.5px;
        }
        tr:hover { background-color: #f5f5f5; }
        .success { 
            background-color: #d4edda; 
            color: #155724; 
            padding: 15px; 
            border-radius: 5px; 
            margin: 10px 0;
            border-left: 4px solid #28a745;
        }
        .info { 
            background-color: #d1ecf1; 
            color: #0c5460; 
            padding: 15px; 
            border-radius: 5px; 
            margin: 10px 0;
            border-left: 4px solid #17a2b8;
        }
        .warning { 
            background-color: #fff3cd; 
            color: #856404; 
            padding: 15px; 
            border-radius: 5px; 
            margin: 10px 0;
            border-left: 4px solid #ffc107;
        }
        .badge { 
            display: inline-block; 
            padding: 5px 10px; 
            border-radius: 20px; 
            font-size: 0.85em;
            font-weight: 600;
        }
        .badge-primary { background: #667eea; color: white; }
        .badge-success { background: #28a745; color: white; }
        .badge-warning { background: #ffc107; color: #333; }
        .badge-danger { background: #dc3545; color: white; }
        .badge-info { background: #17a2b8; color: white; }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        .stat-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }
        .stat-number {
            font-size: 2.5em;
            font-weight: bold;
            margin: 10px 0;
        }
        .stat-label {
            font-size: 1em;
            opacity: 0.9;
        }
        .api-link {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            text-decoration: none;
            margin: 5px;
            transition: all 0.3s;
        }
        .api-link:hover {
            background: #764ba2;
            transform: translateY(-2px);
            box-shadow: 0 4px 10px rgba(0,0,0,0.2);
        }
    </style>
</head>
<body>
    <div class='container'>
        <h1>🎫 Sistema de Tickets - Verificación de Datos</h1>
        <div class='success'>✅ Conexión exitosa a la base de datos: <strong>$dbname</strong></div>
";

// ============================================================
// 1. ESTADÍSTICAS GENERALES
// ============================================================
echo "<h2>📊 Estadísticas Generales</h2>";
echo "<div class='stats-grid'>";

// Total de categorías
$result = $conn->query("SELECT COUNT(*) as total FROM categoria_ticket");
$total_cat = $result->fetch_assoc()['total'];
echo "<div class='stat-card'><div class='stat-label'>Categorías</div><div class='stat-number'>$total_cat</div></div>";

// Total de técnicos
$result = $conn->query("SELECT COUNT(*) as total FROM tecnico");
$total_tec = $result->fetch_assoc()['total'];
echo "<div class='stat-card'><div class='stat-label'>Técnicos</div><div class='stat-number'>$total_tec</div></div>";

// Total de tickets
$result = $conn->query("SELECT COUNT(*) as total FROM ticket");
$total_tick = $result->fetch_assoc()['total'];
echo "<div class='stat-card'><div class='stat-label'>Tickets</div><div class='stat-number'>$total_tick</div></div>";

// Total de etiquetas
$result = $conn->query("SELECT COUNT(*) as total FROM etiqueta");
$total_etiq = $result->fetch_assoc()['total'];
echo "<div class='stat-card'><div class='stat-label'>Etiquetas</div><div class='stat-number'>$total_etiq</div></div>";

// Total de especialidades
$result = $conn->query("SELECT COUNT(*) as total FROM especialidad");
$total_esp = $result->fetch_assoc()['total'];
echo "<div class='stat-card'><div class='stat-label'>Especialidades</div><div class='stat-number'>$total_esp</div></div>";

echo "</div>";

// ============================================================
// 2. CATEGORÍAS
// ============================================================
echo "<h2>📁 Categorías de Tickets</h2>";
$sql = "SELECT c.id_categoria, c.nombre, s.nombre as sla_nombre,
        (SELECT COUNT(*) FROM categoria_etiqueta WHERE id_categoria_ticket = c.id_categoria) as num_etiquetas,
        (SELECT COUNT(*) FROM ticket WHERE id_categoria = c.id_categoria) as num_tickets
        FROM categoria_ticket c
        LEFT JOIN sla s ON c.id_sla = s.id_sla
        ORDER BY c.id_categoria";

$result = $conn->query($sql);

if ($result->num_rows > 0) {
    echo "<table>";
    echo "<tr><th>ID</th><th>Nombre</th><th>SLA</th><th>Etiquetas</th><th>Tickets</th></tr>";
    while($row = $result->fetch_assoc()) {
        $badge_class = $row['num_tickets'] > 0 ? 'badge-success' : 'badge-warning';
        echo "<tr>";
        echo "<td><span class='badge badge-primary'>{$row['id_categoria']}</span></td>";
        echo "<td><strong>{$row['nombre']}</strong></td>";
        echo "<td>{$row['sla_nombre']}</td>";
        echo "<td><span class='badge badge-info'>{$row['num_etiquetas']} etiquetas</span></td>";
        echo "<td><span class='badge $badge_class'>{$row['num_tickets']} tickets</span></td>";
        echo "</tr>";
    }
    echo "</table>";
} else {
    echo "<div class='warning'>⚠️ No hay categorías registradas</div>";
}

// ============================================================
// 3. TÉCNICOS
// ============================================================
echo "<h2>👨‍💻 Técnicos</h2>";
$sql = "SELECT t.id_tecnico, u.nombre, u.correo, t.disponibilidad,
        (SELECT COUNT(*) FROM ticket WHERE id_tecnico = t.id_tecnico) as tickets_totales,
        (SELECT COUNT(*) FROM ticket 
         WHERE id_tecnico = t.id_tecnico 
         AND id_estado IN (SELECT id_estado FROM estado WHERE nombre IN ('Asignado', 'En Proceso'))) as tickets_abiertos
        FROM tecnico t
        JOIN usuario u ON t.id_usuario = u.id_usuario
        ORDER BY tickets_abiertos DESC, u.nombre";

$result = $conn->query($sql);

if ($result->num_rows > 0) {
    echo "<table>";
    echo "<tr><th>ID</th><th>Nombre</th><th>Correo</th><th>Disponibilidad</th><th>Tickets Abiertos</th><th>Total Tickets</th></tr>";
    while($row = $result->fetch_assoc()) {
        $disponible_badge = $row['disponibilidad'] ? "<span class='badge badge-success'>Disponible</span>" : "<span class='badge badge-warning'>No Disponible</span>";
        $carga_badge = $row['tickets_abiertos'] > 2 ? 'badge-danger' : ($row['tickets_abiertos'] > 0 ? 'badge-warning' : 'badge-success');
        echo "<tr>";
        echo "<td><span class='badge badge-primary'>{$row['id_tecnico']}</span></td>";
        echo "<td><strong>{$row['nombre']}</strong></td>";
        echo "<td>{$row['correo']}</td>";
        echo "<td>$disponible_badge</td>";
        echo "<td><span class='badge $carga_badge'>{$row['tickets_abiertos']}</span></td>";
        echo "<td><span class='badge badge-info'>{$row['tickets_totales']}</span></td>";
        echo "</tr>";
    }
    echo "</table>";
} else {
    echo "<div class='warning'>⚠️ No hay técnicos registrados</div>";
}

// ============================================================
// 4. TICKETS POR CATEGORÍA
// ============================================================
echo "<h2>🎯 Distribución de Tickets por Categoría</h2>";
$sql = "SELECT c.nombre as categoria, 
        COUNT(t.id_ticket) as cantidad,
        SUM(CASE WHEN e.nombre = 'Abierto' THEN 1 ELSE 0 END) as abiertos,
        SUM(CASE WHEN e.nombre = 'Asignado' THEN 1 ELSE 0 END) as asignados,
        SUM(CASE WHEN e.nombre = 'En Proceso' THEN 1 ELSE 0 END) as en_proceso,
        SUM(CASE WHEN e.nombre = 'Resuelto' THEN 1 ELSE 0 END) as resueltos,
        SUM(CASE WHEN e.nombre = 'Cerrado' THEN 1 ELSE 0 END) as cerrados
        FROM categoria_ticket c
        LEFT JOIN ticket t ON t.id_categoria = c.id_categoria
        LEFT JOIN estado e ON t.id_estado = e.id_estado
        GROUP BY c.id_categoria, c.nombre
        ORDER BY cantidad DESC";

$result = $conn->query($sql);

if ($result->num_rows > 0) {
    echo "<table>";
    echo "<tr><th>Categoría</th><th>Total</th><th>Abiertos</th><th>Asignados</th><th>En Proceso</th><th>Resueltos</th><th>Cerrados</th></tr>";
    while($row = $result->fetch_assoc()) {
        echo "<tr>";
        echo "<td><strong>{$row['categoria']}</strong></td>";
        echo "<td><span class='badge badge-primary'>{$row['cantidad']}</span></td>";
        echo "<td><span class='badge badge-info'>{$row['abiertos']}</span></td>";
        echo "<td><span class='badge badge-warning'>{$row['asignados']}</span></td>";
        echo "<td><span class='badge badge-warning'>{$row['en_proceso']}</span></td>";
        echo "<td><span class='badge badge-success'>{$row['resueltos']}</span></td>";
        echo "<td><span class='badge badge-secondary'>{$row['cerrados']}</span></td>";
        echo "</tr>";
    }
    echo "</table>";
} else {
    echo "<div class='warning'>⚠️ No hay tickets registrados</div>";
}

// ============================================================
// 5. ETIQUETAS POR CATEGORÍA
// ============================================================
echo "<h2>🏷️ Etiquetas por Categoría</h2>";
$sql = "SELECT c.nombre as categoria,
        GROUP_CONCAT(e.nombre SEPARATOR ', ') as etiquetas,
        COUNT(e.id_etiqueta) as num_etiquetas
        FROM categoria_ticket c
        LEFT JOIN categoria_etiqueta ce ON ce.id_categoria_ticket = c.id_categoria
        LEFT JOIN etiqueta e ON e.id_etiqueta = ce.id_etiqueta
        GROUP BY c.id_categoria, c.nombre
        ORDER BY num_etiquetas DESC";

$result = $conn->query($sql);

if ($result->num_rows > 0) {
    echo "<table>";
    echo "<tr><th>Categoría</th><th>Cantidad</th><th>Etiquetas</th></tr>";
    while($row = $result->fetch_assoc()) {
        $etiquetas = $row['etiquetas'] ? $row['etiquetas'] : '<em>Sin etiquetas</em>';
        echo "<tr>";
        echo "<td><strong>{$row['categoria']}</strong></td>";
        echo "<td><span class='badge badge-info'>{$row['num_etiquetas']}</span></td>";
        echo "<td>$etiquetas</td>";
        echo "</tr>";
    }
    echo "</table>";
}

// ============================================================
// 6. ENLACES DE API PARA PRUEBAS
// ============================================================
echo "<h2>🔗 Enlaces de API para Pruebas</h2>";
echo "<div class='info'>";
echo "<h3>Categorías:</h3>";
echo "<a href='/apiticket/categoria_ticket' class='api-link' target='_blank'>📋 Listar Todas las Categorías</a>";
echo "<a href='/apiticket/categoria_ticket/1' class='api-link' target='_blank'>🔍 Ver Detalle Categoría 1</a>";
echo "<a href='/apiticket/categoria_ticket/2' class='api-link' target='_blank'>🔍 Ver Detalle Categoría 2</a>";

echo "<h3>Técnicos:</h3>";
echo "<a href='/apiticket/tecnico' class='api-link' target='_blank'>👥 Listar Todos los Técnicos</a>";
echo "<a href='/apiticket/tecnico/1' class='api-link' target='_blank'>👨‍💻 Ver Detalle Técnico 1</a>";
echo "<a href='/apiticket/tecnico/2' class='api-link' target='_blank'>👨‍💻 Ver Detalle Técnico 2</a>";

echo "<h3>Tickets:</h3>";
echo "<a href='/apiticket/ticket' class='api-link' target='_blank'>🎫 Listar Todos los Tickets</a>";
echo "<a href='/apiticket/ticket/100001' class='api-link' target='_blank'>📄 Ver Detalle Ticket 100001</a>";
echo "<a href='/apiticket/ticket/getTicketByTecnico/1' class='api-link' target='_blank'>📋 Tickets del Técnico 1</a>";

echo "<h3>Frontend:</h3>";
echo "<a href='/apiticket/appTaskSolve/' class='api-link' target='_blank'>🌐 Abrir Aplicación Frontend</a>";
echo "</div>";

echo "
    </div>
</body>
</html>
";

$conn->close();
?>
