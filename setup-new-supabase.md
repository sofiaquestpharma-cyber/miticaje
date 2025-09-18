# 🚀 Configuración Completa - Nueva Cuenta Supabase

## 📋 Información de la Nueva Cuenta

- **Organización ID**: `uwavqnkwjcatsgconsda`
- **Access Token**: `sbp_10db2f4fa1090d36b40e6a41f6d0c566c9ba391f`
- **Dashboard**: https://supabase.com/dashboard/org/uwavqnkwjcatsgconsda

## 🔧 Pasos de Configuración

### 1. Crear Nuevo Proyecto

1. Ve a: https://supabase.com/dashboard/org/uwavqnkwjcatsgconsda
2. Clic en **"New Project"**
3. Configurar proyecto:
   - **Name**: `MiTicaje Quest Pharma`
   - **Database Password**: `[CREAR_PASSWORD_SEGURO]`
   - **Region**: `Europe West (Ireland)` o la más cercana
   - **Pricing Plan**: Free o Pro según necesidades

### 2. Ejecutar Migración SQL

1. Una vez creado el proyecto, ve a **SQL Editor**
2. Copia y pega el contenido completo de `complete-migration.sql`
3. Ejecuta la migración (clic en **"Run"**)
4. Verifica que aparezca: ✅ Migración completada exitosamente

### 3. Obtener Credenciales del Nuevo Proyecto

1. Ve a **Settings > API**
2. Copia las siguientes credenciales:
   - **Project URL**: `https://[nuevo-project-id].supabase.co`
   - **Anon Key**: `eyJ...` (clave pública)
   - **Service Role Key**: `eyJ...` (clave privada - ¡MANTENER SECRETA!)

### 4. Actualizar Script de Restauración

Edita el archivo `restore-supabase.js` y actualiza:

```javascript
// CONFIGURACIÓN DE LA NUEVA CUENTA SUPABASE
const NEW_SUPABASE_URL = 'https://[TU-NUEVO-PROJECT-ID].supabase.co'
const NEW_SUPABASE_ANON_KEY = 'tu-nueva-anon-key-aqui'
```

### 5. Ejecutar Restauración de Datos

```bash
# Restaurar todos los datos del backup
node restore-supabase.js --confirm
```

### 6. Crear Usuario Administrador

1. Ve a **Authentication > Users** en el dashboard
2. Clic en **"Add user"**
3. Configurar usuario:
   - **Email**: `sofiaquestpharma@gmail.com`
   - **Password**: `Mi perro es feo y blanco*1`
   - **Confirm Password**: `Mi perro es feo y blanco*1`
   - **Auto Confirm User**: ✅ Marcado
4. Clic en **"Create user"**

### 7. Configurar Variables de Entorno

Actualiza tu archivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://[nuevo-project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[nueva-anon-key]
```

### 8. Verificar Configuración

```bash
# Probar la aplicación localmente
npm run dev
```

1. Accede a http://localhost:3000
2. Prueba el login de administrador
3. Verifica que aparezcan los datos restaurados
4. Prueba el fichaje con el empleado ID: `1`, PIN: `1234`

## 📊 Datos que se Restaurarán

- ✅ **1 Empleado**: María Isabel Crespo (ID: 1, PIN: 1234)
- ✅ **1 Centro de Trabajo**: Quest Pharma Laboratorio
- ✅ **218 Registros de Tiempo**: Historial completo marzo-septiembre 2025
- ✅ **3 Configuraciones**: Ajustes del sistema
- ✅ **Ubicaciones GPS**: Coordenadas reales de Fuente Álamo

## 🔒 Seguridad Post-Configuración

### Verificar RLS (Row Level Security)
1. Ve a **Database > Tables**
2. Verifica que todas las tablas tengan RLS habilitado
3. Revisa las políticas de seguridad

### Configurar Autenticación
1. Ve a **Authentication > Settings**
2. Configurar según necesidades:
   - **Site URL**: URL de tu aplicación en producción
   - **Redirect URLs**: URLs permitidas para redirección

## 🚀 Despliegue en Vercel

Una vez configurado Supabase:

1. **Actualizar repositorio GitHub** con nuevas credenciales
2. **Configurar variables en Vercel**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://[nuevo-project-id].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[nueva-anon-key]
   ```
3. **Redesplegar** la aplicación

## 📞 Soporte

Si encuentras algún problema:

1. **Verificar logs** en Supabase Dashboard > Logs
2. **Revisar políticas RLS** si hay errores de permisos
3. **Comprobar conexión** con las nuevas credenciales

## ✅ Checklist Final

- [ ] Proyecto Supabase creado
- [ ] Migración SQL ejecutada exitosamente
- [ ] Credenciales obtenidas y guardadas
- [ ] Script de restauración actualizado
- [ ] Backup restaurado completamente
- [ ] Usuario administrador creado
- [ ] Variables de entorno actualizadas
- [ ] Aplicación probada localmente
- [ ] RLS verificado y funcionando
- [ ] Aplicación desplegada en Vercel

---

🎉 **¡Configuración completada! Tu nueva instancia de MiTicaje Quest Pharma está lista.**
