-- ============================================================
-- SCRIPT DE INSERCIÓN DE DATOS DE PRUEBA
-- Sistema de Tickets - Categorías y Técnicos
-- ============================================================

USE ticket_system;

-- ============================================================
-- 1. VERIFICAR DATOS EXISTENTES
-- ============================================================

SELECT '=== CATEGORÍAS EXISTENTES ===' AS Info;
SELECT id_categoria, nombre, id_sla FROM categoria_ticket ORDER BY id_categoria;

SELECT '=== TÉCNICOS EXISTENTES ===' AS Info;
SELECT t.id_tecnico, u.nombre, u.correo, u.activo 
FROM tecnico t 
JOIN usuario u ON t.id_usuario = u.cedula
ORDER BY t.id_tecnico;

SELECT '=== SLAs DISPONIBLES ===' AS Info;
SELECT id_sla, nombre, tiempo_respuesta_min, tiempo_respuesta_max, 
       tiempo_resolucion_min, tiempo_resolucion_max 
FROM sla ORDER BY id_sla;

SELECT '=== ESPECIALIDADES EXISTENTES ===' AS Info;
SELECT id_especialidad, nombre FROM especialidad ORDER BY id_especialidad;

SELECT '=== ETIQUETAS EXISTENTES ===' AS Info;
SELECT id_etiqueta, nombre FROM etiqueta ORDER BY id_etiqueta;

-- ============================================================
-- 2. INSERTAR NUEVOS TÉCNICOS (OPCIONAL)
-- ============================================================

-- Primero insertar usuarios que serán técnicos
INSERT INTO usuario (cedula, nombre, correo, contrasena, id_rol, activo, fecha_creacion) VALUES
('1-1234-5678', 'María González', 'maria.gonzalez@empresa.com', '$2y$10$abcdefghijklmnopqrstuvwxyz1234567890', 3, 1, NOW()),
('2-2345-6789', 'Carlos Rodríguez', 'carlos.rodriguez@empresa.com', '$2y$10$abcdefghijklmnopqrstuvwxyz1234567890', 3, 1, NOW()),
('3-3456-7890', 'Laura Fernández', 'laura.fernandez@empresa.com', '$2y$10$abcdefghijklmnopqrstuvwxyz1234567890', 3, 1, NOW())
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

-- Luego crear los técnicos
INSERT INTO tecnico (id_usuario) VALUES
('1-1234-5678'),
('2-2345-6789'),
('3-3456-7890')
ON DUPLICATE KEY UPDATE id_usuario=VALUES(id_usuario);

-- ============================================================
-- 3. INSERTAR NUEVAS CATEGORÍAS (OPCIONAL)
-- ============================================================

-- Categoría adicional de ejemplo
INSERT INTO categoria_ticket (nombre, id_sla) VALUES
('Seguridad y Antivirus', 2),
('Backup y Recuperación de Datos', 3),
('Desarrollo y Pruebas', 4)
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

-- ============================================================
-- 4. INSERTAR ESPECIALIDADES ADICIONALES (OPCIONAL)
-- ============================================================

INSERT INTO especialidad (nombre) VALUES
('Seguridad informática'),
('Administración de servidores'),
('Desarrollo de aplicaciones'),
('Análisis de datos'),
('Soporte técnico nivel 1'),
('Soporte técnico nivel 2'),
('Virtualización'),
('Cloud computing')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

-- ============================================================
-- 5. INSERTAR ETIQUETAS ADICIONALES (OPCIONAL)
-- ============================================================

INSERT INTO etiqueta (nombre) VALUES
('Urgente'),
('Planificado'),
('Recurrente'),
('Primera vez'),
('Requiere aprobación'),
('Fuera de horario'),
('Remoto'),
('Presencial')
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

-- ============================================================
-- 6. ASOCIAR ETIQUETAS CON CATEGORÍAS (OPCIONAL)
-- ============================================================

-- Obtener IDs de las nuevas categorías y etiquetas
SET @cat_seguridad = (SELECT id_categoria FROM categoria_ticket WHERE nombre = 'Seguridad y Antivirus' LIMIT 1);
SET @cat_backup = (SELECT id_categoria FROM categoria_ticket WHERE nombre = 'Backup y Recuperación de Datos' LIMIT 1);
SET @cat_desarrollo = (SELECT id_categoria FROM categoria_ticket WHERE nombre = 'Desarrollo y Pruebas' LIMIT 1);

