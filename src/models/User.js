const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    // name: String,
    // email: { type: String, unique: true },
    // role: { type: String, default: 'user' },
    // status: { type: String, default: 'active' },
    // age: Number
}, { timestamps: true,  collection: 'user' });

module.exports = mongoose.model('user', UserSchema);
