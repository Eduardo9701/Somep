const peptidos = require('./data.json');

module.exports = (req, res) => {
  // Configuración de Cabeceras CORS y JSON
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id, categoria, buscar } = req.query;

  // Consulta por ID individual
  if (id) {
    const item = peptidos.find(p => p.id === parseInt(id, 10));
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

  // Filtrado y búsqueda
  let results = [...peptidos];

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
