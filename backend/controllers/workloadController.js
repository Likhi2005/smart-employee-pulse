const Task = require('../models/Task');
const User = require('../models/User');
const workloadService = require('../services/workloadService');

// ============================================================
// WORKLOAD SUMMARY
// ============================================================
const getWorkloadSummary = async (req, res) => {
    try {
        const companyId = req.user.companyId;
        
        // Get all active employees
        const employees = await User.find({
            companyId,
            role: 'employee',
            isActive: true,
        }).select('currentWorkload');

        // Get task statistics
        const tasks = await Task.find({
            companyId,
            isDeleted: { $ne: true },
        });

        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.status === 'completed').length;
        const activeTasks = tasks.filter(t => ['pending', 'in-progress'].includes(t.status)).length;
        const rejectedTasks = tasks.filter(t => t.status === 'rejected').length;

        // Calculate workload statistics
        const workloads = employees.map(e => e.currentWorkload);
        const avgWorkload = workloads.length > 0 ? Math.round((workloads.reduce((a, b) => a + b, 0) / workloads.length) * 100) / 100 : 0;
        const maxWorkload = workloads.length > 0 ? Math.max(...workloads) : 0;
        const minWorkload = workloads.length > 0 ? Math.min(...workloads) : 0;

        // Identify overloaded employees (>30 workload)
        const overloadedEmployees = employees.filter(e => e.currentWorkload > 30).length;
        const healthyEmployees = employees.filter(e => e.currentWorkload <= 20).length;

        // Completion rate
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        res.json({
            message: 'Workload summary retrieved',
            summary: {
                totalEmployees: employees.length,
                totalTasks,
                activeTasks,
                completedTasks,
                rejectedTasks,
                avgWorkload,
                maxWorkload,
                minWorkload,
                overloadedEmployees,
                healthyEmployees,
                completionRate,
                workloadDistribution: {
                    low: workloads.filter(w => w < 15).length,
                    medium: workloads.filter(w => w >= 15 && w < 30).length,
                    high: workloads.filter(w => w >= 30).length,
                },
            },
        });
    } catch (error) {
        console.error('Error getting workload summary:', error);
        res.status(500).json({ message: 'Error fetching workload summary', error: error.message });
    }
};

// ============================================================
// WORKLOAD BY TEAM
// ============================================================
const getWorkloadByTeam = async (req, res) => {
    try {
        const companyId = req.user.companyId;

        // Get all employees with team/department info
        const employees = await User.find({
            companyId,
            role: 'employee',
            isActive: true,
        }).select('fullName email department currentWorkload performanceScore');

        // Group by department
        const teamWorkload = {};
        const teams = [];

        for (const emp of employees) {
            const dept = emp.department || 'Unassigned';
            if (!teamWorkload[dept]) {
                teamWorkload[dept] = {
                    name: dept,
                    employees: [],
                    totalWorkload: 0,
                    avgWorkload: 0,
                    maxWorkload: 0,
                    employeeCount: 0,
                    overloaded: 0,
                };
            }

            teamWorkload[dept].employees.push({
                id: emp._id,
                name: emp.fullName,
                email: emp.email,
                workload: emp.currentWorkload,
                performanceScore: emp.performanceScore || 0,
                status: emp.currentWorkload > 30 ? 'critical' : emp.currentWorkload > 20 ? 'elevated' : 'healthy',
            });

            teamWorkload[dept].totalWorkload += emp.currentWorkload;
            teamWorkload[dept].employeeCount++;
            if (emp.currentWorkload > 30) teamWorkload[dept].overloaded++;
        }

        // Compute aggregates
        for (const teamName in teamWorkload) {
            const team = teamWorkload[teamName];
            team.avgWorkload = team.employeeCount > 0 ? Math.round((team.totalWorkload / team.employeeCount) * 100) / 100 : 0;
            team.maxWorkload = team.employees.length > 0 ? Math.max(...team.employees.map(e => e.workload)) : 0;
            team.status = team.overloaded > 0 ? 'critical' : team.avgWorkload > 20 ? 'elevated' : 'healthy';
            teams.push(team);
        }

        // Sort by average workload (highest first)
        teams.sort((a, b) => b.avgWorkload - a.avgWorkload);

        res.json({
            message: 'Workload by team retrieved',
            teams,
        });
    } catch (error) {
        console.error('Error getting workload by team:', error);
        res.status(500).json({ message: 'Error fetching workload by team', error: error.message });
    }
};

