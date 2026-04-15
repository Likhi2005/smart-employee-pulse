const Task = require('../models/Task');
const User = require('../models/User');
const Leaderboard = require('../models/Leaderboard');
const workloadService = require('../services/workloadService');
const aiService = require('../services/aiService');


// ============================================================
// 1. CREATE TASK WITH AI PRIORITY DETECTION
// ============================================================
const createTask = async (req, res) => {
    try {
        const { title, description, effort, priority, dueDate, isMandatory, useAIPriority } = req.body;
        const managerId = req.user.userId;
        const companyId = req.user.companyId;

        // Validate input
        if (!title || !effort) {
            return res.status(400).json({ message: 'Title and effort required' });
        }

        if (effort < 1) {
            return res.status(400).json({ message: 'Effort must be at least 1' });
        }

        let finalPriority = priority || 'medium';
        let priorityDetection = null;

        // Use AI to detect priority if requested
        if (useAIPriority) {
            try {
                priorityDetection = await aiService.detectTaskPriority(title, description);
                finalPriority = priorityDetection.priority;
            } catch (error) {
                console.warn('AI priority detection failed, using manual priority:', error.message);
            }
        }

        // Create task
        const task = new Task({
            title,
            description: description || '',
            effort,
            priority: finalPriority,
            assignedBy: managerId,
            companyId,
            dueDate: dueDate || null,
            isMandatory: isMandatory || false,
            status: 'pending',
        });

        const savedTask = await task.save();

        res.status(201).json({
            message: 'Task created successfully',
            task: {
                id: savedTask._id,
                title: savedTask.title,
                description: savedTask.description,
                effort: savedTask.effort,
                priority: savedTask.priority,
                isMandatory: savedTask.isMandatory,
                dueDate: savedTask.dueDate,
            },
            priorityDetection, // Include AI analysis if used
        });
    } catch (error) {
        console.error('Create task error:', error);
        res.status(500).json({ message: 'Task creation failed', error: error.message });
    }
};

// ============================================================
// 2. ASSIGN TASK WITH AI RECOMMENDATION
// ============================================================
const assignTask = async (req, res) => {
    try {
        const { taskId, employeeId, useAIAssignment } = req.body;
        const managerId = req.user.userId;
        const companyId = req.user.companyId;

        // Validate input
        if (!taskId) {
            return res.status(400).json({ message: 'Task ID required' });
        }

        // Check if task exists
        const task = await Task.findOne({ _id: taskId, companyId });
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        if (task.assignedTo) {
            return res.status(400).json({ message: 'Task already assigned' });
        }

        let finalEmployeeId = employeeId;
        let aiRecommendation = null;

        // Use AI for smart assignment if requested
        if (useAIAssignment) {
            try {
                const aiResult = await aiService.smartAssignTask(taskId, companyId);

                if (aiResult.success) {
                    finalEmployeeId = aiResult.recommendedEmployee.id;
                    aiRecommendation = aiResult;
                } else {
                    return res.status(400).json({
                        message: 'AI assignment failed',
                        reason: aiResult.reason,
                    });
                }
            } catch (error) {
                console.warn('AI assignment failed, manual assignment needed:', error.message);
                if (!employeeId) {
                    return res.status(400).json({
                        message: 'AI assignment failed and no manual employee specified',
                    });
                }
            }
        }

        if (!finalEmployeeId) {
            return res.status(400).json({ message: 'Employee ID required' });
        }

        // Check if employee exists and belongs to same company
        const employee = await User.findOne({
            _id: finalEmployeeId,
            companyId,
            role: 'employee',
            isActive: true,
        });

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        // Assign task
        task.assignedTo = finalEmployeeId;
        task.status = 'pending';
        const updatedTask = await task.save();

        res.json({
            message: 'Task assigned successfully',
            task: {
                id: updatedTask._id,
                title: updatedTask.title,
                effort: updatedTask.effort,
                priority: updatedTask.priority,
                assignedTo: {
                    id: employee._id,
                    name: employee.fullName,
                    email: employee.email,
                },
                isMandatory: updatedTask.isMandatory,
            },
            aiRecommendation, // Include AI analysis if used
        });
    } catch (error) {
        console.error('Assign task error:', error);
        res.status(500).json({ message: 'Task assignment failed', error: error.message });
    }
};

// ============================================================
// 3. GET EMPLOYEE TASKS
// ============================================================
const getMyTasks = async (req, res) => {
    try {
        const employeeId = req.user.userId;
        const { status } = req.query; // Optional filter by status

        let query = { assignedTo: employeeId };
        if (status) {
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

        // Update task status
        task.status = 'accepted';
        await task.save();

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

        if (task.status !== 'accepted') {
            return res.status(400).json({ message: 'Only accepted tasks can be completed' });
        }

        // Update task
        task.status = 'completed';
        task.completedAt = new Date();
        await task.save();

        // Calculate points earned (effort × priority weight)
        const priorityWeight = workloadService.PRIORITY_WEIGHTS[task.priority] || 1;
        const pointsEarned = task.effort * priorityWeight;

        // Update leaderboard
        const leaderboard = await Leaderboard.findOneAndUpdate(
            { userId: employeeId },
            {
                $inc: {
                    points: pointsEarned,
                    tasksCompleted: 1,
                },
            },
            { new: true }
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
        const companyId = req.user.companyId;
        const { status, employeeId } = req.query;

        let query = { companyId };

        if (status) {
            query.status = status;
        }

        if (employeeId) {
            query.assignedTo = employeeId;
        }

        const tasks = await Task.find(query)
            .populate('assignedTo', 'fullName email currentWorkload')
            .populate('assignedBy', 'fullName email')
            .sort({ createdAt: -1 });

        res.json({
            message: 'Team tasks retrieved successfully',
            tasks,
            count: tasks.length,
        });
    } catch (error) {
        console.error('Get team tasks error:', error);
        res.status(500).json({ message: 'Error fetching tasks', error: error.message });
    }
};

// ============================================================
// 8. GET TASK DETAILS
// ============================================================
const getTaskDetails = async (req, res) => {
    try {
        const { taskId } = req.params;
        const userId = req.user.userId;
        const companyId = req.user.companyId;

        // Find task
        const task = await Task.findOne({
            _id: taskId,
            companyId,
        })
            .populate('assignedTo', 'fullName email currentWorkload')
            .populate('assignedBy', 'fullName email');

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Authorization: manager can see all tasks, employee can only see their own
        if (req.user.role === 'employee' && task.assignedTo._id.toString() !== userId) {
            return res
                .status(403)
                .json({ message: 'You can only view your own tasks' });
        }

        res.json({
            message: 'Task details retrieved',
            task,
        });
    } catch (error) {
        console.error('Get task details error:', error);
        res.status(500).json({ message: 'Error fetching task', error: error.message });
    }
};

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
};