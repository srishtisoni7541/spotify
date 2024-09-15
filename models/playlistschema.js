const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  album: {
    type: String,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // required: true,
  },
  artist:{
    type:String,

  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    // required: true,
  },
  tracks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Track',
  }],
  coverImage:{
    type:String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isAlbum:{
    type:String,
    default:false,
  }
});

module.exports = mongoose.model('Playlist', playlistSchema);
