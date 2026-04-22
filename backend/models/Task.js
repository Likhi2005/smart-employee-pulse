const mongoose = require('mongoose')

const TASK_STATES = {
    DRAFT: 'DRAFT',
    VALIDATED: 'VALIDATED',
    ENRICHED: 'ENRICHED',
    POLICY_VALIDATED: 'POLICY_VALIDATED',
    ASSIGNABLE: 'ASSIGNABLE',
    ASSIGNED: 'ASSIGNED',
    REVIEW_PENDING: 'REVIEW_PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
}

const taskSchema = new mongoose.Schema(
    {
        // Existing fields (keeping all)
        id: {
            type: String,
            unique: true,
            sparse: true,
            index: true,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            default: '',
        },
        effort: {
            type: Number,
            required: true,
            min: 1,
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'medium',
        },
        status: {
            type: String,
            enum: ['pending', 'in-progress', 'accepted', 'rejected', 'completed'],
            default: 'pending',
        },
        riskLevel: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'low',
        },
        dueDate: Date,
        completedAt: Date,
        assignedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            index: true,
        },
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Company',
            required: true,
            index: true,
        },
        isMandatory: {
            type: Boolean,
            default: false,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
        aiSuggestions: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
        },

        // NEW: State Machine Fields
        taskState: {
            type: String,
            enum: Object.values(TASK_STATES),
            default: TASK_STATES.DRAFT,
            index: true,
        },
        stateHistory: [
            {
                state: {
                    type: String,
                    enum: Object.values(TASK_STATES),
                },
                changedAt: {
                    type: Date,
                    default: Date.now,
                },
                changedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                },
                reason: String,
                metadata: mongoose.Schema.Types.Mixed,
            },
        ],

        // NEW: Explainability Fields
        assignmentExplanation: {
            topCandidate: {
                employeeId: mongoose.Schema.Types.ObjectId,
                score: Number,
                reasons: [String],
                confidence: Number,
            },
            policyApplied: String,
            rejectedCandidates: [
                {
                    employeeId: mongoose.Schema.Types.ObjectId,
                    score: Number,
                    rejectionReasons: [String],
                },
            ],
            rankedAt: Date,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: false },
        toObject: { virtuals: false },
    }
)

module.exports = mongoose.model('Task', taskSchema)
module.exports.TASK_STATES = TASK_STATES