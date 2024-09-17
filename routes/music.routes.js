const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {deleteMusic,addMusic,addToPlaylist,searchMusic,deleteTrackFromPlaylist}=require('../controllers/musicController');
const { authenticateToken } = require('../middlewares/auth');
const Track = require('../models/trackschema'); // Import the Track model

// Configure multer for music file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/musics') // Make sure this directory exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'audio/mpeg' || file.mimetype === 'audio/wav' || file.mimetype === 'audio/ogg') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type, only audio is allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB file size limit
});

// New route to handle displaying all tracks on the home page
router.get('/home', authenticateToken, async (req, res) => {
  try {
    // Fetch only active (non-deleted) tracks
    const allTracks = await Track.find({ isDeleted: { $ne: true } });
    
    console.log('Fetched tracks:', allTracks); // Debug log
    
    res.render('userhome', { 
      user: req.user, 
      tracks: allTracks || []
    });
  } catch (error) {
    console.error('Error fetching tracks for home page:', error);
    res.render('userhome', { 
      user: req.user, 
      tracks: [],
      error: 'Error loading tracks. Please try again later.'
    });
  }
});

// Route to upload music (Only for artists)
router.post('/upload', authenticateToken, upload.single('musicFile'), async (req, res) => {
  console.log(req.file);

  if (!req.user) {
    return res.status(401).json({ message: 'User not authenticated' });
  }

  if (!req.user.isArtist) {
    return res.status(403).json({ message: 'Only artists can upload music' });
  }

  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const newTrack = new Track({
      title: req.body.title,
      artist: req.user.name, // Assuming you want to use the user's name as the artist
      album: req.body.album || 'Unknown Album',
      genre: req.body.genre || 'Unknown Genre',
      duration: req.body.duration || 0, // You might want to calculate this
      file: `/uploads/musics/${req.file.filename}`,
      // Add other fields as necessary
    });

    await newTrack.save();

    res.redirect('/music/home'); // Redirect to the music home page
  } catch (error) {
    console.error('Error uploading track:', error);
    res.status(500).json({ message: 'Server error while uploading track' });
  }
});

// Route to delete music
router.get('/delete/:musicId', authenticateToken, deleteMusic);
router.delete('/playlist/:playlistId/track/:trackId', authenticateToken, deleteTrackFromPlaylist);

// Route to search music
router.get('/search', searchMusic);

// Route to add music to a user's playlist
router.post('/add-to-playlist', authenticateToken, addToPlaylist);

// Route to add music
router.post('/add', addMusic);

// Route to upload a track
router.post('/upload', authenticateToken, upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'poster', maxCount: 1 }
]), async (req, res) => {
  if (!req.files || !req.files['file']) {
    return res.status(400).json({ message: 'No audio file uploaded' });
  }

  try {
    const newTrack = new Track({
      title: req.body.title,
      artist: req.body.artist,
      album: req.body.album,
      genre: req.body.genre,
      duration: req.body.duration,
      file: `/uploads/musics/${req.files['file'][0].filename}`,
      poster: req.files['poster'] ? `/uploads/posters/${req.files['poster'][0].filename}` : undefined,
      description: req.body.description,
      tags: req.body.tags ? req.body.tags.split(',') : []
    });

    await newTrack.save();
    res.status(201).json({ message: 'Track uploaded successfully', track: newTrack });
  } catch (error) {
    console.error('Error uploading track:', error);
    res.status(500).json({ message: 'Server error while uploading track' });
  }
});

// Route to get all tracks
router.get('/tracks', async (req, res) => {
  try {
    const tracks = await Track.find();
    res.json(tracks);
  } catch (error) {
    console.error('Error fetching tracks:', error);
    res.status(500).json({ message: 'Server error while fetching tracks' });
  }
});

module.exports = router;
