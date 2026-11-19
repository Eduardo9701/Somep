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
};
