const { verifyAccessToken } = require('../utils/token');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required.' });
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded; // Contains id, email, role
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Invalid or expired access token.' });
  }
};

const optionalAuthenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token) {
    try {
      const decoded = verifyAccessToken(token);
      req.user = decoded;
    } catch (_) {
      // Pass through if optional
    }
  }
  next();
};

module.exports = authenticateToken;
module.exports.optionalAuthenticateToken = optionalAuthenticateToken;
