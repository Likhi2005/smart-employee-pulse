const mongoose = require('mongoose');

const taskAssignmentSchema = new mongoose.Schema(
    {
        taskId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Task',
            required: true,
            index: true,
        },
        employeeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        assignedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Company',
            required: true,
            index: true,
        },
        source: {
            type: String,
            enum: ['manual', 'ai'],
            default: 'manual',
        },
        recommendationMeta: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
        },
        assignedAt: {
            type: Date,
            default: Date.now,
        },
        unassignedAt: {
            type: Date,
            default: null,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

taskAssignmentSchema.index({ taskId: 1, isActive: 1 });
taskAssignmentSchema.index({ employeeId: 1, isActive: 1 });

module.exports = mongoose.model('TaskAssignment', taskAssignmentSchema);