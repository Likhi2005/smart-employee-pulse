const mongoose = require('mongoose')
const { body, param, query, validationResult } = require('express-validator')

const TASK_PUBLIC_ID_REGEX = /^TASK-\d+$/

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array(),
        })
    }
    next()
}

const taskIdentifierValidation = [
    param('taskId').custom((value) => {
        if (TASK_PUBLIC_ID_REGEX.test(String(value))) return true
        if (mongoose.Types.ObjectId.isValid(value)) return true
        throw new Error('Task ID must be a Mongo ID or TASK-XXXX format')
    }),
]

const taskPublicIdQueryValidation = [
    query('id').optional().matches(TASK_PUBLIC_ID_REGEX).withMessage('id must match TASK-XXXX'),
]

const createTaskValidation = [
    body('title').trim().notEmpty().withMessage('Title required'),
    body('description').optional().trim(),
    body('effort').isInt({ min: 1 }).withMessage('Effort must be at least 1'),
    body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
    body('dueDate').optional({ nullable: true, checkFalsy: true }).isISO8601().withMessage('Invalid due date'),
    body('isMandatory').optional().isBoolean().withMessage('isMandatory must be boolean'),
]

const assignTaskValidation = [
    body('taskId').custom((value) => {
        if (TASK_PUBLIC_ID_REGEX.test(String(value))) return true
        if (mongoose.Types.ObjectId.isValid(value)) return true
        throw new Error('Task ID must be a Mongo ID or TASK-XXXX format')
    }),
    body('assignmentMode')
        .optional()
        .isIn(['manual', 'rule-based', 'ai'])
        .withMessage('assignmentMode must be manual, rule-based, or ai'),
    body('useAIAssignment').optional().isBoolean(),
    body('useRuleBasedAssignment').optional().isBoolean(),
    body('employeeId').optional().notEmpty().withMessage('Employee ID cannot be empty'),
]

const updateTaskValidation = [
    ...taskIdentifierValidation,
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('description').optional().trim(),
    body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
    body('effort').optional().isInt({ min: 1 }).withMessage('Effort must be at least 1'),
    body('dueDate').optional({ nullable: true, checkFalsy: true }).isISO8601().withMessage('Invalid date format'),
    body('isMandatory').optional().isBoolean().withMessage('isMandatory must be boolean'),
]

const deleteTaskValidation = [
    ...taskIdentifierValidation,
]

const createTaskTemplateValidation = [
    body('name').trim().notEmpty().withMessage('Template name required'),
    body('title').trim().notEmpty().withMessage('Template title required'),
    body('description').optional().trim(),
    body('defaultPriority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid defaultPriority'),
    body('defaultEffort').optional().isInt({ min: 1 }).withMessage('defaultEffort must be at least 1'),
    body('defaultIsMandatory').optional().isBoolean().withMessage('defaultIsMandatory must be boolean'),
    body('department').optional().trim(),
    body('skillsRequired').optional().isArray().withMessage('skillsRequired must be an array'),
    body('tags').optional().isArray().withMessage('tags must be an array'),
]

const updateTaskTemplateValidation = [
    param('templateId').notEmpty().withMessage('Template ID required'),
    body('name').optional().trim().notEmpty().withMessage('Template name cannot be empty'),
    body('title').optional().trim().notEmpty().withMessage('Template title cannot be empty'),
    body('description').optional().trim(),
    body('defaultPriority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid defaultPriority'),
    body('defaultEffort').optional().isInt({ min: 1 }).withMessage('defaultEffort must be at least 1'),
    body('defaultIsMandatory').optional().isBoolean().withMessage('defaultIsMandatory must be boolean'),
    body('department').optional().trim(),
    body('skillsRequired').optional().isArray().withMessage('skillsRequired must be an array'),
    body('tags').optional().isArray().withMessage('tags must be an array'),
    body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
]

const templateIdValidation = [
    param('templateId').notEmpty().withMessage('Template ID required'),
]

