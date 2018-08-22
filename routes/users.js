const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const keys = require('../config/keys');
const jwt = require('jsonwebtoken');
const passport = require('passport');

// Load input validation
const validateRegisterInput = require('../validation/register');
const validateLoginInput = require('../validation/login');

// Load user model
const User = mongoose.model('users');

// @route   GET users/test
// @desc    Tests users route
// @access  Public
router.get('/test', (req, res) => res.json({ msg: "Users works" }));

// @route   GET users/register
// @desc    Register user
// @access  Public
router.post('/register', async (req, res) => {
    const { errors, isValid } = validateRegisterInput(req.body);

    // Check validation
    if (!isValid) {
        return res.status(400).json(errors);
    }

    try {
        const user = await User.findOne({ email: req.body.email });
        if (user) {
            errors.email = 'Email already exists'
            return res.status(400).json(errors);
        } else {
            const newUser = new User({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password
            });
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, async (err, hash) => {
                    try {
                        if (err) {
                            throw err;
                        }
                        newUser.password = hash;
                        await newUser.save()
                        res.json(newUser);
                    } catch (err) {
                        return console.log(err);
                    }
                });
            });
        }
    } catch (err) {
        return console.log(err);
    }
});

// @route   GET users/login
// @desc    Login user / Returning JWT-Token
// @access  Public
router.post('/login', async (req, res) => {
    const { errors, isValid } = validateLoginInput(req.body);

    // Check validation
    if (!isValid) {
        return res.status(400).json(errors);
    }

    const email = req.body.email;
    const password = req.body.password;

    try {
        // Find user by email
        const user = await User.findOne({ email });
        // Check for user
        if (!user) {
            errors.email = 'User not found'
            return res.status(404).json(errors);
        }
        try {
            // Check password 
            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                // Create JWT-Payload
                const payload = {
                    id: user.id,
                    name: user.name,
                };
                // Sign token
                jwt.sign(payload, keys.secretOrKey, { expiresIn: 3600 }, (err, token) => {
                    res.json({
                        success: true,
                        token: 'Bearer ' + token
                    });
                });
            } else {
                errors.password = 'Password incorrect'
                return res.status(400).json(errors);
            }
        } catch (err) {
            return console.log(err);
        }

    } catch (err) {
        return console.log(err);
    }
});

// @route   GET users/current
// @desc    Return current user
// @access  Private
router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.json({
        id: req.user.id,
        name: req.user.name,
        email: req.user.email
    });
});

// @route   GET users/all
// @desc    Get all users
// @access  Public
router.get('/all', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const errors = {};

        const users = await User.find().populate('user')
        if (!users || users.length === 0) {
            errors.nouser = 'No such user'
            return res.status(404).json(errors);
        }
        res.json(users);
    } catch (err) {
        err => res.status(404).json({ nousersfound: 'No users found' });
    }
});

module.exports = router;