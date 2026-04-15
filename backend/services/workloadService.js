const Task = require('../models/Task');
const User = require('../models/User');

// Priority weight mapping
const PRIORITY_WEIGHTS = {
    low: 1,
    medium: 2,
    high: 3,
};

/**
 * Calculate workload score for an employee
 * Formula: Σ(effort × priority_weight) for all active tasks
 * Active tasks = pending, accepted (not completed/rejected)
 */
const calculateWorkloadScore = async (userId) => {
    try {
        const tasks = await Task.find({
            assignedTo: userId,
            status: { $in: ['pending', 'accepted'] }, // Only active tasks
        });

        let totalWorkload = 0;

        tasks.forEach((task) => {
            const weight = PRIORITY_WEIGHTS[task.priority] || 1;
            const contribution = task.effort * weight;
            totalWorkload += contribution;
        });

        return totalWorkload;
    } catch (error) {
        console.error('Error calculating workload:', error);
        throw error;
    }
};

/**
 * Update employee's workload in database
 */
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

/**
 * Get team workload (for manager dashboard)
 * Returns employees with their current workload
 */
const getTeamWorkload = async (companyId) => {
    try {
        const employees = await User.find({
            companyId,
            role: 'employee',
            isActive: true,
        }).select('fullName email department currentWorkload');

        return employees.sort((a, b) => a.currentWorkload - b.currentWorkload);
    } catch (error) {
        console.error('Error fetching team workload:', error);
        throw error;
    }
};

/**
 * Find employee with lowest workload (for AI suggestion)
 */
const findBestAssignee = async (companyId, excludeUserIds = []) => {
    try {
        const employee = await User.findOne({
            companyId,
            role: 'employee',
            isActive: true,
            _id: { $nin: excludeUserIds },
        })
            .sort({ currentWorkload: 1 })
            .select('_id fullName email currentWorkload');

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
};