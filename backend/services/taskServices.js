const mongoose = require('mongoose')
const Counter = require('../models/Counter')
const Task = require('../models/Task')
const TaskAssignment = require('../models/TaskAssignment')
const TaskTemplate = require('../models/TaskTemplate')
const TaskHistory = require('../models/TaskHistory')
const User = require('../models/User')
const Leaderboard = require('../models/Leaderboard')

const workloadService = require('./workloadService')
const ruleEngineService = require('./ruleEngineService')
const { evaluateTaskPolicy } = require('./policyService')
const { rankCandidates } = require('./rankingService')

const TASK_COUNTER_KEY = 'task_public_id'

const TASK_PUBLIC_ID_REGEX = /^TASK-\d+$/
const VALID_SORT_FIELDS = new Set(['createdAt', 'updatedAt', 'dueDate', 'priority', 'effort', 'riskLevel', 'status', 'id'])
const VALID_HISTORY_ACTIONS = new Set([
    'created',
    'assigned',
    'reassigned',
    'accepted',
    'rejected',
    'completed',
    'updated',
    'deleted',
])

const ALLOWED_STATE_TRANSITIONS = {
    DRAFT: new Set(['VALIDATED', 'ENRICHED', 'REJECTED']),
    VALIDATED: new Set(['ENRICHED', 'REJECTED']),
    ENRICHED: new Set(['POLICY_VALIDATED', 'ASSIGNABLE', 'REJECTED']),
    POLICY_VALIDATED: new Set(['ASSIGNABLE', 'REJECTED']),
    ASSIGNABLE: new Set(['ASSIGNED', 'REJECTED']),
    ASSIGNED: new Set(['IN_PROGRESS', 'REVIEW_PENDING', 'APPROVED', 'REJECTED']),
    IN_PROGRESS: new Set(['COMPLETED', 'REVIEW_PENDING', 'REJECTED']),
    COMPLETED: new Set(['REVIEW_PENDING', 'APPROVED', 'REJECTED']),
    REVIEW_PENDING: new Set(['APPROVED', 'REJECTED']),
    APPROVED: new Set(),
    REJECTED: new Set(),
}

function isTaskPublicId(value) {
    return TASK_PUBLIC_ID_REGEX.test(String(value || ''))
}

function normalizeAssignmentMode(payload = {}) {
    if (payload.assignmentMode && ['manual', 'rule-based', 'ai'].includes(payload.assignmentMode)) {
        return payload.assignmentMode
    }

    if (payload.useAIAssignment === true || payload.useRuleBasedAssignment === true) {
        return 'rule-based'
    }

    return 'manual'
}

function toPlain(doc) {
    return typeof doc?.toObject === 'function' ? doc.toObject() : doc
}

function serializeTask(task) {
    if (!task) return null
    const plain = toPlain(task)

    return {
        id: plain.id,
        _id: plain._id,
        title: plain.title,
        description: plain.description,
        effort: plain.effort,
        priority: plain.priority,
        status: plain.status,
        riskLevel: plain.riskLevel,
        dueDate: plain.dueDate,
        completedAt: plain.completedAt,
        assignedBy: plain.assignedBy,
        assignedTo: plain.assignedTo,
        createdAt: plain.createdAt,
        updatedAt: plain.updatedAt,
        isMandatory: plain.isMandatory,
        isDeleted: plain.isDeleted,
        aiSuggestions: plain.aiSuggestions,
        taskState: plain.taskState,
        stateHistory: plain.stateHistory || [],
        assignmentExplanation: plain.assignmentExplanation || null,
    }
}

