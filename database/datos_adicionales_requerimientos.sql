-- ============================================================
-- SCRIPT DE DATOS ADICIONALES PARA CUMPLIR REQUERIMIENTOS
-- Sistema de Tickets - Datos de Prueba Completos
-- ============================================================

USE ticket_system;

-- ============================================================
-- 1. AGREGAR TICKETS EN ESTADO PENDIENTE (para probar asignación)
-- ============================================================

-- Ticket Pendiente 1 - Prioridad Alta
INSERT INTO ticket (
    titulo,
    descripcion,
    fecha_creacion,
    prioridad,
    id_estado,
    id_usuario,
    id_categoria
) VALUES (
    'Problema urgente con acceso al sistema de nómina',
    'No puedo acceder al sistema de nómina para procesar los pagos de este mes. Es urgente.',
    NOW(),
    'Alta',
    1, -- Pendiente
    '1-1343-0736', -- Dayne Mora (Cliente)
    3 -- Gestión de Usuarios y Accesos
);

-- Ticket Pendiente 2 - Prioridad Media
INSERT INTO ticket (
    titulo,
    descripcion,
    fecha_creacion,
    prioridad,
    id_estado,
    id_usuario,
    id_categoria
) VALUES (
    'Solicitud de instalación de Office 365',
    'Necesito que instalen Microsoft Office 365 en mi equipo nuevo para poder trabajar con documentos.',
    NOW(),
    'Media',
    1, -- Pendiente
    '2-0901-0847', -- Aarón Segura (Cliente)
    2 -- Soporte de Software y Aplicaciones
);

-- Ticket Pendiente 3 - Prioridad Baja
INSERT INTO ticket (
    titulo,
    descripcion,
    fecha_creacion,
    prioridad,
    id_estado,
    id_usuario,
    id_categoria
) VALUES (
    'Solicitud de mouse inalámbrico adicional',
    'Me gustaría tener un mouse inalámbrico adicional para mi laptop cuando trabajo en casa.',
    NOW(),
    'Baja',
    1, -- Pendiente
    '2-0583-0022', -- Rodolfo Segura (Cliente)
    1 -- Gestión y Soporte de Equipamiento Tecnológico
);

-- Ticket Pendiente 4 - Prioridad Alta (Red)
INSERT INTO ticket (
    titulo,
    descripcion,
    fecha_creacion,
    prioridad,
    id_estado,
    id_usuario,
    id_categoria
) VALUES (
    'Falla en conexión de red en departamento de contabilidad',
    'Todo el departamento de contabilidad no tiene acceso a la red desde hace 2 horas. Es crítico.',
    NOW(),
    'Alta',
    1, -- Pendiente
    '4-5566-7788', -- Ana Rodríguez (Cliente)
    4 -- Red y Conectividad
);

-- Ticket Pendiente 5 - Prioridad Media (Servicios Especiales)
INSERT INTO ticket (
    titulo,
    descripcion,
    fecha_creacion,
    prioridad,
    id_estado,
    id_usuario,
    id_categoria
) VALUES (
    'Instalación de software especializado de diseño',
    'Necesito que instalen Adobe Creative Cloud para trabajar en el proyecto de marketing.',
    NOW(),
    'Media',
    1, -- Pendiente
    '5-9900-2211', -- María Sandi (Cliente)
    5 -- Servicios Especiales / Requerimientos Específicos
);

-- ============================================================
-- 2. AGREGAR REGISTROS AL HISTORIAL DE ESTADOS EXISTENTE
-- ============================================================

-- Agregar historial para el ticket 100001 (Asignado)
INSERT INTO historial_estados (id_ticket, id_estado, fecha_cambio, observaciones) VALUES
(100001, 1, '2025-10-21 16:53:36', 'Ticket creado por el cliente. Estado inicial: Pendiente'),
(100001, 2, '2025-10-21 17:00:00', 'Ticket asignado al técnico Joseph Segura para revisión');

