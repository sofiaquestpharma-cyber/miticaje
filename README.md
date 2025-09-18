# 🕐 MiTicaje Quest Pharma - Sistema de Control Horario

Sistema moderno de control horario con geolocalización para Quest Pharma Laboratorio, desarrollado con Next.js y Supabase.

## 🚀 Características

- ✅ **Fichaje con geolocalización** automática
- ✅ **Panel de administración** completo
- ✅ **Gestión de empleados** y centros de trabajo
- ✅ **Reportes y estadísticas** en tiempo real
- ✅ **PWA** - Funciona como app móvil
- ✅ **Responsive** - Adaptado a todos los dispositivos

## 🛠️ Tecnologías

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Geolocalización**: API nativa del navegador
- **UI**: shadcn/ui components

## 📦 Despliegue en Vercel

### 1. Preparar Supabase

1. Crea un proyecto en [Supabase](https://supabase.com)
2. Ejecuta las migraciones SQL (ver carpeta `sql/`)
3. Configura las políticas RLS
4. Obtén las credenciales del proyecto

### 2. Variables de Entorno

Configura estas variables en Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

### 3. Desplegar en Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/tu-usuario/miticaje)

O manualmente:

```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel --prod
```

## 🔧 Desarrollo Local

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales

# Ejecutar en desarrollo
npm run dev
```

## 👥 Usuarios por Defecto

### Administrador
- **Email**: `admin@empresa.com`
- **Contraseña**: `admin123`

### Empleado de Prueba
- **ID**: `1`
- **PIN**: `1234`
- **Nombre**: María Isabel Crespo

## 📱 Uso

### Para Empleados
1. Acceder a la aplicación
2. Introducir ID de empleado y PIN
3. Fichar entrada/salida con geolocalización automática

### Para Administradores
1. Hacer clic en "Acceso Administradores"
2. Iniciar sesión con email y contraseña
3. Gestionar empleados, ver reportes, configurar sistema

## 🔒 Seguridad

- ✅ **Row Level Security** habilitado en Supabase
- ✅ **Autenticación JWT** para administradores
- ✅ **Validación de geolocalización**
- ✅ **Políticas de acceso** granulares

## 📊 Funcionalidades Admin

- **Gestión de Empleados**: Crear, editar, desactivar
- **Centros de Trabajo**: Múltiples ubicaciones
- **Registros de Tiempo**: Ver, editar, exportar
- **Estadísticas**: Horas trabajadas, reportes
- **Configuración**: Ajustes del sistema

## 🌍 Geolocalización

El sistema registra automáticamente:
- Coordenadas GPS (latitud/longitud)
- Precisión del GPS
- Dirección aproximada
- Timestamp de ubicación

## 📄 Licencia

MIT License - Ver archivo `LICENSE` para más detalles.

## 🤝 Contribuir

1. Fork del proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📞 Soporte

Para soporte técnico o consultas:
- 📧 Email: soporte@miticaje.com
- 📱 WhatsApp: +34 XXX XXX XXX
- 🌐 Web: https://miticaje.com

---

Desarrollado con ❤️ para Quest Pharma Laboratorio
