const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  username:{
    type:String,
    required:true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  playlists: [{
    name: String,
    tracks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Track' }]
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  profileImage:{
    type:String,
    default:'defaultimg.jpeg',

  },
  isArtist:{
    type:Boolean,
    default:false,
  }
},{timestamps:true});

module.exports = mongoose.model('User', userSchema);
