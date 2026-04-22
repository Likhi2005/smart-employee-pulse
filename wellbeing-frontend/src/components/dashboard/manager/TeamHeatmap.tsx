import { memo, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, AlertCircle } from 'lucide-react'
import type { Team, TeamMember } from '@/services/workloadService'

interface TeamHeatmapProps {
    teams: Team[]
    onSelectEmployee?: (employee: TeamMember, team: Team) => void
}

export const TeamHeatmap = memo(function TeamHeatmap({ teams, onSelectEmployee }: TeamHeatmapProps) {
    const [expandedTeam, setExpandedTeam] = useState<string | null>(null)

    const getWorkloadStyle = (workload: number) => {
        if (workload < 15) {
            return {
                accent: 'bg-emerald-500',
                badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
                value: 'text-emerald-300',
                ring: 'hover:border-emerald-500/30',
            }
        }

        if (workload < 25) {
            return {
                accent: 'bg-amber-500',
                badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
                value: 'text-amber-300',
                ring: 'hover:border-amber-500/30',
            }
        }

        if (workload < 35) {
            return {
                accent: 'bg-orange-500',
                badge: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
                value: 'text-orange-300',
                ring: 'hover:border-orange-500/30',
            }
        }

        return {
            accent: 'bg-rose-500',
            badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
            value: 'text-rose-300',
            ring: 'hover:border-rose-500/30',
        }
    }

    const getStatusLabel = (workload: number) => {
        if (workload < 15) return 'Healthy'
        if (workload < 25) return 'Elevated'
        if (workload < 35) return 'High'
        return 'Critical'
    }

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'healthy':
                return 'bg-green-500/20 border-green-500/50 text-green-400'
            case 'elevated':
                return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
            case 'critical':
                return 'bg-red-500/20 border-red-500/50 text-red-400'
            default:
                return 'bg-neutral-500/20 border-neutral-500/50 text-neutral-400'
        }
    }

    // Sort teams by status and average workload
    const sortedTeams = useMemo(
        () =>
            [...teams].sort((a, b) => {
                const statusOrder = { critical: 0, elevated: 1, healthy: 2 }
                const statusDiff = (statusOrder[a.status] ?? 2) - (statusOrder[b.status] ?? 2)
                if (statusDiff !== 0) return statusDiff
                return b.avgWorkload - a.avgWorkload
            }),
        [teams]
    )

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            {sortedTeams.map((team, teamIdx) => (
                <motion.div
                    key={team.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: teamIdx * 0.05 }}
                    className="overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900/40 backdrop-blur-sm"
                >
                    {/* Team Header */}
                    <motion.button
                        onClick={() => setExpandedTeam(expandedTeam === team.name ? null : team.name)}
                        className="w-full px-4 py-3 text-left hover:bg-neutral-800/30 transition-colors flex items-center justify-between"
                    >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                            {/* Team Name and Status */}
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-neutral-50 truncate">{team.name}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`px-2 py-1 rounded border text-xs font-medium ${getStatusBadgeColor(team.status)}`}>
                                        {team.status.toUpperCase()}
                                    </span>
                                    {team.overloaded > 0 && (
                                        <span className="flex items-center gap-1 text-xs text-red-400">
                                            <AlertCircle className="w-3 h-3" />
                                            {team.overloaded} overloaded
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Team Metrics */}
                            <div className="grid grid-cols-3 gap-4 text-right text-sm">
                                <div>
                                    <p className="text-neutral-400 text-xs uppercase tracking-wide">People</p>
                                    <p className="font-bold text-neutral-50">{team.employeeCount}</p>
                                </div>
                                <div>
                                    <p className="text-neutral-400 text-xs uppercase tracking-wide">Avg Load</p>
                                    <p className="font-bold text-cyan-400">{team.avgWorkload.toFixed(1)}</p>
                                </div>
                                <div>
                                    <p className="text-neutral-400 text-xs uppercase tracking-wide">Max Load</p>
                                    <p className="font-bold text-red-400">{team.maxWorkload}</p>
                                </div>
                            </div>
                        </div>

                        {/* Expand/Collapse Icon */}
                        <motion.div
                            initial={false}
                            animate={{ rotate: expandedTeam === team.name ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="ml-2 flex-shrink-0"
                        >
                            <ChevronDown className="w-5 h-5 text-neutral-400" />
                        </motion.div>
                    </motion.button>

                    {/* Team Members Grid */}
                    <AnimatePresence initial={false}>
                        {expandedTeam === team.name && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="border-t border-neutral-800 bg-neutral-900/20 px-4 py-4"
                            >
                                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                    {team.employees.map((employee, empIdx) => (
                                        <motion.div
                                            key={employee.id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: empIdx * 0.02 }}
                                            onClick={() => onSelectEmployee?.(employee, team)}
                                            className={`cursor-pointer rounded-xl border border-neutral-700 bg-neutral-900/80 p-4 shadow-[0_8px_24px_rgba(0,0,0,0.25)] transition-all ${getWorkloadStyle(employee.workload).ring}`}
                                        >
                                            <div className={`mb-3 h-1.5 w-full rounded-full ${getWorkloadStyle(employee.workload).accent}`} />
                                            <div className="space-y-2">
                                                <div>
                                                    <div className="flex items-center justify-between gap-2">
                                                        <p className="font-semibold text-neutral-100 truncate">{employee.name}</p>
                                                        <span className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${getWorkloadStyle(employee.workload).badge}`}>
                                                            {getStatusLabel(employee.workload)}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-neutral-400 truncate">{employee.email}</p>
                                                </div>

                                                <div className="flex items-baseline justify-between pt-2 border-t border-neutral-700">
                                                    <span className={`text-2xl font-bold ${getWorkloadStyle(employee.workload).value}`}>
                                                        {employee.workload}
                                                    </span>
                                                    <span className="text-xs text-neutral-400">workload</span>
                                                </div>

                                                <div className="flex items-center justify-between pt-2">
                                                    <span className="text-xs text-neutral-400">Performance</span>
                                                    <span className={`font-semibold ${employee.performanceScore >= 80 ? 'text-emerald-300' : 'text-amber-300'}`}>
                                                        {employee.performanceScore}
                                                    </span>
                                                </div>

                                                {employee.status === 'critical' && (
                                                    <div className="mt-2 flex items-center gap-1 rounded-md border border-rose-500/30 bg-rose-500/15 px-2 py-1 text-xs font-semibold text-rose-300">
                                                        <AlertCircle className="w-3 h-3" />
                                                        CRITICAL
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            ))}
        </motion.div>
    )
})
