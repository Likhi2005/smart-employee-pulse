const Task = require('../../models/Task')
const workloadService = require('../workloadService')
const emailService = require('../email/emailService')
const taskServices = require('../taskServices')
const logger = require('../../utils/logger')
const { TASK_EVENT_TYPES } = require('./eventTypes')

function shouldSendEmails() {
    return process.env.NODE_ENV === 'production' && process.env.ENABLE_EVENT_EMAILS !== 'false'
}

function toIso(input) {
    try {
        return new Date(input).toISOString()
    } catch {
        return null
    }
}

async function handleTaskCreated(eventLog) {
    logger.info('TaskCreated handler', { eventId: eventLog.eventId, aggregateId: eventLog.aggregateId })

    const task = await Task.findById(eventLog.aggregateId).lean()
    if (!task) return

    // Recompute ranking asynchronously on task creation to keep candidate insights fresh.
    await taskServices.rankTaskCandidates(
        {
            taskId: task._id,
            requiredSkills: [],
        },
        {
            companyId: task.companyId,
            actorId: eventLog.actorId,
        }
    )
}

async function handleTaskAssigned(eventLog) {
    const task = await Task.findById(eventLog.aggregateId)
        .populate('assignedTo', 'fullName email')
        .lean()

    if (!task || !task.assignedTo) return

    await workloadService.updateEmployeeWorkload(task.assignedTo._id)

    if (!shouldSendEmails()) {
        logger.info('Skipping assignment email in non-production', {
            taskId: task._id,
            assignee: task.assignedTo.email,
        })
        return
    }

    await emailService.sendTaskEventNotification({
        to: task.assignedTo.email,
        subject: `New Task Assigned: ${task.title}`,
        text: `A task has been assigned to you.\nTask: ${task.title}\nPriority: ${task.priority}\nDue: ${toIso(task.dueDate) || 'Not set'}`,
        html: `<p>A task has been assigned to you.</p><p><strong>Task:</strong> ${task.title}</p><p><strong>Priority:</strong> ${task.priority}</p><p><strong>Due:</strong> ${toIso(task.dueDate) || 'Not set'}</p>`,
    })
}

async function handleTaskCompleted(eventLog) {
    const task = await Task.findById(eventLog.aggregateId)
        .populate('assignedBy', 'fullName email')
        .populate('assignedTo', 'fullName email')
        .lean()

    if (!task) return

    if (!shouldSendEmails() || !task.assignedBy?.email) {
        logger.info('Skipping completion email in non-production or missing manager email', {
            taskId: task._id,
        })
        return
    }

    await emailService.sendTaskEventNotification({
        to: task.assignedBy.email,
        subject: `Task Completed: ${task.title}`,
        text: `${task.assignedTo?.fullName || 'Employee'} completed task ${task.title}.`,
        html: `<p>${task.assignedTo?.fullName || 'Employee'} completed task <strong>${task.title}</strong>.</p>`,
    })
}

async function handleTaskOverdue(eventLog) {
    const task = await Task.findById(eventLog.aggregateId)
        .populate('assignedBy', 'fullName email')
        .populate('assignedTo', 'fullName email')
        .lean()

    if (!task || !task.assignedBy?.email) return

    if (!shouldSendEmails()) {
        logger.info('Skipping overdue escalation email in non-production', {
            taskId: task._id,
        })
        return
    }

    await emailService.sendTaskEventNotification({
        to: task.assignedBy.email,
        subject: `Escalation: Task Overdue (${task.title})`,
        text: `Task ${task.title} assigned to ${task.assignedTo?.fullName || 'employee'} is overdue.`,
        html: `<p>Task <strong>${task.title}</strong> assigned to ${task.assignedTo?.fullName || 'employee'} is overdue.</p>`,
    })
}

async function handleTaskStateTransitioned(eventLog) {
    logger.info('TaskStateTransitioned handler', {
        eventId: eventLog.eventId,
        aggregateId: eventLog.aggregateId,
        payload: eventLog.payload,
    })
}