function serializeTaskTemplate(template) {
    if (!template) return null
    const plain = toPlain(template)

    return {
        id: plain.id || plain._id,
        _id: plain._id,
        name: plain.name,
        title: plain.title,
        description: plain.description,
        defaultPriority: plain.defaultPriority,
        defaultEffort: plain.defaultEffort,
        defaultIsMandatory: plain.defaultIsMandatory,
        department: plain.department,
        skillsRequired: plain.skillsRequired || [],
        tags: plain.tags || [],
        isActive: plain.isActive,
        createdBy: plain.createdBy,
        createdAt: plain.createdAt,
        updatedAt: plain.updatedAt,
    }
}

function serializeHistoryItem(historyItem) {
    if (!historyItem) return null
    const plain = toPlain(historyItem)

    const task = plain.taskId && typeof plain.taskId === 'object'
        ? {
            id: plain.taskId.id || plain.taskId._id,
            _id: plain.taskId._id,
            title: plain.taskId.title,
            status: plain.taskId.status,
            priority: plain.taskId.priority,
        }
        : plain.taskId

    const actor = plain.actorId && typeof plain.actorId === 'object'
        ? {
            id: plain.actorId._id,
            _id: plain.actorId._id,
            fullName: plain.actorId.fullName,
            email: plain.actorId.email,
            role: plain.actorId.role,
        }
        : plain.actorId

    return {
        id: plain._id,
        _id: plain._id,
        eventType: plain.action,
        action: plain.action,
        taskId: task,
        actorId: actor,
        fromStatus: plain.fromStatus,
        toStatus: plain.toStatus,
        notes: plain.notes || '',
        meta: plain.meta || null,
        summary: plain.notes || `${plain.action} event`,
        createdAt: plain.createdAt,
        updatedAt: plain.updatedAt,
    }
}

function buildTaskLookupQuery(identifier) {
    if (!identifier) return null
    const value = String(identifier)

    if (isTaskPublicId(value)) {
        return { id: value }
    }

    if (mongoose.Types.ObjectId.isValid(value)) {
        return { $or: [{ _id: value }, { id: value }] }
    }

    return { $or: [{ _id: value }, { id: value }] }
}

function buildTaskListQuery(companyId, query = {}) {
    const filter = {
        companyId,
        isDeleted: { $ne: true },
    }

    if (query.id) {
        if (isTaskPublicId(query.id)) {
            filter.id = query.id
        } else if (mongoose.Types.ObjectId.isValid(query.id)) {
            filter.$or = [{ _id: query.id }, { id: query.id }]
        }
    }

    if (query.status) filter.status = query.status
    if (query.priority) filter.priority = query.priority
    if (query.riskLevel) filter.riskLevel = query.riskLevel
    if (query.employeeId) filter.assignedTo = query.employeeId

    if (query.search && String(query.search).trim()) {
        const term = String(query.search).trim()
        const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
        filter.$or = [
            { title: regex },
            { description: regex },
            { id: regex },
        ]
    }

    if (query.dueDate) {
        const day = new Date(query.dueDate)
        if (!Number.isNaN(day.getTime())) {
            const start = new Date(day)
            start.setHours(0, 0, 0, 0)
            const end = new Date(day)
            end.setHours(23, 59, 59, 999)
            filter.dueDate = { $gte: start, $lte: end }
        }
    } else {
        const dueDateFrom = query.dueDateFrom ? new Date(query.dueDateFrom) : null
        const dueDateTo = query.dueDateTo ? new Date(query.dueDateTo) : null
        if (dueDateFrom || dueDateTo) {
            filter.dueDate = {}
            if (dueDateFrom && !Number.isNaN(dueDateFrom.getTime())) {
                dueDateFrom.setHours(0, 0, 0, 0)
                filter.dueDate.$gte = dueDateFrom
            }
            if (dueDateTo && !Number.isNaN(dueDateTo.getTime())) {
                dueDateTo.setHours(23, 59, 59, 999)
                filter.dueDate.$lte = dueDateTo
            }
        }
    }

    return filter
}

