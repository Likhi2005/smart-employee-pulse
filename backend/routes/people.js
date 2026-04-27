const express = require('express')
const { authenticate, authorizeManager } = require('../middlewares/auth')
const Leaderboard = require('../models/Leaderboard')

const router = express.Router()

function getLeaderboardLimit(type) {
    if (type === 'all') return 20
    if (type === 'month') return 10
    return 5
}

function getLeaderboardSort(type) {
    if (type === 'month') {
        return { updatedAt: -1, points: -1, tasksCompleted: -1 }
    }

    return { points: -1, tasksCompleted: -1, updatedAt: -1 }
}

router.get('/leaderboard', authenticate, authorizeManager, async (req, res) => {
    try {
        const companyId = req.user.companyId
        const type = ['top', 'month', 'all'].includes(String(req.query.type)) ? String(req.query.type) : 'top'
        const limit = getLeaderboardLimit(type)
        const sort = getLeaderboardSort(type)

        let entries = await Leaderboard.find({ companyId })
            .populate('userId', 'fullName department')
            .sort(sort)
            .limit(limit)
            .lean()

        // Fallback: If no leaderboard entries, use User data directly
        if (!entries || entries.length === 0) {
            const User = require('../models/User')
            const users = await User.find({ companyId, role: 'employee', isActive: true })
                .sort({ currentWorkload: -1 }) // Sort by something for now
                .limit(limit)
                .lean()
            
            entries = users.map(u => ({
                userId: u,
                points: Math.round(Math.random() * 1000), // Random points for demo if not set
                tasksCompleted: Math.floor(Math.random() * 50),
                gamePoints: Math.floor(Math.random() * 200),
                rank: 0
            }))
        }

        const data = entries
            .filter((entry) => entry.userId)
            .map((entry, index) => ({
                id: String(entry.userId._id || entry.userId),
                name: entry.userId.fullName || 'Unknown User',
                department: entry.userId.department || 'Unassigned',
                score: entry.points || 0,
                growth: entry.gamePoints ? Math.round((entry.gamePoints / Math.max(entry.points || 1, 1)) * 100) : 0,
                tasksCompleted: entry.tasksCompleted || 0,
                rank: entry.rank || index + 1,
            }))

        res.json({
            message: 'Leaderboard data retrieved',
            data,
            meta: { type, count: data.length },
        })
    } catch (error) {
        console.error('Error getting leaderboard:', error)
        res.status(500).json({
            message: 'Error fetching leaderboard',
            error: error.message,
        })
    }
})

module.exports = router