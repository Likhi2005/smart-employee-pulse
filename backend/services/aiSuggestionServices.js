const User = require('../models/User');
const Task = require('../models/Task');
const workloadService = require('./workloadService');

/**
 * Get AI suggestion for task assignment
 * Returns the employee with the lowest workload
 * 
 * Why simple AI?
 * - Explainable: Manager understands WHY this employee is suggested
 * - Fast: No API calls, no hallucinations
 * - Reliable: Pure logic based on actual workload
 */
const getSuggestionForTask = async (taskId, companyId) => {
    try {
        // Get task details
        const task = await Task.findOne({ _id: taskId, companyId });
        if (!task) {
            throw new Error('Task not found');
        }

        // Get all active employees in company
        const employees = await User.find({
            companyId,
            role: 'employee',
            isActive: true,
        }).select('_id fullName email department currentWorkload');

        if (employees.length === 0) {
            return {
                suggested: false,
                reason: 'No active employees in company',
            };
        }

        // Sort by workload (ascending) and get the first one
        const bestEmployee = employees.sort(
            (a, b) => a.currentWorkload - b.currentWorkload
        )[0];

        // Calculate impact of assigning this task
        const priorityWeight = workloadService.PRIORITY_WEIGHTS[task.priority] || 1;
        const workloadImpact = task.effort * priorityWeight;
        const projectedWorkload = bestEmployee.currentWorkload + workloadImpact;

        return {
            suggested: true,
            employee: {
                id: bestEmployee._id,
                fullName: bestEmployee.fullName,
                email: bestEmployee.email,
                department: bestEmployee.department,
            },
            analysis: {
                currentWorkload: bestEmployee.currentWorkload,
                taskImpact: workloadImpact,
                projectedWorkload,
                reason: `${bestEmployee.fullName} has the lowest current workload (${bestEmployee.currentWorkload}). Assigning this task will increase their workload by ${workloadImpact} points.`,
            },
        };
    } catch (error) {
        console.error('Error getting AI suggestion:', error);
        throw error;
    }
};

/**
 * Get multiple suggestions (top 3 candidates)
 * Useful when manager wants alternatives
 */
const getTopSuggestions = async (taskId, companyId, count = 3) => {
    try {
        const task = await Task.findOne({ _id: taskId, companyId });
        if (!task) {
            throw new Error('Task not found');
        }

        const employees = await User.find({
            companyId,
            role: 'employee',
            isActive: true,
        }).select('_id fullName email department currentWorkload');

        if (employees.length === 0) {
            return [];
        }

        // Sort by workload and get top N
        const priorityWeight = workloadService.PRIORITY_WEIGHTS[task.priority] || 1;
        const workloadImpact = task.effort * priorityWeight;

        const suggestions = employees
            .sort((a, b) => a.currentWorkload - b.currentWorkload)
            .slice(0, Math.min(count, employees.length))
            .map((emp, index) => ({
                rank: index + 1,
                employee: {
                    id: emp._id,
                    fullName: emp.fullName,
                    email: emp.email,
                    department: emp.department,
                },
                currentWorkload: emp.currentWorkload,
                projectedWorkload: emp.currentWorkload + workloadImpact,
                workloadIncrease: workloadImpact,
            }));

        return suggestions;
    } catch (error) {
        console.error('Error getting top suggestions:', error);
        throw error;
    }
};

/**
 * Get workload distribution analysis
 * Useful for manager to understand team balance
 */
const getWorkloadDistribution = async (companyId) => {
    try {
        const employees = await User.find({
            companyId,
            role: 'employee',
            isActive: true,
        }).select('fullName currentWorkload');

        if (employees.length === 0) {
            return {
                average: 0,
                min: 0,
                max: 0,
                distribution: [],
            };
        }

        const workloads = employees.map((e) => e.currentWorkload);
        const total = workloads.reduce((a, b) => a + b, 0);
        const average = total / employees.length;
        const min = Math.min(...workloads);
        const max = Math.max(...workloads);

        // Calculate standard deviation
        const variance =
            workloads.reduce((sum, w) => sum + Math.pow(w - average, 2), 0) /
            employees.length;
        const stdDev = Math.sqrt(variance);

        return {
            teamSize: employees.length,
            totalWorkload: total,
            averageWorkload: Math.round(average * 10) / 10,
            minWorkload: min,
            maxWorkload: max,
            standardDeviation: Math.round(stdDev * 10) / 10,
            imbalance: max - min,
            distribution: employees.map((emp) => ({
                name: emp.fullName,
                workload: emp.currentWorkload,
                percentageOfTotal: Math.round((emp.currentWorkload / total) * 100),
            })),
        };
    } catch (error) {
        console.error('Error getting workload distribution:', error);
        throw error;
    }
};

module.exports = {
    getSuggestionForTask,
    getTopSuggestions,
    getWorkloadDistribution,
};