function buildSortObject(sortBy = 'createdAt', sortDir = 'desc') {
    const field = VALID_SORT_FIELDS.has(sortBy) ? sortBy : 'createdAt'
    const direction = String(sortDir).toLowerCase() === 'asc' ? 1 : -1
    return { [field]: direction }
}

function canTransitionTaskState(currentState, nextState) {
    const current = currentState || 'DRAFT'
    if (!nextState) return false
    if (current === nextState) return true
    const allowed = ALLOWED_STATE_TRANSITIONS[current]
    return Boolean(allowed && allowed.has(nextState))
}

function appendTaskStateHistory(task, {
    state,
    changedBy,
    reason = '',
    metadata = null,
}) {
    task.stateHistory = Array.isArray(task.stateHistory) ? task.stateHistory : []
    task.stateHistory.push({
        state,
        changedAt: new Date(),
        changedBy,
        reason,
        metadata,
    })
}

async function transitionTaskState({
    taskId,
    companyId,
    actorId,
    newState,
    reason = '',
    metadata = null,
}) {
    const task = await Task.findOne({
        ...buildTaskLookupQuery(taskId),
        companyId,
        isDeleted: { $ne: true },
    })

    if (!task) {
        const error = new Error('Task not found')
        error.statusCode = 404
        throw error
    }

    if (!canTransitionTaskState(task.taskState || 'DRAFT', newState)) {
        const error = new Error(`Invalid state transition from ${task.taskState || 'DRAFT'} to ${newState}`)
        error.statusCode = 400
        throw error
    }

    if ((task.taskState || 'DRAFT') !== newState) {
        task.taskState = newState
        appendTaskStateHistory(task, {
            state: newState,
            changedBy: actorId,
            reason,
            metadata,
        })
        await task.save()
    }

    return serializeTask(task)
}

async function generateNextTaskPublicId() {
    try {
        console.log('Incrementing counter...');
        const counter = await Counter.findOneAndUpdate(
            { key: TASK_COUNTER_KEY },
            { $inc: { value: 1 } },
            { new: true, upsert: true }
        );

        if (!counter) {
            console.error('Counter is null after update');
            throw new Error('Counter update returned null');
        }

        console.log('✓ Counter incremented:', counter.value);
        return `TASK-${counter.value}`;
    } catch (error) {
        console.error('❌ Counter error:', error.message);
        throw error;
    }
}

async function createTask(payload, { managerId, companyId }) {
    console.log('=== SERVICE: createTask START ===');
    console.log('Payload:', JSON.stringify(payload, null, 2));
    console.log('Context:', { managerId, companyId });

    try {
        // Step 1: Validate input
        console.log('Step 1: Validating input...');
        if (!payload.title) {
            throw new Error('Title is required');
        }
        if (!payload.effort || Number(payload.effort) < 1) {
            throw new Error('Effort must be at least 1');
        }
        if (!managerId) {
            throw new Error('Manager ID is required');
        }
        if (!companyId) {
            throw new Error('Company ID is required');
        }
        console.log('✓ Input validation passed');

        // Step 2: Generate task ID
        console.log('Step 2: Generating task ID...');
        const publicId = await generateNextTaskPublicId();
        console.log('✓ Task ID generated:', publicId);

        // Step 3: Prepare task data
        console.log('Step 3: Preparing task data...');
        const taskData = {
            id: publicId,
            title: String(payload.title).trim(),
            description: payload.description ? String(payload.description).trim() : '',
            effort: Number(payload.effort),
            priority: payload.priority || 'medium',
            assignedBy: managerId,
            companyId,
            dueDate: payload.dueDate ? new Date(payload.dueDate) : null,
            isMandatory: Boolean(payload.isMandatory),
            status: 'pending',
            riskLevel: payload.riskLevel || 'low',
            aiSuggestions: payload.aiSuggestions || null,
            taskState: 'ENRICHED',
            stateHistory: [
                {
                    state: 'DRAFT',
                    changedAt: new Date(),
                    changedBy: managerId,
                    reason: 'Task created',
                },
                {
                    state: 'VALIDATED',
                    changedAt: new Date(),
                    changedBy: managerId,
                    reason: 'Base task validation passed',
                },
                {
                    state: 'ENRICHED',
                    changedAt: new Date(),
                    changedBy: managerId,
                    reason: 'Task persisted after enrich stage',
                },
            ],
        };
        console.log('Task data:', JSON.stringify(taskData, null, 2));

        // Step 4: Create task in database
        console.log('Step 4: Creating task in database...');
        const task = await Task.create(taskData);
        console.log('✓ Task created in DB:', task._id, task.id);

        // Step 5: Serialize and return
        console.log('Step 5: Serializing task...');
        const serialized = serializeTask(task);
        console.log('✓ Task serialized successfully');
        console.log('=== SERVICE: createTask END (SUCCESS) ===');

        return serialized;
    } catch (error) {
        console.error('=== SERVICE: createTask END (ERROR) ===');
        console.error('❌ Error message:', error.message);
        console.error('Error name:', error.name);
        console.error('Error code:', error.code);
        console.error('Error stack:', error.stack);
        throw error;
    }
}

