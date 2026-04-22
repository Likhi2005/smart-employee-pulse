const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
        },
        role: {
            type: String,
            enum: ['manager', 'employee'],
            required: true,
        },
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Company',
            required: true,
        },
        // Employee-only fields
        department: {
            type: String,
            default: null,
        },
        skills: {
            type: [String],
            default: [],
        },
        currentWorkload: {
            type: Number,
            default: 0, // Workload score
        },
        // Store a persisted score for analytics/filtering
        performanceScore: {
            type: Number,
            default: 0,
            min: 0,
        },
        // For first-time login password change
        isPasswordChanged: {
            type: Boolean,
            default: false, // Manager-created employees must change on first login
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

// Optional virtual so requirement "name" maps to fullName cleanly
userSchema.virtual('name').get(function () {
    return this.fullName;
});
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function (passwordToCheck) {
    return await bcrypt.compare(passwordToCheck, this.password);
};

// Exclude password from JSON output
const originalToJSON = userSchema.methods.toJSON;
userSchema.methods.toJSON = function () {
    const obj = originalToJSON ? originalToJSON.call(this) : this.toObject();
    delete obj.password;
    return obj;
};
module.exports = mongoose.model('User', userSchema);