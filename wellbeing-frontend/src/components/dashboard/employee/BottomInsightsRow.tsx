import React from 'react'
import { CheckCircle2, Zap, Award, ListTodo } from 'lucide-react'
import type { EmployeeDashboardData } from '@/services/dashboardService'
import type { TaskItem } from '@/types'

interface BottomInsightsRowProps {
    dashboardData: EmployeeDashboardData
    tasks: TaskItem[]
}

export function BottomInsightsRow({ dashboardData, tasks }: BottomInsightsRowProps) {
    const { performance, taskStats } = dashboardData

    // Completed today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const completedToday = tasks.filter(t => {
        if (t.status !== 'completed' || !t.completedAt) return false
        return new Date(t.completedAt).getTime() >= today.getTime()
    }).length

    // Completed this week
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    weekStart.setHours(0, 0, 0, 0)
    const completedThisWeek = tasks.filter(t => {
        if (t.status !== 'completed' || !t.completedAt) return false
        return new Date(t.completedAt).getTime() >= weekStart.getTime()
    }).length

    const stats = [
        {
            icon: CheckCircle2,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20',
            value: completedToday,
            label: 'Completed Today',
        },
        {
            icon: CheckCircle2,
            color: 'text-cyan-400',
            bg: 'bg-cyan-500/10',
            border: 'border-cyan-500/20',
            value: completedThisWeek,
            label: 'Done This Week',
        },
        {
            icon: Zap,
            color: 'text-amber-400',
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/20',
            value: performance.points,
            label: 'Total Points',
        },
        {
            icon: Award,
            color: 'text-violet-400',
            bg: 'bg-violet-500/10',
            border: 'border-violet-500/20',
            value: performance.rank ? `#${performance.rank}` : '–',
            label: 'Team Rank',
        },
        {
            icon: ListTodo,
            color: 'text-blue-400',
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/20',
            value: taskStats.pending + taskStats.accepted,
            label: 'Active Tasks',
        },
    ]

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {stats.map((s, i) => {
                const Icon = s.icon
                return (
                    <div
                        key={i}
                        className={`rounded-xl border ${s.border} ${s.bg} p-3 flex items-center gap-3`}
                    >
                        <div className={`w-8 h-8 rounded-lg ${s.bg} border ${s.border} flex items-center justify-center shrink-0`}>
                            <Icon size={14} className={s.color} />
                        </div>
                        <div>
                            <p className={`text-base font-bold ${s.color}`}>{s.value}</p>
                            <p className="text-[11px] text-neutral-500 leading-tight">{s.label}</p>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
