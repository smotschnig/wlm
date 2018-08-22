const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const keys = require('./config/keys');
const passport = require('passport');

require('./models/User');
require('./models/Profile');

const users = require('./routes/users');
const profile = require('./routes/profile');

const app = express();

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(keys.mongoURI, { useNewUrlParser: true }).catch(function (error) {
    console.log('Unable to connect to the mongodb instance. Error: ', error);
});

// Passport middleware
app.use(passport.initialize());

// Passport config
require('./config/passport')(passport);

// Use routes
app.use('/users', users);
app.use('/profile', profile);

if (process.env.NODE_ENV == 'production') {
    // Express will serve up production asses
    // like our main.js file, or main.css file!
    app.use(express.static('client/build'));

    // Express will serve up the index.html file
    // if it doesn't recognize the route
    const path = require('path');
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
    });
}

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server running on port ${port}`));