import React from 'react'
import { Heart, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react'
import type { EmployeeDashboardData } from '@/services/dashboardService'
import type { TaskItem } from '@/types'

// ============================================================
// HELPERS
// ============================================================

function getWorkloadStatus(workload: number, status: string): {
    label: string
    sublabel: string
    color: string
    bg: string
    border: string
    icon: React.ReactNode
} {
    if (status === 'overloaded' || workload > 30) {
        return {
            label: 'Critical',
            sublabel: 'Workload is very high',
            color: 'text-rose-400',
            bg: 'bg-rose-500/10',
            border: 'border-rose-500/20',
            icon: <AlertTriangle size={16} className="text-rose-400" />,
        }
    }
    if (workload > 20) {
        return {
            label: 'Elevated',
            sublabel: 'Monitoring recommended',
            color: 'text-amber-400',
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/20',
            icon: <TrendingUp size={16} className="text-amber-400" />,
        }
    }
    return {
        label: 'Healthy',
        sublabel: 'Good work-life balance',
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        icon: <CheckCircle2 size={16} className="text-emerald-400" />,
    }
}

// ============================================================
// PROPS
// ============================================================

interface WellbeingPanelProps {
    dashboardData: EmployeeDashboardData
    tasks: TaskItem[]
}

// ============================================================
// COMPONENT
// ============================================================

export function WellbeingPanel({ dashboardData, tasks }: WellbeingPanelProps) {
    const { profile, taskStats } = dashboardData
    const status = getWorkloadStatus(profile.currentWorkload, profile.workloadStatus)

    const overtimeRisk = profile.currentWorkload > 25
    const pendingBacklog = taskStats.pending
    const activeTasks = taskStats.pending + taskStats.accepted

    const suggestion = pendingBacklog >= 5
        ? `You have ${pendingBacklog} pending tasks. Consider accepting your highest-priority ones first.`
        : pendingBacklog > 0
        ? `${pendingBacklog} task${pendingBacklog > 1 ? 's' : ''} awaiting acceptance. Start with the highest priority.`
        : 'No pending tasks. Great execution this week!'

    return (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-2.5 px-5 py-4 border-b border-neutral-800">
                <Heart size={15} className="text-rose-400" />
                <h2 className="text-sm font-semibold text-neutral-100">Wellbeing & Sustainability</h2>
            </div>

            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Workload Status */}
                <div className={`rounded-xl border p-4 ${status.bg} ${status.border}`}>
                    <div className="flex items-center gap-2 mb-2">
                        {status.icon}
                        <p className={`text-sm font-bold ${status.color}`}>{status.label}</p>
                    </div>
                    <p className="text-xs text-neutral-400">{status.sublabel}</p>
                    <div className="mt-3 w-full h-1.5 bg-neutral-800/50 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-700 ${
                                status.label === 'Critical' ? 'bg-rose-500' :
                                status.label === 'Elevated' ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, (profile.currentWorkload / 40) * 100)}%` }}
                        />
                    </div>
                    <p className="mt-1.5 text-[11px] text-neutral-500">
                        {profile.currentWorkload}/40 workload threshold
                    </p>
                </div>

                {/* Overtime Risk */}
                <div className={`rounded-xl border p-4 ${overtimeRisk ? 'bg-amber-500/8 border-amber-500/20' : 'bg-neutral-800/30 border-neutral-700/50'}`}>
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle size={15} className={overtimeRisk ? 'text-amber-400' : 'text-neutral-600'} />
                        <p className={`text-sm font-bold ${overtimeRisk ? 'text-amber-400' : 'text-neutral-500'}`}>
                            Overtime Risk
                        </p>
                    </div>
                    {overtimeRisk ? (
                        <>
                            <p className="text-xs text-amber-300/80">
                                High workload detected ({profile.currentWorkload} pts). Consider reassigning or deferring tasks.
                            </p>
                            <div className="mt-3 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                <span className="text-[11px] text-amber-500 font-medium">Active monitoring</span>
                            </div>
                        </>
                    ) : (
                        <>
                            <p className="text-xs text-neutral-500">No overtime risk detected</p>
                            <p className="text-[11px] text-neutral-600 mt-1">Workload is within safe limits</p>
                        </>
                    )}
                </div>

                {/* Task Volume Health + Suggestion */}
                <div className="rounded-xl border border-neutral-700/50 bg-neutral-800/30 p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp size={15} className="text-cyan-400" />
                        <p className="text-sm font-bold text-neutral-300">Task Health</p>
                    </div>
                    <div className="flex items-center gap-4 mb-3">
                        <div className="text-center">
                            <p className="text-lg font-bold text-neutral-100">{activeTasks}</p>
                            <p className="text-[10px] text-neutral-500">Active</p>
                        </div>
                        <div className="w-px h-8 bg-neutral-700" />
                        <div className="text-center">
                            <p className="text-lg font-bold text-emerald-400">{taskStats.completed}</p>
                            <p className="text-[10px] text-neutral-500">Done</p>
                        </div>
                        <div className="w-px h-8 bg-neutral-700" />
                        <div className="text-center">
                            <p className="text-lg font-bold text-neutral-400">{taskStats.rejected}</p>
                            <p className="text-[10px] text-neutral-500">Rejected</p>
                        </div>
                    </div>
                    <div className="bg-neutral-800 rounded-lg p-2.5">
                        <p className="text-[11px] text-neutral-400 leading-snug">
                            💡 {suggestion}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