async function findTaskByIdentifier(identifier, extraQuery = {}) {
    const lookup = buildTaskLookupQuery(identifier)
    if (!lookup) return null

    return Task.findOne({
        ...lookup,
        ...extraQuery,
        isDeleted: { $ne: true },
    })
}

async function getTaskDetails(taskIdentifier, { companyId, userId, role }) {
    const task = await Task.findOne({
        ...buildTaskLookupQuery(taskIdentifier),
        companyId,
        isDeleted: { $ne: true },
    })
        .populate('assignedTo', 'fullName email currentWorkload department performanceScore skills')
        .populate('assignedBy', 'fullName email role')
        .lean()

    if (!task) {
        return null
    }

    if (role === 'employee') {
        const assignedToId = task.assignedTo?._id ? String(task.assignedTo._id) : String(task.assignedTo || '')
        if (!assignedToId || assignedToId !== String(userId)) {
            const error = new Error('You can only view your own tasks')
            error.statusCode = 403
            throw error
        }
    }

    return serializeTask(task)
}

async function listTeamTasks(companyId, query = {}) {
    const page = Math.max(1, Number(query.page) || 1)
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20))
    const skip = (page - 1) * limit
    const sort = buildSortObject(query.sortBy, query.sortDir)

    const filter = buildTaskListQuery(companyId, query)

    const [tasks, total] = await Promise.all([
        Task.find(filter)
            .populate('assignedTo', 'fullName email currentWorkload department performanceScore skills')
            .populate('assignedBy', 'fullName email role')
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean(),
        Task.countDocuments(filter),
    ])

    return {
        tasks: tasks.map(serializeTask),
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    }
}

