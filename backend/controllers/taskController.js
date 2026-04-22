
const Task = require('../models/Task');
const TaskAssignment = require('../models/TaskAssignment');
const TaskTemplate = require('../models/TaskTemplate');
const TaskHistory = require('../models/TaskHistory');
const User = require('../models/User');
const Leaderboard = require('../models/Leaderboard');

const taskServices = require('../services/taskServices')
const workloadService = require('../services/workloadService');
const aiService = require('../services/aiService');

const ruleEngineService = require('../services/ruleEngineService');

// Helper function to log task history
const logTaskHistory = async ({
    taskId,
    companyId,
    actorId,
    action,
    fromStatus = null,
    toStatus = null,
    notes = '',
    meta = null,
}) => {
    try {
        await TaskHistory.create({
            taskId,
            companyId,
            actorId,
            action,
            fromStatus,
            toStatus,
            notes,
            meta,
        });
    } catch (err) {
        console.error('Task history log failed:', err.message);
    }
};

// ============================================================
// 1. CREATE TASK
// ============================================================

const createTask = async (req, res) => {
    console.log('=== CREATE TASK ENDPOINT HIT ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Request headers:', req.headers);
    console.log('Auth user:', req.user);

    try {
        // Step 1: Verify auth
        if (!req.user) {
            console.error('NO AUTH USER - req.user is undefined');
            return res.status(401).json({ message: 'No authenticated user' });
        }

        if (!req.user.userId || !req.user.companyId) {
            console.error('INCOMPLETE AUTH - missing userId or companyId:', req.user);
            return res.status(401).json({ message: 'Invalid auth user data' });
        }

        console.log('✓ Auth verified. Creating task...');

        // Step 2: Create task in service
        const task = await taskServices.createTask(req.body, {
            managerId: req.user.userId,
            companyId: req.user.companyId,
        });

        console.log('✓ Task created successfully:', task);

        // Step 3: Log task history
        try {
            await TaskHistory.create({
                taskId: task._id,
                companyId: req.user.companyId,
                actorId: req.user.userId,
                action: 'created',
                toStatus: task.status,
                meta: {
                    id: task.id,
                    title: task.title,
                    priority: task.priority,
                    effort: task.effort,
                    riskLevel: task.riskLevel,
                },
            });
            console.log('✓ Task history logged');
        } catch (historyError) {
            console.warn('⚠ TaskHistory create failed (non-blocking):', historyError.message);
        }

        // Step 4: Return response
        console.log('✓ Returning success response');
        return res.status(201).json({
            message: 'Task created successfully',
            task,
        });
    } catch (error) {
        console.error('❌ CREATE TASK ERROR');
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        console.error('Full error:', error);

        return res.status(500).json({
            message: 'Task creation failed',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        });
    }
};


// const createTask = async (req, res) => {
//     try {
//         const { title, description, effort, priority, dueDate, isMandatory } = req.body;
//         const managerId = req.user.userId;
//         const companyId = req.user.companyId;

//         if (!title || !effort) {
//             return res.status(400).json({ message: 'Title and effort required' });
//         }

//         if (Number(effort) < 1) {
//             return res.status(400).json({ message: 'Effort must be at least 1' });
//         }

//         const finalPriority = priority || 'medium';

//         let finalDueDate = dueDate || null;
//         let deadlineSuggestion = null;

//         if (!finalDueDate) {
//             deadlineSuggestion = ruleEngineService.estimateDeadlineByEffort({ effort });
//             finalDueDate = deadlineSuggestion.estimatedDueDate;
//         }

//         const initialRisk = ruleEngineService.detectTaskRisk({
//             dueDate: finalDueDate,
//             status: 'pending',
//             assigneeWorkload: 0,
//             overdueOpenTasks: 0,
//         });

//         const task = new Task({
//             title,
//             description: description || '',
//             effort: Number(effort),
//             priority: finalPriority,
//             assignedBy: managerId,
//             companyId,
//             dueDate: finalDueDate,
//             isMandatory: Boolean(isMandatory),
//             status: 'pending',
//             riskLevel: initialRisk,
//             aiSuggestions: {
//                 mode: 'rule-based',
//                 deadlineSuggestion,
//                 assigneeSuggestion: null,
//             },
//         });

//         const savedTask = await task.save();

