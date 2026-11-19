const pool = require('./db');

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
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (pool) {
    try {
      const [rows] = await pool.query('SELECT * FROM cursos WHERE activo = 1 ORDER BY orden ASC, id ASC');
      return res.status(200).json(rows.map(mapCurso));
    } catch (dbErr) {
      console.warn('[TiDB Warning] Error al obtener cursos:', dbErr.message);
    }
  }

  return res.status(200).json([]);
};
