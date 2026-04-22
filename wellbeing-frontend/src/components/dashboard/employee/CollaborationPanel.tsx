import React from 'react'
import { Users, Bell, CheckCircle2, Clock, Award } from 'lucide-react'
import type { EmployeeDashboardData } from '@/services/dashboardService'
import type { TaskItem } from '@/types'

// ============================================================
// HELPERS
// ============================================================

function getRankBadgeColor(rank: number): string {
    if (rank === 1) return 'from-amber-400 to-yellow-500'
    if (rank === 2) return 'from-neutral-300 to-neutral-400'
    if (rank === 3) return 'from-amber-600 to-amber-700'
    return 'from-cyan-600 to-blue-600'
}

// ============================================================
// PROPS
// ============================================================

interface CollaborationPanelProps {
    dashboardData: EmployeeDashboardData
    tasks: TaskItem[]
}

// ============================================================
// COMPONENT
// ============================================================

export function CollaborationPanel({ dashboardData, tasks }: CollaborationPanelProps) {
    const { taskStats, performance, leaderboard } = dashboardData

    // Notifications: pending tasks
    const pendingCount = taskStats.pending
    // Review: tasks awaiting manager approval
    const reviewTasks = tasks.filter(t => (t as any).taskState === 'REVIEW_PENDING')

    return (
        <div id="insights" className="rounded-2xl border border-neutral-800 bg-neutral-900/50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-2.5 px-5 py-4 border-b border-neutral-800">
                <Users size={15} className="text-cyan-400" />
                <h2 className="text-sm font-semibold text-neutral-100">Collaboration & Signals</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-neutral-800">
                {/* Column 1: Notifications */}
                <div className="p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Bell size={13} className="text-amber-400" />
                        <p className="text-xs font-semibold text-neutral-300">Notifications</p>
                    </div>
                    {pendingCount > 0 ? (
                        <div className="space-y-2">
                            <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-cyan-500/8 border border-cyan-500/15">
                                <Bell size={12} className="text-cyan-400 mt-0.5 shrink-0" />
                                <p className="text-xs text-neutral-300">
                                    <span className="font-semibold text-cyan-400">{pendingCount}</span> task{pendingCount !== 1 ? 's' : ''} awaiting your acceptance
                                </p>
                            </div>
                            {taskStats.rejected > 0 && (
                                <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-neutral-800/50 border border-neutral-700">
                                    <Clock size={12} className="text-neutral-400 mt-0.5 shrink-0" />
                                    <p className="text-xs text-neutral-400">
                                        {taskStats.rejected} rejected task{taskStats.rejected !== 1 ? 's' : ''} on record
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-4">
                            <CheckCircle2 size={20} className="text-emerald-500 mx-auto mb-1" />
                            <p className="text-xs text-neutral-500">All caught up</p>
                        </div>
                    )}
                </div>

                {/* Column 2: Mentions & Approvals */}
                <div className="p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <CheckCircle2 size={13} className="text-violet-400" />
                        <p className="text-xs font-semibold text-neutral-300">Awaiting Approval</p>
                    </div>
                    {reviewTasks.length > 0 ? (
                        <ul className="space-y-2">
                            {reviewTasks.slice(0, 3).map(task => (
                                <li key={task._id} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-violet-500/8 border border-violet-500/15">
                                    <div className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 shrink-0" />
                                    <div>
                                        <p className="text-xs text-neutral-300 line-clamp-1">{task.title}</p>
                                        <p className="text-[10px] text-neutral-600 mt-0.5">Waiting manager review</p>
                                    </div>
                                </li>
                            ))}
                            {reviewTasks.length > 3 && (
                                <p className="text-[11px] text-neutral-600">+{reviewTasks.length - 3} more</p>
                            )}
                        </ul>
                    ) : (
                        <div className="text-center py-4">
                            <p className="text-xs text-neutral-500">No pending approvals</p>
                        </div>
                    )}
                </div>

                {/* Column 3: Full Leaderboard */}
                <div className="p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Award size={13} className="text-amber-400" />
                        <p className="text-xs font-semibold text-neutral-300">Team Leaderboard</p>
                        {performance.rank > 0 && (
                            <span className="ml-auto text-[10px] text-cyan-400 font-medium">
                                You: #{performance.rank}
                            </span>
                        )}
                    </div>
                    {leaderboard.length === 0 ? (
                        <p className="text-xs text-neutral-500">No leaderboard data yet</p>
                    ) : (
                        <ul className="space-y-1.5">
                            {leaderboard.slice(0, 8).map((entry) => {
                                const isCurrentUser = entry.rank === performance.rank
                                return (
                                    <li
                                        key={entry.rank}
                                        className={[
                                            'flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors',
                                            isCurrentUser
                                                ? 'bg-cyan-500/10 border border-cyan-500/20'
                                                : 'hover:bg-neutral-800/50',
                                        ].join(' ')}
                                    >
                                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 bg-gradient-to-br ${getRankBadgeColor(entry.rank)}`}>
                                            {entry.rank}
                                        </span>
                                        <span className={`flex-1 text-xs truncate ${isCurrentUser ? 'text-cyan-300 font-semibold' : 'text-neutral-300'}`}>
                                            {entry.name}
                                            {isCurrentUser && ' (You)'}
                                        </span>
                                        <span className={`text-xs font-semibold shrink-0 ${isCurrentUser ? 'text-cyan-400' : 'text-neutral-400'}`}>
                                            {entry.points}
                                        </span>
                                    </li>
                                )
                            })}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    )
}
