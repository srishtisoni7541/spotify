const express = require('express');
const { registerUser, loginUser, uploadProfilePic } = require('../controllers/user.controllers');
const { authenticateToken } = require('../middlewares/auth');
const multer = require('multer');
const path = require('path');
const User = require('../models/userschema');
const Playlist = require('../models/playlistschema');
const Track=require('../models/trackschema')

const router = express.Router();

// Set up multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/profilepic') // Make sure this directory exists
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
router.get('/login',function(req,res){
    res.render('login')
})

// Route to Render User Home
// router.get('/home', authenticateToken, (req, res) => {
//     res.render('userhome');
// });

// Route to Render User Profile
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate({
                path: 'playlists',
                populate: {
                    path: 'tracks.trackId',
                    model: 'Track',
                    select: 'title artist file'
                }
            })
            .lean();

        if (!user) {
            return res.status(404).send('User not found');
        }

        res.render('userprofile', { user });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).send('Server error');
    }
});

// User Registration Route
router.post('/register', registerUser);

// User Login Route
router.post('/login', loginUser);


// // Music upload route (if you have one)
// router.post('/upload-music', authenticateToken, upload.single('musicFile'), uploadMusic);

// Logout Route
router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/users/login'); // Redirect to login page after logout
});

// Update Profile Route
router.post('/update-profile', authenticateToken,  upload.single('profilePicture'), async (req, res) => {
    try {
        const updatedProfile = {
            name: req.body.name,
            email: req.body.email,
            bio: req.body.bio
        };

        if (req.file) {
            updatedProfile.profileImage = req.file.filename;
        }
      

        // Update the user in the database
        const updatedUser = await User.findByIdAndUpdate(req.user._id, updatedProfile, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // res.json({ message: 'Profile updated successfully', user: updatedUser });
        res.redirect('/users/profile');
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ message: 'An error occurred while updating the profile', error: error.message });
    }
});

module.exports = router;
