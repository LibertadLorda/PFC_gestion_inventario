const jwt = require('jsonwebtoken');

// Se valida q el usuario esté logueado antes de entrar 
module.exports = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    // Si no hay token, se niega el acceso
    return res.status(401).json({ error: 'Acceso denegado, token requerido' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch {
    // Si el token no es válido, se niega el acceso
    res.status(401).json({ error: 'Token inválido' });
  }
};