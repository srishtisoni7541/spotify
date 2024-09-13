
const mongoose = require('mongoose');

const trackSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  artist: {
    type: String,
    required: true,
  },
  album: {
    type: String,
    required: true,
  },
  genre: {
    type: String,
    required: true,
  },
  poster: {
    type: String,
    // Optionally, you can add `required: false` if poster is not always necessary
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  duration: {
    type: Number,
    required: true, // in seconds
  },
  file: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    trim: true, // Optional field for a description of the track
  },
  tags: [String], // Optional array of tags associated with the track
  createdAt: {
    type: Date,
    default: Date.now,
  }
}, { timestamps: true });

module.exports = mongoose.model('Track', trackSchema);
