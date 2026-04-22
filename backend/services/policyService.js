const User = require('../models/User')

function daysBetween(now, dueDate) {
    if (!dueDate) return null
    const ms = new Date(dueDate).getTime() - now.getTime()
    return Math.ceil(ms / (1000 * 60 * 60 * 24))
}

async function evaluateTaskPolicy({ taskInput, companyId }) {
    const blockers = []
    const warnings = []
    const suggestions = []

    const now = new Date()
    const dueInDays = daysBetween(now, taskInput.dueDate)

    if (!taskInput.title || !String(taskInput.title).trim()) {
        blockers.push('Task title is required')
    }

    if (!taskInput.effort || Number(taskInput.effort) < 1) {
        blockers.push('Effort must be at least 1 hour')
    }

    if (dueInDays !== null && dueInDays < 0) {
        blockers.push('Due date cannot be in the past')
    }

    if (dueInDays !== null && dueInDays <= 2) {
        warnings.push('SLA risk is high due to near deadline')
        suggestions.push('Increase priority and reduce scope or assign to low workload owner')
    }

    if (taskInput.isMandatory && Number(taskInput.effort) > 20) {
        warnings.push('Mandatory + high effort has high rejection risk')
        suggestions.push('Split into smaller mandatory milestones')
    }

    const employees = await User.find({
        companyId,
        role: 'employee',
        isActive: true,
    }).select('currentWorkload').lean()

    const avgWorkload =
        employees.length > 0
            ? employees.reduce((sum, e) => sum + Number(e.currentWorkload || 0), 0) / employees.length
            : 0

    if (avgWorkload > 80) {
        warnings.push('Team workload is above threshold')
        suggestions.push('Delay due date or lower effort before assignment')
    }

    const status = blockers.length > 0 ? 'block' : warnings.length > 0 ? 'warn' : 'pass'

    return {
        status,
        blockers,
        warnings,
        suggestions,
        metrics: {
            avgTeamWorkload: Math.round(avgWorkload),
            dueInDays,
            evaluatedAt: now.toISOString(),
        },
        serviceState: {
            policyEngine: 'ok',
            workloadSnapshot: employees.length > 0 ? 'fresh' : 'empty-team',
            timestamp: now.toISOString(),
        },
    }
}

module.exports = {
    evaluateTaskPolicy,
}