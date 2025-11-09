# 🚀 RDK Server Monitor

Monitor de recursos del sistema en tiempo real para servidores Ubuntu con CasaOS.

![Dashboard Preview](https://img.shields.io/badge/Status-Production%20Ready-success)
![Docker](https://img.shields.io/badge/Docker-Ready-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## 📋 Características

- ✅ **Monitoreo en tiempo real** - Actualización cada 3 segundos
- ✅ **CPU** - Uso, núcleos, modelo, temperatura
- ✅ **Memoria RAM** - Uso total, porcentaje, gráficos
- ✅ **Almacenamiento** - Uso por partición, espacio disponible
- ✅ **Red** - Tráfico de entrada/salida por interfaz
- ✅ **Procesos** - Top 10 procesos por CPU/RAM
- ✅ **Sistema de autenticación** - Login seguro con JWT
- ✅ **Gestión de usuarios** - Aprobación de usuarios por admin
- ✅ **Roles** - Administrador y Usuario
- ✅ **Diseño moderno** - Interfaz responsive con Tailwind CSS

## 🛠️ Stack Tecnológico

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- React Router

### Backend
- Node.js + Express
- SQLite (base de datos)
- JWT (autenticación)
- systeminformation (métricas del sistema)
- bcryptjs (encriptación)

### DevOps
- Docker + Docker Compose
- Multi-stage build
- Volúmenes persistentes

## 🚀 Instalación Rápida

### Requisitos Previos
- Docker y Docker Compose instalados
- Puerto 7771 disponible
- Ubuntu Server con CasaOS (recomendado)

### Opción 1: Docker Compose (Recomendada)

```bash
# 1. Clonar o copiar el proyecto
cd ~/
mkdir rdk-server-monitor
cd rdk-server-monitor

# 2. Copiar todos los archivos del proyecto aquí

# 3. Construir y ejecutar
docker-compose up -d

# 4. Ver logs
docker-compose logs -f
```

### Opción 2: Portainer

1. Abrir Portainer en tu navegador
2. Ir a **Stacks → Add Stack**
3. Nombre: `rdk-server-monitor`
4. Copiar contenido de `docker-compose.yml`
5. Click en **Deploy the stack**

## 🔐 Acceso

### URL de Acceso
- **Local:** http://localhost:7771
- **Dominio:** http://sas.rdktech.us (configurar en Cloudflare)

### Credenciales Predefinidas
- **Usuario:** `rdk`
- **Contraseña:** `*Ra8097164412`

## 🌐 Configuración de Cloudflare

1. Acceder al panel de Cloudflare
2. Ir a **DNS → Add Record**
3. Configurar:
   - Type: `A`
   - Name: `sas`
   - Content: IP de tu servidor
   - Proxy: Activado (nube naranja)
4. SSL/TLS: Full (strict) o Flexible

## 👥 Gestión de Usuarios

### Crear Usuario
1. Página de login → Pestaña "Registrarse"
2. Ingresar usuario y contraseña
3. Estado: Pendiente de aprobación

### Aprobar Usuario (Admin)
1. Login como administrador
2. Click en botón "Usuarios"
3. Seleccionar rol (Usuario/Admin)
4. Click en "Aprobar" o "Rechazar"

## 📊 Dashboard

El dashboard muestra:

| Métrica | Descripción |
|---------|-------------|
| **CPU** | Uso actual, núcleos, modelo, frecuencia |
| **RAM** | Uso total, porcentaje, memoria libre |
| **Disco** | Uso por partición, espacio disponible |
| **Red** | Tráfico entrada/salida por interfaz |
| **Temperatura** | Temperatura del CPU y máxima |
| **Uptime** | Tiempo de actividad del servidor |
| **Procesos** | Top 10 procesos por uso |
| **Sistema** | Información del SO |

## 🔧 Comandos Útiles

```bash
# Ver logs en tiempo real
docker-compose logs -f rdk-server-monitor

# Reiniciar servicio
docker-compose restart

# Detener servicio
docker-compose down

# Actualizar servicio
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Ver estado
docker-compose ps

# Acceder al contenedor
docker-compose exec rdk-server-monitor sh

# Ver uso de recursos del contenedor
docker stats rdk-server-monitor
```

## 📁 Estructura del Proyecto

```
rdk-server-monitor/
├── docker-compose.yml          # Configuración Docker Compose
├── Dockerfile                  # Imagen Docker multi-stage
├── start.sh                    # Script de inicio
├── package.json                # Dependencias
├── server/                     # Backend Node.js
│   ├── index.js               # Servidor Express + API
│   ├── database.js            # SQLite + gestión usuarios
│   └── data/                  # Base de datos (persistente)
│       └── users.db
├── src/                        # Frontend React
│   ├── App.tsx                # Rutas y configuración
│   ├── pages/
│   │   ├── Login.tsx          # Página de login/registro
│   │   ├── Dashboard.tsx      # Dashboard principal
│   │   └── UserManagement.tsx # Gestión de usuarios
│   ├── lib/
│   │   └── api.ts             # Cliente API
│   └── components/ui/         # Componentes shadcn/ui
├── dist/                       # Build del frontend
└── README_INSTALACION.md       # Guía detallada
```

## 🔒 Seguridad

### Recomendaciones
1. ✅ Cambiar `JWT_SECRET` en producción
2. ✅ Usar HTTPS mediante Cloudflare
3. ✅ Cambiar contraseña del admin después del primer login
4. ✅ Configurar firewall para restringir acceso
5. ✅ Mantener Docker actualizado
6. ✅ Realizar backups de la base de datos

### Cambiar JWT Secret

```bash
# Editar docker-compose.yml
nano docker-compose.yml

# Cambiar la línea:
JWT_SECRET=tu-clave-super-secreta-aleatoria

# Reiniciar
docker-compose restart
```

## 🐛 Solución de Problemas

### El servicio no inicia
```bash
# Ver logs detallados
docker-compose logs rdk-server-monitor

# Verificar puertos
sudo netstat -tulpn | grep 7771
sudo netstat -tulpn | grep 3001
```

### Error de permisos
```bash
sudo chmod -R 755 ./data
```

### No se muestran métricas
```bash
# Reiniciar con privilegios
docker-compose down
docker-compose up -d
```

### Resetear base de datos
```bash
docker-compose down
rm -rf ./data/users.db
docker-compose up -d
```

## 📝 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `GET /api/auth/verify` - Verificar token

### Usuarios (Admin)
- `GET /api/users` - Listar usuarios
- `POST /api/users/approve` - Aprobar/rechazar usuario

### Sistema
- `GET /api/system/metrics` - Métricas en tiempo real
- `GET /api/system/history` - Histórico de métricas

## 🎯 Roadmap

- [ ] Gráficos históricos con Chart.js
- [ ] Alertas por email/webhook
- [ ] Exportar métricas a CSV
- [ ] Soporte para múltiples servidores
- [ ] Dashboard personalizable
- [ ] Modo oscuro/claro
- [ ] Notificaciones push

## 📄 Licencia

MIT License - Libre para uso personal y comercial

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📞 Soporte

- **Documentación:** Ver `README_INSTALACION.md`
- **Issues:** Reportar problemas en GitHub
- **Email:** soporte@rdktech.us

## ⭐ Agradecimientos

- [shadcn/ui](https://ui.shadcn.com/) - Componentes UI
- [systeminformation](https://github.com/sebhildebrandt/systeminformation) - Métricas del sistema
- [Express](https://expressjs.com/) - Framework backend

---

**Desarrollado con ❤️ para RDK Tech**

🚀 **¡Disfruta monitoreando tu servidor!**
