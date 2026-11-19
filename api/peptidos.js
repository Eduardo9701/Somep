const pool = require('./db');
const fallbackData = require('./data.json');

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
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id, categoria, buscar } = req.query;

  // 1. Intentar consultar TiDB Cloud
  if (pool) {
    try {
      if (id) {
        const [rows] = await pool.query('SELECT * FROM peptidos WHERE id = ? LIMIT 1', [id]);
        if (rows.length === 0) {
          return res.status(404).json({
            timestamp: new Date().toISOString(),
            status: 404,
            error: 'Not Found',
            message: `No se encontró el compuesto con identificador: ${id}`,
            path: `/api/peptidos/${id}`
          });
        }
        return res.status(200).json(mapPeptido(rows[0]));
      }

      let sql = 'SELECT * FROM peptidos WHERE 1=1';
      const params = [];

      if (categoria && categoria.trim() !== '' && categoria.toLowerCase() !== 'todos') {
        sql += ' AND LOWER(categoria) = LOWER(?)';
        params.push(categoria.trim());
      }

      if (buscar && buscar.trim() !== '') {
        const pattern = `%${buscar.trim().toLowerCase()}%`;
        sql += ' AND (LOWER(nombre) LIKE ? OR LOWER(subtitulo) LIKE ? OR LOWER(categoria) LIKE ? OR LOWER(que_es) LIKE ? OR LOWER(que_hace_o_estudia) LIKE ? OR LOWER(clave) LIKE ?)';
        params.push(pattern, pattern, pattern, pattern, pattern, pattern);
      }

      sql += ' ORDER BY nombre ASC';

      const [rows] = await pool.query(sql, params);
      return res.status(200).json(rows.map(mapPeptido));
    } catch (dbErr) {
      console.warn('[TiDB Warning] Error en consulta, usando respaldo local:', dbErr.message);
    }
  }

  // 2. Respaldo estático local en caso de desconexión
  if (id) {
    const item = fallbackData.find(p => p.id === parseInt(id, 10));
    if (!item) {
      return res.status(404).json({
        timestamp: new Date().toISOString(),
        status: 404,
        error: 'Not Found',
        message: `No se encontró el compuesto con identificador: ${id}`,
        path: `/api/peptidos/${id}`
      });
    }
    return res.status(200).json(item);
  }

  let results = [...fallbackData];

  if (categoria && categoria.trim() !== '' && categoria.toLowerCase() !== 'todos') {
    results = results.filter(p => p.categoria.toLowerCase() === categoria.trim().toLowerCase());
  }

  if (buscar && buscar.trim() !== '') {
    const q = buscar.trim().toLowerCase();
    results = results.filter(p => 
      (p.nombre && p.nombre.toLowerCase().includes(q)) ||
      (p.subtitulo && p.subtitulo.toLowerCase().includes(q)) ||
      (p.categoria && p.categoria.toLowerCase().includes(q)) ||
      (p.queEs && p.queEs.toLowerCase().includes(q)) ||
      (p.queHaceOEstudia && p.queHaceOEstudia.toLowerCase().includes(q)) ||
      (p.clave && p.clave.toLowerCase().includes(q))
    );
  }

  return res.status(200).json(results);
};