async function assignTask(payload, { managerId, companyId }) {
    const taskIdentifier = payload.taskId || payload.id
    const assignmentMode = normalizeAssignmentMode(payload)

    const task = await Task.findOne({
        ...buildTaskLookupQuery(taskIdentifier),
        companyId,
        isDeleted: { $ne: true },
    })

    if (!task) {
        const error = new Error('Task not found')
        error.statusCode = 404
        throw error
    }

    // Restriction: Cannot reassign tasks that are in-progress, completed, or approved
    const RESTRICTED_STATUSES = new Set(['in-progress', 'completed', 'accepted'])
    if (RESTRICTED_STATUSES.has(task.status) || task.taskState === 'APPROVED') {
        const error = new Error(`Cannot reassign task in status: ${task.status}`)
        error.statusCode = 400
        throw error
    }

    let finalEmployeeId = payload.employeeId || null
    let ranked = null

    if (assignmentMode === 'rule-based' || assignmentMode === 'ai') {
        ranked = await rankTaskCandidates({
            taskId: task._id,
            requiredSkills: payload.requiredSkills || [],
        }, { companyId })

        if (!ranked.topCandidate) {
            const error = new Error('No candidate available')
            error.statusCode = 400
            throw error
        }

        finalEmployeeId = ranked.topCandidate.employeeId
    }

    if (!finalEmployeeId) {
        const error = new Error('Employee ID required')
        error.statusCode = 400
        throw error
    }

    const employee = await User.findOne({
        _id: finalEmployeeId,
        companyId,
        role: 'employee',
        isActive: true,
    })

    if (!employee) {
        const error = new Error('Employee not found')
        error.statusCode = 404
        throw error
    }

    const previousAssignee = task.assignedTo ? String(task.assignedTo) : null
    const previousStatus = task.status
    const isReassignment = previousAssignee && previousAssignee !== String(finalEmployeeId)

    task.assignedTo = finalEmployeeId
    task.status = 'pending'
    task.taskState = 'ASSIGNED'
    task.ruleSuggestions = {
        mode: assignmentMode,
        assigneeSuggestion: ranked ? ranked.topCandidate : null,
    }

    task.assignmentExplanation = ranked
        ? {
            topCandidate: {
                employeeId: ranked.topCandidate.employeeId,
                score: ranked.topCandidate.score,
                reasons: ranked.topCandidate.reasons,
                confidence: ranked.topCandidate.confidence,
            },
            policyApplied: assignmentMode,
            rejectedCandidates: ranked.rejectedCandidates,
            rankedAt: ranked.rankingState.rankedAt,
        }
        : null

    appendTaskStateHistory(task, {
        state: 'ASSIGNED',
        changedBy: managerId,
        reason: isReassignment ? 'Task reassigned' : 'Task assigned',
        metadata: {
            assignmentMode,
            rankedCount: ranked?.rankedCandidates?.length || 0,
        },
    })

    task.riskLevel = ruleEngineService.detectTaskRisk({
        dueDate: task.dueDate,
        status: task.status,
        assigneeWorkload: employee.currentWorkload || 0,
        overdueOpenTasks: 0,
    })

    const updatedTask = await task.save()

    await TaskAssignment.updateMany(
        { taskId: task._id, isActive: true },
        { $set: { isActive: false, unassignedAt: new Date() } }
    )

    await TaskAssignment.create({
        taskId: task._id,
        employeeId: finalEmployeeId,
        assignedBy: managerId,
        companyId,
        source: assignmentMode,
        recommendationMeta: ranked || null,
    })

    await TaskHistory.create({
        taskId: task._id,
        companyId,
        actorId: managerId,
        action: isReassignment ? 'reassigned' : 'assigned',
        fromStatus: previousStatus,
        toStatus: task.status,
        meta: {
            employeeId: finalEmployeeId,
            assignmentSource: assignmentMode,
            topCandidateScore: ranked?.topCandidate?.score || null,
        },
    })

    await workloadService.updateEmployeeWorkload(finalEmployeeId)

    const populatedTask = await Task.findById(updatedTask._id)
        .populate('assignedTo', 'fullName email currentWorkload department performanceScore skills')
        .populate('assignedBy', 'fullName email role')
        .lean()

    return {
        task: serializeTask(populatedTask || updatedTask),
        suggestion: ranked?.topCandidate || null,
        ruleSuggestion: ranked?.topCandidate || null,
        allCandidates: ranked?.rankedCandidates || [],
        rejectedCandidates: ranked?.rejectedCandidates || [],
        rankingState: ranked?.rankingState || null,
    }
}

function normalizeHistoryQuery(query = {}) {
    const page = Math.max(1, Number(query.page) || 1)
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 30))
    const sortBy = VALID_SORT_FIELDS.has(query.sortBy) ? query.sortBy : 'createdAt'
    const sortDir = String(query.sortDir || 'desc').toLowerCase() === 'asc' ? 1 : -1
    return { page, limit, sortBy, sortDir }
}

