module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  res.setHeader('Set-Cookie', 'XSRF-TOKEN=somep-csrf-token; Path=/; SameSite=Lax; Max-Age=86400');

  return res.status(200).json({
    token: 'somep-csrf-token',
    headerName: 'X-XSRF-TOKEN',
    parameterName: '_csrf'
  });
};
