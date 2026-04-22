import React from 'react'
import { useEmployeeDashboardCtx } from '@/context/EmployeeDashboardContext'
import { PageWrapper } from '@/components/dashboard/employee/PageWrapper'
import { HeroDecisionBand } from '@/components/dashboard/employee/HeroDecisionBand'
import { BottomInsightsRow } from '@/components/dashboard/employee/BottomInsightsRow'
import { useNavigate } from 'react-router-dom'

export default function EmployeeOverviewPage() {
    const { dashboardData, tasks, loading, error, bestNextTask, atRiskTasks, onAccept, refetch } =
        useEmployeeDashboardCtx()

    const navigate = useNavigate()

    return (
        <PageWrapper loading={loading && !dashboardData} error={error} onRetry={refetch}>
            {dashboardData && (
                <>
                    <HeroDecisionBand
                        bestNextTask={bestNextTask}
                        atRiskTasks={atRiskTasks}
                        dashboardData={dashboardData}
                        onAccept={onAccept}
                        onScrollTo={(anchor) => {
                            // Map anchor to route
                            const routeMap: Record<string, string> = {
                                '#blockers': '/dashboard/blockers',
                                '#kanban-board': '/dashboard/kanban',
                                '#priority-inbox': '/dashboard/inbox',
                                '#performance': '/dashboard/performance',
                                '#calendar': '/dashboard/calendar',
                            }
                            const route = routeMap[anchor]
                            if (route) navigate(route)
                        }}
                    />

                    {/* Quick stats grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Pending', value: dashboardData.taskStats.pending, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
                            { label: 'In Progress', value: dashboardData.taskStats.accepted, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
                            { label: 'Completed', value: dashboardData.taskStats.completed, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
                            { label: 'Total Points', value: dashboardData.performance.points, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
                        ].map(stat => (
                            <div key={stat.label} className={`rounded-xl border ${stat.border} ${stat.bg} p-4`}>
                                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                                <p className="text-xs text-neutral-500 mt-0.5">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    <BottomInsightsRow dashboardData={dashboardData} tasks={tasks} />
                </>
            )}
        </PageWrapper>
    )
}
