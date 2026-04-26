import React, { useState } from 'react'
import { Inbox, ChevronDown, ChevronUp, HelpCircle, AlertOctagon, Clock, Zap, ExternalLink } from 'lucide-react'
import type { TaskItem } from '@/types'
import { TaskCard } from './TaskCard'

// ============================================================
// HELPERS
// ============================================================

const PRIORITY_WEIGHT: Record<string, number> = { high: 3, medium: 2, low: 1 }

function getDueDateScore(dueDate?: string): number {
    if (!dueDate) return 0
    const diff = (new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60)
    if (diff < 0) return 3
    if (diff < 24) return 2
    if (diff < 72) return 1
    return 0
}

function getRiskScore(riskLevel?: string): number {
    if (riskLevel === 'high') return 2
    if (riskLevel === 'medium') return 1
    return 0
}

function computeScore(task: TaskItem): number {
    return (PRIORITY_WEIGHT[task.priority] || 1) + getDueDateScore(task.dueDate) + getRiskScore(task.riskLevel)
}

function getAttentionReason(task: TaskItem): string {
    if (task.dueDate) {
        const diffHours = (new Date(task.dueDate).getTime() - Date.now()) / (1000 * 60 * 60)
        if (diffHours < 0) return 'Overdue'
        if (diffHours < 48) {
            if (diffHours < 24) return `Due in ${Math.ceil(diffHours)} hours`
            return `Due in ${Math.ceil(diffHours / 24)} days`
        }
    }
    if (task.riskLevel === 'high') return 'Blocked by dependency'
    if (task.priority === 'high' && task.status === 'pending') return 'High priority task pending'
    return 'Needs review'
}

// ============================================================
// PROPS
// ============================================================

interface PriorityInboxProps {
    tasks: TaskItem[]
    searchQuery: string
    onAccept: (id: string) => Promise<void>
    onReject: (id: string) => Promise<void>
    onComplete: (id: string) => Promise<void>
    onOpenDetails?: (task: TaskItem) => void
}

// ============================================================
// COMPONENT
// ============================================================

