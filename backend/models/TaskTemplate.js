const mongoose = require('mongoose');

const taskTemplateSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            default: '',
        },
        defaultPriority: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'medium',
        },
        defaultEffort: {
            type: Number,
            default: 1,
            min: 1,
        },
        defaultIsMandatory: {
            type: Boolean,
            default: false,
        },
        department: {
            type: String,
            default: null,
        },
        skillsRequired: {
            type: [String],
            default: [],
        },
        tags: {
            type: [String],
            default: [],
        },
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Company',
            required: true,
            index: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

taskTemplateSchema.index({ companyId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('TaskTemplate', taskTemplateSchema);