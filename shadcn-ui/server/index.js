const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const si = require('systeminformation');
const { initDatabase, getUser, getAllUsers, createUser, updateUserStatus } = require('./database');

const app = express();
const PORT = 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'rdk-server-monitor-secret-key-2024';

app.use(cors());
app.use(express.json());

// Middleware de autenticación
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Middleware para verificar rol de admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador' });
  }
  next();
};

// Inicializar base de datos
initDatabase();

// ==================== RUTAS DE AUTENTICACIÓN ====================

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
    }

    const user = await getUser(username);

    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    if (user.status === 'pending') {
      return res.status(403).json({ error: 'Tu cuenta está pendiente de aprobación por un administrador' });
    }

    if (user.status === 'rejected') {
      return res.status(403).json({ error: 'Tu cuenta ha sido rechazada' });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        username: user.username,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Verificar token
app.get('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});

// Registro de nuevo usuario
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const existingUser = await getUser(username);

    if (existingUser) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await createUser(username, hashedPassword, 'user', 'pending');

    res.json({ message: 'Usuario registrado exitosamente. Pendiente de aprobación por administrador.' });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// ==================== RUTAS DE GESTIÓN DE USUARIOS ====================

// Listar todos los usuarios (solo admin)
app.get('/api/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await getAllUsers();
    const usersWithoutPassword = users.map(({ password, ...user }) => user);
    res.json(usersWithoutPassword);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Aprobar/rechazar usuario (solo admin)
app.post('/api/users/approve', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { username, status, role } = req.body;

    if (!username || !status) {
      return res.status(400).json({ error: 'Usuario y estado son requeridos' });
    }

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Estado inválido' });
    }

    await updateUserStatus(username, status, role || 'user');

    res.json({ message: `Usuario ${status === 'approved' ? 'aprobado' : 'rechazado'} exitosamente` });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// ==================== RUTAS DE MÉTRICAS DEL SISTEMA ====================

// Obtener todas las métricas del sistema
app.get('/api/system/metrics', authenticateToken, async (req, res) => {
  try {
    const [cpu, mem, disk, network, osInfo, currentLoad, processes, temp, time] = await Promise.all([
      si.cpu(),
      si.mem(),
      si.fsSize(),
      si.networkStats(),
      si.osInfo(),
      si.currentLoad(),
      si.processes(),
      si.cpuTemperature(),
      si.time()
    ]);

    const metrics = {
      cpu: {
        manufacturer: cpu.manufacturer,
        brand: cpu.brand,
        cores: cpu.cores,
        physicalCores: cpu.physicalCores,
        speed: cpu.speed,
        usage: currentLoad.currentLoad.toFixed(2),
        loadAverage: currentLoad.avgLoad
      },
      memory: {
        total: mem.total,
        used: mem.used,
        free: mem.free,
        usagePercent: ((mem.used / mem.total) * 100).toFixed(2)
      },
      disk: disk.map(d => ({
        fs: d.fs,
        type: d.type,
        size: d.size,
        used: d.used,
        available: d.available,
        usagePercent: d.use.toFixed(2),
        mount: d.mount
      })),
      network: network.map(n => ({
        iface: n.iface,
        rx_bytes: n.rx_bytes,
        tx_bytes: n.tx_bytes,
        rx_sec: n.rx_sec,
        tx_sec: n.tx_sec
      })),
      os: {
        platform: osInfo.platform,
        distro: osInfo.distro,
        release: osInfo.release,
        kernel: osInfo.kernel,
        arch: osInfo.arch,
        hostname: osInfo.hostname
      },
      processes: {
        all: processes.all,
        running: processes.running,
        blocked: processes.blocked,
        sleeping: processes.sleeping,
        list: processes.list.slice(0, 10).map(p => ({
          pid: p.pid,
          name: p.name,
          cpu: p.cpu,
          mem: p.mem
        }))
      },
      temperature: {
        main: temp.main || 0,
        cores: temp.cores || [],
        max: temp.max || 0
      },
      uptime: time.uptime
    };

    res.json(metrics);
  } catch (error) {
    console.error('Error al obtener métricas:', error);
    res.status(500).json({ error: 'Error al obtener métricas del sistema' });
  }
});

// Obtener métricas históricas (simulado para MVP)
app.get('/api/system/history', authenticateToken, async (req, res) => {
  try {
    // En producción, esto debería venir de una base de datos con histórico
    const history = [];
    const now = Date.now();
    
    for (let i = 23; i >= 0; i--) {
      history.push({
        timestamp: now - (i * 3600000), // Últimas 24 horas
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        network_rx: Math.random() * 1000000,
        network_tx: Math.random() * 1000000
      });
    }

    res.json(history);
  } catch (error) {
    console.error('Error al obtener histórico:', error);
    res.status(500).json({ error: 'Error al obtener histórico' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor de monitoreo ejecutándose en puerto ${PORT}`);
  console.log(`📊 API disponible en http://localhost:${PORT}/api`);
});
