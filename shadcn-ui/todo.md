# Monitor de Recursos del Sistema - Plan de Desarrollo

## Archivos a Crear (MVP - Máximo 8 archivos)

### 1. Backend API (Node.js/Express)
- **server/index.js** - Servidor Express con endpoints para métricas del sistema y autenticación
  - GET /api/system/metrics - Métricas en tiempo real (CPU, RAM, Disco, Red, Temperatura)
  - POST /api/auth/login - Login de usuarios
  - GET /api/auth/verify - Verificar token JWT
  - GET /api/users - Listar usuarios (admin)
  - POST /api/users/approve - Aprobar usuarios (admin)

### 2. Base de Datos
- **server/database.js** - Configuración SQLite con usuario admin predefinido

### 3. Frontend (React/TypeScript)
- **src/pages/Login.tsx** - Página de inicio de sesión
- **src/pages/Dashboard.tsx** - Dashboard principal con monitoreo de recursos
- **src/pages/UserManagement.tsx** - Gestión de usuarios (solo admin)
- **src/lib/api.ts** - Cliente API para comunicación con backend

### 4. Docker
- **Dockerfile** - Imagen Docker multi-stage para frontend y backend
- **docker-compose.yml** - Configuración completa con puerto 7772

## Características Implementadas
- ✅ Monitoreo en tiempo real de recursos del sistema
- ✅ Autenticación JWT
- ✅ Usuario admin predefinido (rdk / *Ra8097164412)
- ✅ Gestión de usuarios con aprobación
- ✅ Diseño moderno inspirado en la imagen
- ✅ Puerto 7772
- ✅ Docker Compose para instalación automática

## Notas de Implementación
- Usar librería `systeminformation` para obtener métricas del sistema
- SQLite para base de datos (archivo persistente en volumen Docker)
- JWT para autenticación
- WebSocket o polling para actualización en tiempo real
- Diseño responsive con Tailwind CSS
