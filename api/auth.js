const pool = require('./db');
const bcrypt = require('bcryptjs');
const { signToken, getSessionUser } = require('./auth-helper');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, X-XSRF-TOKEN');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Detectar la acción (/api/auth/login -> action = login)
  let action = req.query.action;
  if (!action) {
    const parts = req.url.split('?')[0].split('/').filter(Boolean);
    action = parts[parts.length - 1];
  }

  // 1. GET /api/auth/me
  if (action === 'me') {
    const user = getSessionUser(req);
    if (!user) {
      return res.status(401).json({
        autenticado: false,
        mensaje: 'No hay una sesión activa.'
      });
    }
    return res.status(200).json({
      autenticado: true,
      username: user.username,
      nombreCompleto: user.nombreCompleto,
      role: user.role
    });
  }

  // 2. GET /api/auth/csrf
  if (action === 'csrf') {
    res.setHeader('Set-Cookie', 'XSRF-TOKEN=somep-csrf-token; Path=/; SameSite=Lax; Max-Age=86400');
    return res.status(200).json({
      token: 'somep-csrf-token',
      headerName: 'X-XSRF-TOKEN',
      parameterName: '_csrf'
    });
  }

  // 3. POST /api/auth/logout
  if (action === 'logout') {
    res.setHeader('Set-Cookie', [
      'somep_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:01 GMT',
      'XSRF-TOKEN=; Path=/; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:01 GMT'
    ]);
    return res.status(200).json({
      status: 'ok',
      mensaje: 'Sesión cerrada exitosamente.'
    });
  }

  // 4. POST /api/auth/login
  if (action === 'login') {
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

      try {
        await pool.query('UPDATE usuarios SET ultimo_acceso = NOW() WHERE id = ?', [usuario.id]);
      } catch (ignoreErr) {}

      const payload = {
        id: usuario.id,
        username: usuario.username,
        email: usuario.email,
        nombreCompleto: usuario.nombre_completo,
        role: usuario.rol || 'ROLE_ADMIN',
        exp: Date.now() + 24 * 60 * 60 * 1000
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
  }

  return res.status(404).json({ error: 'Ruta no encontrada', path: req.url });
};
