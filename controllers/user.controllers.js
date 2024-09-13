const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userschema'); // User model
const fs = require('fs');
const path = require('path');

// Register User
const registerUser = async (req, res) => {
  const { name, username, email, password, role, isArtist } = req.body;

  try {
    // Check if the email already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Validate the isArtist field
    const artistStatus = isArtist === 'true' || isArtist === true;

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user with the provided data
    user = new User({
      username,
      email,
      name,
      password: hashedPassword,
      role: role || 'user',  
      isArtist: artistStatus 
    });

    await user.save();
    let token=jwt.sign({email},'hello');
    res.cookie('token',token);
     // Redirect based on user type
     if (artistStatus) {
      res.redirect('/users/artist');  // Redirect to artist dashboard if artist
    } else {
      res.redirect('/home');  // Redirect to home page if regular user
    }

    // res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};


// Login User
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password.' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ message: 'Invalid email or password.' });

    const token = jwt.sign({ id: user._id, email: user.email }, 'hello', { expiresIn: '1h' });
    
    // Set the token as an HTTP-only cookie
    res.cookie('token', token, { 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      maxAge: 3600000 // 1 hour in milliseconds
    });

    console.log('Token set in cookie:', token);

    // For testing purposes, you can also send the token in the response
    res.json({ message: 'Login successful', token: token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};


const uploadProfilePic = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete old profile picture if it exists
    if (user.profileImage && user.profileImage !== 'defaultimg.jpeg') {
      const oldImagePath = path.join(__dirname, '..', 'uploads', user.profileImage);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Update user's profile image
    user.profileImage = req.file.filename;
    await user.save();

    res.redirect('/profile'); // Redirect back to the profile page
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({ message: 'Error uploading profile picture' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  uploadProfilePic
};
