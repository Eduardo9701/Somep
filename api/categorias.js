const pool = require('./db');
const fallbackData = require('./data.json');

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
      const [rows] = await pool.query('SELECT DISTINCT categoria FROM peptidos WHERE categoria IS NOT NULL AND categoria != "" ORDER BY categoria ASC');
      const categories = rows.map(r => r.categoria);
      return res.status(200).json(categories);
    } catch (dbErr) {
      console.warn('[TiDB Warning] Error al obtener categorías, usando respaldo local:', dbErr.message);
    }
  }

  const distinctCategories = Array.from(new Set(fallbackData.map(p => p.categoria))).sort();
  return res.status(200).json(distinctCategories);
};
