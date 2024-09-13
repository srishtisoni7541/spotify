const jwt = require('jsonwebtoken');
// const cookieParser=require('cookie-parser');
const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    console.log('No token found in cookies');
    return res.redirect('/login'); // Redirect to login page if no token
  }

  try {
    const decoded = jwt.verify(token, 'hello');
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.clearCookie('token');
    return res.redirect('/login'); // Redirect to login page if token is invalid
  }
};

module.exports = { authenticateToken };