// ============================================================
// WORKLOAD ANALYTICS
// ============================================================
const getWorkloadAnalytics = async (req, res) => {
    try {
        const companyId = req.user.companyId;
        const { startDate, endDate } = req.query;

        // Get task completion metrics over time
        const tasks = await Task.find({
            companyId,
            isDeleted: { $ne: true },
        }).select('status priority effort completedAt createdAt');

        // Task state breakdown
        const taskStates = {
            pending: tasks.filter(t => t.status === 'pending').length,
            'in-progress': tasks.filter(t => t.status === 'in-progress').length,
            completed: tasks.filter(t => t.status === 'completed').length,
            rejected: tasks.filter(t => t.status === 'rejected').length,
        };

        // Priority breakdown
        const priorityBreakdown = {
            low: tasks.filter(t => t.priority === 'low').length,
            medium: tasks.filter(t => t.priority === 'medium').length,
            high: tasks.filter(t => t.priority === 'high').length,
        };

        // Get employees with task counts
        const employees = await User.find({
            companyId,
            role: 'employee',
            isActive: true,
        }).select('fullName currentWorkload');

        const employeeTaskCounts = [];
        for (const emp of employees) {
            const empTasks = tasks.filter(t => t.assignedTo?.toString() === emp._id.toString());
            employeeTaskCounts.push({
                name: emp.fullName,
                workload: emp.currentWorkload,
                taskCount: empTasks.length,
                completed: empTasks.filter(t => t.status === 'completed').length,
            });
        }

        // Identify bottlenecks (high workload, low completion)
        const bottlenecks = employeeTaskCounts
            .filter(e => e.workload > 25)
            .sort((a, b) => (b.workload - b.completed) - (a.workload - a.completed))
            .slice(0, 5);

        res.json({
            message: 'Workload analytics retrieved',
            analytics: {
                taskStates,
                priorityBreakdown,
                bottlenecks,
                employeeTaskCounts,
                totalEffort: tasks.reduce((sum, t) => sum + t.effort, 0),
            },
        });
    } catch (error) {
        console.error('Error getting workload analytics:', error);
        res.status(500).json({ message: 'Error fetching workload analytics', error: error.message });
    }
};

// ============================================================
// EMPLOYEE DRILL-DOWN
// ============================================================
const getEmployeeWorkloadDetails = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const companyId = req.user.companyId;

        const employee = await User.findOne({
            _id: employeeId,
            companyId,
            role: 'employee',
        }).select('fullName email department currentWorkload performanceScore skills');

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        const tasks = await Task.find({
            assignedTo: employeeId,
            isDeleted: { $ne: true },
        }).select('title priority status effort dueDate completedAt');

        const taskBreakdown = {
            pending: tasks.filter(t => t.status === 'pending').length,
            'in-progress': tasks.filter(t => t.status === 'in-progress').length,
            completed: tasks.filter(t => t.status === 'completed').length,
            rejected: tasks.filter(t => t.status === 'rejected').length,
        };

        const priorityDistribution = {
            low: tasks.filter(t => t.priority === 'low').length,
            medium: tasks.filter(t => t.priority === 'medium').length,
            high: tasks.filter(t => t.priority === 'high').length,
        };

        res.json({
            message: 'Employee workload details retrieved',
            details: {
                employee: {
                    id: employee._id,
                    name: employee.fullName,
                    email: employee.email,
                    department: employee.department,
                    workload: employee.currentWorkload,
                    performanceScore: employee.performanceScore,
                },
                tasks,
                taskBreakdown,
                priorityDistribution,
                totalTasks: tasks.length,
                avgEffort: tasks.length > 0 ? Math.round((tasks.reduce((sum, t) => sum + t.effort, 0) / tasks.length) * 100) / 100 : 0,
            },
        });
    } catch (error) {
        console.error('Error getting employee workload details:', error);
        res.status(500).json({ message: 'Error fetching employee details', error: error.message });
    }
};

// ============================================================
// WORKLOAD TRENDS (Time series)
// ============================================================
const getWorkloadTrends = async (req, res) => {
    try {
        const companyId = req.user.companyId;
        const { days = 30 } = req.query;

        // Generate time series data
        const trendData = [];
        const now = new Date();

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const startOfDay = new Date(date.setHours(0, 0, 0, 0));
            const endOfDay = new Date(date.setHours(23, 59, 59, 999));

            const tasksInDay = await Task.find({
                companyId,
                createdAt: { $gte: startOfDay, $lte: endOfDay },
                isDeleted: { $ne: true },
            });

            const completedInDay = await Task.find({
                companyId,
                completedAt: { $gte: startOfDay, $lte: endOfDay },
                isDeleted: { $ne: true },
            });

            trendData.push({
                date: date.toISOString().split('T')[0],
                assigned: tasksInDay.length,
                completed: completedInDay.length,
                activeEmployees: (await User.find({
                    companyId,
                    role: 'employee',
                    isActive: true,
                })).length,
            });
        }

        res.json({
            message: 'Workload trends retrieved',
            trends: trendData,
        });
    } catch (error) {
        console.error('Error getting workload trends:', error);
        res.status(500).json({ message: 'Error fetching workload trends', error: error.message });
    }
};

module.exports = {
    getWorkloadSummary,
    getWorkloadByTeam,
    getWorkloadAnalytics,
    getEmployeeWorkloadDetails,
    getWorkloadTrends,
};
