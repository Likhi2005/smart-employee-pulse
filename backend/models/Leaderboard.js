const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Company',
            required: true,
        },
        points: {
            type: Number,
            default: 0,
        },
        tasksCompleted: {
            type: Number,
            default: 0,
        },
        gamePoints: {
            type: Number,
            default: 0,
        },
        rank: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

// Index for ranking
leaderboardSchema.index({ companyId: 1, points: -1 });

module.exports = mongoose.model('Leaderboard', leaderboardSchema);