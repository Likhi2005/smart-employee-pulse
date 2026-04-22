import React from 'react'
import { Sparkles, AlertTriangle, Gauge, PlayCircle, ArrowRight } from 'lucide-react'
import type { TaskItem } from '@/types'
import type { EmployeeDashboardData } from '@/services/dashboardService'

// ============================================================
// HELPERS
// ============================================================

function getDaysUntilDue(dueDate?: string): number | null {
    if (!dueDate) return null
    return (new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
}

function buildWhyReason(task: TaskItem): string {
    const aiSummary = (task as any).aiSuggestions?.summary
    if (aiSummary) return aiSummary

    const reasons: string[] = []
    if (task.priority === 'high') reasons.push('High priority task')
    const days = getDaysUntilDue(task.dueDate)
    if (days !== null) {
        if (days < 0) reasons.push('Already overdue')
        else if (days < 1) reasons.push('Due today')
        else if (days < 3) reasons.push(`Due in ${Math.round(days)} days`)
    }
    if (task.riskLevel === 'high') reasons.push('High risk of delay')
    if ((task as any).isMandatory) reasons.push('Mandatory task')
    return reasons.length > 0 ? reasons.join(' · ') : 'Highest urgency in your queue'
}

function getWorkloadLabel(workload: number, status: string): { label: string; color: string; barColor: string; pct: number } {
    if (status === 'overloaded' || workload > 30) {
        return { label: 'Overloaded', color: 'text-rose-400', barColor: 'bg-rose-500', pct: Math.min(100, (workload / 50) * 100) }
    }
    if (workload > 15) {
        return { label: 'Moderate', color: 'text-amber-400', barColor: 'bg-amber-500', pct: Math.min(100, (workload / 50) * 100) }
    }
    return { label: 'Light', color: 'text-emerald-400', barColor: 'bg-emerald-500', pct: Math.min(100, (workload / 50) * 100) }
}

// ============================================================
// PROPS
// ============================================================

interface HeroDecisionBandProps {
    bestNextTask: TaskItem | null
    atRiskTasks: TaskItem[]
    dashboardData: EmployeeDashboardData
    onAccept: (id: string) => Promise<void>
    onScrollTo: (id: string) => void
}

// ============================================================
// COMPONENT
// ============================================================

export function HeroDecisionBand({
    bestNextTask,
    atRiskTasks,
    dashboardData,
    onAccept,
    onScrollTo,
}: HeroDecisionBandProps) {
    const { profile, taskStats } = dashboardData
    const wl = getWorkloadLabel(profile.currentWorkload, profile.workloadStatus)
    const activeTasks = taskStats.pending + taskStats.accepted
    const daysLeft = getDaysUntilDue(bestNextTask?.dueDate)

    return (
        <div id="dashboard-top" className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* ── (A) Next Best Task ──────────────────────────── */}
            <div className="relative rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-950/40 via-neutral-900 to-neutral-900 p-5 overflow-hidden">
                {/* BG glow */}
                <div className="pointer-events-none absolute -top-10 -left-10 w-36 h-36 rounded-full bg-cyan-500/10 blur-2xl" />

                <div className="relative">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/30">
                            <Sparkles size={14} className="text-cyan-400" />
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-widest text-cyan-500">
                            Next Best Task
                        </span>
                    </div>

                    {bestNextTask ? (
                        <>
                            <p className="text-base font-semibold text-neutral-100 line-clamp-2 leading-snug">
                                {bestNextTask.title}
                            </p>
                            <p className="mt-2 text-xs text-neutral-400 line-clamp-2">
                                <span className="text-cyan-400 font-medium">Why: </span>
                                {buildWhyReason(bestNextTask)}
                            </p>
                            {daysLeft !== null && (
                                <p className={[
                                    'mt-1 text-xs font-medium',
                                    daysLeft < 0 ? 'text-rose-400' : daysLeft < 2 ? 'text-amber-400' : 'text-neutral-500',
                                ].join(' ')}>
                                    {daysLeft < 0
                                        ? `Overdue by ${Math.abs(Math.round(daysLeft))}d`
                                        : daysLeft < 1 ? 'Due today' : `${Math.round(daysLeft)}d left`}
                                </p>
                            )}
                            <button
                                onClick={() => onAccept(bestNextTask._id)}
                                className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-neutral-950 text-sm font-semibold py-2.5 transition-colors"
                            >
                                <PlayCircle size={15} />
                                Accept Task
                            </button>
                        </>
                    ) : (
                        <div className="py-4 text-center">
                            <p className="text-sm text-neutral-400">No pending tasks</p>
                            <p className="text-xs text-neutral-600 mt-1">You're all caught up 🎉</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ── (B) At Risk Tasks ───────────────────────────── */}
            <div className={[
                'relative rounded-2xl border p-5 overflow-hidden',
                atRiskTasks.length > 0
                    ? 'border-amber-500/20 bg-gradient-to-br from-amber-950/30 via-neutral-900 to-neutral-900'
                    : 'border-neutral-800 bg-neutral-900',
            ].join(' ')}>
                {atRiskTasks.length > 0 && (
                    <div className="pointer-events-none absolute -top-10 -right-10 w-36 h-36 rounded-full bg-amber-500/8 blur-2xl" />
                )}

                <div className="relative">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className={[
                                'flex items-center justify-center w-7 h-7 rounded-lg border',
                                atRiskTasks.length > 0
                                    ? 'bg-amber-500/20 border-amber-500/30'
                                    : 'bg-neutral-800 border-neutral-700',
                            ].join(' ')}>
                                <AlertTriangle size={14} className={atRiskTasks.length > 0 ? 'text-amber-400' : 'text-neutral-500'} />
                            </div>
                            <span className={[
                                'text-xs font-semibold uppercase tracking-widest',
                                atRiskTasks.length > 0 ? 'text-amber-500' : 'text-neutral-500',
                            ].join(' ')}>
                                At-Risk Tasks
                            </span>
                        </div>
                        {atRiskTasks.length > 0 && (
                            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-amber-500 text-xs font-bold text-neutral-950">
                                {atRiskTasks.length}
                            </span>
                        )}
                    </div>

                    {atRiskTasks.length > 0 ? (
                        <>
                            <ul className="space-y-2 mt-1">
                                {atRiskTasks.slice(0, 2).map(t => (
                                    <li key={t._id} className="flex items-start gap-2">
                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                                        <span className="text-xs text-neutral-300 line-clamp-1">{t.title}</span>
                                    </li>
                                ))}
                                {atRiskTasks.length > 2 && (
                                    <li className="text-xs text-neutral-500">
                                        +{atRiskTasks.length - 2} more…
                                    </li>
                                )}
                            </ul>
                            <button
                                onClick={() => onScrollTo('#blockers')}
                                className="mt-4 w-full flex items-center justify-center gap-1.5 rounded-lg border border-amber-500/30 text-amber-400 text-xs font-medium py-2 hover:bg-amber-500/10 transition-colors"
                            >
                                View all blockers <ArrowRight size={12} />
                            </button>
                        </>
                    ) : (
                        <div className="py-4 text-center">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center mx-auto mb-2">
                                <span className="text-lg">✓</span>
                            </div>
                            <p className="text-sm text-neutral-400">No at-risk tasks</p>
                            <p className="text-xs text-neutral-600 mt-0.5">All tasks on track</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ── (C) Capacity Status ─────────────────────────── */}
            <div className="relative rounded-2xl border border-neutral-800 bg-neutral-900 p-5 overflow-hidden">
                <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-neutral-800 border border-neutral-700">
                        <Gauge size={14} className="text-neutral-400" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
                        Capacity
                    </span>
                </div>

                {/* Big status */}
                <div className="flex items-end gap-3 mb-4">
                    <span className={`text-3xl font-bold ${wl.color}`}>
                        {profile.currentWorkload}
                    </span>
                    <div className="pb-1">
                        <p className={`text-sm font-semibold ${wl.color}`}>{wl.label}</p>
                        <p className="text-xs text-neutral-500">workload points</p>
                    </div>
                </div>

                {/* Bar */}
                <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${wl.barColor}`}
                        style={{ width: `${wl.pct}%` }}
                    />
                </div>

                {/* Meta */}
                <div className="mt-3 flex items-center justify-between text-xs text-neutral-500">
                    <span>{activeTasks} active tasks</span>
                    <span className={wl.color}>{Math.round(wl.pct)}% capacity used</span>
                </div>
            </div>
        </div>
    )
}
