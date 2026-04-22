import React from 'react'
import { Focus, Zap, Clock, AlertTriangle, PlayCircle, Target } from 'lucide-react'
import type { TaskItem } from '@/types'

// ============================================================
// HELPERS
// ============================================================

function getDaysLeft(dueDate?: string): number | null {
    if (!dueDate) return null
    return (new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
}

function getContextSwitchCost(effort: number): { label: string; color: string } {
    if (effort >= 8) return { label: 'High context-switch cost', color: 'text-rose-400' }
    if (effort >= 4) return { label: 'Medium context-switch cost', color: 'text-amber-400' }
    return { label: 'Low context-switch cost', color: 'text-emerald-400' }
}

function getSkipImpact(task: TaskItem): { message: string; color: string } {
    if ((task as any).isMandatory) {
        return { message: 'Mandatory task — cannot be skipped', color: 'text-rose-400' }
    }
    if (task.riskLevel === 'high') {
        return { message: 'High risk of SLA breach if skipped today', color: 'text-rose-400' }
    }
    const days = getDaysLeft(task.dueDate)
    if (days !== null && days < 1) {
        return { message: 'Will become overdue today if skipped', color: 'text-amber-400' }
    }
    if (days !== null && days < 3) {
        return { message: 'Will create deadline pressure by tomorrow', color: 'text-amber-400' }
    }
    return { message: 'Low immediate impact — can defer 1–2 days', color: 'text-emerald-400' }
}

function getDeadlinePressureLabel(days: number | null): { label: string; color: string } {
    if (days === null) return { label: 'No deadline set', color: 'text-neutral-500' }
    if (days < 0) return { label: `Overdue by ${Math.abs(Math.round(days))}d`, color: 'text-rose-400' }
    if (days < 1) return { label: 'Due today — critical', color: 'text-rose-400' }
    if (days < 2) return { label: 'Due tomorrow — high pressure', color: 'text-amber-400' }
    if (days < 5) return { label: `${Math.round(days)} days left — moderate`, color: 'text-amber-400' }
    return { label: `${Math.round(days)} days left — comfortable`, color: 'text-emerald-400' }
}

// ============================================================
// PROPS
// ============================================================

interface FocusPanelProps {
    bestNextTask: TaskItem | null
    onAccept: (id: string) => Promise<void>
}

// ============================================================
// COMPONENT
// ============================================================

export function FocusPanel({ bestNextTask, onAccept }: FocusPanelProps) {
    if (!bestNextTask) {
        return (
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5">
                <div className="flex items-center gap-2 mb-4">
                    <Focus size={15} className="text-cyan-400" />
                    <h2 className="text-sm font-semibold text-neutral-100">Smart Focus</h2>
                </div>
                <div className="py-8 text-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl">🎉</span>
                    </div>
                    <p className="text-sm text-neutral-400">No pending tasks</p>
                    <p className="text-xs text-neutral-600 mt-1">You're all caught up!</p>
                </div>
            </div>
        )
    }

    const daysLeft = getDaysLeft(bestNextTask.dueDate)
    const deadline = getDeadlinePressureLabel(daysLeft)
    const ctxSwitch = getContextSwitchCost(bestNextTask.effort)
    const skipImpact = getSkipImpact(bestNextTask)
    const aiSummary = (bestNextTask as any).aiSuggestions?.summary

    const assignedByName =
        typeof bestNextTask.assignedBy === 'object' && bestNextTask.assignedBy !== null
            ? (bestNextTask.assignedBy as any).fullName
            : 'Manager'

    return (
        <div className="rounded-2xl border border-cyan-500/15 bg-gradient-to-b from-cyan-950/20 to-neutral-900 overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-2 px-5 py-4 border-b border-cyan-500/10">
                <Focus size={15} className="text-cyan-400" />
                <h2 className="text-sm font-semibold text-neutral-100">Smart Focus Panel</h2>
            </div>

            <div className="p-5 space-y-4">
                {/* Task title */}
                <div>
                    <p className="text-[11px] uppercase tracking-widest text-neutral-500 mb-1">Best Next Task</p>
                    <p className="text-base font-semibold text-neutral-100 leading-snug">{bestNextTask.title}</p>
                    <p className="text-xs text-neutral-500 mt-1">Assigned by {assignedByName}</p>
                </div>

                {/* AI Summary if available */}
                {aiSummary && (
                    <div className="bg-cyan-500/8 border border-cyan-500/15 rounded-lg p-3">
                        <p className="text-[11px] text-cyan-400 font-medium uppercase tracking-wide mb-1">AI Insight</p>
                        <p className="text-xs text-neutral-300">{aiSummary}</p>
                    </div>
                )}

                {/* Analysis grid */}
                <div className="space-y-2.5">
                    {/* Deadline pressure */}
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-neutral-800/50 border border-neutral-700/50">
                        <Clock size={13} className="text-neutral-500 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-[11px] text-neutral-500">Deadline Pressure</p>
                            <p className={`text-xs font-medium mt-0.5 ${deadline.color}`}>{deadline.label}</p>
                        </div>
                    </div>

                    {/* Context switch cost */}
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-neutral-800/50 border border-neutral-700/50">
                        <Zap size={13} className="text-neutral-500 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-[11px] text-neutral-500">Context-Switch Cost</p>
                            <p className={`text-xs font-medium mt-0.5 ${ctxSwitch.color}`}>
                                {ctxSwitch.label} ({bestNextTask.effort} pts effort)
                            </p>
                        </div>
                    </div>

                    {/* Skill match */}
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-neutral-800/50 border border-neutral-700/50">
                        <Target size={13} className="text-neutral-500 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-[11px] text-neutral-500">Skill Match</p>
                            <p className="text-xs font-medium text-emerald-400 mt-0.5">
                                {(bestNextTask as any).aiSuggestions?.recommendations?.[0] || 'Matched to your profile'}
                            </p>
                        </div>
                    </div>

                    {/* If skipped impact */}
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-neutral-800/50 border border-neutral-700/50">
                        <AlertTriangle size={13} className="text-neutral-500 mt-0.5 shrink-0" />
                        <div>
                            <p className="text-[11px] text-neutral-500">If Skipped</p>
                            <p className={`text-xs font-medium mt-0.5 ${skipImpact.color}`}>{skipImpact.message}</p>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <button
                    onClick={() => onAccept(bestNextTask._id)}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-neutral-950 font-semibold text-sm py-3 transition-colors"
                >
                    <PlayCircle size={16} />
                    Start This Task
                </button>
            </div>
        </div>
    )
}
