import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Calendar, ChevronDown, Loader2 } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { WorkloadOverview } from '@/components/dashboard/manager/WorkloadOverview'
import { TeamHeatmap } from '@/components/dashboard/manager/TeamHeatmap'
import { WorkloadTrends } from '@/components/dashboard/manager/WorkloadTrends'
import { EmployeeDrilldown } from '@/components/dashboard/manager/EmployeeDrilldown'
import * as workloadService from '@/services/workloadService'
import type { TeamMember, Team } from '@/services/workloadService'

interface LoadingState {
    summary: boolean
    teams: boolean
    trends: boolean
    analytics: boolean
    employee: boolean
}

export function WorkloadStatusView() {
    const [searchParams, setSearchParams] = useSearchParams()
    const [tab, setTab] = useState<'overview' | 'team' | 'trends'>(() => {
        const workloadTab = searchParams.get('workloadTab')
        return workloadTab === 'team' || workloadTab === 'trends' ? workloadTab : 'overview'
    })
    const [days, setDays] = useState<7 | 30 | 90>(30)
    const [loading, setLoading] = useState<LoadingState>({
        summary: true,
        teams: true,
        trends: true,
        analytics: true,
        employee: false,
    })

    const [data, setData] = useState({
        summary: null as workloadService.WorkloadSummary | null,
        teams: [] as Team[],
        trends: [] as workloadService.TrendData[],
        analytics: null as workloadService.WorkloadAnalytics | null,
    })

    const [selectedEmployee, setSelectedEmployee] = useState<{ employee: TeamMember; team: Team } | null>(null)
    const [employeeDetails, setEmployeeDetails] = useState<workloadService.EmployeeDetails | null>(null)
    const [error, setError] = useState<string | null>(null)

    // Fetch summary data
    const fetchSummary = useCallback(async () => {
        try {
            setLoading((prev) => ({ ...prev, summary: true }))
            const summary = await workloadService.getWorkloadSummary()
            setData((prev) => ({ ...prev, summary }))
            setError(null)
        } catch (err: any) {
            console.error('Error fetching summary:', err)
            setError(err.message || 'Failed to fetch workload summary')
        } finally {
            setLoading((prev) => ({ ...prev, summary: false }))
        }
    }, [])

    // Fetch team data
    const fetchTeams = useCallback(async () => {
        try {
            setLoading((prev) => ({ ...prev, teams: true }))
            const teams = await workloadService.getWorkloadByTeam()
            setData((prev) => ({ ...prev, teams }))
        } catch (err: any) {
            console.error('Error fetching teams:', err)
            setError(err.message || 'Failed to fetch team workload')
        } finally {
            setLoading((prev) => ({ ...prev, teams: false }))
        }
    }, [])

    // Fetch trends data
    const fetchTrends = useCallback(async () => {
        try {
            setLoading((prev) => ({ ...prev, trends: true }))
            const trends = await workloadService.getWorkloadTrends(days)
            setData((prev) => ({ ...prev, trends }))
        } catch (err: any) {
            console.error('Error fetching trends:', err)
            setError(err.message || 'Failed to fetch workload trends')
        } finally {
            setLoading((prev) => ({ ...prev, trends: false }))
        }
    }, [days])

    // Fetch analytics data
    const fetchAnalytics = useCallback(async () => {
        try {
            setLoading((prev) => ({ ...prev, analytics: true }))
            const analytics = await workloadService.getWorkloadAnalytics()
            setData((prev) => ({ ...prev, analytics }))
        } catch (err: any) {
            console.error('Error fetching analytics:', err)
            setError(err.message || 'Failed to fetch workload analytics')
        } finally {
            setLoading((prev) => ({ ...prev, analytics: false }))
        }
    }, [])

    // Fetch employee details
    const fetchEmployeeDetails = useCallback(async (employeeId: string) => {
        try {
            setLoading((prev) => ({ ...prev, employee: true }))
            const details = await workloadService.getEmployeeWorkloadDetails(employeeId)
            setEmployeeDetails(details)
        } catch (err: any) {
            console.error('Error fetching employee details:', err)
            setError(err.message || 'Failed to fetch employee details')
        } finally {
            setLoading((prev) => ({ ...prev, employee: false }))
        }
    }, [])

    // Sync tab from URL query (?workloadTab=overview|team|trends)
    useEffect(() => {
        const workloadTab = searchParams.get('workloadTab')

        if (workloadTab === 'team') {
            setTab('team')
            return
        }
        if (workloadTab === 'trends') {
            setTab('trends')
            return
        }
        setTab('overview')
    }, [searchParams])

    // Initial data load
    useEffect(() => {
        fetchSummary()
        fetchTeams()
        fetchAnalytics()
    }, [fetchSummary, fetchTeams, fetchAnalytics])

    // Fetch trends when days change
    useEffect(() => {
        fetchTrends()
    }, [days, fetchTrends])

    // Handle employee selection
    const handleSelectEmployee = useCallback(
        async (employee: TeamMember, team: Team) => {
            setSelectedEmployee({ employee, team })
            await fetchEmployeeDetails(employee.id)
        },
        [fetchEmployeeDetails]
    )

    const handleTabChange = useCallback(
        (nextTab: 'overview' | 'team' | 'trends') => {
            setTab(nextTab)
            setSearchParams((prev) => {
                const next = new URLSearchParams(prev)
                next.set('workloadTab', nextTab)
                return next
            })
        },
        [setSearchParams]
    )

    const isLoadingAll = Object.values(loading).some((l) => l)

    return (
        <div className="space-y-6 pb-12">
            {/* Page Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div>
                    <h1 className="text-4xl font-bold text-neutral-50">Workload Analytics</h1>
                    <p className="mt-1 text-neutral-400">Real-time team performance and task management insights</p>
                </div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-2 backdrop-blur-sm"
                >
                    <div className="relative">
                        <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                        <select
                            value={days}
                            onChange={(e) => setDays(parseInt(e.target.value) as 7 | 30 | 90)}
                            className="appearance-none bg-transparent pl-9 pr-8 py-2 text-sm font-medium text-neutral-50 outline-none"
                        >
                            <option value={7}>Last 7 Days</option>
                            <option value={30}>Last 30 Days</option>
                            <option value={90}>Last 90 Days</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                    </div>
                </motion.div>
            </motion.div>

            {/* Error State */}
            {error && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-400"
                >
                    <p className="text-sm font-semibold">{error}</p>
                </motion.div>
            )}

            {/* Loading State */}
            {isLoadingAll && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center gap-3 rounded-lg border border-neutral-800 bg-neutral-900/40 py-12 backdrop-blur-sm"
                >
                    <Loader2 className="h-5 w-5 animate-spin text-cyan-500" />
                    <p className="text-neutral-400">Loading workload data...</p>
                </motion.div>
            )}

            {/* Content */}
            {!isLoadingAll && (
                <>
                    {/* Tab Navigation */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex gap-2 border-b border-neutral-800"
                    >
                        {['overview', 'team', 'trends'].map((tabName) => (
                            <button
                                key={tabName}
                                onClick={() => handleTabChange(tabName as 'overview' | 'team' | 'trends')}
                                className={`px-4 py-3 text-sm font-semibold transition-colors ${
                                    tab === tabName
                                        ? 'border-b-2 border-cyan-500 text-cyan-400'
                                        : 'text-neutral-400 hover:text-neutral-200'
                                }`}
                            >
                                {tabName === 'overview'
                                    ? 'Executive Overview'
                                    : tabName === 'team'
                                      ? 'Team Heatmap'
                                      : 'Trends & Analytics'}
                            </button>
                        ))}
                    </motion.div>

                    {/* Tab Content */}
                    <motion.div
                        key={tab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                    >
                        {tab === 'overview' && data.summary && (
                            <WorkloadOverview summary={data.summary} trends={data.trends} />
                        )}

                        {tab === 'team' && data.teams.length > 0 && (
                            <TeamHeatmap teams={data.teams} onSelectEmployee={handleSelectEmployee} />
                        )}

                        {tab === 'trends' && data.trends.length > 0 && (
                            <WorkloadTrends trends={data.trends} days={days} />
                        )}
                    </motion.div>

                    {/* Bottleneck Alert Section */}
                    {data.analytics && data.analytics.bottlenecks.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="rounded-lg border border-red-500/20 bg-red-500/10 p-6 backdrop-blur-sm"
                        >
                            <h3 className="mb-4 text-sm font-semibold text-red-400 uppercase tracking-wide">
                                🚨 Bottleneck Alert
                            </h3>
                            <p className="mb-4 text-sm text-neutral-300">
                                The following employees are high-priority for workload rebalancing:
                            </p>
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                                {data.analytics.bottlenecks.map((bottleneck, idx) => (
                                    <div key={idx} className="rounded-lg border border-red-500/30 bg-red-500/5 p-3">
                                        <p className="font-semibold text-neutral-50">{bottleneck.name}</p>
                                        <div className="mt-2 space-y-1 text-sm">
                                            <p className="text-neutral-400">
                                                Workload: <span className="text-red-400 font-semibold">{bottleneck.workload}</span>
                                            </p>
                                            <p className="text-neutral-400">
                                                Tasks: <span className="text-amber-400 font-semibold">{bottleneck.taskCount}</span>
                                            </p>
                                            <p className="text-neutral-400">
                                                Completed:{' '}
                                                <span className="text-green-400 font-semibold">{bottleneck.completed}</span>
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </>
            )}

            {/* Employee Drill-down Sidebar */}
            <EmployeeDrilldown
                employee={employeeDetails}
                isOpen={!!selectedEmployee}
                onClose={() => {
                    setSelectedEmployee(null)
                    setEmployeeDetails(null)
                }}
                selectedEmployee={selectedEmployee?.employee}
                selectedTeam={selectedEmployee?.team}
            />
        </div>
    )
}
