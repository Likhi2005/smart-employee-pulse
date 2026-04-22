const { registerEventHandler, emitDomainEvent } = require('./eventBus')
const { registerTaskEventHandlers, emitOverdueEvents } = require('./taskEventHandlers')
const logger = require('../../utils/logger')

let bootstrapped = false

function bootstrapTaskEvents() {
    if (bootstrapped) return

    registerTaskEventHandlers(registerEventHandler)

    const intervalMs = Number(process.env.EVENT_OVERDUE_SCAN_INTERVAL_MS || 5 * 60 * 1000)
    setInterval(() => {
        emitOverdueEvents(emitDomainEvent).catch((error) => {
            logger.error('Overdue scan failed', { error: error.message })
        })
    }, intervalMs)

    bootstrapped = true
    logger.info('Task events bootstrap complete')
}

module.exports = {
    bootstrapTaskEvents,
}
