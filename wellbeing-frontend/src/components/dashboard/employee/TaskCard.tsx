import React, { useState } from 'react'
import type { TaskItem } from '@/types'
import {
    AlertTriangle,
    Clock,
    Zap,
    CheckCircle2,
    XCircle,
    PlayCircle,
    ChevronDown,
    ChevronUp,
} from 'lucide-react'

// ============================================================
// HELPERS
// ============================================================

function formatDueDate(dueDate?: string): { label: string; color: string } {
    if (!dueDate) return { label: 'No deadline', color: 'text-neutral-500' }
    const diff = (new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    if (diff < 0) return { label: `Overdue ${Math.abs(Math.round(diff))}d`, color: 'text-rose-400' }
    if (diff < 1) return { label: 'Due today', color: 'text-amber-400' }
    if (diff < 2) return { label: 'Due tomorrow', color: 'text-amber-400' }
    return { label: `Due in ${Math.round(diff)}d`, color: 'text-neutral-400' }
}

const PRIORITY_CONFIG = {
    high: { label: 'Urgent', bg: 'bg-rose-500/15', text: 'text-rose-400', border: 'border-rose-500/40' },
    medium: { label: 'Warning', bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/40' },
    low: { label: 'Normal', bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/40' },
}

const RISK_CONFIG = {
    high: { label: 'High Risk', color: 'text-rose-400', dot: 'bg-rose-500' },
    medium: { label: 'Med Risk', color: 'text-amber-400', dot: 'bg-amber-500' },
    low: { label: 'Low Risk', color: 'text-emerald-400', dot: 'bg-emerald-500' },
}

// ============================================================
// PROPS
// ============================================================

interface TaskCardProps {
    task: TaskItem
    onAccept?: (id: string) => Promise<void>
    onReject?: (id: string) => Promise<void>
    onComplete?: (id: string) => Promise<void>
    compact?: boolean
    showActions?: boolean
}

// ============================================================
// COMPONENT
// ============================================================

export function TaskCard({
    task,
    onAccept,
    onReject,
    onComplete,
    compact = false,
    showActions = true,
}: TaskCardProps) {
    const [expanded, setExpanded] = useState(false)
    const [acting, setActing] = useState<string | null>(null)

    const priority = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.low
    const risk = RISK_CONFIG[task.riskLevel ?? 'low'] ?? RISK_CONFIG.low
    const due = formatDueDate(task.dueDate)

    const assignedByName =
        typeof task.assignedBy === 'object' && task.assignedBy !== null
            ? (task.assignedBy as any).fullName
            : 'Manager'

    const isMandatory = (task as any).isMandatory === true
    const isPending = task.status === 'pending'
    const isInProgress = task.status === 'in-progress'

    async function handle(action: string, fn?: (id: string) => Promise<void>) {
        if (!fn) return
        setActing(action)
        try {
            await fn(task._id)
        } catch {
            // silently fail — hook handles rollback
        } finally {
            setActing(null)
        }
    }

    return (
        <div
            className={[
                'group relative rounded-xl border bg-neutral-900 transition-all duration-200',
                'hover:border-neutral-700 hover:shadow-lg hover:shadow-black/20',
                task.riskLevel === 'high' ? 'border-rose-900/50' : 'border-neutral-800',
                compact ? 'p-3' : 'p-4',
            ].join(' ')}
        >
            {/* Priority stripe */}
            <div
                className={[
                    'absolute left-0 top-0 bottom-0 w-0.5 rounded-l-xl',
                    task.priority === 'high'
                        ? 'bg-rose-500'
                        : task.priority === 'medium'
                        ? 'bg-amber-500'
                        : 'bg-blue-500',
                ].join(' ')}
            />

            <div className="pl-2">
                {/* Header row */}
                <div className="flex items-start justify-between gap-2">
                    <p
                        className={[
                            'font-medium text-neutral-100 leading-snug',
                            compact ? 'text-sm line-clamp-1' : 'text-sm line-clamp-2',
                        ].join(' ')}
                    >
                        {task.title}
                    </p>
                    <div className="flex shrink-0 items-center gap-1.5 mt-0.5">
                        {/* Priority badge */}
                        <span
                            className={[
                                'inline-flex items-center rounded-md border px-1.5 py-0.5 text-[11px] font-medium',
                                priority.bg, priority.text, priority.border,
                            ].join(' ')}
                        >
                            {priority.label}
                        </span>
                        {isMandatory && (
                            <span className="inline-flex items-center rounded-md bg-violet-500/15 border border-violet-500/40 px-1.5 py-0.5 text-[11px] font-medium text-violet-400">
                                Mandatory
                            </span>
                        )}
                    </div>
                </div>

                {/* Meta row */}
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                    <span className={due.color}>
                        <Clock size={11} className="inline mr-1" />
                        {due.label}
                    </span>
                    <span className="text-neutral-500">
                        <Zap size={11} className="inline mr-1" />
                        {task.effort} pts
                    </span>
                    <span className={risk.color}>
                        <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${risk.dot}`} />
                        {risk.label}
                    </span>
                    {task.riskLevel === 'high' && (
                        <span className="text-rose-400">
                            <AlertTriangle size={11} className="inline mr-1" />
                            Blocker
                        </span>
                    )}
                </div>

                {/* Assigned by */}
                {!compact && (
                    <p className="mt-1.5 text-[11px] text-neutral-600">
                        Assigned by {assignedByName}
                    </p>
                )}

                {/* AI suggestion (expandable) */}
                {!compact && (task as any).aiSuggestions?.summary && (
                    <div className="mt-2">
                        <button
                            onClick={() => setExpanded(e => !e)}
                            className="flex items-center gap-1 text-[11px] text-cyan-500 hover:text-cyan-400"
                        >
                            AI insight
                            {expanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                        </button>
                        {expanded && (
                            <p className="mt-1 text-[11px] text-neutral-400 bg-neutral-800/50 rounded-lg p-2">
                                {(task as any).aiSuggestions.summary}
                            </p>
                        )}
                    </div>
                )}

                {/* Actions */}
                {showActions && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                        {isPending && onAccept && (
                            <button
                                onClick={() => handle('accept', onAccept)}
                                disabled={acting === 'accept'}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-500/15 border border-cyan-500/30 px-2.5 py-1 text-xs font-medium text-cyan-400 hover:bg-cyan-500/25 disabled:opacity-50 transition-colors"
                            >
                                <PlayCircle size={12} />
                                {acting === 'accept' ? 'Starting…' : 'Accept'}
                            </button>
                        )}
                        {isInProgress && onComplete && (
                            <button
                                onClick={() => handle('complete', onComplete)}
                                disabled={acting === 'complete'}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 text-xs font-medium text-emerald-400 hover:bg-emerald-500/25 disabled:opacity-50 transition-colors"
                            >
                                <CheckCircle2 size={12} />
                                {acting === 'complete' ? 'Completing…' : 'Complete'}
                            </button>
                        )}
                        {isPending && !isMandatory && onReject && (
                            <button
                                onClick={() => handle('reject', onReject)}
                                disabled={acting === 'reject'}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-800 border border-neutral-700 px-2.5 py-1 text-xs font-medium text-neutral-400 hover:bg-neutral-700 disabled:opacity-50 transition-colors"
                            >
                                <XCircle size={12} />
                                {acting === 'reject' ? 'Rejecting…' : 'Reject'}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
