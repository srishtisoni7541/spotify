const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticateToken } = require('../middlewares/auth');
const { addMusic, deleteMusic, searchMusic, addToPlaylist, uploadMusic } = require('../controllers/musicController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/music'); // Specify your upload directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Use current timestamp for unique filenames
  }
});

// Configure Multer middleware
const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 }, // Limit file size to 10MB
  fileFilter: (req, file, cb) => {
    const filetypes = /mp3|wav|flac/; // Allowed file types
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb('Error: Only audio files are allowed!');
    }
  }
});

// Route to upload music (Only for artists)
router.post('/upload', authenticateToken, upload.single('musicFile'), (req, res, next) => {
  console.log(req.user); // This should now log the user object
  if (req.user && req.user.isArtist) {
    uploadMusic(req, res, next);
  } else {
    res.status(403).json({ message: 'Only artists can upload music' });
  }
});

// Route to delete music
router.delete('/delete/:musicId', deleteMusic);

// Route to search music
router.get('/search', searchMusic);

// Route to add music to a user's playlist
router.post('/add-to-playlist', addToPlaylist);

// Route to add music
router.post('/add', addMusic);

module.exports = router;