-- Agregar historial para el ticket 100002 (Cerrado)
INSERT INTO historial_estados (id_ticket, id_estado, fecha_cambio, observaciones) VALUES
(100002, 1, '2025-10-16 18:53:36', 'Ticket creado. Solicitud de mouse inalámbrico'),
(100002, 2, '2025-10-17 09:00:00', 'Asignado a técnico Andrés Castillo'),
(100002, 3, '2025-10-17 10:30:00', 'Técnico en proceso de entrega del equipo'),
(100002, 4, '2025-10-17 14:00:00', 'Mouse entregado. Esperando confirmación del cliente'),
(100002, 5, '2025-10-18 18:53:36', 'Cliente confirmó recepción. Ticket cerrado');

-- Agregar historial para el ticket 100003 (En Proceso)
INSERT INTO historial_estados (id_ticket, id_estado, fecha_cambio, observaciones) VALUES
(100003, 1, '2025-10-20 18:53:36', 'Ticket creado. Configuración de VPN solicitada'),
(100003, 2, '2025-10-21 08:00:00', 'Asignado a técnico Andrés Quesada'),
(100003, 3, '2025-10-21 09:15:00', 'Iniciando configuración de acceso VPN');

-- Agregar historial para el ticket 100004 (Resuelto)
INSERT INTO historial_estados (id_ticket, id_estado, fecha_cambio, observaciones) VALUES
(100004, 1, '2025-10-21 12:53:36', 'Ticket creado. Restablecimiento de contraseña urgente'),
(100004, 2, '2025-10-21 12:55:00', 'Asignado inmediatamente por prioridad alta'),
(100004, 3, '2025-10-21 13:00:00', 'Técnico trabajando en restablecimiento'),
(100004, 4, '2025-10-21 13:15:00', 'Contraseña restablecida exitosamente. Cliente notificado');

-- ============================================================
-- 3. AGREGAR MÁS USUARIOS DE PRUEBA (para diversidad)
-- ============================================================

-- Cliente adicional
INSERT INTO usuario (id_usuario, nombre, correo, password, id_rol) VALUES
('6-1234-5678', 'Carlos Ramírez', 'cramirezt@empresa.com', SHA2('Cliente123', 256), 3);

-- Técnico adicional
INSERT INTO usuario (id_usuario, nombre, correo, password, id_rol) VALUES
('7-8765-4321', 'Laura Méndez', 'lmendez@empresa.com', SHA2('Tecnico456', 256), 2);

INSERT INTO tecnico (id_usuario, disponibilidad, carga_trabajo) VALUES
('7-8765-4321', TRUE, 0);

-- Asignar especialidades al nuevo técnico (Laura Méndez)
-- Especialidades relacionadas con Software (id_categoria=2)
INSERT INTO tecnico_especialidad (id_tecnico, id_especialidad) 
SELECT 
    (SELECT id_tecnico FROM tecnico WHERE id_usuario = '7-8765-4321'),
    id_especialidad 
FROM especialidad 
WHERE id_categoria = 2 
LIMIT 2;

-- ============================================================
-- 4. ASOCIAR ESPECIALIDADES A TÉCNICOS EXISTENTES
-- ============================================================

-- Joseph Segura (id_tecnico=1) - Especialidades de Software y Gestión de Usuarios
INSERT IGNORE INTO tecnico_especialidad (id_tecnico, id_especialidad) VALUES
(1, 7),  -- Soporte de software corporativo
(1, 8),  -- Gestión de incidencias en aplicaciones
(1, 11), -- Gestión de directorio activo
(1, 12); -- Administración de cuentas corporativas

-- Andrés Quesada (id_tecnico=2) - Especialidades de Red y Equipamiento
INSERT IGNORE INTO tecnico_especialidad (id_tecnico, id_especialidad) VALUES
(2, 1),  -- Instalación y estaciones de trabajo
(2, 15), -- Diagnóstico de red
(2, 16), -- Configuración de VPN
(2, 17); -- Soporte de conexión remota

