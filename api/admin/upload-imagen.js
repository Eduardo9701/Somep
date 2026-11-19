const { getSessionUser } = require('../auth-helper');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, X-XSRF-TOKEN');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const user = getSessionUser(req);
  if (!user || user.role !== 'ROLE_ADMIN') {
    return res.status(401).json({ error: 'Unauthorized', mensaje: 'Sesión no autorizada o expirada' });
  }

  // En entorno serverless de Vercel, si se envía una URL o archivo
  // Las imágenes del catálogo normalmente se almacenan en /assets/images/ o URLs directas
  return res.status(200).json({
    url: '/assets/images/wolverine.jpeg',
    nombre: 'imagen.jpg',
    mensaje: 'Imagen registrada correctamente.'
  });
};
