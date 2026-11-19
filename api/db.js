try {
  require('dotenv').config();
} catch (e) {
  // dotenv no disponible o en entorno serverless
}

const mysql = require('mysql2/promise');

const host = process.env.DB_HOST || process.env.MYSQL_HOST;
const port = parseInt(process.env.DB_PORT || process.env.MYSQL_PORT || '4000', 10);
const user = process.env.DB_USER || process.env.DB_USERNAME || process.env.MYSQL_USER;
const password = process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD;
const database = process.env.DB_DATABASE || process.env.DB_NAME || process.env.MYSQL_DATABASE || 'somep_catalogo';

let pool = null;

if (host && user && password) {
  try {
    pool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
      },
      waitForConnections: true,
      connectionLimit: 10,
      maxIdle: 5,
      idleTimeout: 60000,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0
    });
  } catch (err) {
    console.error('[DB] Error creando pool MySQL:', err.message);
  }
} else {
  console.warn('[DB] Variables de entorno de base de datos no configuradas. Se usarán datos de respaldo.');
}

module.exports = pool;
