const pool = require('./db');
const { getSessionUser } = require('./auth-helper');

function mapPeptido(row) {
  return {
    id: Number(row.id),
    nombre: row.nombre || '',
    subtitulo: row.subtitulo || '',
    categoria: row.categoria || '',
    queEs: row.que_es || '',
    queHaceOEstudia: row.que_hace_o_estudia || '',
    usoMedico: row.uso_medico || '',
    clave: row.clave || '',
    fuente: row.fuente || '',
    imagenUrl: row.imagen_url || '',
    fechaCreacion: row.fecha_creacion,
    fechaActualizacion: row.fecha_actualizacion
  };
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, X-XSRF-TOKEN');
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

  const { id } = req.query;

  // GET: listar todos los peptidos
  if (req.method === 'GET') {
    try {
      const [rows] = await pool.query('SELECT * FROM peptidos ORDER BY id DESC');
      return res.status(200).json(rows.map(mapPeptido));
    } catch (err) {
      console.error('[Admin Peptidos GET Error]:', err.message);
      return res.status(500).json({ error: 'Error al listar compuestos' });
    }
  }

  // POST: crear nuevo peptido
  if (req.method === 'POST') {
    try {
      const { nombre, subtitulo, categoria, queEs, queHaceOEstudia, usoMedico, clave, fuente, imagenUrl } = req.body || {};
      if (!nombre || !subtitulo || !categoria || !queEs || !queHaceOEstudia || !clave) {
        return res.status(400).json({ error: 'Datos incompletos', mensaje: 'Verifique los campos obligatorios.' });
      }

      const [result] = await pool.query(
        `INSERT INTO peptidos (nombre, subtitulo, categoria, que_es, que_hace_o_estudia, uso_medico, clave, fuente, imagen_url, fecha_creacion, fecha_actualizacion)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [nombre, subtitulo, categoria, queEs, queHaceOEstudia, usoMedico || null, clave, fuente || null, imagenUrl || null]
      );

      const [rows] = await pool.query('SELECT * FROM peptidos WHERE id = ?', [result.insertId]);
      return res.status(201).json(mapPeptido(rows[0]));
    } catch (err) {
      console.error('[Admin Peptidos POST Error]:', err.message);
      return res.status(500).json({ error: 'Error al crear compuesto' });
    }
  }

  // PUT: actualizar peptido
  if (req.method === 'PUT') {
    try {
      const peptidoId = id || req.body?.id;
      if (!peptidoId) {
        return res.status(400).json({ error: 'ID requerido' });
      }

      const { nombre, subtitulo, categoria, queEs, queHaceOEstudia, usoMedico, clave, fuente, imagenUrl } = req.body || {};
      await pool.query(
        `UPDATE peptidos SET nombre = ?, subtitulo = ?, categoria = ?, que_es = ?, que_hace_o_estudia = ?, uso_medico = ?, clave = ?, fuente = ?, imagen_url = ?, fecha_actualizacion = NOW()
         WHERE id = ?`,
        [nombre, subtitulo, categoria, queEs, queHaceOEstudia, usoMedico || null, clave, fuente || null, imagenUrl || null, peptidoId]
      );

      const [rows] = await pool.query('SELECT * FROM peptidos WHERE id = ?', [peptidoId]);
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Compuesto no encontrado' });
      }
      return res.status(200).json(mapPeptido(rows[0]));
    } catch (err) {
      console.error('[Admin Peptidos PUT Error]:', err.message);
      return res.status(500).json({ error: 'Error al actualizar compuesto' });
    }
  }

  // DELETE: eliminar peptido
  if (req.method === 'DELETE') {
    try {
      if (!id) {
        return res.status(400).json({ error: 'ID requerido' });
      }

      const [rows] = await pool.query('SELECT * FROM peptidos WHERE id = ?', [id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Compuesto no encontrado' });
      }

      await pool.query('DELETE FROM peptidos WHERE id = ?', [id]);
      return res.status(200).json({ status: 'ok', mensaje: 'Compuesto eliminado exitosamente' });
    } catch (err) {
      console.error('[Admin Peptidos DELETE Error]:', err.message);
      return res.status(500).json({ error: 'Error al eliminar compuesto' });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
};
