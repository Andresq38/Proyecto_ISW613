# 🔄 Guía de Migración de Base de Datos

## Cambios Recientes (Nov 2025)

### Nueva Tabla: `tecnico_especialidad`

Se agregó una tabla intermedia para manejar la relación muchos a muchos entre técnicos y especialidades.

---

## 📋 Para Desarrolladores que ya tienen el proyecto

Si ya tenías el proyecto clonado y la base de datos creada, necesitas ejecutar esta migración:

### Opción 1: Script de Migración Rápida (Recomendado)

Ejecuta en PowerShell (desde la carpeta del proyecto):

```powershell
Get-Content .\database\add_tecnico_especialidad_table.sql | C:\xampp\mysql\bin\mysql.exe -u root -p123456
```

### Opción 2: Ejecutar en phpMyAdmin

1. Abre phpMyAdmin (http://localhost/phpmyadmin)
2. Selecciona la base de datos `ticket_system`
3. Ve a la pestaña **SQL**
4. Copia y pega el contenido de `add_tecnico_especialidad_table.sql`
5. Haz clic en **Continuar**

### Opción 3: Recrear Base de Datos Completa

⚠️ **ADVERTENCIA: Esto eliminará todos los datos**

```powershell
Get-Content .\database\schema.sql | C:\xampp\mysql\bin\mysql.exe -u root -p123456
```

---

## 🆕 Para Nuevos Desarrolladores

Si es tu primera vez clonando el proyecto:

1. Asegúrate de tener XAMPP instalado y MySQL corriendo
2. Ejecuta el schema completo:

```powershell
Get-Content .\database\schema.sql | C:\xampp\mysql\bin\mysql.exe -u root -p123456
```

---

## ✅ Verificar que la migración fue exitosa

Ejecuta en MySQL:

```sql
USE ticket_system;
SHOW TABLES LIKE 'tecnico_especialidad';
```

Deberías ver la tabla listada.

---

## 🐛 Problemas Comunes

### Error: "Access denied for user 'root'@'localhost'"

Tu contraseña de MySQL es diferente. Cambia `-p123456` por tu contraseña.

### Error: "Table already exists"

Ya tienes la migración aplicada. ¡No necesitas hacer nada! ✓

---

## 📝 Cambios en el Código

Esta migración afecta:
- ✅ `TecnicoModel.php` - Métodos `get()`, `create()`, `update()`
- ✅ `EditTecnico.jsx` - Formulario de edición de técnicos
- ✅ Ahora las especialidades se guardan y cargan correctamente

---

## 📞 Contacto

Si tienes problemas con la migración, contacta al equipo de desarrollo.
