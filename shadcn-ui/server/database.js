const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data', 'users.db');
let db;

// Inicializar base de datos
function initDatabase() {
  try {
    // Crear directorio de datos si no existe
    const fs = require('fs');
    const dataDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    db = new Database(DB_PATH);
    
    // Crear tabla de usuarios
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        status TEXT NOT NULL DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Verificar si existe el usuario admin
    const adminExists = db.prepare('SELECT * FROM users WHERE username = ?').get('rdk');

    if (!adminExists) {
      // Crear usuario administrador predefinido
      const hashedPassword = bcrypt.hashSync('*Ra8097164412', 10);
      db.prepare(`
        INSERT INTO users (username, password, role, status)
        VALUES (?, ?, ?, ?)
      `).run('rdk', hashedPassword, 'admin', 'approved');

      console.log('✅ Usuario administrador creado exitosamente');
      console.log('   Usuario: rdk');
      console.log('   Contraseña: *Ra8097164412');
    } else {
      console.log('✅ Usuario administrador ya existe');
    }

    console.log('✅ Base de datos inicializada correctamente');
  } catch (error) {
    console.error('❌ Error al inicializar base de datos:', error);
    throw error;
  }
}

// Obtener usuario por username
function getUser(username) {
  try {
    return db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    throw error;
  }
}

// Obtener todos los usuarios
function getAllUsers() {
  try {
    return db.prepare('SELECT * FROM users ORDER BY created_at DESC').all();
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
}

// Crear nuevo usuario
function createUser(username, password, role = 'user', status = 'pending') {
  try {
    return db.prepare(`
      INSERT INTO users (username, password, role, status)
      VALUES (?, ?, ?, ?)
    `).run(username, password, role, status);
  } catch (error) {
    console.error('Error al crear usuario:', error);
    throw error;
  }
}

// Actualizar estado del usuario
function updateUserStatus(username, status, role = 'user') {
  try {
    return db.prepare(`
      UPDATE users 
      SET status = ?, role = ?, updated_at = CURRENT_TIMESTAMP
      WHERE username = ?
    `).run(status, role, username);
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    throw error;
  }
}

module.exports = {
  initDatabase,
  getUser,
  getAllUsers,
  createUser,
  updateUserStatus
};
