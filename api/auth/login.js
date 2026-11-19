const pool = require('../db');
const bcrypt = require('bcryptjs');
const { signToken } = require('../auth-helper');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({
      error: 'Datos incompletos',
      mensaje: 'Por favor ingrese usuario y contraseña.'
    });
  }

  if (!pool) {
    return res.status(500).json({
      error: 'Error de conexión',
      mensaje: 'No fue posible conectar con la base de datos.'
    });
  }

  try {
    const q = username.trim().toLowerCase();
    const [rows] = await pool.query(
      'SELECT id, username, email, password, nombre_completo, rol, CAST(activo AS UNSIGNED) AS activo FROM usuarios WHERE LOWER(username) = ? OR LOWER(email) = ? LIMIT 1',
      [q, q]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        error: 'Credenciales incorrectas',
        mensaje: 'Usuario o contraseña inválidos.'
      });
    }

    const usuario = rows[0];

    if (!usuario.activo) {
      return res.status(403).json({
        error: 'Cuenta deshabilitada',
        mensaje: 'La cuenta de usuario se encuentra inactiva.'
      });
    }

    const coincide = bcrypt.compareSync(password, usuario.password);
    if (!coincide) {
      return res.status(401).json({
        error: 'Credenciales incorrectas',
        mensaje: 'Usuario o contraseña inválidos.'
      });
    }

    // Actualizar último acceso
    try {
      await pool.query('UPDATE usuarios SET ultimo_acceso = NOW() WHERE id = ?', [usuario.id]);
    } catch (ignoreErr) {}

    const payload = {
      id: usuario.id,
      username: usuario.username,
      email: usuario.email,
      nombreCompleto: usuario.nombre_completo,
      role: usuario.rol || 'ROLE_ADMIN',
      exp: Date.now() + 24 * 60 * 60 * 1000 // 24 horas
    };

    const token = signToken(payload);

    res.setHeader('Set-Cookie', [
      `somep_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`,
      `XSRF-TOKEN=somep-csrf-token; Path=/; SameSite=Lax; Max-Age=86400`
    ]);

    return res.status(200).json({
      autenticado: true,
      mensaje: 'Inicio de sesión exitoso',
      username: usuario.username,
      nombreCompleto: usuario.nombre_completo,
      role: usuario.rol || 'ROLE_ADMIN'
    });

  } catch (err) {
    console.error('[Auth Error] Error en login:', err.message);
    return res.status(500).json({
      error: 'Error de autenticación',
      mensaje: 'Ocurrió un error inesperado al procesar el inicio de sesión.'
    });
  }
};
