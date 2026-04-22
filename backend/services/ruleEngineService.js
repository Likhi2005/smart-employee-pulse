const Task = require('../models/Task');
const User = require('../models/User');

// Normalize workload to 0..100 with configurable cap
const WORKLOAD_CAP = 120;
const normalizeWorkload = (workload) => Math.max(0, Math.min(100, (workload / WORKLOAD_CAP) * 100));

const tokenize = (text) =>
    String(text || '')
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter(Boolean);

const calcSkillMatch = (task, employee) => {
    const empSkills = (employee.skills || []).map((s) => String(s).toLowerCase());
    if (!empSkills.length) return 0;

    const words = tokenize(`${task.title} ${task.description}`);
    const uniqueWords = new Set(words);
    let hit = 0;

    for (const skill of empSkills) {
        const skillWords = tokenize(skill);
        const matched = skillWords.some((sw) => uniqueWords.has(sw));
        if (matched) hit += 1;
    }

    return Math.round((hit / empSkills.length) * 100);
};

const computeAssigneeScore = ({ skillMatch, workload, performanceScore }) => {
    const workloadNormalized = normalizeWorkload(workload);
    return (
        skillMatch * 0.45 +
        (100 - workloadNormalized) * 0.35 +
        Math.min(100, performanceScore) * 0.20
    );
};

const suggestAssignee = async ({ taskId, companyId }) => {
    const task = await Task.findOne({ _id: taskId, companyId, isDeleted: { $ne: true } });
    if (!task) {
        return { suggested: false, reason: 'Task not found' };
    }

    const employees = await User.find({
        companyId,
        role: 'employee',
        isActive: true,
    }).select('_id fullName email department skills currentWorkload performanceScore');

    if (!employees.length) {
        return { suggested: false, reason: 'No active employees available' };
    }

    const ranked = employees.map((emp) => {
        const skillMatch = calcSkillMatch(task, emp);
        const score = computeAssigneeScore({
            skillMatch,
            workload: emp.currentWorkload || 0,
            performanceScore: emp.performanceScore || 0,
        });

        return {
            employee: {
                id: emp._id,
                name: emp.fullName,
                email: emp.email,
                department: emp.department || null,
            },
            metrics: {
                skillMatch,
                workload: emp.currentWorkload || 0,
                performanceScore: emp.performanceScore || 0,
            },
            score: Math.round(score * 100) / 100,
        };
    });

    ranked.sort((a, b) => b.score - a.score);

    return {
        suggested: true,
        top: ranked[0],
        alternatives: ranked.slice(1, 3),
        scoringFormula: 'score = skillMatch*0.45 + (100-workloadNormalized)*0.35 + performanceScore*0.20',
    };
};

const estimateDeadlineByEffort = ({ effort, employee = null }) => {
    const safeEffort = Math.max(1, Number(effort) || 1);

    // Deterministic baseline. If employee exists and has better score, compress days.
    const baselineVelocity = 6; // effort points per day
    const perfFactor = employee ? Math.max(0.8, 1.2 - ((employee.performanceScore || 0) / 250)) : 1;
    const estimatedDays = Math.max(1, Math.ceil((safeEffort / baselineVelocity) * perfFactor));

    const due = new Date();
    due.setDate(due.getDate() + estimatedDays);

    return {
        estimatedDays,
        estimatedDueDate: due,
        method: 'effort and performance weighted rule',
    };
};

const detectTaskRisk = ({ dueDate, status, assigneeWorkload = 0, overdueOpenTasks = 0 }) => {
    const now = new Date();
    const overdue = dueDate ? new Date(dueDate) < now && !['completed', 'rejected'].includes(status) : false;
    const workloadPercent = normalizeWorkload(assigneeWorkload);

    if (overdue || overdueOpenTasks > 3 || workloadPercent > 90) {
        return 'high';
    }
    if (workloadPercent > 70 || overdueOpenTasks > 1) {
        return 'medium';
    }
    return 'low';
};

module.exports = {
    suggestAssignee,
    estimateDeadlineByEffort,
    detectTaskRisk,
    normalizeWorkload,
};