async function getTaskHistoryByTaskId(taskId, companyId, user, query = {}) {
    const task = await Task.findOne({
        ...buildTaskLookupQuery(taskId),
        companyId,
    }).select('assignedTo')

    if (!task) {
        const error = new Error('Task not found')
        error.statusCode = 404
        throw error
    }

    if (user.role === 'employee') {
        if (!task.assignedTo || String(task.assignedTo) !== String(user.userId)) {
            const error = new Error('You can only view your own task history')
            error.statusCode = 403
            throw error
        }
    }

    const { page, limit } = normalizeHistoryQuery(query)
    const skip = (page - 1) * limit

    const [history, total] = await Promise.all([
        TaskHistory.find({ taskId: task._id, companyId })
            .populate('actorId', 'fullName email role')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        TaskHistory.countDocuments({ taskId: task._id, companyId }),
    ])

    return {
        history: history.map(serializeHistoryItem),
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    }
}

async function getTaskHistoryFeed(companyId, query = {}) {
    const { page, limit } = normalizeHistoryQuery(query)
    const skip = (page - 1) * limit
    const filter = { companyId }

    if (query.taskId) filter.taskId = mongoose.Types.ObjectId.isValid(query.taskId) ? query.taskId : query.taskId
    if (query.action && VALID_HISTORY_ACTIONS.has(query.action)) filter.action = query.action
    if (query.actorId) filter.actorId = query.actorId

    const [history, total] = await Promise.all([
        TaskHistory.find(filter)
            .populate('taskId', 'id title status priority')
            .populate('actorId', 'fullName email role')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        TaskHistory.countDocuments(filter),
    ])

    return {
        history: history.map(serializeHistoryItem),
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    }
}

async function getTaskTemplates(companyId, query = {}) {
    const page = Math.max(1, Number(query.page) || 1)
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20))
    const skip = (page - 1) * limit

    const filter = {
        companyId,
        ...(query.includeInactive === 'true' || query.includeInactive === true ? {} : { isActive: true }),
    }

    if (query.department) {
        filter.department = query.department
    }

    if (query.search && String(query.search).trim()) {
        const regex = new RegExp(String(query.search).trim(), 'i')
        filter.$or = [
            { name: regex },
            { title: regex },
            { description: regex },
            { tags: regex },
            { skillsRequired: regex },
        ]
    }

    const [templates, total] = await Promise.all([
        TaskTemplate.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('createdBy', 'fullName email role')
            .lean(),
        TaskTemplate.countDocuments(filter),
    ])

    return {
        templates: templates.map(serializeTaskTemplate),
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    }
}

async function validateTaskPolicy(payload, { companyId, actorId = null }) {
    const taskInput = {
        title: payload.title,
        description: payload.description || '',
        effort: Number(payload.effort || 0),
        priority: payload.priority || 'medium',
        dueDate: payload.dueDate || null,
        isMandatory: Boolean(payload.isMandatory),
    }

    const result = await evaluateTaskPolicy({ taskInput, companyId })

    if (payload.taskId) {
        if (result.status === 'block') {
            await transitionTaskState({
                taskId: payload.taskId,
                companyId,
                actorId,
                newState: 'VALIDATED',
                reason: 'Policy validation found blockers',
                metadata: { blockers: result.blockers },
            })
        } else {
            await transitionTaskState({
                taskId: payload.taskId,
                companyId,
                actorId,
                newState: 'POLICY_VALIDATED',
                reason: 'Policy checks completed',
                metadata: { warnings: result.warnings },
            })

            if (result.status === 'pass') {
                await transitionTaskState({
                    taskId: payload.taskId,
                    companyId,
                    actorId,
                    newState: 'ASSIGNABLE',
                    reason: 'Policy checks passed and task is assignable',
                    metadata: { suggestions: result.suggestions },
                })
            }
        }
    }

    return result
}

