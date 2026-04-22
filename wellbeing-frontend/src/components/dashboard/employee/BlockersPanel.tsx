import React, { useState } from 'react'
import { ShieldAlert, AlertTriangle, Send, UserMinus, HelpCircle, XCircle, Link } from 'lucide-react'
import type { TaskItem } from '@/types'

// ============================================================
// HELPERS
// ============================================================

function getBlockerReason(task: TaskItem): string {
    const days = task.dueDate
        ? (new Date(task.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        : null

    if (days !== null && days < 0) return 'Task is overdue'
    if (task.riskLevel === 'high') return 'High risk — delay likely'
    if (days !== null && days < 1) return 'Due today — critical path'
    if ((task as any).isMandatory) return 'Mandatory — blocking downstream'
    return 'Elevated risk'
}

function isBlocking(task: TaskItem): boolean {
    return (task as any).isMandatory === true
}

// ============================================================
// PROPS
// ============================================================

interface BlockersPanelProps {
    blockedTasks: TaskItem[]
    onReject: (id: string) => Promise<void>
}

// ============================================================
// COMPONENT
// ============================================================

export function BlockersPanel({ blockedTasks, onReject }: BlockersPanelProps) {
    const [toast, setToast] = useState<string | null>(null)

    function showToast(msg: string) {
        setToast(msg)
        setTimeout(() => setToast(null), 2500)
    }

    return (
        <div id="blockers" className="rounded-2xl border border-neutral-800 bg-neutral-900/50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800">
                <div className="flex items-center gap-2.5">
                    <ShieldAlert size={15} className={blockedTasks.length > 0 ? 'text-rose-400' : 'text-neutral-500'} />
                    <h2 className="text-sm font-semibold text-neutral-100">Blockers & Dependencies</h2>
                    {blockedTasks.length > 0 && (
                        <span className="flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-[11px] font-bold text-rose-400">
                            {blockedTasks.length}
                        </span>
                    )}
                </div>
            </div>

            {/* Toast */}
            {toast && (
                <div className="mx-4 mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-800 border border-neutral-700 text-xs text-neutral-300">
                    <HelpCircle size={11} className="text-cyan-400 shrink-0" />
                    {toast}
                </div>
            )}

            {/* Empty state */}
            {blockedTasks.length === 0 && (
                <div className="py-12 text-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                        <span className="text-xl">🛡️</span>
                    </div>
                    <p className="text-sm text-neutral-400">No blockers detected</p>
                    <p className="text-xs text-neutral-600 mt-1">All tasks on track</p>
                </div>
            )}

            {/* Blocker list */}
            <div className="divide-y divide-neutral-800/50">
                {blockedTasks.map(task => {
                    const reason = getBlockerReason(task)
                    const blocking = isBlocking(task)
                    const isPending = task.status === 'pending'
                    const isMandatory = (task as any).isMandatory
                    const assignedByName =
                        typeof task.assignedBy === 'object' && task.assignedBy !== null
                            ? (task.assignedBy as any).fullName
                            : 'Manager'

                    return (
                        <div key={task._id} className="px-5 py-4">
                            {/* Left accent */}
                            <div className="flex gap-3">
                                <div className="w-0.5 rounded-full bg-rose-500/60 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    {/* Title row */}
                                    <div className="flex items-start gap-2 flex-wrap">
                                        <p className="text-sm font-medium text-neutral-100 flex-1 min-w-0 truncate">
                                            {task.title}
                                        </p>
                                        {blocking && (
                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/20 text-[10px] text-rose-400">
                                                <Link size={8} />
                                                Blocking others
                                            </span>
                                        )}
                                    </div>

                                    {/* Reason */}
                                    <div className="mt-1.5 flex items-center gap-1.5">
                                        <AlertTriangle size={11} className="text-amber-400 shrink-0" />
                                        <p className="text-xs text-amber-400">{reason}</p>
                                    </div>

                                    {/* Meta */}
                                    <p className="mt-1 text-[11px] text-neutral-600">
                                        Assigned by {assignedByName} · {task.effort} pts effort
                                    </p>

                                    {/* Actions */}
                                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                                        <button
                                            onClick={() => showToast(`Ping sent to ${assignedByName}`)}
                                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-400 hover:bg-blue-500/20 transition-colors"
                                        >
                                            <Send size={10} />
                                            Ping Owner
                                        </button>
                                        <button
                                            onClick={() => showToast('Reassignment request sent to manager')}
                                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-neutral-800 border border-neutral-700 text-[11px] text-neutral-400 hover:bg-neutral-700 transition-colors"
                                        >
                                            <UserMinus size={10} />
                                            Reassign
                                        </button>
                                        <button
                                            onClick={() => showToast('Help request submitted')}
                                            className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-violet-500/10 border border-violet-500/20 text-[11px] text-violet-400 hover:bg-violet-500/15 transition-colors"
                                        >
                                            <HelpCircle size={10} />
                                            Request Help
                                        </button>
                                        {isPending && !isMandatory && (
                                            <button
                                                onClick={() => onReject(task._id)}
                                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-rose-500/10 border border-rose-500/20 text-[11px] text-rose-400 hover:bg-rose-500/15 transition-colors"
                                            >
                                                <XCircle size={10} />
                                                Reject
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
