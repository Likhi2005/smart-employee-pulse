import React from 'react'
import { TrendingUp, Star, Award, Zap, CheckCircle2, Target } from 'lucide-react'
import type { EmployeeDashboardData } from '@/services/dashboardService'

// ============================================================
// HELPERS
// ============================================================

function getTrend(completed: number, total: number): { label: string; color: string; icon: string } {
    if (total === 0) return { label: 'No data yet', color: 'text-neutral-500', icon: '·' }
    const ratio = completed / total
    if (ratio >= 0.7) return { label: 'Strong performance', color: 'text-emerald-400', icon: '↑' }
    if (ratio >= 0.4) return { label: 'Improving', color: 'text-amber-400', icon: '→' }
    return { label: 'Needs attention', color: 'text-rose-400', icon: '↓' }
}

function getRankBadgeColor(rank: number): string {
    if (rank === 1) return 'from-amber-400 to-yellow-500'
    if (rank === 2) return 'from-neutral-300 to-neutral-400'
    if (rank === 3) return 'from-amber-600 to-amber-700'
    return 'from-cyan-500 to-blue-500'
}

// ============================================================
// PROPS
// ============================================================

interface PerformancePanelProps {
    dashboardData: EmployeeDashboardData
}

// ============================================================
// COMPONENT
// ============================================================

export function PerformancePanel({ dashboardData }: PerformancePanelProps) {
    const { performance, taskStats, leaderboard } = dashboardData
    const trend = getTrend(taskStats.completed, taskStats.total)
    const completionRate = taskStats.total > 0
        ? Math.round((taskStats.completed / taskStats.total) * 100)
        : 0
    const avgPtsPerTask = performance.tasksCompleted > 0
        ? Math.round(performance.points / performance.tasksCompleted)
        : 0

    return (
        <div id="performance" className="rounded-2xl border border-neutral-800 bg-neutral-900/50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-2.5 px-5 py-4 border-b border-neutral-800">
                <TrendingUp size={15} className="text-cyan-400" />
                <h2 className="text-sm font-semibold text-neutral-100">Performance & Growth</h2>
            </div>

            <div className="p-5">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Tasks Completed */}
                    <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 text-center">
                        <div className="w-9 h-9 rounded-full bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center mx-auto mb-2">
                            <CheckCircle2 size={16} className="text-emerald-400" />
                        </div>
                        <p className="text-2xl font-bold text-neutral-100">{performance.tasksCompleted}</p>
                        <p className="text-xs text-neutral-500 mt-0.5">Tasks Completed</p>
                    </div>

                    {/* Points */}
                    <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 text-center">
                        <div className="w-9 h-9 rounded-full bg-cyan-500/15 border border-cyan-500/20 flex items-center justify-center mx-auto mb-2">
                            <Zap size={16} className="text-cyan-400" />
                        </div>
                        <p className="text-2xl font-bold text-neutral-100">{performance.points}</p>
                        <p className="text-xs text-neutral-500 mt-0.5">Total Points</p>
                        {performance.gamePoints > 0 && (
                            <p className="text-[10px] text-neutral-600 mt-0.5">+{performance.gamePoints} bonus</p>
                        )}
                    </div>

                    {/* Rank */}
                    <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 text-center">
                        <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${getRankBadgeColor(performance.rank)} flex items-center justify-center mx-auto mb-2`}>
                            <Award size={16} className="text-white" />
                        </div>
                        <p className="text-2xl font-bold text-neutral-100">
                            #{performance.rank || '–'}
                        </p>
                        <p className="text-xs text-neutral-500 mt-0.5">Team Rank</p>
                    </div>

                    {/* Avg pts/task */}
                    <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 text-center">
                        <div className="w-9 h-9 rounded-full bg-violet-500/15 border border-violet-500/20 flex items-center justify-center mx-auto mb-2">
                            <Star size={16} className="text-violet-400" />
                        </div>
                        <p className="text-2xl font-bold text-neutral-100">{avgPtsPerTask}</p>
                        <p className="text-xs text-neutral-500 mt-0.5">Avg pts/task</p>
                    </div>
                </div>

                {/* Completion trend + rate */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Trend */}
                    <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Target size={13} className="text-neutral-500" />
                            <p className="text-xs font-medium text-neutral-400">Completion Trend</p>
                        </div>
                        <p className={`text-sm font-bold ${trend.color}`}>
                            {trend.icon} {trend.label}
                        </p>
                        <div className="mt-2 flex items-center gap-2 text-xs text-neutral-500">
                            <span className="text-neutral-300 font-medium">{taskStats.completed}</span> completed
                            <span className="text-neutral-600">of</span>
                            <span className="text-neutral-300 font-medium">{taskStats.total}</span> total
                        </div>
                        {/* Progress bar */}
                        <div className="mt-3 w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-700 ${
                                    completionRate >= 70 ? 'bg-emerald-500' : completionRate >= 40 ? 'bg-amber-500' : 'bg-rose-500'
                                }`}
                                style={{ width: `${completionRate}%` }}
                            />
                        </div>
                        <p className="mt-1 text-right text-[11px] text-neutral-500">{completionRate}% rate</p>
                    </div>

                    {/* Leaderboard preview */}
                    <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
                        <p className="text-xs font-medium text-neutral-400 mb-3 flex items-center gap-1.5">
                            <Award size={12} className="text-amber-400" /> Top Performers
                        </p>
                        {leaderboard.slice(0, 3).length === 0 ? (
                            <p className="text-xs text-neutral-600">No leaderboard data</p>
                        ) : (
                            <ul className="space-y-2">
                                {leaderboard.slice(0, 3).map((entry, i) => (
                                    <li key={i} className="flex items-center gap-2">
                                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white bg-gradient-to-br ${getRankBadgeColor(entry.rank)}`}>
                                            {entry.rank}
                                        </span>
                                        <span className="flex-1 text-xs text-neutral-300 truncate">{entry.name}</span>
                                        <span className="text-xs font-semibold text-cyan-400">{entry.points} pts</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