async function rankTaskCandidates(payload, { companyId, actorId = null }) {
    let taskInput = {
        title: payload.title,
        effort: Number(payload.effort || 1),
        dueDate: payload.dueDate || null,
        isMandatory: Boolean(payload.isMandatory),
    }

    if (payload.taskId) {
        const task = await Task.findOne({
            ...buildTaskLookupQuery(payload.taskId),
            companyId,
            isDeleted: { $ne: true },
        }).lean()

        if (!task) {
            const error = new Error('Task not found for ranking')
            error.statusCode = 404
            throw error
        }

        taskInput = {
            title: task.title,
            effort: Number(task.effort || 1),
            dueDate: task.dueDate || null,
            isMandatory: Boolean(task.isMandatory),
        }
    }

    const requiredSkills = Array.isArray(payload.requiredSkills)
        ? payload.requiredSkills
        : []
    
    const department = payload.department || null

    const result = await rankCandidates({ companyId, taskInput, requiredSkills, department })

    if (payload.taskId && (result?.rankedCandidates?.length || 0) > 0) {
        try {
            await transitionTaskState({
                taskId: payload.taskId,
                companyId,
                actorId,
                newState: 'ASSIGNABLE',
                reason: 'Candidates ranked and task is ready for assignment',
                metadata: { rankedCount: result.rankedCandidates.length },
            })
        } catch {
            // Keep ranking functional even if state transition is not possible in current branch.
        }
    }

    return result
}

async function createTaskFromTemplate(payload, { managerId, companyId }) {
    const template = await TaskTemplate.findOne({
        _id: payload.templateId,
        companyId,
        isActive: true,
    }).lean()

    if (!template) {
        const error = new Error('Template not found or inactive')
        error.statusCode = 404
        throw error
    }

    const body = {
        title: payload.title || template.title,
        description: payload.description || template.description || '',
        effort: Number(payload.effort || template.defaultEffort || 1),
        priority: payload.priority || template.defaultPriority || 'medium',
        dueDate: payload.dueDate || null,
        isMandatory: payload.isMandatory !== undefined
            ? Boolean(payload.isMandatory)
            : Boolean(template.defaultIsMandatory),
    }

    const task = await createTask(body, { managerId, companyId })
    return {
        task,
        template: serializeTaskTemplate(template),
        enrichDefaults: {
            department: template.department || '',
            skills: template.skillsRequired || [],
            tags: template.tags || [],
        },
    }
}

async function createBulkTasks(tasksPayload, { managerId, companyId }) {
    const createdTasks = []
    for (const taskPayload of tasksPayload) {
        // Run policy validation first to ensure safety
        const policyResult = await evaluateTaskPolicy({
            taskInput: {
                title: taskPayload.title,
                effort: Number(taskPayload.effort || 1),
                priority: taskPayload.priority || 'medium',
                isMandatory: Boolean(taskPayload.isMandatory),
            },
            companyId
        })

        if (policyResult.status === 'block') {
            throw new Error(`Policy blocked creation of task: ${taskPayload.title}. Blockers: ${policyResult.blockers.join(', ')}`)
        }

        const task = await createTask(taskPayload, { managerId, companyId })
        createdTasks.push(task)
    }
    return createdTasks
}

