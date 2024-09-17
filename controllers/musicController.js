const Music = require('../models/trackschema');
const Playlist = require('../models/playlistschema');
const User = require('../models/userschema');
const { validationResult } = require('express-validator');
const fs = require('fs');
const path = require('path');
// const Track = require('../models/trackschema');

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

exports.deleteTrackFromPlaylist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const playlist = user.playlists.id(req.params.playlistId);
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }
    playlist.tracks = playlist.tracks.filter(track => track.toString() !== req.params.trackId);
    await user.save();
    res.json({ message: 'Track removed from playlist successfully' });
  } catch (error) {
    console.error('Error removing track from playlist:', error);
    res.status(500).json({ message: 'Server error while removing track from playlist' });
  }
};

exports.deletePlaylist = async (req, res) => {
    try {
        const playlistId = req.params.music;
        const userId = req.user._id;

        console.log(`Attempting to delete playlist ${playlistId} for user ${userId}`);

        // Find the user and populate the playlists
        const user = await User.findById(userId).populate('playlists');
        if (!user) {
            console.log('User not found');
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        console.log('User playlists:', user.playlists);

        // Check if the playlist belongs to the user
        const playlistIndex = user.playlists.findIndex(playlist => playlist._id.toString() === playlistId);
        if (playlistIndex === -1) {
            console.log(`Playlist ${playlistId} not found in user's playlists`);
            return res.status(403).json({ success: false, message: 'You do not have permission to delete this playlist' });
        }

        // Remove the playlist from the user's playlists array
        user.playlists.splice(playlistIndex, 1);
        await user.save();

        // Try to delete the playlist document
        const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);
        if (!deletedPlaylist) {
            console.log(`Playlist ${playlistId} not found in Playlist collection, but removed from user's playlists`);
        } else {
            console.log(`Playlist ${playlistId} deleted successfully from Playlist collection`);
        }

        // Redirect to the user's profile page
        res.redirect('/users/profile');

    } catch (err) {
        console.error('Error deleting playlist:', err);
        res.status(500).json({ success: false, message: 'Server error while deleting playlist' });
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
  const { trackId, playlistId,playlistName } = req.body;
  const userId=req.user._id;
  try {
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }
    
    if (!playlist.tracks.includes(trackId)) {
      playlist.tracks.push(trackId);
      await playlist.save();
      res.json({ message: 'Track added to playlist successfully' });
    } else {
      res.json({ message: 'Track already in playlist' });
    }
  } catch (error) {
    console.error('Error adding track to playlist:', error);
    res.status(500).json({ message: 'Server error while adding track to playlist' });
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
