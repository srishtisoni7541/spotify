const express = require('express');
const { registerUser, loginUser, uploadProfilePic } = require('../controllers/user.controllers');
const { authenticateToken } = require('../middlewares/auth');
const multer = require('multer');
const path = require('path');
const User = require('../models/userschema');

const router = express.Router();

// Set up multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Make sure this directory exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage });

// Route to Render Registration Page
router.get('/register', (req, res) => {
    res.render('register');
});

// Route to Render Artist Dashboard
router.get('/artist', authenticateToken, (req, res) => {
    res.render('artistdashboard');
});

// Route to Render User Home
router.get('/home', authenticateToken, (req, res) => {
    res.render('userhome');
});

// Route to Render User Profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('playlists');
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.render('userprofile', { user: user });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).send('Server error');
  }
});

// User Registration Route
router.post('/register', registerUser);

// User Login Route
router.post('/login', loginUser);

// Profile picture upload route
router.post('/upload-profile-pic', authenticateToken, upload.single('profilePic'), uploadProfilePic);

// Logout Route
router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/login'); // Redirect to login page after logout
});

module.exports = router;