async function assignBulkTasks(assignmentsPayload, { managerId, companyId }) {
    const assignedTasks = []
    const errors = []
    
    for (let i = 0; i < assignmentsPayload.length; i++) {
        const assignment = assignmentsPayload[i]
        try {
            console.log(`📌 Processing assignment ${i + 1}/${assignmentsPayload.length}:`, {
                taskId: assignment.taskId,
                employeeId: assignment.employeeId
            })
            
            const result = await assignTask(
                {
                    taskId: assignment.taskId,
                    employeeId: assignment.employeeId,
                    assignmentMode: 'manual'
                },
                { managerId, companyId }
            )
            assignedTasks.push(result)
            console.log(`✅ Assignment ${i + 1} succeeded`)
        } catch (err) {
            console.error(`❌ Assignment ${i + 1} failed:`, {
                taskId: assignment.taskId,
                employeeId: assignment.employeeId,
                error: err.message
            })
            errors.push({
                index: i,
                taskId: assignment.taskId,
                employeeId: assignment.employeeId,
                error: err.message
            })
        }
    }

    if (errors.length > 0 && assignedTasks.length === 0) {
        const err = new Error(`All ${errors.length} assignments failed. First error: ${errors[0].error}`)
        err.statusCode = 400
        throw err
    }

    if (errors.length > 0) {
        console.warn(`⚠️ Partial failure: ${assignedTasks.length} succeeded, ${errors.length} failed`)
    }

    return assignedTasks
}

async function distributeBulkTasks(taskIds, { companyId }) {
    const objectIds = taskIds
        .filter(id => mongoose.Types.ObjectId.isValid(id))
        .map(id => new mongoose.Types.ObjectId(id))

    // Fetch tasks — allow assigned or unassigned since we may be re-distributing
    const tasks = await Task.find({
        _id: { $in: objectIds },
        companyId,
        isDeleted: { $ne: true },
    })

    if (!tasks.length) throw new Error('No tasks found for given IDs')

    // 2. Fetch all employees to track simulated workload
    const employees = await User.find({
        companyId,
        role: 'employee',
        isActive: true,
    }).lean()

    // 3. Create a simulated state
    const simulatedWorkloads = {}
    employees.forEach(emp => {
        simulatedWorkloads[emp._id.toString()] = emp.currentWorkload || 0
    })

    const distributionMap = []

    // 4. Iteratively rank and distribute
    for (const task of tasks) {
        // Temporarily patch the DB values for ranking with our simulated workload
        const currentEmpData = employees.map(emp => ({
            ...emp,
            currentWorkload: simulatedWorkloads[emp._id.toString()]
        }))
        
        // Custom lightweight ranker since rankTaskCandidates pulls fresh from DB
        let topCandidate = null
        let highestScore = -Infinity

        for (const emp of currentEmpData) {
            // Simplified calculation using ruleEngine logic
            const workloadNormalized = ruleEngineService.normalizeWorkload(emp.currentWorkload)
            const score = (100 - workloadNormalized) * 0.35 + (emp.performanceScore || 0) * 0.20
            
            if (score > highestScore) {
                highestScore = score
                topCandidate = emp
            }
        }

        if (topCandidate) {
            // Assign
            distributionMap.push({
                taskId: task._id,
                taskTitle: task.title,
                employeeId: topCandidate._id,
                employeeName: topCandidate.fullName,
                effort: task.effort,
                projectedWorkload: simulatedWorkloads[topCandidate._id.toString()] + task.effort,
                reason: 'Algorithmic distribution based on workload balancing.'
            })

            // Update simulated workload
            simulatedWorkloads[topCandidate._id.toString()] += task.effort
        }
    }

    return distributionMap
}

module.exports = {
    TASK_PUBLIC_ID_REGEX,
    isTaskPublicId,
    normalizeAssignmentMode,
    serializeTask,
    serializeTaskTemplate,
    serializeHistoryItem,
    buildTaskLookupQuery,
    buildTaskListQuery,
    buildSortObject,
    canTransitionTaskState,
    transitionTaskState,
    generateNextTaskPublicId,
    createTask,
    findTaskByIdentifier,
    getTaskDetails,
    listTeamTasks,
    assignTask,
    getTaskHistoryByTaskId,
    getTaskHistoryFeed,
    getTaskTemplates,
    validateTaskPolicy,
    rankTaskCandidates,
    createTaskFromTemplate,
    createBulkTasks,
    assignBulkTasks,
    distributeBulkTasks,
}