SET @etq_urgente = (SELECT id_etiqueta FROM etiqueta WHERE nombre = 'Urgente' LIMIT 1);
SET @etq_planificado = (SELECT id_etiqueta FROM etiqueta WHERE nombre = 'Planificado' LIMIT 1);
SET @etq_recurrente = (SELECT id_etiqueta FROM etiqueta WHERE nombre = 'Recurrente' LIMIT 1);

-- Asociaciones de ejemplo (solo si existen las categorías y etiquetas)
INSERT IGNORE INTO categoria_etiqueta (id_categoria, id_etiqueta) VALUES
(@cat_seguridad, @etq_urgente),
(@cat_seguridad, @etq_recurrente),
(@cat_backup, @etq_planificado),
(@cat_backup, @etq_recurrente),
(@cat_desarrollo, @etq_planificado);

-- ============================================================
-- 7. INSERTAR TICKETS DE PRUEBA CON DIFERENTES CATEGORÍAS
-- ============================================================

-- Obtener IDs de técnicos y usuarios para los tickets
SET @tecnico1 = (SELECT id_tecnico FROM tecnico LIMIT 1 OFFSET 0);
SET @tecnico2 = (SELECT id_tecnico FROM tecnico LIMIT 1 OFFSET 1);
SET @tecnico3 = (SELECT id_tecnico FROM tecnico LIMIT 1 OFFSET 2);

SET @usuario1 = (SELECT cedula FROM usuario WHERE id_rol = 2 LIMIT 1);
SET @estado_abierto = (SELECT id_estado FROM estado WHERE nombre = 'Abierto' LIMIT 1);
SET @estado_asignado = (SELECT id_estado FROM estado WHERE nombre = 'Asignado' LIMIT 1);

-- Tickets de prueba
INSERT INTO ticket (id_ticket, titulo, descripcion, fecha_creacion, id_usuario, id_tecnico, id_categoria, id_estado_actual, prioridad) VALUES
(100007, 'Instalación de antivirus en nuevas estaciones', 'Se requiere instalar y configurar antivirus en 5 estaciones nuevas', NOW(), @usuario1, @tecnico1, @cat_seguridad, @estado_asignado, 'Media'),
(100008, 'Respaldo semanal no se ejecutó', 'El respaldo automático de la semana pasada falló', NOW(), @usuario1, @tecnico2, @cat_backup, @estado_asignado, 'Alta'),
(100009, 'Configurar ambiente de desarrollo', 'Necesito un ambiente de desarrollo para nuevo proyecto', NOW(), @usuario1, @tecnico3, @cat_desarrollo, @estado_abierto, 'Baja')
ON DUPLICATE KEY UPDATE titulo=VALUES(titulo);

-- ============================================================
-- 8. VERIFICAR DATOS DESPUÉS DE INSERCIÓN
-- ============================================================

SELECT '=== RESUMEN FINAL ===' AS Info;

SELECT '--- Total de Categorías ---' AS Detalle;
SELECT COUNT(*) as total_categorias FROM categoria_ticket;

SELECT '--- Total de Técnicos ---' AS Detalle;
SELECT COUNT(*) as total_tecnicos FROM tecnico;

SELECT '--- Total de Tickets ---' AS Detalle;
SELECT COUNT(*) as total_tickets FROM ticket;

SELECT '--- Tickets por Categoría ---' AS Detalle;
SELECT c.nombre as categoria, COUNT(t.id_ticket) as cantidad_tickets
FROM categoria_ticket c
LEFT JOIN ticket t ON t.id_categoria = c.id_categoria
GROUP BY c.id_categoria, c.nombre
ORDER BY cantidad_tickets DESC;

SELECT '--- Tickets por Técnico ---' AS Detalle;
SELECT u.nombre as tecnico, COUNT(t.id_ticket) as tickets_asignados
FROM tecnico te
JOIN usuario u ON te.id_usuario = u.cedula
LEFT JOIN ticket t ON t.id_tecnico = te.id_tecnico
GROUP BY te.id_tecnico, u.nombre
ORDER BY tickets_asignados DESC;

SELECT '--- Etiquetas por Categoría ---' AS Detalle;
SELECT c.nombre as categoria, COUNT(ce.id_etiqueta) as num_etiquetas
FROM categoria_ticket c
LEFT JOIN categoria_etiqueta ce ON ce.id_categoria = c.id_categoria
GROUP BY c.id_categoria, c.nombre
ORDER BY num_etiquetas DESC;

-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================
