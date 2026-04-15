const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        industry: {
            type: String,
            default: 'Other',
        },
        managerName: {
            type: String,
            required: true,
        },
        managerEmail: {
            type: String,
            required: true,
            lowercase: true,
        },
        maxEmployees: {
            type: Number,
            default: 50,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Company', companySchema);