const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'super_secret_jwt_key_restaurant_2026_seap',
    { expiresIn: '7d' }
  );
};

module.exports = { generateToken };