//         await logTaskHistory({
//             taskId: savedTask._id,
//             companyId,
//             actorId: managerId,
//             action: 'created',
//             toStatus: savedTask.status,
//             meta: {
//                 title: savedTask.title,
//                 priority: savedTask.priority,
//                 effort: savedTask.effort,
//                 riskLevel: savedTask.riskLevel,
//             },
//         });

//         res.status(201).json({
//             message: 'Task created successfully',
//             task: {
//                 id: savedTask._id,
//                 title: savedTask.title,
//                 description: savedTask.description,
//                 effort: savedTask.effort,
//                 priority: savedTask.priority,
//                 status: savedTask.status,
//                 riskLevel: savedTask.riskLevel,
//                 dueDate: savedTask.dueDate,
//                 isMandatory: savedTask.isMandatory,
//                 aiSuggestions: savedTask.aiSuggestions,
//             },
//         });
//     } catch (error) {
//         console.error('Create task error:', error);
//         res.status(500).json({ message: 'Task creation failed', error: error.message });
//     }
// };


// ============================================================
// ASSIGN TASK 
// ============================================================

const assignTask = async (req, res) => {
    try {
        const result = await taskServices.assignTask(req.body, {
            managerId: req.user.userId,
            companyId: req.user.companyId,
        })

        return res.json({
            message: 'Task assigned successfully',
            task: result.task,
            suggestion: result.suggestion,
            allCandidates: result.allCandidates,
            rejectedCandidates: result.rejectedCandidates,
            rankingState: result.rankingState,
        })
    } catch (error) {
        console.error('Assign task error:', error)
        return res.status(error.statusCode || 500).json({
            message: error.message || 'Task assignment failed',
            error: error.message,
        })
    }
}

const validateTaskPolicy = async (req, res) => {
    try {
        const result = await taskServices.validateTaskPolicy(req.body, {
            companyId: req.user.companyId,
        })

        return res.json({
            message: 'Policy validation completed',
            result,
        })
    } catch (error) {
        console.error('Validate policy error:', error)
        return res.status(error.statusCode || 500).json({
            message: error.message || 'Policy validation failed',
            error: error.message,
        })
    }
}

const rankTaskCandidates = async (req, res) => {
    try {
        const result = await taskServices.rankTaskCandidates(req.body, {
            companyId: req.user.companyId,
        })

        return res.json({
            message: 'Ranking completed',
            ...result,
        })
    } catch (error) {
        console.error('Rank candidates error:', error)
        return res.status(error.statusCode || 500).json({
            message: error.message || 'Ranking failed',
            error: error.message,
        })
    }
}

const createTaskFromTemplate = async (req, res) => {
    try {
        const result = await taskServices.createTaskFromTemplate(req.body, {
            managerId: req.user.userId,
            companyId: req.user.companyId,
        })

        return res.status(201).json({
            message: 'Task created from template successfully',
            ...result,
        })
    } catch (error) {
        console.error('Create task from template error:', error)
        return res.status(error.statusCode || 500).json({
            message: error.message || 'Create from template failed',
            error: error.message,
        })
    }
}

// Export the updated function
module.exports.assignTask = assignTask


// ============================================================
// 3. GET EMPLOYEE TASKS
// ============================================================
const getMyTasks = async (req, res) => {
    try {
        const employeeId = req.user.userId;
        const { status } = req.query; // Optional filter by status

        let query = { assignedTo: employeeId };
        if (status === 'in-progress') {
            query.status = { $in: ['in-progress', 'accepted'] };
        } else if (status) {
            query.status = status;
        }

        const tasks = await Task.find(query)
            .populate('assignedBy', 'fullName email')
            .sort({ createdAt: -1 });

        res.json({
            message: 'Tasks retrieved successfully',
            tasks,
            count: tasks.length,
        });
    } catch (error) {
        console.error('Get tasks error:', error);
        res.status(500).json({ message: 'Error fetching tasks', error: error.message });
    }
};

