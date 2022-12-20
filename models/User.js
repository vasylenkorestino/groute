const { Schema, model } = require('mongoose')

module.exports = model('User', {
    email: { type: String, required: true },
    password: { type: String, required: true },
    isActive: { type: Boolean },
    isAdmin: { type: Boolean },
    username: { type: String },
    sfUser: { type: String },
    driverName: { type: String },
}, 'User')