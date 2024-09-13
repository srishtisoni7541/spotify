const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const connectDB = require('./config/db');
const userRoutes = require('./routes/user.routes'); // Correct path to your routes file
const musicRoutes=require('./routes/music.routes');

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For parsing form data
app.set('view engine','ejs');
app.set('views', __dirname + '/views');
app.use(cookieParser());

connectDB();
app.use('/uploads', express.static('uploads'));
// Correct usage of the router
app.use('/users', userRoutes);
app.use('/music',musicRoutes);
app.get('/',function(rew,res){
    res.send('hello');
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


