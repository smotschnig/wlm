const validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateProfileInput(data) {
    let errors = {};

    data.hannicknamedle = !isEmpty(data.nickname) ? data.nickname : '';
    data.status = !isEmpty(data.status) ? data.status : '';
    data.skills = !isEmpty(data.skills) ? data.skills : '';


    if (!validator.isLength(data.nickname, { min: 2, max: 40 })) {
        errors.nickname = 'Nickname needs to be between 2 and 40 characters';
    }

    if (validator.isEmpty(data.nickname)) {
        errors.nickname = 'Profile nickname is required';
    }

    if (validator.isEmpty(data.status)) {
        errors.status = 'Status field is required';
    }

    if (validator.isEmpty(data.skills)) {
        errors.skills = 'Skills field is required';
    }

    return {
        errors,
        isValid: isEmpty(errors)
    }
};
