const jwt = require('jsonwebtoken');

// Protect admin routes - verify admin JWT token
const adminProtect = async (req, res, next) => {
  try {
    let token;

    if (req.cookies && req.cookies.admin_token) {
      token = req.cookies.admin_token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized: admin token missing' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_ADMIN || process.env.JWT_SECRET || 'fallback-secret-admin');

      if (!decoded || decoded.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: not an admin token' });
      }

      req.admin = { id: decoded.id, email: decoded.email, role: 'admin' };
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Admin token is not valid' });
    }
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { adminProtect };


