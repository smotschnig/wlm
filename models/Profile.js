const mongoose = require('mongoose');
const { Schema } = mongoose;

// Create Schema
const profileSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    nickname: {
        type: String,
        required: true
    },
    age: {
        type: Date,
        default: Date.now
    },
    location: {
        type: String
    },
    status: {
        type: String,
        required: true
    },
    skills: {
        type: [String],
        required: true
    },
    githubusername: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    }
});

mongoose.model('profile', profileSchema);