const db = require('../database/client');

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];
  const { data, error } = await db.auth.getUser(token);

  if (error || !data?.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  req.user = data.user;
  next();
};

module.exports = authenticate;