export function PriorityInbox({ tasks, searchQuery, onAccept, onReject, onComplete, onOpenDetails }: PriorityInboxProps) {
    const [expanded, setExpanded] = useState(false)
    const [toastMsg, setToastMsg] = useState<string | null>(null)

    const activeTasks = tasks.filter(t => t.status !== 'rejected' && t.status !== 'completed')

    const filtered = activeTasks.filter(t =>
        !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const sorted = [...filtered].sort((a, b) => computeScore(b) - computeScore(a))
    const visible = expanded ? sorted : sorted.slice(0, 5)

    function showToast(msg: string) {
        setToastMsg(msg)
        setTimeout(() => setToastMsg(null), 2500)
    }

    return (
        <div id="priority-inbox" className="rounded-2xl border border-neutral-800 bg-neutral-900/50">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800">
                <div className="flex items-center gap-2.5">
                    <Inbox size={16} className="text-cyan-400" />
                    <h2 className="text-sm font-semibold text-neutral-100">Priority Inbox</h2>
                    <span className="flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-[11px] font-bold text-cyan-400">
                        {sorted.length}
                    </span>
                </div>
                <p className="text-xs text-neutral-500">Ranked by urgency score</p>
            </div>

            {/* Toast */}
            {toastMsg && (
                <div className="mx-5 mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-xs text-neutral-300">
                    <HelpCircle size={12} className="text-cyan-400" />
                    {toastMsg}
                </div>
            )}

            {/* Task rows */}
            <div className="divide-y divide-neutral-800/50">
                {visible.length === 0 && (
                    <div className="py-12 text-center">
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-2">
                            <span className="text-lg">✓</span>
                        </div>
                        <p className="text-sm text-neutral-400">No tasks in inbox</p>
                    </div>
                )}

                {visible.map((task) => {
                    const attentionReason = getAttentionReason(task)
                    const isPending = task.status === 'pending'
                    const isInProgress = task.status === 'in-progress'
                    const isMandatory = (task as any).isMandatory

                    return (
                        <div key={task._id} className="flex items-start gap-4 px-5 py-4 hover:bg-neutral-800/30 transition-colors">
                            {/* Urgency score dot */}
                            <div className="mt-1 flex items-center justify-center w-6 h-6 rounded-full bg-neutral-800 border border-neutral-700 text-[10px] font-bold text-neutral-400 shrink-0">
                                {computeScore(task)}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <p className="text-sm font-medium text-neutral-100 truncate">{task.title}</p>
                                    {task.priority && (
                                        <span className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${
                                            task.priority === 'high' ? 'bg-rose-500/15 text-rose-400 border-rose-500/30' :
                                            task.priority === 'medium' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30' :
                                            'bg-blue-500/15 text-blue-400 border-blue-500/30'
                                        }`}>
                                            {task.priority}
                                        </span>
                                    )}
                                </div>
                                <div className="mb-2 inline-flex items-center rounded-md bg-neutral-800/80 border border-neutral-700 px-2 py-1">
                                    <AlertOctagon size={12} className="text-amber-400 mr-1.5" />
                                    <span className="text-xs font-medium text-amber-400">{attentionReason}</span>
                                </div>
                                <div className="flex items-center gap-3 text-[11px] text-neutral-500">
                                    {task.dueDate && (
                                        <span><Clock size={10} className="inline mr-0.5" />{new Date(task.dueDate).toLocaleDateString()}</span>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                                {onOpenDetails && (
                                    <button
                                        onClick={() => onOpenDetails(task)}
                                        className="p-1.5 rounded-md border border-neutral-700 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
                                        title="View Details"
                                    >
                                        <ExternalLink size={14} />
                                    </button>
                                )}
                                {isPending && (
                                    <button
                                        onClick={() => onAccept(task._id)}
                                        className="px-2.5 py-1 rounded-md bg-cyan-500/15 border border-cyan-500/30 text-[11px] font-medium text-cyan-400 hover:bg-cyan-500/25 transition-colors"
                                    >
                                        Accept
                                    </button>
                                )}
                                {isInProgress && (
                                    <button
                                        onClick={() => onComplete(task._id)}
                                        className="px-2.5 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-[11px] font-medium text-emerald-400 hover:bg-emerald-500/25 transition-colors"
                                    >
                                        Complete
                                    </button>
                                )}
                                {isPending && !isMandatory && (
                                    <button
                                        onClick={() => onReject(task._id)}
                                        className="px-2.5 py-1 rounded-md bg-neutral-800 border border-neutral-700 text-[11px] font-medium text-neutral-400 hover:bg-neutral-700 transition-colors"
                                    >
                                        Reject
                                    </button>
                                )}
                                <button
                                    onClick={() => showToast('Help request feature coming soon')}
                                    className="px-2.5 py-1 rounded-md bg-violet-500/10 border border-violet-500/20 text-[11px] font-medium text-violet-400 hover:bg-violet-500/15 transition-colors"
                                >
                                    Help
                                </button>
                                <button
                                    onClick={() => showToast('Escalation queued to manager')}
                                    className="p-1 rounded-md border border-neutral-700 text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800 transition-colors"
                                    title="Escalate"
                                >
                                    <AlertOctagon size={12} />
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Show more */}
            {sorted.length > 5 && (
                <div className="px-5 py-3 border-t border-neutral-800">
                    <button
                        onClick={() => setExpanded(e => !e)}
                        className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-300 transition-colors"
                    >
                        {expanded ? (
                            <><ChevronUp size={12} /> Show less</>
                        ) : (
                            <><ChevronDown size={12} /> Show {sorted.length - 5} more tasks</>
                        )}
                    </button>
                </div>
            )}
        </div>
    )
}
