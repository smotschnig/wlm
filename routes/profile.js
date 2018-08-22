const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const keys = require('../config/keys');
const request = require('request');

// Load input validation
const validateProfileInput = require('../validation/profile');

// Load user model
const Profile = mongoose.model('profile');

// Load user model
const User = mongoose.model('users');

// @route   GET profile/test
// @desc    Tests profile route
// @access  Public
router.get('/test', (req, res) => res.json({ msg: "Profile works" }));

// @route   GET profile
// @desc    Get current users profile
// @access  Private
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const errors = {};

    try {
        const profile = await Profile.findOne({ user: req.user.id }).populate('user');
        if (!profile) {
            errors.noprofile = 'There is no profile for this user';
            return res.status(404).json(errors);
        }
        res.json(profile);
    } catch (err) {
        return err => res.status(404).json(err);
    }
});

// @route   GET profile/user/:user_id
// @desc    Get profile by user ID
// @access  Public
router.get('/user/:user_id', async (req, res) => {
    const errors = {};
    try {
        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name']);
        if (!profile) {
            errors.noprofile = 'There is no profile for this user';
            return res.status(404).json(errors);
        }
        res.json(profile);
    } catch (err) {
        return res.status(404).json({ profile: 'There is no profile for this user' });
    }
});

// @route   GET profile/all
// @desc    Get all profiles
// @access  Public
router.get('/all', async (req, res) => {
    const errors = {};

    try {
        const profiles = await Profile.find().populate('user', ['name'])
        if (!profiles || profiles.length === 0) {
            errors.noprofile = 'There are no profiles';
            return res.status(404).json(errors);
        }
        res.json(profiles);
    } catch (err) {
        return res.status(404).json(err);
    }
});

// @route   GET profile/nickname/:nickname
// @desc    Get profile by nickname
// @access  Public
router.get('/nickname/:nickname', async (req, res) => {
    const errors = {};

    try {
        const profile = await Profile.findOne({ nickname: req.params.nickname }).populate('user', ['name']);
        if (!profile) {
            errors.noprofile = 'There is no profile for this user';
            return res.status(404).json(errors);
        }
        res.json(profile);

    } catch (err) {
        return res.status(404).json(err);
    }
});

// @route   POST profile
// @desc    Create or edit user profile
// @access  Private
router.post('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const { errors, isValid } = validateProfileInput(req.body);

    // Check validation
    if (!isValid) {
        return res.status(400).json(errors);
    }

    // Get fields
    const profileFields = {};
    profileFields.user = req.user.id;
    if (req.body.nickname) profileFields.nickname = req.body.nickname;
    if (req.body.age) profileFields.age = req.body.age;
    if (req.body.location) profileFields.location = req.body.location;
    if (req.body.status) profileFields.status = req.body.status;
    if (req.body.githubusername) profileFields.githubusername = req.body.githubusername;
    // Skills - Split into array
    if (typeof req.body.skills !== 'undefined') {
        profileFields.skills = req.body.skills.split(',');
    }

    try {
        const profile = await Profile.findOne({ user: req.user.id });
        if (profile) {
            const profile = await Profile.findOneAndUpdate({ user: req.user.id }, { $set: profileFields }, { new: true });
            res.json(profile)
        } else {
            const profile = await Profile.findOne({ nickname: profileFields.nickname })
            if (profile) {
                errors.nickname = 'That nickname already exists';
                res.status(400).json(errors);
            }

            // Save profile
            const saveProfile = await new Profile(profileFields).save()
            res.json(saveProfile);
        }
    } catch (err) {
        return err;
    }
});

// @route   DELETE profile
// @desc    Delete user and profile
// @access  Private
router.delete('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        await Profile.findOneAndRemove({ user: req.user.id });
        await User.findOneAndRemove({ _id: req.user.id });
        res.json({ success: true });
    } catch (err) {
        return err;
    }
});

// @route       GET profile/github/:username/:count/:sort
// @desc        Get github data from github api
// @access      Public
router.get("/github/:username/:count/:sort", async (req, res) => {
    username = req.params.username;
    clientId = keys.clientId;
    clientSecret = keys.clientSecret;
    count = req.params.count;
    sort = req.params.sort;
    const options = {
        url: `https://api.github.com/users/${username}/repos?per_page=${count}&sort=${sort}&client_id=${clientId}&client_secret=${clientSecret}`,
        headers: {
            "User-Agent": "request"
        }
    };
    function callback(error, response, body) {
        if (!error && response.statusCode == 200) {
            const info = JSON.parse(body);
            res.json(info);
        }
    }
    await request(options, callback);
});

module.exports = router;