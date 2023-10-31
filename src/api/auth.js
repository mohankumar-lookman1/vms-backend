const bcrypt = require('bcrypt'); // Import bcrypt library
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session'); // Import express-session
const express = require('express');
const { User } = require('../../database/models/models');
const app = express();

app.use(session({
    secret: 'hitler loves peace', // Change this to a secure random key
    resave: false,
    saveUninitialized: false
}));

passport.use(new LocalStrategy(
    {
        usernameField: 'email',
        passwordField: 'password'
    },
    async (email, password, done) => {
        try {
            const user = await User.findOne({ email });

            if (!user) {
                return done(null, false, { message: 'User not found' });
            }

            const passwordMatch = await bcrypt.compare(password, user.password);

            if (!passwordMatch) {
                return done(null, false, { message: 'Incorrect password' });
            }

            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }
));

// Serialize and deserialize user
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

app.post('/signup', async (req, res) => {
    const formData = req.body;
    if (!formData.email || !formData.password || !formData.username) {
        res.status(400).send('Bad request');
        return;
    }
    try {
        // Hash the password before saving it to the MongoDB database
        const hashedPassword = await bcrypt.hash(formData.password, 10);
        formData.password = hashedPassword;

        // Save the form data to the MongoDB database
        const userData = new User(formData);
        await userData.save();
        console.log('Data saved to MongoDB:', userData);
        res.json({ username: formData.username, message: 'Signup successful' });
    } catch (error) {
        console.error('Error saving data to MongoDB:', error);
        res.status(500).send('Error saving data to the database');
    }
});

// Route for user login using Passport.js
app.post('/login', passport.authenticate('local', { failureRedirect: '/login-failed' }), (req, res) => {
    const { username } = req.user;
    res.json({ username, message: 'Login successful' });
});

module.exports = app;