function registerTaskEventHandlers(registerEventHandler) {
    registerEventHandler(TASK_EVENT_TYPES.TaskCreated, handleTaskCreated)
    registerEventHandler(TASK_EVENT_TYPES.TaskAssigned, handleTaskAssigned)
    registerEventHandler(TASK_EVENT_TYPES.TaskCompleted, handleTaskCompleted)
    registerEventHandler(TASK_EVENT_TYPES.TaskOverdue, handleTaskOverdue)
    registerEventHandler(TASK_EVENT_TYPES.TaskStateTransitioned, handleTaskStateTransitioned)

    registerEventHandler(TASK_EVENT_TYPES.TaskAccepted, async (eventLog) => {
        const actorId = eventLog.payload?.actorId
        if (actorId) {
            await workloadService.updateEmployeeWorkload(actorId)
        }
    })

    registerEventHandler(TASK_EVENT_TYPES.TaskRejected, async (eventLog) => {
        const actorId = eventLog.payload?.actorId
        if (actorId) {
            await workloadService.updateEmployeeWorkload(actorId)
        }
    })

    registerEventHandler(TASK_EVENT_TYPES.PolicyValidated, async (eventLog) => {
        logger.info('PolicyValidated handler', {
            eventId: eventLog.eventId,
            aggregateId: eventLog.aggregateId,
            status: eventLog.payload?.status,
        })
    })

    registerEventHandler(TASK_EVENT_TYPES.CandidatesRanked, async (eventLog) => {
        logger.info('CandidatesRanked handler', {
            eventId: eventLog.eventId,
            aggregateId: eventLog.aggregateId,
            rankedCount: eventLog.payload?.rankedCount || 0,
        })
    })

    registerEventHandler(TASK_EVENT_TYPES.TaskEnriched, async (eventLog) => {
        const task = await Task.findById(eventLog.aggregateId).lean()
        if (!task) return

        await taskServices.validateTaskPolicy(
            {
                taskId: task._id,
                title: task.title,
                description: task.description,
                effort: task.effort,
                priority: task.priority,
                dueDate: task.dueDate,
                isMandatory: task.isMandatory,
            },
            {
                companyId: task.companyId,
                actorId: eventLog.actorId,
            }
        )
    })

    registerEventHandler(TASK_EVENT_TYPES.TaskApproved, async (eventLog) => {
        const task = await Task.findById(eventLog.aggregateId)
            .populate('assignedTo', 'fullName email')
            .lean()

        if (!task || !task.assignedTo?.email) return

        if (!shouldSendEmails()) {
            logger.info('Skipping approval email in non-production', {
                taskId: task._id,
            })
            return
        }

        await emailService.sendTaskEventNotification({
            to: task.assignedTo.email,
            subject: `Task Approved: ${task.title}`,
            text: `Your submitted task ${task.title} has been approved.`,
            html: `<p>Your submitted task <strong>${task.title}</strong> has been approved.</p>`,
        })
    })
}

async function emitOverdueEvents(emitDomainEvent) {
    const now = new Date()
    const overdueTasks = await Task.find({
        status: { $in: ['pending', 'in-progress'] },
        dueDate: { $ne: null, $lt: now },
        isDeleted: { $ne: true },
    })
        .select('_id companyId dueDate title')
        .lean()

    for (const task of overdueTasks) {
        await emitDomainEvent({
            type: TASK_EVENT_TYPES.TaskOverdue,
            aggregateId: task._id,
            actorId: null,
            companyId: task.companyId,
            payload: {
                taskId: String(task._id),
                title: task.title,
                dueDate: task.dueDate,
            },
            idempotencyKey: `TaskOverdue:${task._id}:${new Date(task.dueDate).toISOString().slice(0, 10)}`,
        })
    }
}

module.exports = {
    registerTaskEventHandlers,
    emitOverdueEvents,
}
