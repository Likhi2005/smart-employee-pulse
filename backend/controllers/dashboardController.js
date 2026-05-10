const Task = require('../models/Task');
const User = require('../models/User');
const Leaderboard = require('../models/Leaderboard');
const workloadService = require('../services/workloadService');
const aiSuggestionService = require('../services/aiSuggestionService');

// ============================================================
// MANAGER DASHBOARD
// ============================================================
const getManagerDashboard = async (req, res) => {
    try {
        const companyId = req.user.companyId;

        // 1. Get team statistics
        const totalEmployees = await User.countDocuments({
            companyId,
            role: 'employee',
            isActive: true,
        });

        const teamWorkload = await workloadService.getTeamWorkload(companyId);

        // 2. Get task statistics
        const totalTasks = await Task.countDocuments({ companyId });
        const pendingTasks = await Task.countDocuments({
            companyId,
            status: 'pending',
        });
        const acceptedTasks = await Task.countDocuments({
            companyId,
            status: { $in: ['accepted', 'in-progress'] },
        });
        const completedTasks = await Task.countDocuments({
            companyId,
            status: 'completed',
        });
        const rejectedTasks = await Task.countDocuments({
            companyId,
            status: 'rejected',
        });

        // 3. Get recent tasks
        const recentTasks = await Task.find({ companyId })
            .populate('assignedTo', 'fullName email')
            .populate('assignedBy', 'fullName email')
            .sort({ createdAt: -1 })
            .limit(5);

        // 4. Get workload distribution
        const workloadDistribution =
            await aiSuggestionService.getWorkloadDistribution(companyId);

        // 5. Get employees with highest and lowest workload
        const overloadedEmployee = teamWorkload[teamWorkload.length - 1]; // Highest
        const underutilizedEmployee = teamWorkload[0]; // Lowest

        res.json({
            message: 'Manager dashboard data retrieved',
            dashboard: {
                teamStats: {
                    totalEmployees,
                    avgWorkload: Math.round(workloadDistribution.averageWorkload * 10) / 10,
                    maxWorkload: workloadDistribution.maxWorkload,
                    minWorkload: workloadDistribution.minWorkload,
                    workloadImbalance: workloadDistribution.imbalance,
                },
                taskStats: {
                    total: totalTasks,
                    pending: pendingTasks,
                    accepted: acceptedTasks,
                    completed: completedTasks,
                    rejected: rejectedTasks,
                },
                teamWorkload: teamWorkload,
                recentTasks,
                alerts: {
                    overloadedEmployee: overloadedEmployee
                        ? {
                            name: overloadedEmployee.fullName,
                            workload: overloadedEmployee.currentWorkload,
                            message: `${overloadedEmployee.fullName} is overloaded with ${overloadedEmployee.currentWorkload} workload points`,
                        }
                        : null,
                    underutilizedEmployee: underutilizedEmployee
                        ? {
                            name: underutilizedEmployee.fullName,
                            workload: underutilizedEmployee.currentWorkload,
                            message: `${underutilizedEmployee.fullName} can take more work (${underutilizedEmployee.currentWorkload} workload points)`,
                        }
                        : null,
                },
            },
        });
    } catch (error) {
        console.error('Error getting manager dashboard:', error);
        res.status(500).json({
            message: 'Error fetching dashboard',
            error: error.message,
        });
    }
};

// ============================================================
// EMPLOYEE DASHBOARD
// ============================================================
const getEmployeeDashboard = async (req, res) => {
    try {
        const employeeId = req.user.userId;
        const companyId = req.user.companyId;

        // 1. Get employee info
        const employee = await User.findById(employeeId).select(
            'fullName email department currentWorkload'
        );

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        // 2. Get task statistics
        const myTasks = await Task.find({ assignedTo: employeeId });
        const pendingTasks = myTasks.filter((t) => t.status === 'pending').length;
        const acceptedTasks = myTasks.filter((t) => t.status === 'accepted').length;
        const completedTasks = myTasks.filter((t) => t.status === 'completed').length;
        const rejectedTasks = myTasks.filter((t) => t.status === 'rejected').length;

        // 3. Get leaderboard info
        const leaderboard = await Leaderboard.findOne({
            userId: employeeId,
            companyId,
        }).select('points tasksCompleted gamePoints rank');

        // Get company-wide leaderboard (top 10)
        const companyLeaderboard = await Leaderboard.find({ companyId })
            .populate('userId', 'fullName')
            .sort({ points: -1 })
            .limit(10)
            .select('userId points tasksCompleted rank');

        // 5. Get active tasks (pending + accepted + in-progress)
        const activeTasks = await Task.find({
            assignedTo: employeeId,
            status: { $in: ['pending', 'accepted', 'in-progress'] },
        })
            .populate('assignedBy', 'fullName email')
            .sort({ dueDate: 1 });

        // 6. Calculate overtime risk (if workload > threshold)
        const HIGH_WORKLOAD_THRESHOLD = 30; // Adjust based on your needs
        const isOverloaded = employee.currentWorkload > HIGH_WORKLOAD_THRESHOLD;

        res.json({
            message: 'Employee dashboard data retrieved',
            dashboard: {
                profile: {
                    fullName: employee.fullName,
                    email: employee.email,
                    department: employee.department,
                    currentWorkload: employee.currentWorkload,
                    workloadStatus: isOverloaded ? 'overloaded' : 'normal',
                },
                taskStats: {
                    total: myTasks.length,
                    pending: pendingTasks,
                    accepted: acceptedTasks,
                    completed: completedTasks,
                    rejected: rejectedTasks,
                },
                performance: {
                    points: leaderboard?.points || 0,
                    tasksCompleted: leaderboard?.tasksCompleted || 0,
                    gamePoints: leaderboard?.gamePoints || 0,
                    rank: leaderboard?.rank || 0,
                },
                activeTasks,
                leaderboard: companyLeaderboard
                    .filter(entry => entry.userId) // Ensure userId exists
                    .map((entry, index) => ({
                        rank: index + 1,
                        name: entry.userId.fullName || 'Unknown User',
                        points: entry.points,
                        tasksCompleted: entry.tasksCompleted,
                    })),
            },
        });
    } catch (error) {
        console.error('Error getting employee dashboard:', error);
        res.status(500).json({
            message: 'Error fetching dashboard',
            error: error.message,
        });
    }
};

module.exports = {
    getManagerDashboard,
    getEmployeeDashboard,
};