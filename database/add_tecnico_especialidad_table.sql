-- Script para agregar tabla intermedia tecnico_especialidad
-- Esta tabla permite que un técnico tenga múltiples especialidades

USE ticket_system;

-- Crear tabla intermedia tecnico_especialidad
CREATE TABLE IF NOT EXISTS tecnico_especialidad (
  id_tecnico INT NOT NULL,
  id_especialidad INT NOT NULL,
  PRIMARY KEY (id_tecnico, id_especialidad),
  FOREIGN KEY (id_tecnico) REFERENCES tecnico(id_tecnico)
    ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (id_especialidad) REFERENCES especialidad(id_especialidad)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Índices para mejorar rendimiento de búsquedas
CREATE INDEX idx_tecnico ON tecnico_especialidad(id_tecnico);
CREATE INDEX idx_especialidad ON tecnico_especialidad(id_especialidad);

SELECT 'Tabla tecnico_especialidad creada exitosamente' AS resultado;