// ============================================================
// 4. ACCEPT TASK (Employee only)
// ============================================================
const acceptTask = async (req, res) => {
    try {
        const { taskId } = req.body;
        const employeeId = req.user.userId;
        const companyId = req.user.companyId;

        // Find task
        const task = await Task.findOne({
            _id: taskId,
            assignedTo: employeeId,
            companyId,
        });

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        if (task.status !== 'pending') {
            return res.status(400).json({ message: 'Task cannot be accepted in current status' });
        }

        task.status = 'in-progress';
        task.riskLevel = ruleEngineService.detectTaskRisk({
            dueDate: task.dueDate,
            status: task.status,
        });
        await task.save();

        await logTaskHistory({
            taskId: task._id,
            companyId,
            actorId: employeeId,
            action: 'accepted',
            fromStatus: 'pending',
            toStatus: 'in-progress',
        });

        // Update employee workload
        await workloadService.updateEmployeeWorkload(employeeId);

        res.json({
            message: 'Task accepted successfully',
            task: {
                id: task._id,
                title: task.title,
                status: task.status,
            },
        });
    } catch (error) {
        console.error('Accept task error:', error);
        res.status(500).json({ message: 'Error accepting task', error: error.message });
    }
};

// ============================================================
// 5. REJECT TASK (Employee only, except mandatory tasks)
// ============================================================
const rejectTask = async (req, res) => {
    try {
        const { taskId, reason } = req.body;
        const employeeId = req.user.userId;
        const companyId = req.user.companyId;

        // Find task
        const task = await Task.findOne({
            _id: taskId,
            assignedTo: employeeId,
            companyId,
        });

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Check if task is mandatory
        if (task.isMandatory) {
            return res.status(403).json({ message: 'Cannot reject mandatory task' });
        }

        if (task.status !== 'pending') {
            return res
                .status(400)
                .json({ message: 'Task cannot be rejected in current status' });
        }

        // Update task status
        task.status = 'rejected';
        await task.save();

        await logTaskHistory({
            taskId: task._id,
            companyId,
            actorId: employeeId,
            action: 'rejected',
            fromStatus: 'pending',
            toStatus: 'rejected',
            notes: reason || '',
        });

        res.json({
            message: 'Task rejected successfully',
            task: {
                id: task._id,
                title: task.title,
                status: task.status,
                rejectionReason: reason || 'Not specified',
            },
        });
    } catch (error) {
        console.error('Reject task error:', error);
        res.status(500).json({ message: 'Error rejecting task', error: error.message });
    }
};

// ============================================================
// 6. COMPLETE TASK (Employee only)
// ============================================================
const completeTask = async (req, res) => {
    try {
        const { taskId } = req.body;
        const employeeId = req.user.userId;
        const companyId = req.user.companyId;

        // Find task
        const task = await Task.findOne({
            _id: taskId,
            assignedTo: employeeId,
            companyId,
        });

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        if (task.status !== 'in-progress') {
            return res.status(400).json({ message: 'Only in-progress tasks can be completed' });
        }

        // Update task
        task.status = 'completed';
        task.completedAt = new Date();
        task.riskLevel = 'low';
        await task.save();

        await logTaskHistory({
            taskId: task._id,
            companyId,
            actorId: employeeId,
            action: 'completed',
            fromStatus: 'in-progress',
            toStatus: 'completed',
        });

        // Calculate points earned (effort × priority weight)
        const priorityWeight = workloadService.PRIORITY_WEIGHTS[task.priority] || 1;
        const pointsEarned = task.effort * priorityWeight;

        // Update leaderboard
        const leaderboard = await Leaderboard.findOneAndUpdate(
            { userId: employeeId, companyId },
            {
                $inc: {
                    points: pointsEarned,
                    tasksCompleted: 1,
                },
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        // Update employee workload
        await workloadService.updateEmployeeWorkload(employeeId);

        res.json({
            message: 'Task completed successfully',
            task: {
                id: task._id,
                title: task.title,
                status: task.status,
                completedAt: task.completedAt,
            },
            pointsEarned,
            totalPoints: leaderboard.points,
        });
    } catch (error) {
        console.error('Complete task error:', error);
        res.status(500).json({ message: 'Error completing task', error: error.message });
    }
};

// ============================================================
// 7. GET ALL TEAM TASKS (Manager only)
// ============================================================

const getTeamTasks = async (req, res) => {
    try {
        const result = await taskServices.listTeamTasks(req.user.companyId, req.query)
        return res.json({
            message: 'Team tasks retrieved successfully',
            tasks: result.tasks,
            meta: result.meta,
        })
    } catch (error) {
        console.error('Get team tasks error:', error)
        return res.status(500).json({
            message: 'Error fetching tasks',
            error: error.message,
        })
    }
}

// ============================================================
// 8. GET TASK DETAILS
// ============================================================


const getTaskDetails = async (req, res) => {
    try {
        const task = await taskServices.getTaskDetails(req.params.taskId, {
            companyId: req.user.companyId,
            userId: req.user.userId,
            role: req.user.role,
        })

        if (!task) {
            return res.status(404).json({ message: 'Task not found' })
        }

        return res.json({
            message: 'Task details retrieved',
            task,
        })
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ message: error.message })
        }

        console.error('Get task details error:', error)
        return res.status(500).json({
            message: 'Error fetching task',
            error: error.message,
        })
    }
}

