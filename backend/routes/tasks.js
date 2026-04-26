const express = require('express')
const taskController = require('../controllers/taskController')
const { authenticate, authorizeManager, authorizeEmployee } = require('../middlewares/auth')
const {
    handleValidationErrors,
    taskIdentifierValidation,
    taskBodyIdentifierValidation,
    createTaskValidation,
    assignTaskValidation,
    updateTaskValidation,
    deleteTaskValidation,
    createTaskTemplateValidation,
    updateTaskTemplateValidation,
    templateIdValidation,
    taskHistoryByTaskValidation,
    taskHistoryFeedValidation,
    templateListValidation,
    suggestAssigneeValidation,
    taskListValidation,
    policyValidationRequest,
    rankCandidatesValidation,
    createFromTemplateValidation,
    taskStateValidation,
    approveTaskValidation,
    bulkCreateValidation,
    bulkAssignValidation,
    bulkDistributeValidation,
} = require('../validators/taskValidators')

const router = express.Router()

router.post(
    '/create',
    authenticate,
    authorizeManager,
    createTaskValidation,
    handleValidationErrors,
    taskController.createTask
)

router.post(
    '/assign',
    authenticate,
    authorizeManager,
    assignTaskValidation,
    handleValidationErrors,
    taskController.assignTask
)

router.post(
    '/templates',
    authenticate,
    authorizeManager,
    createTaskTemplateValidation,
    handleValidationErrors,
    taskController.createTaskTemplate
)

router.get(
    '/templates',
    authenticate,
    authorizeManager,
    templateListValidation,
    handleValidationErrors,
    taskController.getTaskTemplates
)

router.get(
    '/templates/:templateId',
    authenticate,
    authorizeManager,
    templateIdValidation,
    handleValidationErrors,
    taskController.getTaskTemplateById
)

router.put(
    '/templates/:templateId',
    authenticate,
    authorizeManager,
    updateTaskTemplateValidation,
    handleValidationErrors,
    taskController.updateTaskTemplate
)

router.delete(
    '/templates/:templateId',
    authenticate,
    authorizeManager,
    templateIdValidation,
    handleValidationErrors,
    taskController.deleteTaskTemplate
)

router.get(
    '/history',
    authenticate,
    authorizeManager,
    taskHistoryFeedValidation,
    handleValidationErrors,
    taskController.getTaskHistoryFeed
)

router.get(
    '/:taskId/history',
    authenticate,
    taskHistoryByTaskValidation,
    handleValidationErrors,
    taskController.getTaskHistoryByTaskId
)

router.get(
    '/:taskId/suggest-assignee',
    authenticate,
    authorizeManager,
    suggestAssigneeValidation,
    handleValidationErrors,
    taskController.getSuggestedAssignee
)

router.put(
    '/:taskId',
    authenticate,
    authorizeManager,
    updateTaskValidation,
    handleValidationErrors,
    taskController.updateTask
)

router.delete(
    '/:taskId',
    authenticate,
    authorizeManager,
    deleteTaskValidation,
    handleValidationErrors,
    taskController.deleteTask
)

router.get(
    '/team-tasks',
    authenticate,
    authorizeManager,
    taskListValidation,
    handleValidationErrors,
    taskController.getTeamTasks
)

router.get(
    '/team-workload',
    authenticate,
    authorizeManager,
    taskController.getTeamWorkload
)

router.get(
    '/my-tasks',
    authenticate,
    authorizeEmployee,
    taskController.getMyTasks
)

router.post(
    '/accept',
    authenticate,
    authorizeEmployee,
    taskBodyIdentifierValidation,
    handleValidationErrors,
    taskController.acceptTask
)

router.post(
    '/reject',
    authenticate,
    authorizeEmployee,
    taskBodyIdentifierValidation,
    handleValidationErrors,
    taskController.rejectTask
)

router.post(
    '/complete',
    authenticate,
    authorizeEmployee,
    taskBodyIdentifierValidation,
    handleValidationErrors,
    taskController.completeTask
)

router.post(
    '/:taskId/state',
    authenticate,
    authorizeManager,
    taskStateValidation,
    handleValidationErrors,
    taskController.updateTaskState
)

router.post(
    '/:taskId/approve',
    authenticate,
    authorizeManager,
    approveTaskValidation,
    handleValidationErrors,
    taskController.approveTask
)

router.get(
    '/:taskId',
    authenticate,
    taskIdentifierValidation,
    handleValidationErrors,
    taskController.getTaskDetails
)


// Policy validation and candidate ranking routes
router.post(
    '/policy/validate',
    authenticate,
    authorizeManager,
    policyValidationRequest,
    handleValidationErrors,
    taskController.validateTaskPolicy
)

router.post(
    '/rank-candidates',
    authenticate,
    authorizeManager,
    rankCandidatesValidation,
    handleValidationErrors,
    taskController.rankTaskCandidates
)

router.post(
    '/create-from-template',
    authenticate,
    authorizeManager,
    createFromTemplateValidation,
    handleValidationErrors,
    taskController.createTaskFromTemplate
)

// Bulk Operations
router.post(
    '/bulk-create',
    authenticate,
    authorizeManager,
    bulkCreateValidation,
    handleValidationErrors,
    taskController.createBulkTasks
)

router.post(
    '/bulk-assign',
    authenticate,
    authorizeManager,
    bulkAssignValidation,
    handleValidationErrors,
    taskController.assignBulkTasks
)

router.post(
    '/bulk-distribute',
    authenticate,
    authorizeManager,
    bulkDistributeValidation,
    handleValidationErrors,
    taskController.distributeBulkTasks
)

module.exports = router