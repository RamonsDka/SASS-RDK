# 🚀 RDK Server Monitor - Guía de Instalación

Monitor de recursos del sistema en tiempo real para servidores Ubuntu con CasaOS.

## 📋 Requisitos Previos

- Ubuntu Server con CasaOS instalado
- Docker y Docker Compose instalados
- Portainer instalado (opcional, para gestión visual)
- Puerto 7772 disponible
- Dominio configurado en Cloudflare: `sass.rdktech.us`

## 🔧 Instalación Rápida

### Opción 1: Instalación con Docker Compose (Recomendada)

1. **Clonar o copiar el proyecto al servidor:**

```bash
# Crear directorio para el proyecto
mkdir -p ~/rdk-server-monitor
cd ~/rdk-server-monitor

# Copiar todos los archivos del proyecto aquí
```

2. **Construir y ejecutar el contenedor:**

```bash
# Construir la imagen y ejecutar
docker-compose up -d

# Ver logs para verificar que todo funciona
docker-compose logs -f
```

3. **Verificar que el servicio está corriendo:**

```bash
# Verificar estado del contenedor
docker-compose ps

# Verificar logs
docker-compose logs rdk-server-monitor
```

### Opción 2: Instalación con Portainer

1. **Abrir Portainer en tu navegador**
2. **Ir a Stacks → Add Stack**
3. **Nombre del stack:** `rdk-server-monitor`
4. **Copiar el contenido de `docker-compose.yml` en el editor web**
5. **Click en "Deploy the stack"**

## 🌐 Configuración de Cloudflare

1. **Acceder a tu panel de Cloudflare**
2. **Ir a DNS → Add Record**
3. **Configurar el registro:**
   - Type: `A` o `CNAME`
   - Name: `sass`
   - Content: IP de tu servidor o dominio principal
   - Proxy status: Activado (nube naranja)
   - TTL: Auto

4. **Configurar SSL/TLS:**
   - Ir a SSL/TLS → Overview
   - Modo: Full (strict) o Flexible

## 🔐 Credenciales de Acceso

### Usuario Administrador Predefinido:
- **Usuario:** `rdk`
- **Contraseña:** `*Ra8097164412`

### Primer Acceso:
1. Abrir navegador en: `http://sass.rdktech.us` o `http://localhost:7772`
2. Iniciar sesión con las credenciales de administrador
3. El dashboard mostrará las métricas del sistema en tiempo real

## 👥 Gestión de Usuarios

### Crear Nuevos Usuarios:
1. En la página de login, ir a la pestaña "Registrarse"
2. Ingresar usuario y contraseña
3. El usuario quedará en estado "Pendiente"

### Aprobar Usuarios (Solo Administrador):
1. Iniciar sesión como administrador
2. Click en el botón "Usuarios" en el header
3. Ver lista de usuarios pendientes
4. Seleccionar rol (Usuario o Admin)
5. Click en "Aprobar" o "Rechazar"

## 📊 Características del Dashboard

El dashboard muestra en tiempo real:

- ✅ **CPU:** Uso actual, núcleos, modelo
- ✅ **Memoria RAM:** Uso, porcentaje, total/usado
- ✅ **Almacenamiento:** Uso por partición, espacio disponible
- ✅ **Red:** Tráfico de entrada/salida por interfaz
- ✅ **Temperatura:** Temperatura del CPU
- ✅ **Uptime:** Tiempo de actividad del servidor
- ✅ **Procesos:** Top 10 procesos por uso de CPU/RAM
- ✅ **Sistema Operativo:** Información del SO

## 🔄 Actualización de Datos

Las métricas se actualizan automáticamente cada **3 segundos** sin necesidad de recargar la página.

## 🛠️ Comandos Útiles

### Ver logs en tiempo real:
```bash
docker-compose logs -f rdk-server-monitor
```

### Reiniciar el servicio:
```bash
docker-compose restart
```

### Detener el servicio:
```bash
docker-compose down
```

### Actualizar el servicio:
```bash
# Detener y eliminar contenedor
docker-compose down

# Reconstruir imagen
docker-compose build --no-cache

# Iniciar nuevamente
docker-compose up -d
```

### Ver estado del contenedor:
```bash
docker-compose ps
```

### Acceder al contenedor:
```bash
docker-compose exec rdk-server-monitor sh
```

## 📁 Estructura de Archivos

```
rdk-server-monitor/
├── docker-compose.yml          # Configuración de Docker Compose
├── Dockerfile                  # Imagen Docker
├── package.json                # Dependencias del proyecto
├── server/                     # Backend Node.js
│   ├── index.js               # Servidor Express
│   ├── database.js            # Gestión de base de datos SQLite
│   └── data/                  # Base de datos (persistente)
│       └── users.db
├── src/                        # Frontend React
│   ├── pages/
│   │   ├── Login.tsx          # Página de login
│   │   ├── Dashboard.tsx      # Dashboard principal
│   │   └── UserManagement.tsx # Gestión de usuarios
│   └── lib/
│       └── api.ts             # Cliente API
└── dist/                       # Build del frontend
```

## 🔒 Seguridad

### Recomendaciones:
1. **Cambiar el JWT_SECRET** en el archivo `docker-compose.yml`
2. **Usar HTTPS** mediante Cloudflare
3. **Cambiar la contraseña del admin** después del primer login
4. **Configurar firewall** para restringir acceso al puerto 7771
5. **Mantener Docker actualizado**

### Cambiar JWT Secret:
```bash
# Editar docker-compose.yml
nano docker-compose.yml

# Buscar la línea:
JWT_SECRET=rdk-server-monitor-secret-key-2024

# Cambiar por una clave segura generada aleatoriamente
JWT_SECRET=tu-clave-super-secreta-aqui

# Reiniciar el servicio
docker-compose restart
```

## 🐛 Solución de Problemas

### El servicio no inicia:
```bash
# Ver logs detallados
docker-compose logs rdk-server-monitor

# Verificar puertos en uso
sudo netstat -tulpn | grep 7772
sudo netstat -tulpn | grep 3001
```

### Error de permisos:
```bash
# Dar permisos al directorio de datos
sudo chmod -R 755 ./data
```

### No se muestran métricas:
```bash
# Verificar que el contenedor tiene acceso al sistema host
docker-compose down
docker-compose up -d
```

### Resetear base de datos:
```bash
# Detener servicio
docker-compose down

# Eliminar base de datos
rm -rf ./data/users.db

# Iniciar nuevamente (se creará nueva BD con admin)
docker-compose up -d
```

## 📞 Soporte

Si encuentras algún problema:
1. Revisar los logs: `docker-compose logs -f`
2. Verificar que los puertos 7772 y 3001 están disponibles
3. Asegurarse de que Docker tiene permisos para acceder al sistema host

## 📝 Notas Adicionales

- El contenedor usa `network_mode: host` para acceder a las métricas del sistema host
- La base de datos SQLite se almacena en un volumen persistente
- El usuario administrador se crea automáticamente al iniciar por primera vez
- Los datos persisten incluso si el contenedor se elimina

## 🎉 ¡Listo!

Tu monitor de recursos del sistema está configurado y listo para usar. Accede a través de:

- **Local:** http://localhost:7772
- **Dominio:** http://sass.rdktech.us

**Usuario:** rdk  
**Contraseña:** *Ra8097164412

¡Disfruta monitoreando tu servidor! 🚀