// ============================================================
// 9. GET TEAM WORKLOAD (Manager only)
// ============================================================
const getTeamWorkload = async (req, res) => {
    try {
        const companyId = req.user.companyId;

        const teamWorkload = await workloadService.getTeamWorkload(companyId);

        res.json({
            message: 'Team workload retrieved successfully',
            teamWorkload,
        });
    } catch (error) {
        console.error('Get team workload error:', error);
        res.status(500).json({
            message: 'Error fetching team workload',
            error: error.message,
        });
    }
};

// ============================================================
// 10. UPDATE TASK (Manager only)
// ============================================================
const updateTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const managerId = req.user.userId;
        const companyId = req.user.companyId;
        const { title, description, priority, effort, dueDate, isMandatory } = req.body;

        // Find task
        const task = await Task.findOne({ _id: taskId, companyId });
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Prevent updating assigned tasks (they are locked after assignment)
        if (task.assignedTo && task.status !== 'pending') {
            return res.status(400).json({
                message: 'Cannot update task after assignment and acceptance',
            });
        }

        // Track changes
        const changes = {};
        if (title && title !== task.title) {
            changes.title = { from: task.title, to: title };
            task.title = title;
        }
        if (description !== undefined && description !== task.description) {
            changes.description = { from: task.description, to: description };
            task.description = description;
        }
        if (priority && priority !== task.priority) {
            changes.priority = { from: task.priority, to: priority };
            task.priority = priority;
        }
        if (effort && effort !== task.effort) {
            changes.effort = { from: task.effort, to: effort };
            task.effort = effort;
        }
        if (dueDate !== undefined) {
            const newDueDate = dueDate ? new Date(dueDate) : null;
            if (String(newDueDate) !== String(task.dueDate)) {
                changes.dueDate = { from: task.dueDate, to: newDueDate };
                task.dueDate = newDueDate;
            }
        }
        if (isMandatory !== undefined && isMandatory !== task.isMandatory) {
            changes.isMandatory = { from: task.isMandatory, to: isMandatory };
            task.isMandatory = isMandatory;
        }

        // If no changes, return current task
        if (Object.keys(changes).length === 0) {
            return res.json({
                message: 'No changes made',
                task: {
                    id: task._id,
                    title: task.title,
                    description: task.description,
                    priority: task.priority,
                    effort: task.effort,
                    dueDate: task.dueDate,
                    isMandatory: task.isMandatory,
                },
            });
        }

        await task.save();

        await logTaskHistory({
            taskId: task._id,
            companyId,
            actorId: managerId,
            action: 'updated',
            fromStatus: task.status,
            toStatus: task.status,
            meta: changes,
        });

        res.json({
            message: 'Task updated successfully',
            task: {
                id: task._id,
                title: task.title,
                description: task.description,
                priority: task.priority,
                effort: task.effort,
                dueDate: task.dueDate,
                isMandatory: task.isMandatory,
                status: task.status,
            },
            changes,
        });
    } catch (error) {
        console.error('Update task error:', error);
        res.status(500).json({ message: 'Task update failed', error: error.message });
    }
};

// ============================================================
// 11. DELETE TASK (Manager only)
// ============================================================
const deleteTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const managerId = req.user.userId;
        const companyId = req.user.companyId;

        // Find task
        const task = await Task.findOne({ _id: taskId, companyId });
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Prevent deletion if task is in progress or completed
        if (['accepted', 'completed'].includes(task.status)) {
            return res.status(400).json({
                message: `Cannot delete task with status ${task.status}`,
            });
        }

        // Soft delete: mark as deleted but don't remove from DB
        // Alternative: await Task.deleteOne({ _id: taskId });
        task.isDeleted = true;
        task.deletedAt = new Date();
        task.deletedBy = managerId;
        await task.save();

        // Cancel any active assignments
        await TaskAssignment.updateMany(
            { taskId: task._id, isActive: true },
            { $set: { isActive: false, unassignedAt: new Date() } }
        );

        await logTaskHistory({
            taskId: task._id,
            companyId,
            actorId: managerId,
            action: 'deleted',
            fromStatus: task.status,
            toStatus: null,
        });

        res.json({
            message: 'Task deleted successfully',
            task: {
                id: task._id,
                title: task.title,
                status: 'deleted',
            },
        });
    } catch (error) {
        console.error('Delete task error:', error);
        res.status(500).json({ message: 'Task deletion failed', error: error.message });
    }
};

