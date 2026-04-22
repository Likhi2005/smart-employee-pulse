const mongoose = require('mongoose');

const taskHistorySchema = new mongoose.Schema(
    {
        taskId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Task',
            required: true,
            index: true,
        },
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Company',
            required: true,
            index: true,
        },
        actorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        action: {
            type: String,
            enum: [
                'created',
                'assigned',
                'reassigned',
                'accepted',
                'rejected',
                'completed',
                'updated',
                'deleted',
            ],
            required: true,
        },
        fromStatus: {
            type: String,
            enum: ['pending','in-progress', 'accepted', 'rejected', 'completed', null],
            default: null,
        },
        toStatus: {
            type: String,
            enum: ['pending','in-progress', 'accepted', 'rejected', 'completed', null],
            default: null,
        },
        notes: {
            type: String,
            default: '',
        },
        meta: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
        },
    },
    { timestamps: true }
);

taskHistorySchema.index({ taskId: 1, createdAt: -1 });
taskHistorySchema.index({ companyId: 1, createdAt: -1 });

module.exports = mongoose.model('TaskHistory', taskHistorySchema);