-- Andrés Castillo (id_tecnico=3) - Especialidades de Equipamiento y Mantenimiento
INSERT IGNORE INTO tecnico_especialidad (id_tecnico, id_especialidad) VALUES
(3, 2),  -- Diagnóstico y reparación
(3, 3),  -- Mantenimiento programado
(3, 4),  -- Control y actualización del inventario
(3, 5);  -- Gestión de logística

-- ============================================================
-- 5. CREAR ALGUNAS NOTIFICACIONES DE EJEMPLO
-- ============================================================

-- Notificación de inicio de sesión
INSERT INTO notificacion (id_usuario_destinatario, tipo_evento, mensaje, estado, fecha_hora) VALUES
('1-1343-0736', 'Inicio de sesión', 'Has iniciado sesión exitosamente el 20/11/2025 a las 08:30', 'Leida', '2025-11-20 08:30:00');

-- Notificación de cambio de estado
INSERT INTO notificacion (id_usuario_destinatario, id_usuario_remitente, tipo_evento, mensaje, estado, fecha_hora) VALUES
('2-0901-0847', '2-0854-0194', 'Cambio de estado de ticket', 'El ticket #100001 ha cambiado a estado: Asignado. Observación: Ticket asignado al técnico Joseph Segura', 'No Leida', '2025-10-21 17:00:00');

-- Notificación al técnico
INSERT INTO notificacion (id_usuario_destinatario, id_usuario_remitente, tipo_evento, mensaje, estado, fecha_hora) VALUES
('2-0854-0194', '1-2345-6789', 'Cambio de estado de ticket', 'El ticket #100001 asignado a ti ha cambiado a estado: Asignado. Observación: Ticket asignado al técnico', 'No Leida', '2025-10-21 17:00:00');

-- ============================================================
-- 6. VERIFICAR DATOS INSERTADOS
-- ============================================================

SELECT '=== TICKETS EN ESTADO PENDIENTE ===' AS Info;
SELECT id_ticket, titulo, prioridad, id_usuario, id_categoria 
FROM ticket 
WHERE id_estado = 1;

SELECT '=== HISTORIAL DE ESTADOS REGISTRADOS ===' AS Info;
SELECT h.id_historial, h.id_ticket, e.nombre AS estado, h.fecha_cambio, 
       LEFT(h.observaciones, 50) AS observaciones_breves
FROM historial_estados h
JOIN estado e ON e.id_estado = h.id_estado
ORDER BY h.id_ticket, h.fecha_cambio;

SELECT '=== TÉCNICOS CON ESPECIALIDADES ===' AS Info;
SELECT t.id_tecnico, u.nombre, COUNT(te.id_especialidad) AS cantidad_especialidades
FROM tecnico t
JOIN usuario u ON t.id_usuario = u.id_usuario
LEFT JOIN tecnico_especialidad te ON te.id_tecnico = t.id_tecnico
GROUP BY t.id_tecnico, u.nombre;

SELECT '=== NOTIFICACIONES CREADAS ===' AS Info;
SELECT id_notificacion, tipo_evento, id_usuario_destinatario, estado, fecha_hora
FROM notificacion
ORDER BY fecha_hora DESC;

SELECT '=== RESUMEN GENERAL ===' AS Info;
SELECT 
    (SELECT COUNT(*) FROM ticket) AS total_tickets,
    (SELECT COUNT(*) FROM ticket WHERE id_estado = 1) AS tickets_pendientes,
    (SELECT COUNT(*) FROM tecnico) AS total_tecnicos,
    (SELECT COUNT(*) FROM usuario WHERE id_rol = 3) AS total_clientes,
    (SELECT COUNT(*) FROM notificacion) AS total_notificaciones;

-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================
