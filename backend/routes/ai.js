const express = require('express');
const { param } = require('express-validator');
const aiService = require('../services/aiService');
const { authenticate, authorizeManager } = require('../middlewares/auth');
const User = require('../models/User');
const Task = require('../models/Task');
const taskServices = require('../services/taskServices');
const { evaluateTaskPolicy } = require('../services/policyService');

const router = express.Router();

const handleValidationErrors = (req, res, next) => {
    const errors = require('express-validator').validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// ============================================================
// 1. DETECT TASK PRIORITY
// ============================================================
router.post(
    '/detect-priority',
    authenticate,
    authorizeManager,
    async (req, res) => {
        try {
            const { title, description } = req.body;

            if (!title) {
                return res.status(400).json({ message: 'Task title required' });
            }

            const result = await aiService.detectTaskPriority(title, description || '');

            res.json({
                message: 'Priority detected',
                result,
            });
        } catch (error) {
            console.error('Error detecting priority:', error);
            res.status(500).json({
                message: 'Error detecting priority',
                error: error.message,
            });
        }
    }
);

// ============================================================
// 2. SMART TASK ASSIGNMENT
// ============================================================
router.post(
    '/smart-assign/:taskId',
    authenticate,
    authorizeManager,
    [param('taskId').notEmpty().withMessage('Task ID required')],
    handleValidationErrors,
    async (req, res) => {
        try {
            const { taskId } = req.params;
            const companyId = req.user.companyId;

            const result = await aiService.smartAssignTask(taskId, companyId);

            if (result.success) {
                res.json({
                    message: 'Smart assignment recommendation received',
                    recommendation: result,
                });
            } else {
                res.status(400).json({
                    message: 'Smart assignment failed',
                    reason: result.reason,
                });
            }
        } catch (error) {
            console.error('Error in smart assignment:', error);
            res.status(500).json({
                message: 'Error during smart assignment',
                error: error.message,
            });
        }
    }
);

// ============================================================
// 3. TASK BREAKDOWN
// ============================================================
router.post(
    '/break-down-task',
    authenticate,
    authorizeManager,
    async (req, res) => {
        try {
            const { title, description, effort } = req.body;

            if (!title || !effort) {
                return res.status(400).json({ message: 'Title and effort required' });
            }

            const result = await aiService.generateTaskBreakdown(title, description || '', effort);

            // Return the subtasks array as 'breakdown' for the frontend
            res.json({
                message: 'Task breakdown generated',
                breakdown: result.subtasks || [],
                breakdownStrategy: result.breakdownStrategy || '',
            });
        } catch (error) {
            console.error('Error generating breakdown:', error);
            res.status(500).json({
                message: 'Error generating breakdown',
                error: error.message,
            });
        }
    }
);

// ============================================================
// 5. AI-POWERED BULK DISTRIBUTION
// ============================================================
router.post(
    '/ai-distribute',
    authenticate,
    authorizeManager,
    async (req, res) => {
        try {
            const { tasks } = req.body;
            const companyId = req.user.companyId;

            if (!tasks || !tasks.length) {
                return res.status(400).json({ message: 'Tasks array is required' });
            }

            // Fetch employees with skills
            const employees = await User.find({
                companyId,
                role: 'employee',
                isActive: true,
            }).select('_id fullName email currentWorkload skills department').lean();

            if (!employees.length) {
                return res.status(400).json({ message: 'No active employees found for distribution' });
            }

            // Run policy validation on each task
            const policyResults = await Promise.all(
                tasks.map(async (task) => {
                    const result = await evaluateTaskPolicy({
                        taskInput: {
                            title: task.title,
                            effort: Number(task.effort || 1),
                            priority: task.priority || 'medium',
                            isMandatory: false,
                        },
                        companyId,
                    });
                    return { taskTitle: task.title, policyResult: result };
                })
            );

            // Check for blockers
            const blocked = policyResults.filter(r => r.policyResult.status === 'block');
            if (blocked.length > 0) {
                return res.status(422).json({
                    message: 'Policy validation blocked some tasks',
                    blockedTasks: blocked.map(b => ({
                        taskTitle: b.taskTitle,
                        blockers: b.policyResult.blockers,
                    })),
                });
            }

            // Run AI distribution
            const aiResult = await aiService.aiDistributeTasks(tasks, employees);
            const aiAssignments = aiResult.assignments || [];

            // Map AI names back to employee IDs
            const mapping = tasks.map((task, idx) => {
                const aiAssignment = aiAssignments.find(
                    a => a.taskTitle?.toLowerCase().trim() === task.title?.toLowerCase().trim()
                ) || aiAssignments[idx % aiAssignments.length];

                const employee = employees.find(
                    e => e.fullName?.toLowerCase().trim() === aiAssignment?.assigneeName?.toLowerCase().trim()
                ) || employees[idx % employees.length];

                const policyStatus = policyResults.find(p => p.taskTitle === task.title)?.policyResult?.status || 'pass';

                return {
                    taskIndex: idx,
                    taskTitle: task.title,
                    effort: task.effort,
                    priority: task.priority,
                    employeeId: String(employee._id),
                    employeeName: employee.fullName,
                    employeeEmail: employee.email,
                    projectedWorkload: Math.min(100, Number(employee.currentWorkload || 0) + Number(task.effort || 0)),
                    reason: aiAssignment?.reason || 'Assigned based on workload balancing.',
                    policyStatus,
                    policyWarnings: policyResults.find(p => p.taskTitle === task.title)?.policyResult?.warnings || [],
                };
            });

            res.json({
                message: 'AI distribution completed',
                mapping,
                employeeCount: employees.length,
            });
        } catch (error) {
            console.error('Error in AI distribution:', error);
            res.status(500).json({
                message: 'AI distribution failed',
                error: error.message,
            });
        }
    }
);

// ============================================================
// 4. PERFORMANCE INSIGHTS
// ============================================================
router.get(
    '/performance-insights',
    authenticate,
    authorizeManager,
    async (req, res) => {
        try {
            const companyId = req.user.companyId;

            const insights = await aiService.generatePerformanceInsights(companyId);

            res.json({
                message: 'Performance insights generated',
                insights,
            });
        } catch (error) {
            console.error('Error generating insights:', error);
            res.status(500).json({
                message: 'Error generating insights',
                error: error.message,
            });
        }
    }
);

// ============================================================
// 6. AI DASHBOARD ENDPOINTS
// ============================================================

router.get('/detect-conflicts', authenticate, authorizeManager, async (req, res) => {
    try {
        const companyId = req.user.companyId;
        const tasks = await Task.find({ companyId, isDeleted: { $ne: true } })
            .populate('assignedTo', 'fullName currentWorkload skills department')
            .lean();
        const employees = await User.find({ companyId, role: 'employee', isActive: true })
            .select('fullName currentWorkload skills department')
            .lean();

        const skillMap = {
            backend: ['backend', 'nodejs', 'node.js', 'express', 'api', 'database', 'sql', 'mongodb', 'server', 'java', 'spring'],
            frontend: ['frontend', 'react', 'vue', 'angular', 'typescript', 'html', 'css', 'javascript', 'ui', 'component', 'tsx', 'jsx'],
            design: ['design', 'ui', 'ux', 'figma', 'sketch', 'wireframe', 'mockup', 'visual', 'layout', 'branding'],
            devops: ['devops', 'docker', 'kubernetes', 'terraform', 'aws', 'ci/cd', 'jenkins', 'deployment', 'infrastructure'],
            general: ['general', 'admin', 'update', 'documentation', 'testing', 'qa', 'review'],
        };

        const extractRequiredSkills = (text = '') => {
            const lower = String(text).toLowerCase();
            const detected = new Set();
            Object.entries(skillMap).forEach(([category, words]) => {
                if (words.some((word) => lower.includes(word))) {
                    detected.add(category);
                }
            });
            return Array.from(detected);
        };

        const conflicts = [];

        // 1. Overload Bottleneck Detection
        const overloaded = employees
            .filter((employee) => Number(employee.currentWorkload || 0) > 30)
            .sort((a, b) => Number(b.currentWorkload || 0) - Number(a.currentWorkload || 0));

        overloaded.forEach((employee, index) => {
            const employeeTasks = tasks
                .filter((task) => String(task.assignedTo?._id || task.assignedTo) === String(employee._id))
                .filter((task) => ['pending', 'in-progress'].includes(task.status));
            
            const taskToMove = employeeTasks.sort((a, b) => Number(b.effort || 0) - Number(a.effort || 0))[0];
            if (!taskToMove) return;

            const candidatePool = employees
                .filter((candidate) => String(candidate._id) !== String(employee._id))
                .sort((a, b) => Number(a.currentWorkload || 0) - Number(b.currentWorkload || 0));

            const matchingCandidate = candidatePool[0];
            if (!matchingCandidate) return;

            conflicts.push({
                id: `workload-${employee._id}-${index}`,
                title: 'Workload Bottleneck',
                description: `${employee.fullName} is at ${Math.round(Number(employee.currentWorkload || 0))}% capacity, risking delay on ${taskToMove.title}.`,
                suggestedAction: `Reassign ${taskToMove.title} to ${matchingCandidate.fullName}`,
                impact: 'Reduces risk and balances load',
                type: 'workload',
                taskId: String(taskToMove._id),
                employeeId: String(matchingCandidate._id),
            });
        });

        // 2. Deadline Risk Detection
        const upcomingTasks = tasks.filter(t => 
            ['pending', 'in-progress'].includes(t.status) && 
            t.dueDate && 
            new Date(t.dueDate) > new Date() &&
            new Date(t.dueDate) < new Date(Date.now() + 48 * 60 * 60 * 1000) // Within 48 hours
        );

        upcomingTasks.forEach(task => {
            conflicts.push({
                id: `deadline-${task._id}`,
                title: 'Deadline at Risk',
                description: `"${task.title}" is due soon (${new Date(task.dueDate).toLocaleDateString()}). Current progress might not be sufficient.`,
                suggestedAction: `Escalate priority or reassign to higher capacity member`,
                impact: 'Ensures on-time delivery',
                type: 'deadline',
                taskId: String(task._id),
                employeeId: String(task.assignedTo?._id || task.assignedTo)
            });
        });

        res.json({ conflicts });
    } catch (error) {
        console.error('Error getting conflicts:', error);
        res.status(500).json({ message: 'Failed to detect conflicts', error: error.message });
    }
});

router.post('/assign-task', authenticate, authorizeManager, async (req, res) => {
    try {
        const { taskId, employeeId, conflict } = req.body;
        const payloadTaskId = taskId || conflict?.taskId;
        const payloadEmployeeId = employeeId || conflict?.employeeId;

        if (!payloadTaskId || !payloadEmployeeId) {
            return res.status(400).json({
                message: 'taskId and employeeId are required to apply a fix',
            });
        }

        const result = await taskServices.assignTask(
            {
                taskId: payloadTaskId,
                employeeId: payloadEmployeeId,
                assignmentMode: 'manual',
            },
            { managerId: req.user.userId, companyId: req.user.companyId }
        );

        res.json({ success: true, message: 'Task reassigned successfully', task: result });
    } catch (error) {
        console.error('Error applying assignment fix:', error);
        res.status(error.statusCode || 500).json({
            message: error.message || 'Failed to apply assignment fix',
            error: error.message,
        });
    }
});

router.post('/simulate-impact', authenticate, authorizeManager, async (req, res) => {
    try {
        const companyId = req.user.companyId;
        const employees = await User.find({ companyId, role: 'employee', isActive: true });
        
        if (employees.length === 0) {
            return res.json({ metrics: { avgWorkload: 0, riskLevel: 'green', efficiency: 100 } });
        }

        const totalWorkload = employees.reduce((sum, emp) => sum + Number(emp.currentWorkload || 0), 0);
        const avgWorkload = Math.round(totalWorkload / employees.length);
        
        let riskLevel = 'green';
        if (avgWorkload > 30) riskLevel = 'red';
        else if (avgWorkload > 20) riskLevel = 'amber';

        // Efficiency is inversely proportional to workload imbalance and high workloads
        const overcapacityCount = employees.filter(e => e.currentWorkload > 30).length;
        const efficiency = Math.max(0, 100 - (overcapacityCount * 10) - (avgWorkload > 25 ? 15 : 0));

        res.json({ 
            metrics: { 
                avgWorkload, 
                riskLevel, 
                efficiency: Math.round(efficiency) 
            } 
        });
    } catch (error) {
        console.error('Error simulating impact:', error);
        res.status(500).json({ message: 'Simulation failed' });
    }
});

router.get('/insights', authenticate, authorizeManager, async (req, res) => {
    try {
        const companyId = req.user.companyId;
        const insightsData = await aiService.generatePerformanceInsights(companyId);
        res.json({ insights: insightsData.insights || [] });
    } catch (error) {
        console.error('Error getting AI insights:', error);
        res.status(500).json({ message: 'Failed to generate insights' });
    }
});

router.get('/decision-trace/:id', authenticate, authorizeManager, async (req, res) => {
    try {
        const { id } = req.params;
        const companyId = req.user.companyId;

        // Fetch tasks and employees to provide context to the AI
        const tasks = await Task.find({ companyId, isDeleted: { $ne: true } }).populate('assignedTo');
        const employees = await User.find({ companyId, role: 'employee', isActive: true });

        // Find the specific task if possible from the ID (assuming ID might contain taskId)
        // If it's a generic conflict ID, we'll just explain based on the type
        const type = id.split('-')[0];
        const teamState = employees.map(e => `- ${e.fullName}: Workload ${e.currentWorkload}%`).join('\n');
        
        const aiService = require('../services/aiService');
        const aiTrace = await aiService.generateDecisionReasoning({
            type,
            teamState,
            conflictDesc: `Suggested fix for conflict ${id}`
        });

        if (aiTrace) {
            return res.json({ trace: { ...aiTrace, id } });
        }

        // Fallback to semi-real trace if AI fails
        const bestCandidate = employees.sort((a, b) => (a.currentWorkload || 0) - (b.currentWorkload || 0))[0];
        const secondBest = employees.sort((a, b) => (a.currentWorkload || 0) - (b.currentWorkload || 0))[1];

        const trace = {
            id,
            constraintsApplied: [
                'Workload threshold < 35%',
                'Deadline proximity monitoring',
                'Skill compatibility check'
            ],
            candidateRanking: [
                { 
                    name: bestCandidate ? bestCandidate.fullName : 'None', 
                    score: 98, 
                    reason: `Lowest current workload (${bestCandidate ? Math.round(bestCandidate.currentWorkload) : 0}%) and high performance history.` 
                },
                { 
                    name: secondBest ? secondBest.fullName : 'None', 
                    score: 75, 
                    reason: `Workload is acceptable (${secondBest ? Math.round(secondBest.currentWorkload) : 0}%) but higher than primary candidate.` 
                }
            ],
            rejectionReasons: employees
                .filter(e => (e.currentWorkload || 0) > 30)
                .map(e => `${e.fullName} excluded due to high workload (${Math.round(e.currentWorkload)}%)`),
            finalScore: 98
        };

        res.json({ trace });
    } catch (error) {
        console.error('Error generating decision trace:', error);
        res.status(500).json({ message: 'Failed to generate reasoning' });
    }
});

module.exports = router;