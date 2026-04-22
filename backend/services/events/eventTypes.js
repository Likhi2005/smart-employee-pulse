const TASK_EVENT_TYPES = {
    TaskCreated: 'TaskCreated',
    TaskEnriched: 'TaskEnriched',
    PolicyValidated: 'PolicyValidated',
    CandidatesRanked: 'CandidatesRanked',
    TaskAssigned: 'TaskAssigned',
    TaskAccepted: 'TaskAccepted',
    TaskRejected: 'TaskRejected',
    TaskOverdue: 'TaskOverdue',
    TaskCompleted: 'TaskCompleted',
    TaskApproved: 'TaskApproved',
    TaskStateTransitioned: 'TaskStateTransitioned',
}

module.exports = {
    TASK_EVENT_TYPES,
}
