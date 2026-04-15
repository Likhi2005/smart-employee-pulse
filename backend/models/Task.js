const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            default: '',
        },
        effort: {
            type: Number,
            required: true, // Estimate in hours or points
            min: 1,
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'medium',
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected', 'completed'],
            default: 'pending',
        },
        assignedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true, // Manager who created the task
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true, // Employee assigned
        },
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Company',
            required: true,
        },
        isMandatory: {
            type: Boolean,
            default: false, // Employees cannot reject mandatory tasks
        },
        dueDate: {
            type: Date,
            default: null,
        },
        completedAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

// Index for faster queries
taskSchema.index({ assignedTo: 1, companyId: 1 });
taskSchema.index({ assignedBy: 1, companyId: 1 });
taskSchema.index({ status: 1 });

module.exports = mongoose.model('Task', taskSchema);