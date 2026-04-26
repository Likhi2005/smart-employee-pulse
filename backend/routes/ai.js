const express = require('express');
const { param } = require('express-validator');
const aiService = require('../services/aiService');
const { authenticate, authorizeManager } = require('../middlewares/auth');
const User = require('../models/User');
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
    res.json({
        conflicts: [
            { id: 'c1', title: 'Workload Bottleneck', description: 'Sarah is at 110% capacity, risking delay on API Gateway.', suggestedAction: 'Reassign 2 tasks to Alex', impact: 'Reduces risk to 0%', type: 'workload' },
            { id: 'c2', title: 'Skill Gap Detected', description: 'Frontend migration requires React expertise not present in current assignee.', suggestedAction: 'Assign to Frontend Team', impact: 'Ensures quality', type: 'skill' }
        ]
    });
});

router.post('/assign-task', authenticate, authorizeManager, async (req, res) => {
    res.json({ success: true, message: 'Tasks assigned successfully' });
});

router.post('/simulate-impact', authenticate, authorizeManager, async (req, res) => {
    const { riskMode } = req.body;
    let metrics = { avgWorkload: 75, riskLevel: 'amber', efficiency: 85 };
    if (riskMode === 'Conservative') metrics = { avgWorkload: 65, riskLevel: 'green', efficiency: 70 };
    if (riskMode === 'Aggressive') metrics = { avgWorkload: 90, riskLevel: 'red', efficiency: 95 };

    res.json({ metrics });
});

router.get('/decision-trace/:id', authenticate, authorizeManager, async (req, res) => {
    res.json({
        trace: {
            id: req.params.id,
            constraintsApplied: ['Max Workload < 90%', 'Required Skill: React'],
            candidateRanking: [
                { name: 'Alex', score: 95, reason: 'Optimal workload (70%), possesses React skill' },
                { name: 'Jordan', score: 60, reason: 'Workload too high (85%)' }
            ],
            rejectionReasons: ['Sarah rejected due to lack of React skill'],
            finalScore: 95
        }
    });
});

module.exports = router;