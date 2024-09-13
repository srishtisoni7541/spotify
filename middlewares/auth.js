
const jwt = require('jsonwebtoken');
const cookieParser=require('cookie-parser');
const authenticateToken = (req, res, next) => {
  // Get the token from the Authorization header
  const authHeader = req.header('Authorization');
  const token = req.cookies.token // Get the token part after 'Bearer'
  console.log(token);

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, 'hello'); // Verify the token using the secret key
    req.user = decoded; // Add the decoded user info to the request object
    next();
  } catch (error) {
    res.status(403).json({ message: 'Invalid token.' }); // Send 403 Forbidden for an invalid token
  }
};

module.exports = { authenticateToken };

