const pool = require('../db');
const { getSessionUser } = require('../auth-helper');

function mapCurso(row) {
  return {
    id: Number(row.id),
    titulo: row.titulo || '',
    tipo: row.tipo || '',
    badgeTipo: row.badge_tipo || '',
    estado: row.estado || '',
    orden: row.orden || 0,
    meta1: row.meta1 || '',
    meta2: row.meta2 || '',
    textoBoton: row.texto_boton || '',
    enlaceWhatsapp: row.enlace_whatsapp || '',
    imagenUrl: row.imagen_url || '',
    activo: Boolean(row.activo),
    descripcion: row.descripcion || '',
    acreditacion: row.acreditacion || '',
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

  // GET: listar todos los cursos (incluye inactivos)
  if (req.method === 'GET') {
    try {
      const [rows] = await pool.query('SELECT * FROM cursos ORDER BY orden ASC, id ASC');
      return res.status(200).json(rows.map(mapCurso));
    } catch (err) {
      console.error('[Admin Cursos GET Error]:', err.message);
      return res.status(500).json({ error: 'Error al listar cursos' });
    }
  }

  // POST: crear nuevo curso
  if (req.method === 'POST') {
    try {
      const { titulo, tipo, badgeTipo, estado, orden, meta1, meta2, textoBoton, enlaceWhatsapp, imagenUrl, activo, descripcion, acreditacion } = req.body || {};
      if (!titulo || !tipo || !badgeTipo || !estado || !descripcion) {
        return res.status(400).json({ error: 'Datos incompletos', mensaje: 'Verifique los campos obligatorios.' });
      }

      const esActivo = activo !== undefined ? (activo ? 1 : 0) : 1;
      const ordenNum = orden !== undefined ? Number(orden) : 1;

      const [result] = await pool.query(
        `INSERT INTO cursos (titulo, tipo, badge_tipo, estado, orden, meta1, meta2, texto_boton, enlace_whatsapp, imagen_url, activo, descripcion, acreditacion, fecha_creacion, fecha_actualizacion)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [titulo, tipo, badgeTipo, estado, ordenNum, meta1 || null, meta2 || null, textoBoton || null, enlaceWhatsapp || null, imagenUrl || null, esActivo, descripcion, acreditacion || null]
      );

      const [rows] = await pool.query('SELECT * FROM cursos WHERE id = ?', [result.insertId]);
      return res.status(201).json(mapCurso(rows[0]));
    } catch (err) {
      console.error('[Admin Cursos POST Error]:', err.message);
      return res.status(500).json({ error: 'Error al crear curso' });
    }
  }

  // PUT: actualizar curso
  if (req.method === 'PUT') {
    try {
      const cursoId = id || req.body?.id;
      if (!cursoId) {
        return res.status(400).json({ error: 'ID requerido' });
      }

      const { titulo, tipo, badgeTipo, estado, orden, meta1, meta2, textoBoton, enlaceWhatsapp, imagenUrl, activo, descripcion, acreditacion } = req.body || {};
      const esActivo = activo !== undefined ? (activo ? 1 : 0) : 1;
      const ordenNum = orden !== undefined ? Number(orden) : 1;

      await pool.query(
        `UPDATE cursos SET titulo = ?, tipo = ?, badge_tipo = ?, estado = ?, orden = ?, meta1 = ?, meta2 = ?, texto_boton = ?, enlace_whatsapp = ?, imagen_url = ?, activo = ?, descripcion = ?, acreditacion = ?, fecha_actualizacion = NOW()
         WHERE id = ?`,
        [titulo, tipo, badgeTipo, estado, ordenNum, meta1 || null, meta2 || null, textoBoton || null, enlaceWhatsapp || null, imagenUrl || null, esActivo, descripcion, acreditacion || null, cursoId]
      );

      const [rows] = await pool.query('SELECT * FROM cursos WHERE id = ?', [cursoId]);
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Curso no encontrado' });
      }
      return res.status(200).json(mapCurso(rows[0]));
    } catch (err) {
      console.error('[Admin Cursos PUT Error]:', err.message);
      return res.status(500).json({ error: 'Error al actualizar curso' });
    }
  }

  // DELETE: eliminar curso
  if (req.method === 'DELETE') {
    try {
      if (!id) {
        return res.status(400).json({ error: 'ID requerido' });
      }

      const [rows] = await pool.query('SELECT * FROM cursos WHERE id = ?', [id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Curso no encontrado' });
      }

      await pool.query('DELETE FROM cursos WHERE id = ?', [id]);
      return res.status(200).json({ status: 'ok', mensaje: 'Curso eliminado exitosamente' });
    } catch (err) {
      console.error('[Admin Cursos DELETE Error]:', err.message);
      return res.status(500).json({ error: 'Error al eliminar curso' });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
};
