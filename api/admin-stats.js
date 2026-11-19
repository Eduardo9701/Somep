const pool = require('./db');
const { getSessionUser } = require('./auth-helper');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const user = getSessionUser(req);
  if (!user || user.role !== 'ROLE_ADMIN') {
    return res.status(401).json({ error: 'Unauthorized', mensaje: 'Sesión no autorizada o expirada' });
  }

  if (!pool) {
    return res.status(500).json({ error: 'Database error' });
  }

  try {
    const [[{ totalCompuestos }]] = await pool.query('SELECT count(*) as totalCompuestos FROM peptidos');
    const [[{ totalCategorias }]] = await pool.query('SELECT count(DISTINCT categoria) as totalCategorias FROM peptidos WHERE categoria IS NOT NULL');
    const [[{ totalCursos }]] = await pool.query('SELECT count(*) as totalCursos FROM cursos');
    const [[{ ultimaActualizacion }]] = await pool.query('SELECT MAX(fecha_actualizacion) as ultimaActualizacion FROM peptidos');

    return res.status(200).json({
      totalCompuestos: Number(totalCompuestos || 0),
      totalCategorias: Number(totalCategorias || 0),
      totalCursos: Number(totalCursos || 0),
      ultimaActualizacion: ultimaActualizacion || new Date().toISOString()
    });
  } catch (err) {
    console.error('[Admin Stats Error]:', err.message);
    return res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};