const taskListValidation = [
    query('page').optional().isInt({ min: 1 }).withMessage('page must be >= 1'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be 1..100'),
    query('search').optional().trim().isLength({ max: 150 }).withMessage('search is too long'),
    query('status').optional().isIn(['pending', 'in-progress', 'accepted', 'rejected', 'completed']).withMessage('Invalid status'),
    query('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
    query('riskLevel').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid riskLevel'),
    query('employeeId').optional().custom((value) => {
        if (mongoose.Types.ObjectId.isValid(value)) return true
        throw new Error('employeeId must be a valid Mongo ID')
    }),
    query('id').optional().matches(TASK_PUBLIC_ID_REGEX).withMessage('id must match TASK-XXXX'),
    query('dueDate').optional().isISO8601().withMessage('dueDate must be ISO8601'),
    query('dueDateFrom').optional().isISO8601().withMessage('dueDateFrom must be ISO8601'),
    query('dueDateTo').optional().isISO8601().withMessage('dueDateTo must be ISO8601'),
    query('sortBy').optional().isIn(['createdAt', 'updatedAt', 'dueDate', 'priority', 'effort', 'riskLevel', 'status', 'id']).withMessage('Invalid sortBy'),
    query('sortDir').optional().isIn(['asc', 'desc']).withMessage('sortDir must be asc or desc'),
]

const taskHistoryByTaskValidation = [
    ...taskIdentifierValidation,
    query('page').optional().isInt({ min: 1 }).withMessage('page must be >= 1'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be 1..100'),
    query('sortDir').optional().isIn(['asc', 'desc']).withMessage('sortDir must be asc or desc'),
]

const taskHistoryFeedValidation = [
    query('taskId').optional().custom((value) => {
        if (!value) return true
        if (TASK_PUBLIC_ID_REGEX.test(String(value))) return true
        if (mongoose.Types.ObjectId.isValid(value)) return true
        throw new Error('taskId must be a Mongo ID or TASK-XXXX format')
    }),
    query('action').optional().isIn([
        'created',
        'assigned',
        'reassigned',
        'accepted',
        'rejected',
        'completed',
        'updated',
        'deleted',
    ]).withMessage('Invalid action'),
    query('actorId').optional().custom((value) => {
        if (!value) return true
        if (mongoose.Types.ObjectId.isValid(value)) return true
        throw new Error('actorId must be a valid Mongo ID')
    }),
    query('page').optional().isInt({ min: 1 }).withMessage('page must be >= 1'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be 1..100'),
    query('sortDir').optional().isIn(['asc', 'desc']).withMessage('sortDir must be asc or desc'),
]

const templateListValidation = [
    query('page').optional().isInt({ min: 1 }).withMessage('page must be >= 1'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be 1..100'),
    query('search').optional().trim().isLength({ max: 150 }).withMessage('search is too long'),
    query('department').optional().trim().isLength({ max: 100 }).withMessage('department is too long'),
    query('includeInactive').optional().isBoolean().withMessage('includeInactive must be boolean'),
]

const suggestAssigneeValidation = [
    ...taskIdentifierValidation,
]

const taskStateValidation = [
    param('taskId').custom((value) => {
        if (TASK_PUBLIC_ID_REGEX.test(String(value))) return true
        if (mongoose.Types.ObjectId.isValid(value)) return true
        throw new Error('Task ID must be a Mongo ID or TASK-XXXX format')
    }),
    body('newState')
        .isIn(['DRAFT', 'VALIDATED', 'ENRICHED', 'POLICY_VALIDATED', 'ASSIGNABLE', 'ASSIGNED', 'REVIEW_PENDING', 'APPROVED', 'REJECTED'])
        .withMessage('Invalid task state'),
    body('reason').optional().trim(),
]

const policyValidationRequest = [
    body('taskId').optional().custom((value) => {
        if (!value) return true
        if (TASK_PUBLIC_ID_REGEX.test(String(value))) return true
        if (mongoose.Types.ObjectId.isValid(value)) return true
        throw new Error('taskId must be Mongo ID or TASK-XXXX')
    }),
    body('title').optional().trim(),
    body('description').optional().trim(),
    body('effort').optional().isInt({ min: 1 }).withMessage('effort must be >=1'),
    body('priority').optional().isIn(['low', 'medium', 'high']),
    body('dueDate').optional({ nullable: true, checkFalsy: true }).isISO8601(),
    body('isMandatory').optional().isBoolean(),
]

const approveTaskValidation = [
    ...taskIdentifierValidation,
    body('notes').optional().trim(),
]

const rankCandidatesValidation = [
    body('taskId').optional().custom((value) => {
        if (!value) return true
        if (TASK_PUBLIC_ID_REGEX.test(String(value))) return true
        if (mongoose.Types.ObjectId.isValid(value)) return true
        throw new Error('taskId must be Mongo ID or TASK-XXXX')
    }),
    body('effort').optional().isInt({ min: 1 }),
    body('dueDate').optional({ nullable: true, checkFalsy: true }).isISO8601(),
    body('isMandatory').optional().isBoolean(),
    body('requiredSkills').optional().isArray(),
]

const createFromTemplateValidation = [
    body('templateId').notEmpty().withMessage('templateId is required'),
    body('title').optional().trim(),
    body('description').optional().trim(),
    body('effort').optional().isInt({ min: 1 }),
    body('priority').optional().isIn(['low', 'medium', 'high']),
    body('dueDate').optional({ nullable: true, checkFalsy: true }).isISO8601(),
    body('isMandatory').optional().isBoolean(),
]

module.exports = {
    handleValidationErrors,
    taskIdentifierValidation,
    taskPublicIdQueryValidation,
    createTaskValidation,
    assignTaskValidation,
    updateTaskValidation,
    deleteTaskValidation,
    createTaskTemplateValidation,
    updateTaskTemplateValidation,
    templateIdValidation,
    taskListValidation,
    taskHistoryByTaskValidation,
    taskHistoryFeedValidation,
    templateListValidation,
    suggestAssigneeValidation,
    taskStateValidation,
    policyValidationRequest,
    rankCandidatesValidation,
    createFromTemplateValidation,
    approveTaskValidation,
}