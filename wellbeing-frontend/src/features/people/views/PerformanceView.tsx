import { motion } from 'framer-motion'
import { Users, CheckCircle, Clock, AlertCircle, TrendingUp } from 'lucide-react'
import { SummaryCard } from '@/components/dashboard/stats/SummaryCard'
import { WorkloadChart } from '@/components/dashboard/stats/WorkloadChart'
import { TaskStatusChart } from '@/components/dashboard/stats/TaskStatusChart'
import { EmployeesList } from '@/components/dashboard/stats/EmployeesList'
import { SuggestionCard } from '@/components/dashboard/stats/SuggestionCard'
import { TrendChart } from '@/components/dashboard/stats/TrendChart'
import { RejectedTasksAnalysis } from '@/components/dashboard/stats/RejectedTasksAnalysis'
import { StatsFilters } from '@/components/dashboard/stats/StatsFilters'
import { useManagerDashboard } from '@/hooks/useManagerDashboard'

export function PerformanceView() {
    const { data, loading, error } = useManagerDashboard()

    if (loading) {
        return (
            <div className="space-y-6 p-6">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <h1 className="text-3xl font-bold text-neutral-50">Manager Statistics</h1>
                    <p className="mt-2 text-neutral-400">Loading...</p>
                </motion.div>
                <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-8">
                    <div className="flex items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                        <span className="ml-4 text-neutral-400">Fetching manager dashboard data...</span>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="space-y-6 p-6">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <h1 className="text-3xl font-bold text-neutral-50">Manager Statistics</h1>
                </motion.div>
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6">
                    <h3 className="font-semibold text-red-400 mb-2">Error Loading Dashboard</h3>
                    <p className="text-red-300 text-sm mb-4">{error}</p>
                    <div className="text-xs text-red-300/70 space-y-1 bg-red-950/30 p-3 rounded">
                        <p>• Check browser console for more details (F12)</p>
                        <p>• Ensure you are logged in as a Manager</p>
                        <p>• Check that the backend server is running</p>
                        <p>• Try refreshing the page</p>
                    </div>
                </div>
            </div>
        )
    }

    if (!data) {
        return (
            <div className="space-y-6 p-6">
                <h1 className="text-3xl font-bold text-neutral-50">Manager Statistics</h1>
                <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-6">
                    <p className="text-yellow-300">No data available. Please try refreshing.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 p-6">
                {/* Page Header */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-3xl font-bold text-neutral-50">Manager Statistics</h1>
                    <p className="mt-2 text-neutral-400">Track workload, performance, and task distribution</p>
                </motion.div>

                {/* Filters */}
                <StatsFilters dashboardData={data} />

                {/* Summary Cards Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <SummaryCard
                        title="Total Employees"
                        value={data.teamStats.totalEmployees}
                        icon={Users}
                        variant="default"
                        index={0}
                    />
                    <SummaryCard
                        title="Active Tasks"
                        value={data.taskStats.pending + data.taskStats.accepted}
                        icon={Clock}
                        variant="warning"
                        index={1}
                        trend={{ value: 12, isPositive: true }}
                    />
                    <SummaryCard
                        title="Completed Tasks"
                        value={data.taskStats.completed}
                        icon={CheckCircle}
                        variant="success"
                        index={2}
                        trend={{ value: 8, isPositive: true }}
                    />
                    <SummaryCard
                        title="Overloaded"
                        value={data.teamWorkload.filter(e => e.currentWorkload > 30).length}
                        icon={AlertCircle}
                        variant="danger"
                        index={3}
                        trend={{ value: 2, isPositive: false }}
                    />
                    <SummaryCard
                        title="Available"
                        value={data.teamWorkload.filter(e => e.currentWorkload < 15).length}
                        icon={TrendingUp}
                        variant="success"
                        index={4}
                        trend={{ value: 5, isPositive: true }}
                    />
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <WorkloadChart teamWorkload={data.teamWorkload} />
                    <TaskStatusChart taskStats={data.taskStats} />
                </div>

                {/* Employees Lists */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <EmployeesList type="overloaded" teamWorkload={data.teamWorkload} />
                    <EmployeesList type="available" teamWorkload={data.teamWorkload} />
                </div>

                {/* Suggestion & Trend */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <SuggestionCard alerts={data.alerts} />
                    <div className="lg:col-span-2">
                        <TrendChart recentTasks={data.recentTasks} />
                    </div>
                </div>

                {/* Rejected Tasks */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <RejectedTasksAnalysis taskStats={data.taskStats} />
                </div>
            </div>
    )
}