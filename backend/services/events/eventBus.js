const crypto = require('crypto')
const EventLog = require('../../models/EventLog')
const logger = require('../../utils/logger')

const handlers = new Map()

const MAX_RETRIES = Number(process.env.EVENT_MAX_RETRIES || 5)
const BASE_DELAY_MS = Number(process.env.EVENT_BASE_DELAY_MS || 500)

function getBackoffDelayMs(retryCount) {
    return BASE_DELAY_MS * Math.pow(2, retryCount)
}

function hashPayload(payload) {
    return crypto.createHash('sha1').update(JSON.stringify(payload || {})).digest('hex')
}

function registerEventHandler(eventType, handler) {
    if (!handlers.has(eventType)) {
        handlers.set(eventType, [])
    }
    handlers.get(eventType).push(handler)
}

async function emitDomainEvent({ type, aggregateId, payload, actorId = null, companyId = null, idempotencyKey = null }) {
    const finalKey =
        idempotencyKey ||
        `${type}:${String(aggregateId)}:${hashPayload(payload)}`

    const existing = await EventLog.findOne({
        type,
        idempotencyKey: finalKey,
    }).lean()

    if (existing) {
        return existing
    }

    const eventLog = await EventLog.create({
        eventId: crypto.randomUUID(),
        aggregateId: String(aggregateId),
        type,
        payload,
        actorId,
        companyId,
        idempotencyKey: finalKey,
        status: 'pending',
        retryCount: 0,
        timestamp: new Date(),
    })

    process.nextTick(() => {
        dispatchEventById(eventLog._id).catch((error) => {
            logger.error('Event dispatch bootstrap failed', {
                eventId: eventLog.eventId,
                type,
                error: error.message,
            })
        })
    })

    return eventLog
}

async function dispatchEventById(eventId) {
    const eventLog = await EventLog.findById(eventId)
    if (!eventLog) return
    if (eventLog.status === 'processed' || eventLog.status === 'dead-letter') return

    const eventHandlers = handlers.get(eventLog.type) || []

    try {
        for (const handler of eventHandlers) {
            await handler(eventLog)
        }

        eventLog.status = 'processed'
        eventLog.lastError = null
        eventLog.processedAt = new Date()
        await eventLog.save()
    } catch (error) {
        eventLog.retryCount = Number(eventLog.retryCount || 0) + 1
        eventLog.lastError = error.message

        if (eventLog.retryCount > MAX_RETRIES) {
            eventLog.status = 'dead-letter'
            await eventLog.save()

            logger.error('Event moved to dead-letter', {
                eventId: eventLog.eventId,
                type: eventLog.type,
                retries: eventLog.retryCount,
                error: error.message,
            })
            return
        }

        eventLog.status = 'failed'
        await eventLog.save()

        const delay = getBackoffDelayMs(eventLog.retryCount)
        setTimeout(() => {
            dispatchEventById(eventLog._id).catch((retryError) => {
                logger.error('Event retry dispatch failed', {
                    eventId: eventLog.eventId,
                    type: eventLog.type,
                    error: retryError.message,
                })
            })
        }, delay)
    }
}

module.exports = {
    registerEventHandler,
    emitDomainEvent,
    dispatchEventById,
}