// ============================================================
// 12. CREATE TASK TEMPLATE (Manager only)
// ============================================================
const createTaskTemplate = async (req, res) => {
    try {
        const companyId = req.user.companyId;
        const managerId = req.user.userId;
        const {
            name,
            title,
            description,
            defaultPriority,
            defaultEffort,
            defaultIsMandatory,
            department,
            skillsRequired,
            tags,
        } = req.body;

        const template = await TaskTemplate.create({
            name,
            title,
            description: description || '',
            defaultPriority: defaultPriority || 'medium',
            defaultEffort: defaultEffort || 1,
            defaultIsMandatory: Boolean(defaultIsMandatory),
            department: department || null,
            skillsRequired: Array.isArray(skillsRequired) ? skillsRequired : [],
            tags: Array.isArray(tags) ? tags : [],
            companyId,
            createdBy: managerId,
        });

        res.status(201).json({
            message: 'Task template created successfully',
            template,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: 'Template name already exists for this company',
            });
        }

        console.error('Create task template error:', error);
        res.status(500).json({
            message: 'Failed to create task template',
            error: error.message,
        });
    }
};

// ============================================================
// 13. LIST TASK TEMPLATES (Manager only)
// ============================================================
const getTaskTemplates = async (req, res) => {
    try {
        const companyId = req.user.companyId;
        const {
            search = '',
            department,
            includeInactive = 'false',
            page = 1,
            limit = 20,
        } = req.query;

        const query = {
            companyId,
            ...(includeInactive === 'true' ? {} : { isActive: true }),
        };

        if (department) {
            query.department = department;
        }

        if (search.trim()) {
            const regex = new RegExp(search.trim(), 'i');
            query.$or = [{ name: regex }, { title: regex }, { tags: regex }];
        }

        const skip = (Number(page) - 1) * Number(limit);

        const [templates, total] = await Promise.all([
            TaskTemplate.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit))
                .populate('createdBy', 'fullName email'),
            TaskTemplate.countDocuments(query),
        ]);

        res.json({
            message: 'Task templates fetched successfully',
            templates,
            meta: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (error) {
        console.error('Get task templates error:', error);
        res.status(500).json({
            message: 'Failed to fetch task templates',
            error: error.message,
        });
    }
};

// ============================================================
// 14. GET TASK TEMPLATE BY ID (Manager only)
// ============================================================
const getTaskTemplateById = async (req, res) => {
    try {
        const companyId = req.user.companyId;
        const { templateId } = req.params;

        const template = await TaskTemplate.findOne({
            _id: templateId,
            companyId,
        }).populate('createdBy', 'fullName email');

        if (!template) {
            return res.status(404).json({ message: 'Task template not found' });
        }

        res.json({
            message: 'Task template fetched successfully',
            template,
        });
    } catch (error) {
        console.error('Get task template by id error:', error);
        res.status(500).json({
            message: 'Failed to fetch task template',
            error: error.message,
        });
    }
};

// ============================================================
// 15. UPDATE TASK TEMPLATE (Manager only)
// ============================================================
const updateTaskTemplate = async (req, res) => {
    try {
        const companyId = req.user.companyId;
        const { templateId } = req.params;
        const updates = req.body;

        const template = await TaskTemplate.findOne({ _id: templateId, companyId });
        if (!template) {
            return res.status(404).json({ message: 'Task template not found' });
        }

        const allowed = [
            'name',
            'title',
            'description',
            'defaultPriority',
            'defaultEffort',
            'defaultIsMandatory',
            'department',
            'skillsRequired',
            'tags',
            'isActive',
        ];

        for (const key of allowed) {
            if (updates[key] !== undefined) {
                template[key] = updates[key];
            }
        }

        await template.save();

        res.json({
            message: 'Task template updated successfully',
            template,
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: 'Template name already exists for this company',
            });
        }

        console.error('Update task template error:', error);
        res.status(500).json({
            message: 'Failed to update task template',
            error: error.message,
        });
    }
};

