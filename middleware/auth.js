const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Unauthorised' });

  jwt.verify(token, process.env.SECRET_KEY, (err, payload) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });

    // payload.id — это id пользователя, который мы положили при логине
    req.user = { userId: payload.userId  };
    next();
  });
};

module.exports = authenticateToken;
