const Music = require('../models/trackschema');
const Playlist = require('../models/playlistschema');
const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');

// Add Music
exports.addMusic = async (req, res) => {
  try {
    const { title, artist, genre } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const newMusic = new Music({
      title,
      artist,
      genre,
      file: req.file.path // Assuming file is being uploaded
    });
    
    await newMusic.save();
    res.status(201).json(newMusic);
  } catch (err) {
    res.status(500).json({ message: 'Error adding music', error: err.message });
  }
};

// Delete Music
exports.deleteMusic = async (req, res) => {
  try {
    const { musicId } = req.params;
    const music = await Music.findById(musicId);
    
    if (!music) {
      return res.status(404).json({ message: 'Music not found' });
    }
    
    // Delete the music file from the server
    fs.unlinkSync(path.join(__dirname, '..', music.file));
    
    await Music.findByIdAndDelete(musicId);
    res.status(200).json({ message: 'Music deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting music', error: err.message });
  }
};

// Search Music
exports.searchMusic = async (req, res) => {
  try {
    const { query } = req.query;
    const music = await Music.find({
      $or: [
        { title: new RegExp(query, 'i') },
        { artist: new RegExp(query, 'i') },
        { genre: new RegExp(query, 'i') }
      ]
    });
    res.status(200).json(music);
  } catch (err) {
    res.status(500).json({ message: 'Error searching music', error: err.message });
  }
};

// Add Music to Playlist
exports.addToPlaylist = async (req, res) => {
  try {
    const { musicId, playlistId } = req.body;
    
    const music = await Music.findById(musicId);
    if (!music) {
      return res.status(404).json({ message: 'Music not found' });
    }
    
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }
    
    playlist.music.push(musicId);
    await playlist.save();
    
    res.status(200).json({ message: 'Music added to playlist successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error adding music to playlist', error: err.message });
  }
};

// Upload Music (for artists)
exports.uploadMusic = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Store file details in the database
    const { title, artist } = req.body;
    
    const newMusic = new Music({
      title,
      artist,
      genre,
      file: req.file.path
    });
    
    await newMusic.save();
    res.status(201).json(newMusic);
  } catch (err) {
    res.status(500).json({ message: 'Error uploading music', error: err.message });
  }
};
