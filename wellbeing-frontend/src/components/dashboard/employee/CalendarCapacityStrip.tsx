import React from 'react'
import { CalendarDays, AlertTriangle } from 'lucide-react'
import type { TaskItem } from '@/types'
import type { EmployeeDashboardData } from '@/services/dashboardService'

// ============================================================
// HELPERS
// ============================================================

function getNextNDays(n: number): Date[] {
    const days: Date[] = []
    for (let i = 0; i < n; i++) {
        const d = new Date()
        d.setDate(d.getDate() + i)
        d.setHours(0, 0, 0, 0)
        days.push(d)
    }
    return days
}

function sameDay(a: Date, b: Date): boolean {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    )
}

function getDayLabel(date: Date, index: number): string {
    if (index === 0) return 'Today'
    if (index === 1) return 'Tmrw'
    return date.toLocaleDateString('en-US', { weekday: 'short' })
}

function getBarColor(effort: number): string {
    if (effort > 10) return 'bg-rose-500'
    if (effort > 5) return 'bg-amber-500'
    return 'bg-emerald-500'
}

function getLabelColor(effort: number): string {
    if (effort > 10) return 'text-rose-400'
    if (effort > 5) return 'text-amber-400'
    return 'text-emerald-400'
}

function calculateWeightedWorkload(task: TaskItem): number {
    const priorityWeight = task.priority === 'high' ? 3 : task.priority === 'medium' ? 2 : 1;
    const statusWeight = task.status === 'in-progress' ? 1.25 : task.status === 'pending' ? 1.0 : 0;
    return (task.effort || 0) * priorityWeight * statusWeight;
}

// ============================================================
// PROPS
// ============================================================

interface CalendarCapacityStripProps {
    tasks: TaskItem[]
    dashboardData: EmployeeDashboardData
}

// ============================================================
// COMPONENT
// ============================================================

export function CalendarCapacityStrip({ tasks, dashboardData }: CalendarCapacityStripProps) {
    const days = getNextNDays(7)
    const { profile } = dashboardData

    // Compute effort per day for tasks with due dates
    const effortByDay = days.map(day => {
        const due = tasks.filter(t => {
            if (!t.dueDate || t.status === 'rejected') return false
            return sameDay(new Date(t.dueDate), day)
        })
        return {
            day,
            effort: due.reduce((sum, t) => sum + calculateWeightedWorkload(t), 0),
            taskCount: due.length,
            tasks: due,
        }
    })

    const maxEffort = Math.max(...effortByDay.map(d => d.effort), 1)
    const todayEffort = effortByDay[0].effort
    const isOverloaded = todayEffort > 10

    return (
        <div id="calendar" className="rounded-2xl border border-neutral-800 bg-neutral-900/50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800">
                <div className="flex items-center gap-2.5">
                    <CalendarDays size={15} className="text-cyan-400" />
                    <h2 className="text-sm font-semibold text-neutral-100">Calendar & Capacity</h2>
                </div>
                <div className="flex items-center gap-2 text-xs">
                    <span className="text-neutral-500">Workload:</span>
                    <span className={profile.workloadStatus === 'overloaded' ? 'text-rose-400 font-semibold' : 'text-emerald-400 font-semibold'}>
                        {profile.workloadStatus === 'overloaded' ? 'Overloaded' : 'Normal'} ({profile.currentWorkload} pts)
                    </span>
                </div>
            </div>

            <div className="p-5 space-y-4">
                {/* Overload warning */}
                {isOverloaded && (
                    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
                        <AlertTriangle size={13} className="text-rose-400 shrink-0" />
                        <p className="text-xs text-rose-300">
                            <span className="font-semibold">Overloaded today:</span> {todayEffort} effort points due. Consider deferring non-critical tasks.
                        </p>
                    </div>
                )}

                {/* 7-day strip */}
                <div className="flex items-end gap-2">
                    {effortByDay.map((item, i) => {
                        const isToday = i === 0
                        const barPct = (item.effort / maxEffort) * 100
                        const barH = Math.max(8, barPct * 0.8) // max 80px

                        return (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                                {/* Effort label */}
                                {item.effort > 0 && (
                                    <span className={`text-[10px] font-medium ${getLabelColor(item.effort)}`}>
                                        {item.effort % 1 !== 0 ? item.effort.toFixed(2) : item.effort}
                                    </span>
                                )}

                                {/* Bar */}
                                <div className="w-full flex flex-col items-center justify-end" style={{ height: '64px' }}>
                                    {item.effort > 0 ? (
                                        <div
                                            className={`w-full rounded-t-md transition-all duration-500 ${getBarColor(item.effort)} ${isToday ? 'opacity-100' : 'opacity-60'}`}
                                            style={{ height: `${barH}px` }}
                                            title={`${item.taskCount} task(s), ${item.effort % 1 !== 0 ? item.effort.toFixed(2) : item.effort} pts`}
                                        />
                                    ) : (
                                        <div className="w-full h-1 rounded-full bg-neutral-800" />
                                    )}
                                </div>

                                {/* Day label */}
                                <div className={[
                                    'flex flex-col items-center',
                                    isToday ? 'opacity-100' : 'opacity-60',
                                ].join(' ')}>
                                    <span className={`text-[11px] font-medium ${isToday ? 'text-cyan-400' : 'text-neutral-400'}`}>
                                        {getDayLabel(item.day, i)}
                                    </span>
                                    <span className="text-[10px] text-neutral-600">
                                        {item.day.getDate()}/{item.day.getMonth() + 1}
                                    </span>
                                </div>

                                {/* Today ring */}
                                {isToday && (
                                    <div className="w-1 h-1 rounded-full bg-cyan-400" />
                                )}
                            </div>
                        )
                    })}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 pt-2 border-t border-neutral-800">
                    <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
                        <span className="w-2 h-2 rounded-sm bg-emerald-500" />≤5 pts — Light
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
                        <span className="w-2 h-2 rounded-sm bg-amber-500" />≤10 pts — Moderate
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
                        <span className="w-2 h-2 rounded-sm bg-rose-500" />&gt;10 pts — Overloaded
                    </div>
                </div>
            </div>
        </div>
    )
}