// ============================================================
// 16. DELETE TASK TEMPLATE (Manager only - soft delete)
// ============================================================
const deleteTaskTemplate = async (req, res) => {
    try {
        const companyId = req.user.companyId;
        const { templateId } = req.params;

        const template = await TaskTemplate.findOne({
            _id: templateId,
            companyId,
            isActive: true,
        });

        if (!template) {
            return res.status(404).json({ message: 'Task template not found' });
        }

        template.isActive = false;
        await template.save();

        res.json({
            message: 'Task template deleted successfully',
            template: {
                id: template._id,
                name: template.name,
                isActive: template.isActive,
            },
        });
    } catch (error) {
        console.error('Delete task template error:', error);
        res.status(500).json({
            message: 'Failed to delete task template',
            error: error.message,
        });
    }
};

// ============================================================
// 17. GET TASK HISTORY FOR ONE TASK (Manager + assigned employee)
// ============================================================
const getTaskHistoryByTaskId = async (req, res) => {
    try {
        const companyId = req.user.companyId;
        const userId = req.user.userId;
        const role = req.user.role;
        const { taskId } = req.params;
        const { page = 1, limit = 20 } = req.query;

        const task = await Task.findOne({ _id: taskId, companyId }).select('assignedTo');
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        if (role === 'employee') {
            if (!task.assignedTo || task.assignedTo.toString() !== userId.toString()) {
                return res.status(403).json({ message: 'You can only view your own task history' });
            }
        }

        const skip = (Number(page) - 1) * Number(limit);

        const [history, total] = await Promise.all([
            TaskHistory.find({ taskId, companyId })
                .populate('actorId', 'fullName email role')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            TaskHistory.countDocuments({ taskId, companyId }),
        ]);

        res.json({
            message: 'Task history fetched successfully',
            history,
            meta: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (error) {
        console.error('Get task history by taskId error:', error);
        res.status(500).json({
            message: 'Failed to fetch task history',
            error: error.message,
        });
    }
};

// ============================================================
// 18. GET TASK HISTORY FEED (Manager only)
// ============================================================
const getTaskHistoryFeed = async (req, res) => {
    try {
        const companyId = req.user.companyId;
        const {
            taskId,
            action,
            actorId,
            page = 1,
            limit = 30,
        } = req.query;

        const query = { companyId };

        if (taskId) query.taskId = taskId;
        if (action) query.action = action;
        if (actorId) query.actorId = actorId;

        const skip = (Number(page) - 1) * Number(limit);

        const [history, total] = await Promise.all([
            TaskHistory.find(query)
                .populate('taskId', 'title status priority')
                .populate('actorId', 'fullName email role')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(Number(limit)),
            TaskHistory.countDocuments(query),
        ]);

        res.json({
            message: 'Task history feed fetched successfully',
            history,
            meta: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (error) {
        console.error('Get task history feed error:', error);
        res.status(500).json({
            message: 'Failed to fetch task history feed',
            error: error.message,
        });
    }
};

// ============================================================
// 19. GET SUGGESTED ASSIGNEE FOR A TASK (Manager only)
// ============================================================
const getSuggestedAssignee = async (req, res) => {
    try {
        const { taskId } = req.params;
        const companyId = req.user.companyId;

        const suggestion = await ruleEngineService.suggestAssignee({ taskId, companyId });
        if (!suggestion.suggested) {
            return res.status(404).json({ message: suggestion.reason || 'No suggestion found' });
        }

        res.json({
            message: 'Suggested assignee generated',
            suggestion,
        });
    } catch (error) {
        console.error('Get suggested assignee error:', error);
        res.status(500).json({ message: 'Failed to generate suggestion', error: error.message });
    }
};


module.exports = {
    createTask,
    assignTask,
    getMyTasks,
    acceptTask,
    rejectTask,
    completeTask,
    getTeamTasks,
    getTaskDetails,
    getTeamWorkload,
    updateTask,
    deleteTask,
    createTaskTemplate,
    getTaskTemplates,
    getTaskTemplateById,
    updateTaskTemplate,
    deleteTaskTemplate,
    getTaskHistoryByTaskId,
    getTaskHistoryFeed,
    getSuggestedAssignee,
    validateTaskPolicy,
    rankTaskCandidates,
    createTaskFromTemplate,
};