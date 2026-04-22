const Task = require('../models/Task');
const User = require('../models/User');

const PRIORITY_WEIGHTS = {
    low: 1,
    medium: 2,
    high: 3,
};

// Stage 3: weighted by status
const STATUS_WEIGHTS = {
    pending: 1.0,
    'in-progress': 1.25,
    completed: 0,
    rejected: 0,
};

/**
 * Calculate workload score for an employee
 * Workload score = sum of (effort * priority weight * status weight) for all pending/in-progress tasks
 * Higher score means more workload. Completed/rejected tasks do not contribute to workload.
 * Priority weight: low=1, medium=2, high=3
 * Status weight: pending=1.0, in-progress=1.25, completed=0, rejected=0
 * The score is rounded to 2 decimal places for easier readability.
 */
const calculateWorkloadScore = async (userId) => {
    try {
        const tasks = await Task.find({
            assignedTo: userId,
            isDeleted: { $ne: true },
            status: { $in: ['pending', 'in-progress'] },
        }).select('effort priority status');

        let totalWorkload = 0;

        for (const task of tasks) {
            const priorityWeight = PRIORITY_WEIGHTS[task.priority] || 1;
            const statusWeight = STATUS_WEIGHTS[task.status] ?? 1;
            totalWorkload += task.effort * priorityWeight * statusWeight;
        }

        return Math.round(totalWorkload * 100) / 100;
    } catch (error) {
        console.error('Error calculating workload:', error);
        throw error;
    }
};

const updateEmployeeWorkload = async (userId) => {
    try {
        const workloadScore = await calculateWorkloadScore(userId);

        await User.findByIdAndUpdate(userId, {
            currentWorkload: workloadScore,
        });

        return workloadScore;
    } catch (error) {
        console.error('Error updating workload:', error);
        throw error;
    }
};

const getTeamWorkload = async (companyId) => {
    try {
        const employees = await User.find({
            companyId,
            role: 'employee',
            isActive: true,
        }).select('fullName email department currentWorkload performanceScore skills');

        return employees.sort((a, b) => a.currentWorkload - b.currentWorkload);
    } catch (error) {
        console.error('Error fetching team workload:', error);
        throw error;
    }
};

const findBestAssignee = async (companyId, excludeUserIds = []) => {
    try {
        const employee = await User.findOne({
            companyId,
            role: 'employee',
            isActive: true,
            _id: { $nin: excludeUserIds },
        })
            .sort({ currentWorkload: 1 })
            .select('_id fullName email currentWorkload performanceScore skills');

        return employee;
    } catch (error) {
        console.error('Error finding best assignee:', error);
        throw error;
    }
};

module.exports = {
    calculateWorkloadScore,
    updateEmployeeWorkload,
    getTeamWorkload,
    findBestAssignee,
    PRIORITY_WEIGHTS,
    STATUS_WEIGHTS,
};