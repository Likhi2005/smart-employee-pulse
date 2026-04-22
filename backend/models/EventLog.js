const mongoose = require('mongoose')

const eventLogSchema = new mongoose.Schema(
    {
        eventId: { type: String, required: true, unique: true, index: true },
        aggregateId: { type: String, required: true, index: true },
        type: { type: String, required: true, index: true },
        payload: { type: mongoose.Schema.Types.Mixed, required: true },
        actorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
            index: true,
        },
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Company',
            default: null,
            index: true,
        },
        idempotencyKey: { type: String, required: true, index: true },
        status: {
            type: String,
            enum: ['pending', 'processed', 'failed', 'dead-letter'],
            default: 'pending',
            index: true,
        },
        retryCount: { type: Number, default: 0 },
        lastError: { type: String, default: null },
        processedAt: { type: Date, default: null },
        timestamp: { type: Date, default: Date.now, index: true },
    },
    { timestamps: true }
)

eventLogSchema.index({ type: 1, aggregateId: 1, createdAt: -1 })
eventLogSchema.index({ idempotencyKey: 1, type: 1 }, { unique: true })

module.exports = mongoose.model('EventLog', eventLogSchema)
