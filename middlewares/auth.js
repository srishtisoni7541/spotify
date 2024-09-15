const jwt = require('jsonwebtoken');
const usermodel=require('../models/userschema');
// const cookieParser=require('cookie-parser');
const authenticateToken =  async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    console.log('No token found in cookies');
    return res.redirect('/users/login'); // Redirect to login page if no token
  }

  try {
    const decoded = jwt.verify(token, 'hello');
    const User=await usermodel.findById(decoded.userId);
    console.log('User found:', User);
    req.user = User;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.clearCookie('token');
    return res.redirect('/users/login'); // Redirect to login page if token is invalid
  }
};

module.exports = { authenticateToken };

