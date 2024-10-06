const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String,
        enum: ['user', 'company', 'freelancer'],  // Define the allowed roles
        required: true  // Ensure the role is provided during registration
    },
    bio: { type: String },
    socialMedia: {
        instagram: { type: String },
        youtube: { type: String },
        facebook: { type: String },
    },
    profilePic: { type: String },  // This will store the profile picture filename
    engagements: { type: Number, default: 0 },
    analytics: {
        growthRate: { type: Number, default: 0 },
        popularContent: { type: String },
    }
});

// Apply the passportLocalMongoose plugin to userSchema
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);
